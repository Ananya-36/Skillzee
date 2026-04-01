"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, PhoneCall, Video } from "lucide-react";
import { getSocket } from "@/lib/socket";

type VideoSignal =
  | { type: "offer"; data: RTCSessionDescriptionInit }
  | { type: "answer"; data: RTCSessionDescriptionInit }
  | { type: "candidate"; data: RTCIceCandidateInit };

type VideoRoomProps = {
  bookingId: string;
  roomId: string;
  token: string;
};

export function VideoRoom({ bookingId, roomId, token }: VideoRoomProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState("Camera ready. Start the call when both users join.");

  useEffect(() => {
    let mounted = true;
    const socket = getSocket(token);

    async function setupMedia() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (!mounted) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    }

    function ensureConnection() {
      if (connectionRef.current) {
        return connectionRef.current;
      }

      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });

      streamRef.current?.getTracks().forEach((track) => {
        peer.addTrack(track, streamRef.current!);
      });

      peer.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("video:signal", {
            bookingId,
            senderId: roomId,
            signal: {
              type: "candidate",
              data: event.candidate.toJSON()
            }
          });
        }
      };

      connectionRef.current = peer;
      return peer;
    }

    async function handleSignal(payload: { signal: VideoSignal }) {
      const peer = ensureConnection();
      const signal = payload.signal;

      if (signal.type === "offer") {
        await peer.setRemoteDescription(new RTCSessionDescription(signal.data));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("video:signal", {
          bookingId,
          senderId: roomId,
          signal: {
            type: "answer",
            data: answer
          }
        });
        setStatus("Connected. In-app video session is live.");
      }

      if (signal.type === "answer") {
        await peer.setRemoteDescription(new RTCSessionDescription(signal.data));
        setStatus("Connected. In-app video session is live.");
      }

      if (signal.type === "candidate") {
        await peer.addIceCandidate(new RTCIceCandidate(signal.data));
      }
    }

    void setupMedia().catch(() => {
      setStatus("Camera or microphone access was blocked.");
    });

    socket.emit("video:join", bookingId);
    socket.on("video:signal", handleSignal);

    return () => {
      mounted = false;
      socket.off("video:signal", handleSignal);
      connectionRef.current?.close();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [bookingId, roomId, token]);

  async function startCall() {
    const socket = getSocket(token);
    const peer =
      connectionRef.current ??
      new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });

    connectionRef.current = peer;
    streamRef.current?.getTracks().forEach((track) => {
      if (!peer.getSenders().some((sender) => sender.track?.id === track.id)) {
        peer.addTrack(track, streamRef.current!);
      }
    });

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("video:signal", {
          bookingId,
          senderId: roomId,
          signal: {
            type: "candidate",
            data: event.candidate.toJSON()
          }
        });
      }
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit("video:signal", {
      bookingId,
      senderId: roomId,
      signal: {
        type: "offer",
        data: offer
      }
    });
    setStatus("Calling the other participant...");
  }

  return (
    <article className="panel stack">
      <div className="panel-actions">
        <span className="pill">
          <Video size={16} />
          In-app video room
        </span>
        <span className="pill">
          <Mic size={16} />
          WebRTC
        </span>
      </div>
      <p>{status}</p>
      <div className="cards-grid">
        <div className="glass-card">
          <strong>Your camera</strong>
          <video ref={localVideoRef} autoPlay muted playsInline style={{ width: "100%", borderRadius: 20 }} />
        </div>
        <div className="glass-card">
          <strong>Peer video</strong>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "100%", borderRadius: 20 }} />
        </div>
      </div>
      <button type="button" className="button button--primary" onClick={() => void startCall()}>
        <PhoneCall size={16} />
        Start in-app call
      </button>
    </article>
  );
}
