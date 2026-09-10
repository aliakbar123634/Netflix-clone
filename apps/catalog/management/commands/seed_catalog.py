"""
StreamFlix catalog seeder.

Location:
    apps/catalog/management/commands/seed_catalog.py

Run:
    python manage.py seed_catalog

Requires:
    pip install requests

This seeds:
    - genres
    - people
    - 5 movies
    - 2 anthology TV shows
    - seasons + episodes
    - poster/backdrop files into MEDIA_ROOT
    - working public sample MP4 video URLs

IMPORTANT:
    Videos are NOT downloaded.
    They remain remote and are played through video_url.

    Images ARE downloaded into MEDIA_ROOT.
"""

from __future__ import annotations

import requests

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from apps.catalog.models import (
    Episode,
    Genre,
    Movie,
    Person,
    Season,
    TVShow,
)


# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------

TIMEOUT = 30

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/131.0 Safari/537.36 "
    "StreamFlixSeeder/2.0"
)


# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------

def download_image(url: str, filename: str) -> bytes | None:
    """
    Download an image from a public URL.

    We do not rely only on Content-Type because some public
    image/CDN servers may return unusual headers.
    """

    try:
        response = requests.get(
            url,
            timeout=TIMEOUT,
            headers={
                "User-Agent": USER_AGENT,
                "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
            },
            allow_redirects=True,
        )

        response.raise_for_status()

        if not response.content:
            print(f"  [WARN] Empty image response: {url}")
            return None

        content_type = (
            response.headers.get("content-type", "")
            .lower()
            .split(";")[0]
            .strip()
        )

        # Normal image response
        if content_type.startswith("image/"):
            return response.content

        # Some servers can have incorrect content-type headers.
        # Check common image signatures as a fallback.
        data = response.content

        image_signatures = (
            b"\xff\xd8\xff",       # JPEG
            b"\x89PNG\r\n\x1a\n",  # PNG
            b"GIF87a",             # GIF
            b"GIF89a",             # GIF
            b"RIFF",               # WEBP starts with RIFF
        )

        if data.startswith(image_signatures):
            return data

        print(
            f"  [WARN] Response is not recognized as an image: "
            f"{url} | content-type={content_type}"
        )

        return None

    except requests.RequestException as exc:
        print(
            f"  [WARN] Image download failed: "
            f"{url} -> {exc}"
        )
        return None


def save_remote_image(
    instance,
    field_name: str,
    url: str | None,
    filename: str,
):
    """
    Download and attach an image to a Django ImageField.

    Existing images are preserved.
    """

    if not url:
        return

    field = getattr(instance, field_name)

    if field:
        return

    print(f"  Downloading {field_name}: {filename}")

    data = download_image(url, filename)

    if not data:
        print(
            f"  [WARN] Could not save {field_name}: "
            f"{instance}"
        )
        return

    field.save(
        filename,
        ContentFile(data),
        save=False,
    )

    print(
        f"  [OK] Saved {field_name}: "
        f"{filename}"
    )


def get_or_create_genre(name: str) -> Genre:
    genre, _ = Genre.objects.get_or_create(
        name=name,
        defaults={
            "slug": slugify(name),
        },
    )

    return genre


def get_or_create_person(name: str) -> Person:
    person, _ = Person.objects.get_or_create(
        name=name,
    )

    return person


# ---------------------------------------------------------------------------
# VIDEO SOURCES
# ---------------------------------------------------------------------------
#
# These are public sample MP4 files hosted in Google's sample-video bucket.
#
# We intentionally use:
#
#     https://storage.googleapis.com/
#
# instead of the old Blender URLs that were returning 404 in your browser.
#
# The same sample URLs are currently referenced by public video-player
# examples and Google sample projects.
#
# IMPORTANT:
# These are DEMO videos for your assignment/player testing.
# They are not Netflix copyrighted movies.
#

