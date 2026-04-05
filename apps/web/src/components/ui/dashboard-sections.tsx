import Link from "next/link";
import { BellRing, Medal, PlusCircle, Sparkles, Wallet2 } from "lucide-react";
import { SkillCard } from "@/components/ui/skill-card";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";
import { buildMeetingLink } from "@/lib/communication";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getAvatarSrc, uniqueStrings } from "@/lib/presentation";
import type { Booking, NotificationItem, Skill, User, WalletResponse } from "@/types";

type LearnerDashboardSectionProps = {
  currentUser: User;
  learnerBookings: Booking[];
  learnerCompletedBookings: Booking[];
  recommended: Skill[];
  notifications: NotificationItem[];
  inAppBooking?: Booking;
  token: string | null;
  onSubmitReview: (formData: FormData) => Promise<void>;
  onEnablePush: () => Promise<void>;
  children?: React.ReactNode;
};

type ProviderApplicant = {
  bookingId: string;
  learner: User;
  skillTitle: string;
  scheduledAt: string;
  status: Booking["status"];
};

type ProviderDashboardSectionProps = {
  currentUser: User;
  providerBookings: Booking[];
  providerApplicants: ProviderApplicant[];
  publishedSkills: Skill[];
  payments: WalletResponse["payments"];
  message: string;
  onUpdateBookingStatus: (bookingId: string, status: Booking["status"]) => Promise<void>;
  onCreateSkill: (formData: FormData) => Promise<void>;
};

