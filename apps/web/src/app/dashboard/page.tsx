"use client";

import { useEffect, useMemo, useState } from "react";
import { VideoRoom } from "@/components/ui/video-room";
import { LearnerDashboardSection, ProviderDashboardSection } from "@/components/ui/dashboard-sections";
import { apiRequest } from "@/lib/api";
import { fallbackBookings, fallbackNotifications, fallbackSkills, fallbackUser, fallbackWallet } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";
import { subscribeToPush } from "@/lib/pwa";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/hooks/use-auth";
import type { Booking, NotificationItem, Skill, WalletResponse } from "@/types";

type DashboardView = "LEARNER" | "TRAINER";

function upsertBooking(current: Booking[], nextBooking: Booking) {
  const exists = current.some((booking) => booking._id === nextBooking._id);

  if (!exists) {
    return [nextBooking, ...current];
  }

  return current.map((booking) => (booking._id === nextBooking._id ? nextBooking : booking));
}

export default function DashboardPage() {
  const { token, user, refreshUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>(fallbackBookings);
  const [notifications, setNotifications] = useState<NotificationItem[]>(fallbackNotifications);
  const [wallet, setWallet] = useState<WalletResponse>(fallbackWallet);
  const [recommended, setRecommended] = useState<Skill[]>(fallbackSkills);
  const [publishedSkills, setPublishedSkills] = useState<Skill[]>(fallbackSkills.filter((skill) => skill.trainer._id === fallbackUser._id));
  const [message, setMessage] = useState("");
  const [dashboardView, setDashboardView] = useState<DashboardView>("LEARNER");
  const currentUser = user ?? fallbackUser;
  const currentUserId = currentUser._id;

  useEffect(() => {
    if (user?.rolePreference === "TRAINER") {
      setDashboardView("TRAINER");
    }
  }, [user?.rolePreference]);

  useEffect(() => {
    if (!token) {
      setBookings(fallbackBookings);
      setNotifications(fallbackNotifications);
      setWallet(fallbackWallet);
      setRecommended(fallbackSkills);
      setPublishedSkills(fallbackSkills.filter((skill) => skill.trainer._id === currentUserId));
      return;
    }

    void Promise.all([
      apiRequest<Booking[]>("/bookings", { token }).catch(() => fallbackBookings),
      apiRequest<NotificationItem[]>("/notifications", { token }).catch(() => fallbackNotifications),
      apiRequest<WalletResponse>("/payments/wallet", { token }).catch(() => fallbackWallet),
      apiRequest<Skill[]>("/skills/recommended", { token }).catch(() => fallbackSkills),
      apiRequest<Skill[]>(`/skills?trainerId=${encodeURIComponent(currentUserId)}`, { token }).catch(() =>
        fallbackSkills.filter((skill) => skill.trainer._id === currentUserId)
      )
    ]).then(([nextBookings, nextNotifications, nextWallet, nextRecommended, nextPublishedSkills]) => {
      setBookings(nextBookings);
      setNotifications(nextNotifications);
      setWallet(nextWallet);
      setRecommended(nextRecommended);
      setPublishedSkills(nextPublishedSkills);
    });
  }, [currentUserId, token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const socket = getSocket(token);

    const handleNotification = (notification: NotificationItem) => {
      setNotifications((current) => [notification, ...current]);
    };
    const handleBookingCreate = (booking: Booking) => {
      setBookings((current) => upsertBooking(current, booking));
    };
    const handleBookingUpdate = (booking: Booking) => {
      setBookings((current) => upsertBooking(current, booking));
    };

    socket.on("notification:new", handleNotification);
    socket.on("booking:new", handleBookingCreate);
    socket.on("booking:updated", handleBookingUpdate);

    return () => {
      socket.off("notification:new", handleNotification);
      socket.off("booking:new", handleBookingCreate);
      socket.off("booking:updated", handleBookingUpdate);
    };
  }, [token]);

  const learnerBookings = useMemo(
    () => bookings.filter((booking) => booking.learner._id === currentUserId),
    [bookings, currentUserId]
  );
  const providerBookings = useMemo(
    () => bookings.filter((booking) => booking.trainer._id === currentUserId),
    [bookings, currentUserId]
  );
  const learnerCompletedBookings = useMemo(
    () => learnerBookings.filter((booking) => booking.status === "COMPLETED"),
    [learnerBookings]
  );
  const learnerActiveBookings = useMemo(
    () => learnerBookings.filter((booking) => booking.status !== "COMPLETED"),
    [learnerBookings]
  );
  const providerApplicants = useMemo(
    () =>
      providerBookings.map((booking) => ({
        bookingId: booking._id,
        learner: booking.learner,
        skillTitle: booking.skill.title,
        scheduledAt: booking.scheduledAt,
        status: booking.status
      })),
    [providerBookings]
  );

  const monetization = useMemo(() => {
    return providerBookings.reduce(
      (totals, booking) => ({
        grossRevenue: totals.grossRevenue + booking.amount,
        platformCommission: totals.platformCommission + booking.platformCommission,
        netPayout: totals.netPayout + booking.trainerPayout
      }),
      {
        grossRevenue: 0,
        platformCommission: 0,
        netPayout: 0
      }
    );
  }, [providerBookings]);

  const learnerOverview = useMemo(() => {
    return {
      upcomingSessions: learnerBookings.filter((booking) => booking.status === "CONFIRMED").length,
      certificatesReady: learnerBookings.filter((booking) => booking.status === "COMPLETED").length
    };
  }, [learnerBookings]);

  const inAppBooking = useMemo(
    () => learnerActiveBookings.find((booking) => booking.sessionType === "IN_APP" && booking.videoRoomId),
    [learnerActiveBookings]
  );

  async function createSkill(formData: FormData) {
    if (!token) {
      setMessage("Sign in with a provider or both-role account to create skills.");
      return;
    }

    try {
      const createdSkill = await apiRequest<Skill>("/skills", {
        method: "POST",
        token,
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          category: formData.get("category"),
          price: Number(formData.get("price")),
          durationMinutes: Number(formData.get("durationMinutes")),
          mode: formData.get("mode"),
          sessionType: formData.get("sessionType"),
          meetLink: formData.get("meetLink"),
          outcomes: String(formData.get("outcomes"))
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          tags: String(formData.get("tags"))
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          availability: String(formData.get("availability"))
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        })
      });
      setPublishedSkills((current) => [createdSkill, ...current.filter((skill) => skill._id !== createdSkill._id)]);
      setMessage("Skill created successfully.");
      await refreshUser();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create skill");
    }
  }

  async function enablePush() {
    if (!token) {
      setMessage("Sign in to enable browser notifications.");
      return;
    }

    try {
      const subscription = await subscribeToPush();

      if (subscription) {
        await apiRequest("/notifications/subscribe", {
          method: "POST",
          token,
          body: JSON.stringify(subscription)
        });
      }

      setMessage("Browser notifications enabled.");
    } catch {
      setMessage("Push notification setup could not complete on this browser.");
    }
  }

  async function updateBookingStatus(bookingId: string, status: Booking["status"]) {
    if (!token) {
      return;
    }

    try {
      const updated = await apiRequest<Booking>(`/bookings/${bookingId}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status })
      });

      setBookings((current) => current.map((booking) => (booking._id === bookingId ? { ...booking, ...updated } : booking)));
      const nextWallet = await apiRequest<WalletResponse>("/payments/wallet", { token }).catch(() => wallet);
      setWallet(nextWallet);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update booking");
    }
  }

  async function submitReview(formData: FormData) {
    if (!token) {
      setMessage("Sign in to leave a review.");
      return;
    }

    try {
      await apiRequest(`/bookings/${formData.get("bookingId")}/review`, {
        method: "POST",
        token,
        body: JSON.stringify({
          rating: Number(formData.get("rating")),
          comment: formData.get("comment")
        })
      });
      setMessage("Review submitted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit review");
    }
  }

  return (
    <section className="container page-header">
      <div className="page-header">
        <span className="eyebrow">Dashboard</span>
        <h1>Switch between Learner and Provider views without leaving your account.</h1>
        <p className="muted">
          Track bookings, realtime alerts, AI recommendations, wallet movement, commission, and payout readiness from one place.
        </p>
        <p className="muted">New bookings now stream into this dashboard live for both learners and providers.</p>
      </div>

      <div className="view-switch">
        <button
          type="button"
          className={`button ${dashboardView === "LEARNER" ? "button--primary" : "button--ghost"}`}
          onClick={() => setDashboardView("LEARNER")}
        >
          Learner view
        </button>
        <button
          type="button"
          className={`button ${dashboardView === "TRAINER" ? "button--primary" : "button--ghost"}`}
          onClick={() => setDashboardView("TRAINER")}
        >
          Provider view
        </button>
      </div>

      <div className="cards-grid">
        {dashboardView === "TRAINER" ? (
          <>
            <article className="metric-card">
              <span>Total revenue</span>
              <strong>{formatCurrency(monetization.grossRevenue)}</strong>
              <p>Gross learner payments collected for your sessions.</p>
            </article>
            <article className="metric-card">
              <span>Platform commission</span>
              <strong>{formatCurrency(monetization.platformCommission)}</strong>
              <p>SkillSwap keeps 20 percent on each completed booking.</p>
            </article>
            <article className="metric-card">
              <span>Net payout</span>
              <strong>{formatCurrency(monetization.netPayout)}</strong>
              <p>Estimated trainer payout after commission.</p>
            </article>
          </>
        ) : (
          <>
            <article className="metric-card">
              <span>Wallet balance</span>
              <strong>{formatCurrency(wallet.user.wallet.availableBalance)}</strong>
              <p>Released earnings and credits currently available in your account.</p>
            </article>
            <article className="metric-card">
              <span>Upcoming sessions</span>
              <strong>{learnerOverview.upcomingSessions}</strong>
              <p>Confirmed classes you can join from chat, WhatsApp, or meeting links.</p>
            </article>
            <article className="metric-card">
              <span>Certificates ready</span>
              <strong>{learnerOverview.certificatesReady}</strong>
              <p>Completed sessions with a downloadable certificate available.</p>
            </article>
          </>
        )}
      </div>

      <div className="dashboard-grid section">
        {dashboardView === "LEARNER" ? (
          <LearnerDashboardSection
            currentUser={currentUser}
            learnerBookings={learnerBookings}
            learnerCompletedBookings={learnerCompletedBookings}
            recommended={recommended}
            notifications={notifications}
            inAppBooking={inAppBooking}
            token={token}
            onSubmitReview={submitReview}
            onEnablePush={enablePush}
          >
            {inAppBooking && token ? (
              <VideoRoom bookingId={inAppBooking._id} roomId={inAppBooking.videoRoomId ?? inAppBooking._id} token={token} />
            ) : null}
          </LearnerDashboardSection>
        ) : (
          <ProviderDashboardSection
            currentUser={currentUser}
            providerBookings={providerBookings}
            providerApplicants={providerApplicants}
            publishedSkills={publishedSkills}
            payments={wallet.payments}
            message={message}
            onUpdateBookingStatus={updateBookingStatus}
            onCreateSkill={createSkill}
          />
        )}
      </div>
    </section>
  );
}
