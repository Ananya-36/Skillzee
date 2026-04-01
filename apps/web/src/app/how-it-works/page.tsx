export default function HowItWorksPage() {
  const learnerSteps = [
    "Sign up",
    "Browse skills",
    "Book session",
    "Chat via app, WhatsApp, or email",
    "Attend session",
    "Rate trainer"
  ];

  const trainerSteps = [
    "Register",
    "Add skill",
    "Receive booking notification",
    "Conduct session",
    "Earn money"
  ];

  return (
    <section className="container page-header">
      <div className="page-header">
        <span className="eyebrow">How Skillzee Works</span>
        <h1>Simple enough for first-time users, strong enough for real marketplace operations.</h1>
        <p className="muted">
          Skillzee combines discovery, booking, chat, communication handoff, delivery, ratings, and payouts
          in one student-friendly flow.
        </p>
      </div>

      <div className="split-layout">
        <article className="panel">
          <h2>Learner Flow</h2>
          <div className="stack" style={{ marginTop: 20 }}>
            {learnerSteps.map((step, index) => (
              <div key={step} className="timeline-step">
                <span>{index + 1}</span>
                <div>
                  <h3>{step}</h3>
                  <p>
                    {index === 3
                      ? "Use in-app chat first, then jump to WhatsApp or email when you need faster coordination."
                      : "Move to the next step with clean handoffs, saved context, and visible booking status."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
        <article className="panel">
          <h2>Trainer Flow</h2>
          <div className="stack" style={{ marginTop: 20 }}>
            {trainerSteps.map((step, index) => (
              <div key={step} className="timeline-step">
                <span>{index + 1}</span>
                <div>
                  <h3>{step}</h3>
                  <p>
                    {index === 2
                      ? "Realtime notifications notify trainers instantly when a booking or message arrives."
                      : "Trainer dashboards surface bookings, wallet changes, badges, and learner reviews."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
