import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getSubscriptionPlans,
  getCurrentSubscription,
  getSubscriptionHistory,
  activateSubscription,
} from "../../services/subscriptions";

import "./Subscription.css";


// ============================================================
// HELPERS
// ============================================================

const normalizeArray = (data, key) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.[key])) {
    return data[key];
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};


const formatPrice = (price) => {
  const number = Number(price);

  if (!Number.isFinite(number)) {
    return "0.00";
  }

  return number.toFixed(2);
};


const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
};


const getQualityLabel = (quality) => {
  const labels = {
    SD: "SD",
    HD: "HD",
    FULL_HD: "Full HD",
    "4K": "4K",
  };

  return labels[quality] || quality || "HD";
};


// ============================================================
// ICONS
// ============================================================

const CheckIcon = () => (
  <span className="subscription-check">
    ✓
  </span>
);


const PlayIcon = () => (
  <span className="subscription-play-icon">
    ▶
  </span>
);


// ============================================================
// PAYMENT MODAL
// ============================================================

const PaymentModal = ({
  plan,
  onClose,
  onSuccess,
}) => {

  const [cardName, setCardName] =
    useState("");

  const [cardNumber, setCardNumber] =
    useState("");

  const [expiry, setExpiry] =
    useState("");

  const [cvv, setCvv] =
    useState("");

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");


  // ----------------------------------------------------------
  // FORMAT CARD NUMBER
  // ----------------------------------------------------------

  const handleCardNumberChange = (
    event
  ) => {

    let value =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 16);

    value =
      value.replace(
        /(.{4})/g,
        "$1 "
      ).trim();

    setCardNumber(value);
  };


  // ----------------------------------------------------------
  // FORMAT EXPIRY
  // ----------------------------------------------------------

  const handleExpiryChange = (
    event
  ) => {

    let value =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 4);

    if (value.length >= 3) {
      value =
        `${value.slice(0, 2)}/${value.slice(2)}`;
    }

    setExpiry(value);
  };


  // ----------------------------------------------------------
  // SUBMIT
  // ----------------------------------------------------------

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setError("");


    const cleanCardNumber =
      cardNumber.replace(/\s/g, "");


    if (!cardName.trim()) {
      setError(
        "Please enter the cardholder name."
      );
      return;
    }


    if (
      cleanCardNumber.length !== 16
    ) {
      setError(
        "Please enter a valid 16-digit card number."
      );
      return;
    }


    if (expiry.length !== 5) {
      setError(
        "Please enter a valid expiry date."
      );
      return;
    }


    if (cvv.length !== 3) {
      setError(
        "Please enter a valid 3-digit CVV."
      );
      return;
    }


    try {

      setProcessing(true);

      const response =
        await activateSubscription(
          plan.id
        );

      onSuccess(response);

    } catch (err) {

      console.error(
        "Subscription activation error:",
        err
      );

      const message =
        err.response?.data?.detail ||
        "Unable to activate subscription. Please try again.";

      setError(message);

    } finally {

      setProcessing(false);

    }
  };


  return (

    <div
      className="subscription-modal-backdrop"
      onMouseDown={(event) => {

        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }

      }}
    >

      <div className="subscription-modal">

        {/* ================================================== */}
        {/* MODAL HEADER */}
        {/* ================================================== */}

        <div className="subscription-modal-header">

          <div>

            <span className="subscription-modal-eyebrow">
              CHECKOUT
            </span>

            <h2>
              Complete your plan
            </h2>

          </div>


          <button
            type="button"
            className="subscription-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>

        </div>


        {/* ================================================== */}
        {/* PLAN SUMMARY */}
        {/* ================================================== */}

        <div className="subscription-checkout-plan">

          <div>

            <span className="subscription-small-label">
              SELECTED PLAN
            </span>

            <h3>
              {plan.name}
            </h3>

            <p>
              {getQualityLabel(
                plan.video_quality
              )}
              {" • "}
              {plan.max_devices}{" "}
              {plan.max_devices === 1
                ? "device"
                : "devices"}
            </p>

          </div>


          <div className="subscription-checkout-price">

            <strong>
              ${formatPrice(plan.price)}
            </strong>

            <span>
              / month
            </span>

          </div>

        </div>


        {/* ================================================== */}
        {/* DEMO NOTICE */}
        {/* ================================================== */}

        <div className="subscription-demo-notice">

          <span>ⓘ</span>

          <p>
            This is a demo checkout for the
            StreamFlix assignment. No real
            payment will be charged.
          </p>

        </div>


        {/* ================================================== */}
        {/* PAYMENT FORM */}
        {/* ================================================== */}

        <form
          className="subscription-payment-form"
          onSubmit={handleSubmit}
        >

          <div className="subscription-form-group">

            <label>
              Cardholder Name
            </label>

            <input
              type="text"
              placeholder="John Doe"
              value={cardName}
              onChange={(event) =>
                setCardName(
                  event.target.value
                )
              }
              disabled={processing}
            />

          </div>


          <div className="subscription-form-group">

            <label>
              Card Number
            </label>

            <div className="subscription-card-input">

              <span>
                💳
              </span>

              <input
                type="text"
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={
                  handleCardNumberChange
                }
                disabled={processing}
              />

            </div>

          </div>


          <div className="subscription-form-row">

            <div className="subscription-form-group">

              <label>
                Expiry
              </label>

              <input
                type="text"
                inputMode="numeric"
                placeholder="MM/YY"
                value={expiry}
                onChange={
                  handleExpiryChange
                }
                disabled={processing}
              />

            </div>


            <div className="subscription-form-group">

              <label>
                CVV
              </label>

              <input
                type="password"
                inputMode="numeric"
                placeholder="123"
                maxLength={3}
                value={cvv}
                onChange={(event) =>
                  setCvv(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 3)
                  )
                }
                disabled={processing}
              />

            </div>

          </div>


          {error && (

            <div className="subscription-form-error">
              {error}
            </div>

          )}


          <button
            type="submit"
            className="subscription-pay-button"
            disabled={processing}
          >

            {processing ? (
              <>
                <span className="subscription-button-spinner"></span>
                Processing...
              </>
            ) : (
              <>
                <PlayIcon />
                Activate {plan.name}
              </>
            )}

          </button>


          <p className="subscription-secure-text">
            🔒 Secure demo checkout •
            Your card details are not stored.
          </p>

        </form>

      </div>

    </div>

  );
};


