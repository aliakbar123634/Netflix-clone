// import {
//   Link,
// } from "react-router-dom";


// const Landing = () => {

//   return (

//     <main className="landing-page">

//       <div className="landing-content">

//         <span className="landing-eyebrow">
//           STREAMFLIX
//         </span>


//         <h1>
//           Unlimited movies,
//           <br />
//           TV shows, and more.
//         </h1>


//         <p>
//           Watch anywhere. Cancel anytime.
//         </p>


//         <div className="landing-actions">

//           <Link
//             to="/login"
//             className="primary-button"
//           >
//             Sign In
//           </Link>


//           <Link
//             to="/signup"
//             className="secondary-button"
//           >
//             Get Started
//           </Link>

//         </div>

//       </div>

//     </main>

//   );

// };


// export default Landing;



import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";


// ============================================================
// TRENDING CONTENT
// ============================================================

const trendingItems = [
  {
    number: "01",
    title: "The Last Horizon",
    genre: "Action",
    image:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "02",
    title: "Dark City",
    genre: "Thriller",
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "03",
    title: "The Unknown",
    genre: "Sci-Fi",
    image:
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "04",
    title: "Into The Wild",
    genre: "Adventure",
    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "05",
    title: "Nightfall",
    genre: "Drama",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "06",
    title: "Final Mission",
    genre: "Action",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85",
  },
];


// ============================================================
// FAQ DATA
// ============================================================

const faqItems = [
  {
    question: "What is StreamFlix?",
    answer:
      "StreamFlix is a streaming platform where you can watch movies and TV shows across your favorite devices.",
  },
  {
    question: "How much does StreamFlix cost?",
    answer:
      "Choose the subscription plan that works best for you. You can manage your subscription from your account.",
  },
  {
    question: "Where can I watch?",
    answer:
      "You can watch StreamFlix on supported phones, tablets, laptops, and desktop devices.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "You can manage or cancel your subscription from the Subscription section of your StreamFlix account.",
  },
  {
    question: "What can I watch on StreamFlix?",
    answer:
      "StreamFlix includes movies, TV shows, episodes, popular content, and personalized recommendations.",
  },
  {
    question: "Is StreamFlix suitable for kids?",
    answer:
      "Yes. StreamFlix supports Kids profiles with age-appropriate content controls.",
  },
];


// ============================================================
// LANDING PAGE
// ============================================================