VIDEO = {
    # Movies
    "bbb": (
        "https://storage.googleapis.com/"
        "gtv-videos-bucket/sample/BigBuckBunny.mp4"
    ),

    "sintel": (
        "https://storage.googleapis.com/"
        "gtv-videos-bucket/sample/Sintel.mp4"
    ),

    "tears": (
        "https://storage.googleapis.com/"
        "gtv-videos-bucket/sample/TearsOfSteel.mp4"
    ),

    "elephants": (
        "https://storage.googleapis.com/"
        "gtv-videos-bucket/sample/ElephantsDream.mp4"
    ),

    # Short demo videos for anthology episodes
    "blazes": (
        "https://storage.googleapis.com/"
        "gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    ),

    "escapes": (
        "https://storage.googleapis.com/"
        "gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
    ),

    "fun": (
        "https://storage.googleapis.com/"
        "gtv-videos-bucket/sample/ForBiggerFun.mp4"
    ),

    "joyrides": (
        "https://storage.googleapis.com/"
        "gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
    ),

    "meltdowns": (
        "https://storage.googleapis.com/"
        "gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
    ),
}


# ---------------------------------------------------------------------------
# IMAGE SOURCES
# ---------------------------------------------------------------------------
#
# These are the matching sample thumbnails from Google's sample-video
# storage. We download them into Django MEDIA_ROOT.
#
# They are landscape thumbnails rather than official Netflix-style posters,
# but they are reliable test artwork and will make the catalog visually
# populated immediately.
#

IMG = {
    # Big Buck Bunny
    "bbb": (
        "https://storage.googleapis.com/"
        "gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
    ),

    # Sintel
    "sintel": (
        "https://storage.googleapis.com/"
        "gtv-videos-bucket/sample/images/Sintel.jpg"
    ),

    # Tears of Steel
    "tears": (
        "https://storage.googleapis.com/"
        "gtv-videos-bucket/sample/images/TearsOfSteel.jpg"
    ),

    # Elephants Dream
    "elephants": (
        "https://storage.googleapis.com/"
        "gtv-videos-bucket/sample/images/ElephantsDream.jpg"
    ),

    # Google demo thumbnails
    "blazes": (
        "https://storage.googleapis.com/"
        "gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg"
    ),

    "escapes": (
        "https://storage.googleapis.com/"
        "gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg"
    ),

    "fun": (
        "https://storage.googleapis.com/"
        "gtv-videos-bucket/sample/images/ForBiggerFun.jpg"
    ),

    "joyrides": (
        "https://storage.googleapis.com/"
        "gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg"
    ),

    "meltdowns": (
        "https://storage.googleapis.com/"
        "gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg"
    ),
}


# ---------------------------------------------------------------------------
# MOVIE UPSERT
# ---------------------------------------------------------------------------

def upsert_movie(data: dict) -> Movie:
    movie, created = Movie.objects.get_or_create(
        slug=data["slug"],
        defaults={
            "title": data["title"],
            "description": data["description"],
            "release_year": data["release_year"],
            "duration": data["duration"],
            "maturity_rating": data["maturity_rating"],
            "language": data.get("language", "en"),
            "trailer_url": data.get("trailer_url", ""),
            "video_url": data["video_url"],
            "is_featured": data.get("is_featured", False),
            "is_published": True,
        },
    )

    # Update normal fields every time the seeder runs.
    movie.title = data["title"]
    movie.description = data["description"]
    movie.release_year = data["release_year"]
    movie.duration = data["duration"]
    movie.maturity_rating = data["maturity_rating"]
    movie.language = data.get("language", "en")
    movie.trailer_url = data.get("trailer_url", "")
    movie.video_url = data["video_url"]
    movie.is_featured = data.get("is_featured", False)
    movie.is_published = True

    # Images
    save_remote_image(
        movie,
        "poster",
        data.get("poster_url"),
        f'{movie.slug}-poster.jpg',
    )

    save_remote_image(
        movie,
        "backdrop",
        data.get("backdrop_url"),
        f'{movie.slug}-backdrop.jpg',
    )

    movie.save()

    # Genres
    movie.genres.set(
        [
            get_or_create_genre(name)
            for name in data.get("genres", [])
        ]
    )

    # Cast
    movie.cast.set(
        [
            get_or_create_person(name)
            for name in data.get("cast", [])
        ]
    )

    # Directors
    movie.directors.set(
        [
            get_or_create_person(name)
            for name in data.get("directors", [])
        ]
    )

    print(
        f"  [{'CREATED' if created else 'UPDATED'}] "
        f"Movie: {movie.title}"
    )

    return movie


# ---------------------------------------------------------------------------
# TV SHOW UPSERT
# ---------------------------------------------------------------------------

def upsert_show(data: dict) -> TVShow:
    show, created = TVShow.objects.get_or_create(
        slug=data["slug"],
        defaults={
            "title": data["title"],
            "description": data["description"],
            "release_year": data["release_year"],
            "maturity_rating": data["maturity_rating"],
            "language": data.get("language", "en"),
            "trailer_url": data.get("trailer_url", ""),
            "is_featured": data.get("is_featured", False),
            "is_published": True,
        },
    )

    show.title = data["title"]
    show.description = data["description"]
    show.release_year = data["release_year"]
    show.maturity_rating = data["maturity_rating"]
    show.language = data.get("language", "en")
    show.trailer_url = data.get("trailer_url", "")
    show.is_featured = data.get("is_featured", False)
    show.is_published = True

    save_remote_image(
        show,
        "poster",
        data.get("poster_url"),
        f'{show.slug}-poster.jpg',
    )

    save_remote_image(
        show,
        "backdrop",
        data.get("backdrop_url"),
        f'{show.slug}-backdrop.jpg',
    )

    show.save()

    show.genres.set(
        [
            get_or_create_genre(name)
            for name in data.get("genres", [])
        ]
    )

    show.cast.set(
        [
            get_or_create_person(name)
            for name in data.get("cast", [])
        ]
    )

    show.directors.set(
        [
            get_or_create_person(name)
            for name in data.get("directors", [])
        ]
    )

    print(
        f"  [{'CREATED' if created else 'UPDATED'}] "
        f"TV Show: {show.title}"
    )

    return show


# ---------------------------------------------------------------------------
# SEASON + EPISODES
# ---------------------------------------------------------------------------

def seed_season_and_episodes(
    show: TVShow,
    season_data: dict,
):
    season, _ = Season.objects.get_or_create(
        show=show,
        season_number=season_data["season_number"],
        defaults={
            "title": season_data.get("title", ""),
            "description": season_data.get("description", ""),
        },
    )

    season.title = season_data.get("title", "")
    season.description = season_data.get("description", "")

    save_remote_image(
        season,
        "poster",
        season_data.get("poster_url"),
        (
            f'{show.slug}-season-'
            f'{season.season_number}.jpg'
        ),
    )

    season.save()

    for episode_data in season_data["episodes"]:
        episode, created = Episode.objects.get_or_create(
            season=season,
            episode_number=episode_data["episode_number"],
            defaults={
                "title": episode_data["title"],
                "description": episode_data["description"],
                "duration": episode_data["duration"],
                "video_url": episode_data["video_url"],
                "trailer_url": episode_data.get(
                    "trailer_url",
                    "",
                ),
                "is_published": True,
            },
        )

        episode.title = episode_data["title"]
        episode.description = episode_data["description"]
        episode.duration = episode_data["duration"]
        episode.video_url = episode_data["video_url"]
        episode.trailer_url = episode_data.get(
            "trailer_url",
            "",
        )
        episode.is_published = True

        save_remote_image(
            episode,
            "thumbnail",
            episode_data.get("thumbnail_url"),
            (
                f'{show.slug}-s'
                f'{season.season_number}-e'
                f'{episode.episode_number}.jpg'
            ),
        )

        episode.save()

        print(
            f"    [{'CREATED' if created else 'UPDATED'}] "
            f"S{season.season_number}E"
            f"{episode.episode_number}: "
            f"{episode.title}"
        )


# ---------------------------------------------------------------------------
# MOVIES
# ---------------------------------------------------------------------------

MOVIES = [
    {
        "slug": "big-buck-bunny",
        "title": "Big Buck Bunny",
        "description": (
            "A cheerful open animated short from the "
            "Blender Foundation about a friendly giant "
            "rabbit whose peaceful day is interrupted "
            "by mischievous forest animals."
        ),
        "release_year": 2008,
        "duration": 10,
        "maturity_rating": "all",
        "genres": [
            "Animation",
            "Comedy",
            "Family",
        ],
        "directors": [
            "Sacha Goedegebure",
        ],
        "cast": [
            "Big Buck Bunny",
            "Frank",
            "Rinky",
        ],
        "video_url": VIDEO["bbb"],
        "poster_url": IMG["bbb"],
        "backdrop_url": IMG["bbb"],
        "is_featured": True,
    },

    {
        "slug": "sintel",
        "title": "Sintel",
        "description": (
            "A fantasy adventure open movie about "
            "a young woman who sets out on a dangerous "
            "journey after discovering a wounded dragon."
        ),
        "release_year": 2010,
        "duration": 15,
        "maturity_rating": "7+",
        "genres": [
            "Animation",
            "Fantasy",
            "Adventure",
        ],
        "directors": [
            "Colin Levy",
        ],
        "cast": [
            "Sintel",
            "Scales",
            "The Dragon",
        ],
        "video_url": VIDEO["sintel"],
        "poster_url": IMG["sintel"],
        "backdrop_url": IMG["sintel"],
        "is_featured": True,
    },

    {
        "slug": "tears-of-steel",
        "title": "Tears of Steel",
        "description": (
            "A science-fiction open movie combining "
            "live action and computer-generated visual "
            "effects in a post-apocalyptic story."
        ),
        "release_year": 2012,
        "duration": 12,
        "maturity_rating": "13+",
        "genres": [
            "Science Fiction",
            "Action",
            "Drama",
        ],
        "directors": [
            "Ian Hubert",
        ],
        "cast": [
            "Derek de Lint",
            "Viktor",
            "Thom",
        ],
        "video_url": VIDEO["tears"],
        "poster_url": IMG["tears"],
        "backdrop_url": IMG["tears"],
        "is_featured": True,
    },

    {
        "slug": "elephants-dream",
        "title": "Elephants Dream",
        "description": (
            "The first Blender Open Movie follows "
            "two strange characters exploring a "
            "mysterious and seemingly infinite machine."
        ),
        "release_year": 2006,
        "duration": 11,
        "maturity_rating": "7+",
        "genres": [
            "Animation",
            "Fantasy",
            "Adventure",
        ],
        "directors": [
            "Bassam Kurdali",
        ],
        "cast": [
            "Proog",
            "Emo",
        ],
        "video_url": VIDEO["elephants"],
        "poster_url": IMG["elephants"],
        "backdrop_url": IMG["elephants"],
        "is_featured": True,
    },

    {
        "slug": "cosmos-laundromat",
        "title": "Cosmos Laundromat: First Cycle",
        "description": (
            "On a desolate island, a lonely sheep "
            "meets an unusual salesman who offers a "
            "strange gift: the possibility of another "
            "lifetime."
        ),
        "release_year": 2015,
        "duration": 12,
        "maturity_rating": "13+",
        "genres": [
            "Animation",
            "Fantasy",
            "Comedy",
        ],
        "directors": [
            "Francesco Siddi",
        ],
        "cast": [
            "Franck",
            "Victor",
        ],

        # Google sample bucket does not contain the actual
        # Cosmos Laundromat movie. We use a known working
        # demo MP4 so the StreamFlix player remains playable.
        "video_url": VIDEO["fun"],

        # Use a known working sample image instead of
        # the old Wikimedia URL that was failing.
        "poster_url": IMG["fun"],
        "backdrop_url": IMG["fun"],
        "is_featured": False,
    },
]


# ---------------------------------------------------------------------------
# TV SHOWS
# ---------------------------------------------------------------------------

SHOWS = [
    {
        "slug": "streamflix-kids-shorts",
        "title": "StreamFlix Kids Shorts",
        "description": (
            "A family-friendly anthology of colorful "
            "animated shorts and short adventures."
        ),
        "release_year": 2020,
        "maturity_rating": "all",
        "genres": [
            "Animation",
            "Family",
            "Adventure",
        ],
        "directors": [
            "Blender Foundation",
        ],
        "cast": [
            "Blender Open Movie Characters",
        ],
        "poster_url": IMG["bbb"],
        "backdrop_url": IMG["bbb"],
        "is_featured": True,
        "seasons": [
            {
                "season_number": 1,
                "title": "Kids Open Movie Collection",
                "description": (
                    "Family-friendly animated shorts."
                ),
                "poster_url": IMG["bbb"],
                "episodes": [
                    {
                        "episode_number": 1,
                        "title": "Big Buck Bunny",
                        "description": (
                            "A cheerful animated short "
                            "featuring Big Buck Bunny."
                        ),
                        "duration": 10,
                        "video_url": VIDEO["bbb"],
                        "thumbnail_url": IMG["bbb"],
                    },
                    {
                        "episode_number": 2,
                        "title": "Sintel",
                        "description": (
                            "A fantasy adventure featuring "
                            "a young woman and a dragon."
                        ),
                        "duration": 15,
                        "video_url": VIDEO["sintel"],
                        "thumbnail_url": IMG["sintel"],
                    },
                    {
                        "episode_number": 3,
                        "title": "For Bigger Fun",
                        "description": (
                            "A short sample video for "
                            "testing StreamFlix playback."
                        ),
                        "duration": 3,
                        "video_url": VIDEO["fun"],
                        "thumbnail_url": IMG["fun"],
                    },
                    {
                        "episode_number": 4,
                        "title": "For Bigger Joyrides",
                        "description": (
                            "A short sample video for "
                            "testing StreamFlix playback."
                        ),
                        "duration": 3,
                        "video_url": VIDEO["joyrides"],
                        "thumbnail_url": IMG["joyrides"],
                    },
                ],
            }
        ],
    },

    {
        "slug": "streamflix-animation-anthology",
        "title": "StreamFlix Animation Anthology",
        "description": (
            "A rotating anthology of visually "
            "ambitious open short films and demo "
            "videos."
        ),
        "release_year": 2015,
        "maturity_rating": "7+",
        "genres": [
            "Animation",
            "Fantasy",
            "Science Fiction",
        ],
        "directors": [
            "Blender Foundation",
        ],
        "cast": [
            "Blender Open Movie Characters",
        ],
        "poster_url": IMG["tears"],
        "backdrop_url": IMG["tears"],
        "is_featured": False,
        "seasons": [
            {
                "season_number": 1,
                "title": "Open Cinema",
                "description": (
                    "Selected open short films and "
                    "sample videos."
                ),
                "poster_url": IMG["tears"],
                "episodes": [
                    {
                        "episode_number": 1,
                        "title": "Tears of Steel",
                        "description": (
                            "A science-fiction open movie "
                            "sample from the Blender Foundation."
                        ),
                        "duration": 12,
                        "video_url": VIDEO["tears"],
                        "thumbnail_url": IMG["tears"],
                    },
                    {
                        "episode_number": 2,
                        "title": "For Bigger Blazes",
                        "description": (
                            "A short sample video for "
                            "testing StreamFlix playback."
                        ),
                        "duration": 3,
                        "video_url": VIDEO["blazes"],
                        "thumbnail_url": IMG["blazes"],
                    },
                    {
                        "episode_number": 3,
                        "title": "For Bigger Escapes",
                        "description": (
                            "A short sample video for "
                            "testing StreamFlix playback."
                        ),
                        "duration": 3,
                        "video_url": VIDEO["escapes"],
                        "thumbnail_url": IMG["escapes"],
                    },
                ],
            }
        ],
    },
]


# ---------------------------------------------------------------------------
# MAIN SEED FUNCTION
# ---------------------------------------------------------------------------

@transaction.atomic
def seed():
    print()
    print("==============================================")
    print(" STREAMFLIX CATALOG SEED")
    print("==============================================")
    print()

    # -----------------------------------------------------------------------
    # GENRES
    # -----------------------------------------------------------------------

    print("[1/4] Creating genres...")

    genres = [
        "Animation",
        "Comedy",
        "Family",
        "Fantasy",
        "Adventure",
        "Science Fiction",
        "Action",
        "Drama",
        "Short Film",
    ]

    for name in genres:
        get_or_create_genre(name)

    print(f"  [OK] Genres ready: {Genre.objects.count()}")

    # -----------------------------------------------------------------------
    # MOVIES
    # -----------------------------------------------------------------------

    print()
    print("[2/4] Seeding movies...")

    for movie_data in MOVIES:
        upsert_movie(movie_data)

    # -----------------------------------------------------------------------
    # TV SHOWS
    # -----------------------------------------------------------------------

    print()
    print("[3/4] Seeding TV shows + seasons + episodes...")

    for show_data in SHOWS:
        show = upsert_show(show_data)

        for season_data in show_data.get(
            "seasons",
            [],
        ):
            seed_season_and_episodes(
                show,
                season_data,
            )

    # -----------------------------------------------------------------------
    # FINAL SUMMARY
    # -----------------------------------------------------------------------

    print()
    print("[4/4] Final catalog check...")
    print()

    print("==============================================")
    print(" STREAMFLIX CATALOG READY")
    print("==============================================")

    print(
        f"Movies:   "
        f"{Movie.objects.filter(is_published=True).count()}"
    )

    print(
        f"Shows:    "
        f"{TVShow.objects.filter(is_published=True).count()}"
    )

    print(
        f"Seasons:  "
        f"{Season.objects.count()}"
    )

    print(
        f"Episodes: "
        f"{Episode.objects.filter(is_published=True).count()}"
    )

    print(
        f"Genres:   "
        f"{Genre.objects.count()}"
    )

    print(
        f"People:   "
        f"{Person.objects.count()}"
    )

    print()
    print("Media:")
    print("  Posters/backdrops are downloaded into MEDIA_ROOT.")
    print("  Videos remain remote and are played from video_url.")

    print()
    print("Video source:")
    print("  Google public sample MP4 files.")

    print()
    print("IMPORTANT:")
    print(
        "  The current Movie/Episode model has one video_url "
        "per content item."
    )

    print(
        "  A real quality selector requires multiple video "
        "encodes or HLS/DASH."
    )

    print(
        "  The StreamFlix quality label should not be treated "
        "as a real bitrate selector yet."
    )

    print()
    print("==============================================")
    print()


# ---------------------------------------------------------------------------
# DJANGO MANAGEMENT COMMAND
# ---------------------------------------------------------------------------

class Command(BaseCommand):
    help = (
        "Seed StreamFlix catalog with movies, TV shows, "
        "episodes, genres, people, posters and backdrops."
    )

    def handle(self, *args, **options):
        try:
            seed()

        except Exception as exc:
            self.stdout.write(
                self.style.ERROR(
                    f"\nSEED FAILED: {exc}\n"
                )
            )
            raise