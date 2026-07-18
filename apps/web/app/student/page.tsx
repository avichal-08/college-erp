"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import styles from "../styles/ledger.module.css";
import { TEACHER_SERVICE_WS_URL } from "../lib/config";
import { getCurrentUser, type CurrentUser } from "../lib/auth";

interface AttendanceView {
  id: string;
  subjectOfferingId: string;
  subjectCode: string;
  subjectName: string;
  teacherName: string;
  sessionType: "LECTURE" | "LAB";
  sessionDate: string;
  classroom: string | null;
  startTime: string | null;
  endTime: string | null;
  status: "OPEN" | "ACCEPTED" | "CANCELLED";
  createdAt: string;
}

type SessionState = "open" | "marked" | "accepted";

type ConnectionState = "connecting" | "connected" | "closed";

export default function StudentPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [connection, setConnection] = useState<ConnectionState>("connecting");

  const [sessions, setSessions] = useState<Map<string, AttendanceView>>(new Map());
  const [states, setStates] = useState<Map<string, SessionState>>(new Map());
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!authChecked || !user || user.role !== "STUDENT") return;

    const ws = new WebSocket(TEACHER_SERVICE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => setConnection("connected");
    ws.onclose = () => setConnection("closed");
    ws.onerror = () => setConnection("closed");

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "connected") {
        setConnection("connected");
      } else if (msg.type === "attendance_available") {
        const attendance: AttendanceView = msg.payload.attendance;
        setSessions((prev) => new Map(prev).set(attendance.id, attendance));
        setStates((prev) => (prev.has(attendance.id) ? prev : new Map(prev).set(attendance.id, "open")));
      } else if (msg.type === "attendance_marked") {
        const id: string = msg.payload.sessionId;
        setStates((prev) => new Map(prev).set(id, "marked"));
      } else if (msg.type === "attendance_accepted") {
        const id: string = msg.payload.sessionId;
        setStates((prev) => new Map(prev).set(id, "accepted"));
      } else if (msg.type === "error") {
        setError(msg.payload.message);
      }
    };

    return () => ws.close();
  }, [authChecked, user]);

  function handleMark(sessionId: string) {
    setError(null);
    wsRef.current?.send(JSON.stringify({ type: "mark_attendance", payload: { sessionId } }));
  }

  if (authChecked && !user) {
    return (
      <div className={styles.ledger}>
        <div className={styles.shell}>
          <div className={styles.eyebrow}>College ERP · Attendance</div>
          <h1 className={styles.title}>Not signed in</h1>
          <p className={styles.subtitle}>
            <Link className={styles.link} href="/login">
              Sign in
            </Link>{" "}
            with a student account first.
          </p>
        </div>
      </div>
    );
  }

  if (authChecked && user && user.role !== "STUDENT") {
    return (
      <div className={styles.ledger}>
        <div className={styles.shell}>
          <div className={styles.eyebrow}>College ERP · Attendance</div>
          <h1 className={styles.title}>Wrong account</h1>
          <p className={styles.subtitle}>
            Signed in as {user.email} ({user.role}) — this view is for students. Try{" "}
            <Link className={styles.link} href="/teacher">
              the teacher view
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  const list = [...sessions.values()];

  return (
    <div className={styles.ledger}>
      <div className={styles.shell}>
        <div className={styles.eyebrow}>College ERP · Attendance</div>
        <h1 className={styles.title}>Your classes</h1>
        <p className={styles.status}>
          {user ? `${user.firstName} ${user.lastName} · ` : ""}
          {connection === "connecting" && "connecting…"}
          {connection === "connected" && "connected"}
          {connection === "closed" && "disconnected"}
        </p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {list.length === 0 ? (
          <p className={styles.emptyState}>
            No open attendance sessions right now — they'll appear here the moment a teacher opens one.
          </p>
        ) : (
          list.map((a) => {
            const state = states.get(a.id) ?? "open";
            const where = a.classroom
              ? `${a.classroom}${a.startTime ? ` · ${a.startTime}–${a.endTime}` : ""}`
              : null;
            return (
              <div className={styles.card} key={a.id}>
                <h2 className={styles.cardTitle}>
                  {a.subjectCode} — {a.subjectName}
                </h2>
                <p className={styles.cardMeta}>
                  {a.teacherName} · {a.sessionType} · {a.sessionDate}
                  {where ? ` · ${where}` : ""}
                </p>
                <button
                  className={styles.button}
                  onClick={() => handleMark(a.id)}
                  disabled={state !== "open"}
                >
                  {state === "open" && "Mark attendance"}
                  {state === "marked" && "Marked ✓ — pending teacher review"}
                  {state === "accepted" && "Finalized ✓"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