const Landing = () => {

  const [
    email,
    setEmail,
  ] = useState("");


  const [
    openFaq,
    setOpenFaq,
  ] = useState(null);


  // ==========================================================
  // FAQ TOGGLE
  // ==========================================================

  const handleFaqToggle = (
    index
  ) => {

    setOpenFaq(
      previous =>
        previous === index
          ? null
          : index
    );

  };


  // ==========================================================
  // EMAIL
  // ==========================================================

  const handleEmailChange = (
    event
  ) => {

    setEmail(
      event.target.value
    );

  };


  return (

    <main className="landing-page">


      {/* ==================================================== */}
      {/* HERO BACKGROUND */}
      {/* ==================================================== */}

      <section className="landing-hero">


        <div
          className="landing-hero-background"
          aria-hidden="true"
        />


        <div
          className="landing-hero-overlay"
          aria-hidden="true"
        />


        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <header className="landing-header">

          <Link
            to="/"
            className="landing-logo"
          >
            STREAMFLIX
          </Link>


          <Link
            to="/login"
            className="landing-signin"
          >
            Sign In
          </Link>

        </header>


        {/* ================================================== */}
        {/* HERO CONTENT */}
        {/* ================================================== */}

        <div className="landing-hero-content">


          <span className="landing-eyebrow">
            STREAMFLIX
          </span>


          <h1>
            Unlimited movies,
            <br />
            TV shows, and more.
          </h1>


          <h2>
            Watch anywhere. Cancel anytime.
          </h2>


          <p className="landing-hero-description">
            Ready to watch? Enter your email
            to create or restart your membership.
          </p>


          {/* ================================================ */}
          {/* EMAIL CTA */}
          {/* ================================================ */}

          <div className="landing-email-section">

            <div className="landing-email-form">

              <input
                type="email"
                value={email}
                onChange={
                  handleEmailChange
                }
                placeholder="Email address"
                aria-label="Email address"
                autoComplete="email"
              />


              <Link
                to="/signup"
                className="landing-get-started"
              >

                Get Started

                <span>
                  ›
                </span>

              </Link>

            </div>


            <p className="landing-email-note">
              Enter your email to get started
              with StreamFlix.
            </p>

          </div>


        </div>


        {/* ================================================== */}
        {/* HERO FADE */}
        {/* ================================================== */}

        <div
          className="landing-hero-bottom-fade"
          aria-hidden="true"
        />

      </section>


      {/* ==================================================== */}
      {/* MAIN CONTENT */}
      {/* ==================================================== */}

      <div className="landing-body">


        {/* ================================================== */}
        {/* TRENDING */}
        {/* ================================================== */}

        <section className="landing-section">


          <div className="landing-section-header">

            <div>

              <span className="landing-section-label">
                EXPLORE
              </span>

              <h2>
                Trending Now
              </h2>

            </div>

          </div>


          <div className="landing-trending-wrapper">

            <div className="landing-trending-row">

              {trendingItems.map(
                item => (

                  <article
                    className="landing-trending-card"
                    key={
                      item.number
                    }
                  >

                    <div className="landing-number">

                      {item.number}

                    </div>


                    <div className="landing-trending-image">

                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                      />

                    </div>


                    <div className="landing-trending-gradient" />


                    <div className="landing-trending-info">

                      <h3>
                        {item.title}
                      </h3>

                      <span>
                        {item.genre}
                      </span>

                    </div>

                  </article>

                )
              )}

            </div>

          </div>

        </section>


        {/* ================================================== */}
        {/* DIVIDER */}
        {/* ================================================== */}

        <div className="landing-divider" />


        {/* ================================================== */}
        {/* MORE REASONS */}
        {/* ================================================== */}

        <section className="landing-section">


          <div className="landing-section-header">

            <div>

              <span className="landing-section-label">
                STREAMFLIX
              </span>

              <h2>
                More Reasons to Join
              </h2>

            </div>

          </div>


          <div className="landing-reasons-grid">


            <article className="landing-reason-card">

              <div className="landing-reason-icon">
                TV
              </div>

              <h3>
                Enjoy on your TV
              </h3>

              <p>
                Watch StreamFlix on your
                smart TV, gaming console,
                streaming device, and more.
              </p>

            </article>


            <article className="landing-reason-card">

              <div className="landing-reason-icon">
                ↓
              </div>

              <h3>
                Download your shows
              </h3>

              <p>
                Save your favorite content
                and enjoy it whenever you
                want.
              </p>

            </article>


            <article className="landing-reason-card">

              <div className="landing-reason-icon">
                ◉
              </div>

              <h3>
                Watch everywhere
              </h3>

              <p>
                Stream your favorite movies
                and shows across supported
                devices.
              </p>

            </article>


            <article className="landing-reason-card">

              <div className="landing-reason-icon">
                K
              </div>

              <h3>
                Create profiles for kids
              </h3>

              <p>
                Give kids their own space
                with age-appropriate content.
              </p>

            </article>


          </div>

        </section>


        {/* ================================================== */}
        {/* DIVIDER */}
        {/* ================================================== */}

        <div className="landing-divider" />


        {/* ================================================== */}
        {/* FAQ */}
        {/* ================================================== */}

        <section className="landing-section landing-faq-section">


          <div className="landing-section-header">

            <div>

              <span className="landing-section-label">
                HELP
              </span>

              <h2>
                Frequently Asked Questions
              </h2>

            </div>

          </div>


          <div className="landing-faq-list">

            {faqItems.map(
              (item, index) => {

                const isOpen =
                  openFaq === index;


                return (

                  <div
                    className={
                      `landing-faq-item ${
                        isOpen
                          ? "landing-faq-item-open"
                          : ""
                      }`
                    }
                    key={
                      item.question
                    }
                  >

                    <button
                      type="button"
                      className="landing-faq-question"
                      onClick={() =>
                        handleFaqToggle(
                          index
                        )
                      }
                      aria-expanded={
                        isOpen
                      }
                    >

                      <span>
                        {item.question}
                      </span>


                      <span
                        className="landing-faq-icon"
                      >
                        {isOpen
                          ? "×"
                          : "+"
                        }
                      </span>

                    </button>


                    {isOpen && (

                      <div className="landing-faq-answer">

                        <p>
                          {item.answer}
                        </p>

                      </div>

                    )}

                  </div>

                );

              }
            )}

          </div>


        </section>


        {/* ================================================== */}
        {/* FINAL CTA */}
        {/* ================================================== */}

        <section className="landing-final-cta">

          <h2>
            Ready to watch?
          </h2>


          <p>
            Enter your email to create
            your StreamFlix account.
          </p>


          <div className="landing-email-form landing-email-form-bottom">

            <input
              type="email"
              value={email}
              onChange={
                handleEmailChange
              }
              placeholder="Email address"
              aria-label="Email address"
              autoComplete="email"
            />


            <Link
              to="/signup"
              className="landing-get-started"
            >

              Get Started

              <span>
                ›
              </span>

            </Link>

          </div>

        </section>


      </div>


      {/* ==================================================== */}
      {/* FOOTER */}
      {/* ==================================================== */}

      <footer className="landing-footer">


        <p>
          Questions? Contact StreamFlix support.
        </p>


        <div className="landing-footer-links">

          <Link to="/login">
            Account
          </Link>

          <Link to="/signup">
            Sign Up
          </Link>

          <Link to="/login">
            Sign In
          </Link>

          <Link to="/">
            Terms of Use
          </Link>

          <Link to="/">
            Privacy
          </Link>

        </div>


        <div className="landing-footer-brand">
          STREAMFLIX
        </div>


      </footer>


    </main>

  );

};


export default Landing;