// ============================================================
// SUBSCRIPTION PAGE
// ============================================================

const Subscription = () => {

  const [plans, setPlans] =
    useState([]);

  const [currentSubscription, setCurrentSubscription] =
    useState(null);

  const [hasSubscription, setHasSubscription] =
    useState(false);

  const [history, setHistory] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedPlan, setSelectedPlan] =
    useState(null);

  const [successMessage, setSuccessMessage] =
    useState("");


  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadSubscriptionData =
    async () => {

      try {

        setLoading(true);
        setError("");
        setSuccessMessage("");

        const [
          plansResponse,
          currentResponse,
          historyResponse,
        ] = await Promise.all([
          getSubscriptionPlans(),
          getCurrentSubscription(),
          getSubscriptionHistory(),
        ]);


        const normalizedPlans =
          normalizeArray(
            plansResponse,
            "plans"
          );


        const subscription =
          currentResponse?.subscription ||
          null;


        setPlans(
          normalizedPlans
        );

        setCurrentSubscription(
          subscription
        );

        setHasSubscription(
          Boolean(
            currentResponse?.has_subscription
          )
        );

        setHistory(
          normalizeArray(
            historyResponse,
            "subscriptions"
          )
        );

      } catch (err) {

        console.error(
          "Subscription page error:",
          err
        );

        const message =
          err.response?.data?.detail ||
          "Unable to load subscription information.";

        setError(message);

      } finally {

        setLoading(false);

      }
    };


  useEffect(() => {

    loadSubscriptionData();

  }, []);


  // ==========================================================
  // CURRENT PLAN ID
  // ==========================================================

  const currentPlanId =
    useMemo(() => {

      if (
        !hasSubscription ||
        !currentSubscription
      ) {
        return null;
      }

      return Number(
        currentSubscription.plan?.id
      );

    }, [
      hasSubscription,
      currentSubscription,
    ]);


  // ==========================================================
  // OPEN CHECKOUT
  // ==========================================================

  const handleSelectPlan = (
    plan
  ) => {

    if (
      Number(plan.id) ===
      currentPlanId
    ) {
      return;
    }

    setSelectedPlan(plan);
    setSuccessMessage("");

  };


  // ==========================================================
  // PAYMENT SUCCESS
  // ==========================================================

  const handlePaymentSuccess =
    async (response) => {

      setSelectedPlan(null);

      setSuccessMessage(
        response?.message ||
        "Subscription activated successfully."
      );

      await loadSubscriptionData();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div className="subscription-page">

        <div className="subscription-loading">

          <div className="subscription-page-spinner"></div>

          <p>
            Loading subscription plans...
          </p>

        </div>

      </div>

    );

  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    return (

      <div className="subscription-page">

        <div className="subscription-error-state">

          <div className="subscription-error-icon">
            !
          </div>

          <h2>
            Something went wrong
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="subscription-retry-button"
            onClick={loadSubscriptionData}
          >
            Try Again
          </button>

        </div>

      </div>

    );

  }


  return (

    <div className="subscription-page">

      {/* ==================================================== */}
      {/* HERO */}
      {/* ==================================================== */}

      <section className="subscription-hero">

        <div className="subscription-hero-content">

          <span className="subscription-eyebrow">
            STREAMFLIX MEMBERSHIP
          </span>

          <h1>
            Choose the plan
            <br />
            that works for you.
          </h1>

          <p>
            Watch unlimited movies and TV shows
            with the quality and devices that fit
            your entertainment needs.
          </p>

        </div>

      </section>


      {/* ==================================================== */}
      {/* SUCCESS MESSAGE */}
      {/* ==================================================== */}

      {successMessage && (

        <div className="subscription-success-wrapper">

          <div className="subscription-success">

            <span className="subscription-success-icon">
              ✓
            </span>

            <div>

              <strong>
                Subscription updated
              </strong>

              <p>
                {successMessage}
              </p>

            </div>

          </div>

        </div>

      )}


      {/* ==================================================== */}
      {/* CURRENT PLAN */}
      {/* ==================================================== */}

      <section className="subscription-current-section">

        <div className="subscription-section-heading">

          <div>

            <span>
              YOUR MEMBERSHIP
            </span>

            <h2>
              Current plan
            </h2>

          </div>

        </div>


        {hasSubscription &&
        currentSubscription ? (

          <div className="subscription-current-card">

            <div className="subscription-current-main">

              <div className="subscription-current-icon">
                ✓
              </div>

              <div>

                <span className="subscription-current-label">
                  ACTIVE PLAN
                </span>

                <h3>
                  {
                    currentSubscription.plan?.name
                  }
                </h3>

                <p>
                  Your membership is active
                  and ready for streaming.
                </p>

              </div>

            </div>


            <div className="subscription-current-details">

              <div>

                <span>
                  PRICE
                </span>

                <strong>
                  $
                  {formatPrice(
                    currentSubscription.plan?.price
                  )}
                  <small>
                    /month
                  </small>
                </strong>

              </div>


              <div>

                <span>
                  QUALITY
                </span>

                <strong>
                  {getQualityLabel(
                    currentSubscription.plan
                      ?.video_quality
                  )}
                </strong>

              </div>


              <div>

                <span>
                  DEVICES
                </span>

                <strong>
                  {
                    currentSubscription.plan
                      ?.max_devices
                  }
                </strong>

              </div>


              <div>

                <span>
                  EXPIRES
                </span>

                <strong>
                  {formatDate(
                    currentSubscription.end_date
                  )}
                </strong>

              </div>

            </div>

          </div>

        ) : (

          <div className="subscription-no-plan">

            <div className="subscription-no-plan-icon">
              ▶
            </div>

            <div>

              <h3>
                No active subscription
              </h3>

              <p>
                Choose a plan below to start
                watching StreamFlix.
              </p>

            </div>

          </div>

        )}

      </section>


      {/* ==================================================== */}
      {/* PRICING */}
      {/* ==================================================== */}

      <section className="subscription-plans-section">

        <div className="subscription-section-heading centered">

          <span>
            MEMBERSHIP PLANS
          </span>

          <h2>
            Pick your perfect plan
          </h2>

          <p>
            Simple pricing. No hidden surprises.
          </p>

        </div>


        <div className="subscription-plans-grid">

          {plans.map((plan, index) => {

            const isCurrent =
              Number(plan.id) ===
              currentPlanId;

            const isPopular =
              plans.length >= 3 &&
              index === 1;


            return (

              <article
                key={plan.id}
                className={
                  `subscription-plan-card ${
                    isCurrent
                      ? "current"
                      : ""
                  } ${
                    isPopular
                      ? "popular"
                      : ""
                  }`
                }
              >

                {isPopular && (

                  <div className="subscription-popular-badge">
                    MOST POPULAR
                  </div>

                )}


                {isCurrent && (

                  <div className="subscription-current-badge">
                    CURRENT PLAN
                  </div>

                )}


                <div className="subscription-plan-top">

                  <span className="subscription-plan-number">
                    0{index + 1}
                  </span>

                  <h3>
                    {plan.name}
                  </h3>

                  <p>
                    Built for your
                    entertainment.
                  </p>

                </div>


                <div className="subscription-plan-price">

                  <strong>
                    $
                    {formatPrice(
                      plan.price
                    )}
                  </strong>

                  <span>
                    / month
                  </span>

                </div>


                <div className="subscription-plan-divider"></div>


                <ul className="subscription-feature-list">

                  <li>
                    <CheckIcon />

                    <span>
                      {getQualityLabel(
                        plan.video_quality
                      )} video quality
                    </span>
                  </li>


                  <li>
                    <CheckIcon />

                    <span>
                      Watch on{" "}
                      {plan.max_devices}{" "}
                      {plan.max_devices === 1
                        ? "device"
                        : "devices"}
                    </span>
                  </li>


                  <li>
                    <CheckIcon />

                    <span>
                      Unlimited movies
                    </span>
                  </li>


                  <li>
                    <CheckIcon />

                    <span>
                      Unlimited TV shows
                    </span>
                  </li>


                  <li>
                    <CheckIcon />

                    <span>
                      Personalized profiles
                    </span>
                  </li>

                </ul>


                <button
                  type="button"
                  className={
                    `subscription-plan-button ${
                      isCurrent
                        ? "current"
                        : ""
                    }`
                  }
                  disabled={isCurrent}
                  onClick={() =>
                    handleSelectPlan(plan)
                  }
                >

                  {isCurrent
                    ? "Current Plan"
                    : currentPlanId
                    ? "Upgrade Plan"
                    : "Choose Plan"}

                </button>

              </article>

            );

          })}

        </div>

      </section>


      {/* ==================================================== */}
      {/* COMPARISON */}
      {/* ==================================================== */}

      {plans.length > 0 && (

        <section className="subscription-comparison-section">

          <div className="subscription-section-heading">

            <span>
              PLAN DETAILS
            </span>

            <h2>
              Compare plans
            </h2>

          </div>


          <div className="subscription-comparison">

            <div className="subscription-comparison-row header">

              <div>
                Feature
              </div>

              {plans.map((plan) => (

                <div key={plan.id}>
                  {plan.name}
                </div>

              ))}

            </div>


            <div className="subscription-comparison-row">

              <div>
                Video quality
              </div>

              {plans.map((plan) => (

                <div key={plan.id}>
                  {getQualityLabel(
                    plan.video_quality
                  )}
                </div>

              ))}

            </div>


            <div className="subscription-comparison-row">

              <div>
                Devices
              </div>

              {plans.map((plan) => (

                <div key={plan.id}>
                  {plan.max_devices}
                </div>

              ))}

            </div>


            <div className="subscription-comparison-row">

              <div>
                Monthly price
              </div>

              {plans.map((plan) => (

                <div key={plan.id}>
                  $
                  {formatPrice(
                    plan.price
                  )}
                </div>

              ))}

            </div>

          </div>

        </section>

      )}


      {/* ==================================================== */}
      {/* SUBSCRIPTION HISTORY */}
      {/* ==================================================== */}

      {history.length > 0 && (

        <section className="subscription-history-section">

          <div className="subscription-section-heading">

            <span>
              BILLING
            </span>

            <h2>
              Subscription history
            </h2>

          </div>


          <div className="subscription-history-list">

            {history.map((item) => (

              <div
                key={item.id}
                className="subscription-history-item"
              >

                <div className="subscription-history-plan">

                  <div className="subscription-history-icon">
                    ✓
                  </div>

                  <div>

                    <strong>
                      {item.plan?.name ||
                        "Subscription"}
                    </strong>

                    <span>
                      Started{" "}
                      {formatDate(
                        item.start_date
                      )}
                    </span>

                  </div>

                </div>


                <div className="subscription-history-status">

                  <span
                    className={
                      `subscription-status ${
                        item.status
                      }`
                    }
                  >
                    {item.status}
                  </span>

                  <span>
                    {formatDate(
                      item.end_date
                    )}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </section>

      )}


      {/* ==================================================== */}
      {/* FOOTER NOTE */}
      {/* ==================================================== */}

      <section className="subscription-footer">

        <div>

          <span>
            STREAMFLIX
          </span>

          <h3>
            Entertainment without limits.
          </h3>

          <p>
            Choose your plan and start watching
            your favorite movies and shows.
          </p>

        </div>

      </section>


      {/* ==================================================== */}
      {/* PAYMENT MODAL */}
      {/* ==================================================== */}

      {selectedPlan && (

        <PaymentModal
          plan={selectedPlan}
          onClose={() =>
            setSelectedPlan(null)
          }
          onSuccess={
            handlePaymentSuccess
          }
        />

      )}

    </div>

  );
};


export default Subscription;