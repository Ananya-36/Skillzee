export default function HowItWorksPage() {
  const learnerSteps = [
    "Create one profile with bio, skills, and WhatsApp number",
    "Browse classes and ask the AI assistant for suggestions",
    "Book a time slot with the calendar flow",
    "Pay through the simulated Razorpay or UPI step",
    "Chat via app, WhatsApp, or email",
    "Attend session, review it, and download your certificate"
  ];

  const trainerSteps = [
    "Register once and switch to Provider view",
    "Publish a skill with price, duration, outcomes, and session mode",
    "Receive realtime dashboard notifications and email alerts",
    "Run the class through Google Meet or in-app video",
    "Mark the session complete and unlock payout plus badges"
  ];

  return (
    <section className="container page-header">
      <div className="page-header">
        <span className="eyebrow">How SkillSwap Works</span>
        <h1>Simple enough for first-time users, strong enough for real marketplace operations.</h1>
        <p className="muted">
          SkillSwap combines discovery, booking, chat, communication handoff, delivery, ratings, and payouts
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