export function LearnerDashboardSection({
  currentUser,
  learnerBookings,
  learnerCompletedBookings,
  recommended,
  notifications,
  inAppBooking,
  token,
  onSubmitReview,
  onEnablePush,
  children
}: LearnerDashboardSectionProps) {
  return (
    <>
      <div className="stack">
        <article className="panel profile-snapshot">
          <div className="skill-card__trainer">
            <img src={getAvatarSrc(currentUser.name, currentUser.avatarUrl)} alt={currentUser.name} className="avatar avatar--large" />
            <div>
              <span className="eyebrow">Learner profile</span>
              <h2>{currentUser.name}</h2>
              <p>{currentUser.bio || "Tell providers what you want to learn next."}</p>
            </div>
          </div>
          <div className="pill-row">
            {uniqueStrings(currentUser.interests).map((interest, index) => (
              <span key={`${interest}-${index}`} className="pill">
                {interest}
              </span>
            ))}
          </div>
          <div className="skill-card__stats">
            <span>{learnerBookings.length} classes booked</span>
            <span>{learnerCompletedBookings.length} completed</span>
            <span>{currentUser.points} learner points</span>
          </div>
        </article>

        <article className="panel">
          <div className="panel-actions" style={{ justifyContent: "space-between" }}>
            <div>
              <span className="eyebrow">Applied classes</span>
              <h2>Classes you have paid for</h2>
            </div>
            <Link href="/chat" className="button button--ghost">
              Open chat
            </Link>
          </div>
          <div className="stack" style={{ marginTop: 18 }}>
            {learnerBookings.map((booking) => {
              const trainerWhatsApp = booking.trainer.whatsAppNumber || booking.trainer.phone;

              return (
                <article key={booking._id} className="timeline-card">
                  <div className="panel-actions" style={{ justifyContent: "space-between" }}>
                    <div>
                      <h3>{booking.skill.title}</h3>
                      <p>{formatDateTime(booking.scheduledAt)}</p>
                    </div>
                    <span className="pill">{booking.status === "COMPLETED" ? "Completed" : "Active"}</span>
                  </div>
                  <div className="skill-card__trainer" style={{ marginTop: 12 }}>
                    <img src={getAvatarSrc(booking.trainer.name, booking.trainer.avatarUrl)} alt={booking.trainer.name} />
                    <div>
                      <strong>{booking.trainer.name}</strong>
                      <span>{booking.trainer.college}</span>
                    </div>
                  </div>
                  <div className="skill-card__stats">
                    <span>{formatCurrency(booking.amount)} paid</span>
                    <span>{booking.sessionType === "IN_APP" ? "In-app video" : "Google Meet"}</span>
                  </div>
                  <div className="panel-actions">
                    <Link href={`/chat?booking=${booking._id}`} className="button button--ghost">
                      Message trainer
                    </Link>
                    <WhatsAppLink phone={trainerWhatsApp} skillTitle={booking.skill.title} label="WhatsApp" />
                    {booking.sessionType === "GOOGLE_MEET" ? (
                      <a className="button button--primary" href={buildMeetingLink(booking.sessionLink)} target="_blank" rel="noreferrer">
                        Join Meeting
                      </a>
                    ) : null}
                    {booking.status === "COMPLETED" && token ? (
                      <a
                        className="button button--ghost"
                        href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"}/bookings/${booking._id}/certificate`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download certificate
                      </a>
                    ) : null}
                  </div>
                  {booking.status === "COMPLETED" ? (
                    <form className="form-grid" action={(formData) => void onSubmitReview(formData)}>
                      <input type="hidden" name="bookingId" value={booking._id} />
                      <div className="form-grid form-grid--two">
                        <label>
                          Rating
                          <select name="rating" defaultValue="5">
                            <option value="5">5 stars</option>
                            <option value="4">4 stars</option>
                            <option value="3">3 stars</option>
                            <option value="2">2 stars</option>
                            <option value="1">1 star</option>
                          </select>
                        </label>
                        <label>
                          Review
                          <input name="comment" placeholder="What went well?" />
                        </label>
                      </div>
                      <button className="button button--ghost" type="submit">
                        Submit review
                      </button>
                    </form>
                  ) : null}
                </article>
              );
            })}
          </div>
        </article>

        {children}
      </div>

      <div className="stack">
        <article className="panel">
          <div className="panel-actions" style={{ justifyContent: "space-between" }}>
            <div>
              <span className="eyebrow">Recommended</span>
              <h2>Recommendations from your interests and paid classes</h2>
            </div>
            <Sparkles size={18} />
          </div>
          <p className="muted">These suggestions use your selected interests, saved skills, and the classes you already booked.</p>
          <div className="stack" style={{ marginTop: 18 }}>
            {recommended.slice(0, 3).map((skill) => (
              <SkillCard key={skill._id} skill={skill} compact />
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-actions" style={{ justifyContent: "space-between" }}>
            <div>
              <span className="eyebrow">Completed</span>
              <h2>Finished classes</h2>
            </div>
            <span className="pill">{learnerCompletedBookings.length} done</span>
          </div>
          <div className="stack" style={{ marginTop: 18 }}>
            {learnerCompletedBookings.length ? (
              learnerCompletedBookings.map((booking) => (
                <article key={booking._id} className="timeline-card">
                  <strong>{booking.skill.title}</strong>
                  <p>
                    Completed with {booking.trainer.name} on {formatDateTime(booking.scheduledAt)}
                  </p>
                </article>
              ))
            ) : (
              <article className="timeline-card">
                <strong>No completed classes yet</strong>
                <p>Your finished sessions will appear here once a provider marks them complete.</p>
              </article>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-actions" style={{ justifyContent: "space-between" }}>
            <div>
              <span className="eyebrow">Notifications</span>
              <h2>Realtime alerts</h2>
            </div>
            <button type="button" className="button button--ghost" onClick={() => void onEnablePush()}>
              <BellRing size={16} />
              Enable push
            </button>
          </div>
          <div className="stack" style={{ marginTop: 18 }}>
            {notifications.map((notification) => (
              <article key={notification._id} className="timeline-card">
                <strong>{notification.title}</strong>
                <p>{notification.body}</p>
              </article>
            ))}
          </div>
        </article>
      </div>
    </>
  );
}

export function ProviderDashboardSection({
  currentUser,
  providerBookings,
  providerApplicants,
  publishedSkills,
  payments,
  message,
  onUpdateBookingStatus,
  onCreateSkill
}: ProviderDashboardSectionProps) {
  const providerTopStudents = providerApplicants
    .slice()
    .sort((left, right) => right.learner.points - left.learner.points)
    .slice(0, 4);

  return (
    <>
      <div className="stack">
        <article className="panel profile-snapshot">
          <div className="skill-card__trainer">
            <img src={getAvatarSrc(currentUser.name, currentUser.avatarUrl)} alt={currentUser.name} className="avatar avatar--large" />
            <div>
              <span className="eyebrow">Provider profile</span>
              <h2>{currentUser.name}</h2>
              <p>{currentUser.bio || "Introduce your expertise and the outcomes students can expect."}</p>
            </div>
          </div>
          <div className="pill-row">
            {uniqueStrings(currentUser.skills).map((skill, index) => (
              <span key={`${skill}-${index}`} className="pill">
                {skill}
              </span>
            ))}
          </div>
          <div className="skill-card__stats">
            <span>{providerBookings.length} student applications</span>
            <span>{currentUser.trainerProfile.completedSessions} completed sessions</span>
            <span>{currentUser.trainerProfile.averageRating.toFixed(1)} avg rating</span>
          </div>
        </article>

        <article className="panel">
          <div className="panel-actions" style={{ justifyContent: "space-between" }}>
            <div>
              <span className="eyebrow">Published classes</span>
              <h2>My Published Classes</h2>
            </div>
            <span className="pill">{publishedSkills.length} live</span>
          </div>
          <div className="stack" style={{ marginTop: 18 }}>
            {publishedSkills.length ? (
              publishedSkills.map((skill) => (
                <article key={skill._id} className="timeline-card">
                  <div className="panel-actions" style={{ justifyContent: "space-between" }}>
                    <div>
                      <h3>{skill.title}</h3>
                      <p>
                        {skill.category} · {skill.mode === "ONLINE" ? "Online" : "Offline"}
                      </p>
                    </div>
                    <span className="pill">{formatCurrency(skill.price)}</span>
                  </div>
                  <div className="skill-card__stats">
                    <span>{skill.bookingsCount} bookings</span>
                    <span>
                      {skill.ratingAverage.toFixed(1)} rating ({skill.ratingCount})
                    </span>
                    <span>{skill.durationMinutes} min</span>
                  </div>
                  <div className="pill-row" style={{ marginTop: 12 }}>
                    {uniqueStrings([...skill.tags, ...skill.outcomes]).slice(0, 4).map((item, index) => (
                      <span key={`${skill._id}-${item}-${index}`} className="pill">
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="panel-actions" style={{ marginTop: 16 }}>
                    <Link href={`/skills/${skill._id}`} className="button button--ghost">
                      View details
                    </Link>
                    {skill.sessionType === "GOOGLE_MEET" && skill.meetLink ? (
                      <a className="button button--ghost" href={buildMeetingLink(skill.meetLink)} target="_blank" rel="noreferrer">
                        Open meet link
                      </a>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <article className="timeline-card">
                <strong>No classes published yet</strong>
                <p>Your new class listings will show up here right after you publish them.</p>
              </article>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-actions" style={{ justifyContent: "space-between" }}>
            <div>
              <span className="eyebrow">Applicants</span>
              <h2>Students who applied for your classes</h2>
            </div>
            <Link href="/chat" className="button button--ghost">
              Open chat
            </Link>
          </div>
          <div className="stack" style={{ marginTop: 18 }}>
            {providerApplicants.length ? (
              providerApplicants.map((application) => {
                const learnerWhatsApp = application.learner.whatsAppNumber || application.learner.phone;

                return (
                  <article key={application.bookingId} className="timeline-card">
                    <div className="panel-actions" style={{ justifyContent: "space-between" }}>
                      <div>
                        <h3>{application.skillTitle}</h3>
                        <p>{formatDateTime(application.scheduledAt)}</p>
                      </div>
                      <span className="pill">{application.status}</span>
                    </div>
                    <div className="skill-card__trainer" style={{ marginTop: 12 }}>
                      <img src={getAvatarSrc(application.learner.name, application.learner.avatarUrl)} alt={application.learner.name} />
                      <div>
                        <strong>{application.learner.name}</strong>
                        <span>{application.learner.college}</span>
                      </div>
                    </div>
                    <div className="skill-card__stats">
                      <span>{application.learner.points} points</span>
                      <span>{uniqueStrings(application.learner.interests).slice(0, 2).join(", ") || "No interests yet"}</span>
                    </div>
                    <div className="panel-actions">
                      <Link href={`/chat?booking=${application.bookingId}`} className="button button--ghost">
                        Message student
                      </Link>
                      <WhatsAppLink phone={learnerWhatsApp} skillTitle={application.skillTitle} label="WhatsApp" />
                      {application.status === "CONFIRMED" ? (
                        <button
                          type="button"
                          className="button button--ghost"
                          onClick={() => void onUpdateBookingStatus(application.bookingId, "COMPLETED")}
                        >
                          Mark completed
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })
            ) : (
              <article className="timeline-card">
                <strong>No student applications yet</strong>
                <p>Your incoming student list will appear here as soon as learners book your classes.</p>
              </article>
            )}
          </div>
        </article>
      </div>

      <div className="stack">
        <article className="panel">
          <div className="panel-actions" style={{ justifyContent: "space-between" }}>
            <div>
              <span className="eyebrow">Top learners</span>
              <h2>Students currently in your pipeline</h2>
            </div>
            <Medal size={18} />
          </div>
          <div className="stack" style={{ marginTop: 18 }}>
            {providerTopStudents.length ? (
              providerTopStudents.map((application, index) => (
                <article key={`${application.bookingId}-${index}`} className="timeline-card">
                  <div className="skill-card__trainer">
                    <img src={getAvatarSrc(application.learner.name, application.learner.avatarUrl)} alt={application.learner.name} />
                    <div>
                      <strong>
                        #{index + 1} {application.learner.name}
                      </strong>
                      <span>{application.skillTitle}</span>
                    </div>
                  </div>
                  <p>{uniqueStrings(application.learner.skills).slice(0, 3).join(", ") || "Exploring new skills"}</p>
                </article>
              ))
            ) : (
              <article className="timeline-card">
                <strong>No learners ranked yet</strong>
                <p>Once students apply for your classes, they will appear here with their interests and skills.</p>
              </article>
            )}
          </div>
        </article>

        <article className="panel">
          <span className="eyebrow">Payment activity</span>
          <h2>Simulated gateway trail</h2>
          <div className="stack" style={{ marginTop: 18 }}>
            {payments.map((payment) => (
              <article key={payment._id} className="timeline-card">
                <strong>{payment.provider}</strong>
                <p>
                  {formatCurrency(payment.amount)} total - {formatCurrency(payment.commission)} commission - {formatCurrency(payment.payout)} payout
                </p>
                <span className="muted">{payment.transactionId}</span>
              </article>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-actions" style={{ justifyContent: "space-between" }}>
            <div>
              <span className="eyebrow">Provider tools</span>
              <h2>Create a skill listing</h2>
            </div>
            <PlusCircle size={18} />
          </div>
          <p className="muted">Introduce a new class with pricing, session mode, outcomes, and available slots so students can book it immediately.</p>
          <form className="form-grid" style={{ marginTop: 18 }} action={(formData) => void onCreateSkill(formData)}>
            <label>
              Title
              <input name="title" required />
            </label>
            <label>
              Description
              <textarea name="description" required />
            </label>
            <div className="form-grid form-grid--two">
              <label>
                Category
                <input name="category" required />
              </label>
              <label>
                Price
                <input name="price" type="number" min="1" required />
              </label>
            </div>
            <div className="form-grid form-grid--two">
              <label>
                Duration in minutes
                <input name="durationMinutes" type="number" min="15" required />
              </label>
              <label>
                Mode
                <select name="mode" defaultValue="ONLINE">
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline</option>
                </select>
              </label>
            </div>
            <div className="form-grid form-grid--two">
              <label>
                Session type
                <select name="sessionType" defaultValue="GOOGLE_MEET">
                  <option value="GOOGLE_MEET">Google Meet</option>
                  <option value="IN_APP">In-app video</option>
                </select>
              </label>
              <label>
                Meet link
                <input name="meetLink" type="url" placeholder="https://meet.google.com/..." />
              </label>
            </div>
            <label>
              Outcomes
              <input name="outcomes" placeholder="Video editing, Branding, Portfolio polish" />
            </label>
            <label>
              Tags
              <input name="tags" placeholder="figma, ui, portfolio" />
            </label>
            <label>
              Availability
              <input name="availability" placeholder="Mon 7 PM, Wed 6 PM" />
            </label>
            <button className="button button--primary" type="submit">
              <Wallet2 size={16} />
              Publish listing
            </button>
          </form>
          {message ? <p className="muted">{message}</p> : null}
        </article>
      </div>
    </>
  );
}
