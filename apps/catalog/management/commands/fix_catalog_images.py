from io import BytesIO
from pathlib import Path

import requests
from PIL import Image, ImageDraw, ImageFont
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.catalog.models import Movie, TVShow, Season, Episode

TIMEOUT = 30
UA = "StreamFlix-Catalog-Image-Fixer/1.0"


def poster_source_from_video(video_url: str | None) -> str | None:
    if not video_url:
        return None

    url = str(video_url)

    if "media.w3.org/2010/05/sintel/trailer.mp4" in url:
        return "https://media.w3.org/2010/05/sintel/poster.png"

    if "res.cloudinary.com/demo/video/upload/" in url:
        marker = "/video/upload/"
        head, tail = url.split(marker, 1)
        tail = tail.rsplit(".", 1)[0] + ".jpg"
        return f"{head}{marker}so_2/{tail}"

    if "www.w3schools.com/html/mov_bbb.mp4" in url:
        # W3Schools does not provide a stable public poster endpoint.
        return None

    return None


def download_image(url: str | None) -> Image.Image | None:
    if not url:
        return None

    try:
        response = requests.get(
            url,
            timeout=TIMEOUT,
            headers={"User-Agent": UA},
        )
        response.raise_for_status()
        image = Image.open(BytesIO(response.content)).convert("RGB")
        return image
    except Exception as exc:
        print(f"  [WARN] image download failed: {url} -> {exc}")
        return None


def make_fallback(title: str, width: int, height: int) -> Image.Image:
    image = Image.new("RGB", (width, height), (24, 24, 24))
    draw = ImageDraw.Draw(image)

    # Netflix-like dark red gradient bands.
    for y in range(height):
        ratio = y / max(height - 1, 1)
        r = int(35 + 35 * (1 - ratio))
        g = int(8 + 8 * (1 - ratio))
        b = int(10 + 10 * (1 - ratio))
        draw.line((0, y, width, y), fill=(r, g, b))

    try:
        font_big = ImageFont.truetype("arial.ttf", max(32, width // 10))
        font_small = ImageFont.truetype("arial.ttf", max(18, width // 28))
    except Exception:
        font_big = ImageFont.load_default()
        font_small = ImageFont.load_default()

    words = title.split()
    short = " ".join(words[:5])
    draw.text(
        (width // 2, height // 2 - 20),
        short,
        fill=(255, 255, 255),
        font=font_big,
        anchor="mm",
        align="center",
    )
    draw.text(
        (width // 2, height // 2 + max(45, width // 12)),
        "STREAMFLIX",
        fill=(229, 9, 20),
        font=font_small,
        anchor="mm",
    )
    return image


def fit_cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_w, target_h = size
    source_w, source_h = image.size
    scale = max(target_w / source_w, target_h / source_h)
    new_size = (int(source_w * scale), int(source_h * scale))
    image = image.resize(new_size, Image.Resampling.LANCZOS)

    left = max((image.width - target_w) // 2, 0)
    top = max((image.height - target_h) // 2, 0)
    image = image.crop((left, top, left + target_w, top + target_h))
    return image


def image_bytes(image: Image.Image, size: tuple[int, int]) -> bytes:
    image = fit_cover(image, size)
    buffer = BytesIO()
    image.save(buffer, format="JPEG", quality=90, optimize=True)
    return buffer.getvalue()


def save_image_field(instance, field_name: str, image: Image.Image, filename: str, size):
    data = image_bytes(image, size)
    field = getattr(instance, field_name)
    field.save(filename, ContentFile(data), save=False)


def source_for_movie(movie: Movie):
    return poster_source_from_video(movie.video_url)


def source_for_show(show: TVShow):
    episode = (
        Episode.objects
        .filter(season__show=show, is_published=True)
        .order_by("season__season_number", "episode_number")
        .first()
    )
    return poster_source_from_video(episode.video_url if episode else None)


def source_for_episode(episode: Episode):
    return poster_source_from_video(episode.video_url)


def process_instance(instance, source_url, poster_size, backdrop_size, poster_dir, backdrop_dir):
    image = download_image(source_url)
    if image is None:
        image = make_fallback(instance.title, *poster_size)

    slug = getattr(instance, "slug", None) or str(instance.pk)
    base = f"{slug}-poster.jpg"
    back = f"{slug}-backdrop.jpg"

    save_image_field(instance, "poster", image, f"{poster_dir}/{base}", poster_size)
    save_image_field(instance, "backdrop", image, f"{backdrop_dir}/{back}", backdrop_size)
    instance.save(update_fields=["poster", "backdrop", "updated_at"])


def process_episode(episode):
    image = download_image(source_for_episode(episode))
    if image is None:
        image = make_fallback(episode.title, 640, 360)

    filename = f"{episode.season.show.slug}-s{episode.season.season_number:02d}-e{episode.episode_number:02d}.jpg"
    data = image_bytes(image, (640, 360))
    episode.thumbnail.save(filename, ContentFile(data), save=False)
    episode.save(update_fields=["thumbnail", "updated_at"])


class Command(BaseCommand):
    help = "Repair StreamFlix catalog poster, backdrop, season poster, and episode thumbnail images."

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("\n=== StreamFlix image repair ===\n")

        for movie in Movie.objects.all().order_by("id"):
            self.stdout.write(f"Movie: {movie.title}")
            process_instance(
                movie,
                source_for_movie(movie),
                (600, 900),
                (1280, 720),
                "catalog/posters",
                "catalog/backdrops",
            )

        for show in TVShow.objects.all().order_by("id"):
            self.stdout.write(f"Show: {show.title}")
            process_instance(
                show,
                source_for_show(show),
                (600, 900),
                (1280, 720),
                "catalog/shows/posters",
                "catalog/shows/backdrops",
            )

        for season in Season.objects.select_related("show").all().order_by("show_id", "season_number"):
            episode = (
                Episode.objects
                .filter(season=season, is_published=True)
                .order_by("episode_number")
                .first()
            )
            source = poster_source_from_video(episode.video_url if episode else None)
            image = download_image(source)
            if image is None:
                image = make_fallback(season.title or f"Season {season.season_number}", 600, 900)

            filename = f"{season.show.slug}-season-{season.season_number}.jpg"
            save_image_field(season, "poster", image, f"catalog/seasons/{filename}", (600, 900))
            season.save(update_fields=["poster", "updated_at"])

        for episode in Episode.objects.select_related("season__show").filter(is_published=True).order_by("id"):
            self.stdout.write(f"Episode: {episode.season.show.title} / {episode.title}")
            process_episode(episode)

        self.stdout.write(self.style.SUCCESS("\nDONE — catalog thumbnails/posters/backdrops repaired.\n"))
