"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
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

interface PendingStudent {
  studentId: string;
  name: string;
  sectionRollNo: string;
  markedAt: string;
}

type ConnectionState = "connecting" | "connected" | "closed";

export default function TeacherPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [connection, setConnection] = useState<ConnectionState>("connecting");

  const [session, setSession] = useState<AttendanceView | null>(null);
  const [students, setStudents] = useState<PendingStudent[]>([]);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [subjectOfferingId, setSubjectOfferingId] = useState("");
  const [sessionType, setSessionType] = useState<"LECTURE" | "LAB">("LECTURE");
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [timetableEntryId, setTimetableEntryId] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  // Avoids a stale closure inside the long-lived ws.onmessage handler —
  // React state from the render that created the handler would otherwise
  // never see later updates.
  const sessionRef = useRef<AttendanceView | null>(null);

  function applySession(next: AttendanceView | null) {
    sessionRef.current = next;
    setSession(next);
  }

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!authChecked || !user || user.role !== "TEACHER") return;

    const ws = new WebSocket(TEACHER_SERVICE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => setConnection("connected");
    ws.onclose = () => setConnection("closed");
    ws.onerror = () => setConnection("closed");

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "connected") {
        setConnection("connected");
      } else if (msg.type === "attendance_created") {
        applySession(msg.payload.attendance);
        setStudents([]);
        setAccepted(false);
        setError(null);
      } else if (msg.type === "pending_update") {
        if (msg.payload.sessionId === sessionRef.current?.id) {
          setStudents(msg.payload.students);
        }
      } else if (msg.type === "attendance_accepted") {
        if (msg.payload.sessionId === sessionRef.current?.id) {
          setAccepted(true);
        }
      } else if (msg.type === "error") {
        setError(msg.payload.message);
      }
    };

    return () => ws.close();
  }, [authChecked, user]);

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: Record<string, unknown> = {
      subjectOfferingId: subjectOfferingId.trim(),
      sessionType,
      sessionDate,
    };
    if (timetableEntryId.trim()) payload.timetableEntryId = timetableEntryId.trim();
    wsRef.current?.send(JSON.stringify({ type: "create_attendance", payload }));
  }

  function handleRemove(studentId: string) {
    if (!sessionRef.current) return;
    wsRef.current?.send(
      JSON.stringify({
        type: "remove_student",
        payload: { sessionId: sessionRef.current.id, studentId },
      }),
    );
  }

  function handleAccept() {
    if (!sessionRef.current) return;
    wsRef.current?.send(
      JSON.stringify({
        type: "accept_attendance",
        payload: { sessionId: sessionRef.current.id },
      }),
    );
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
            with a teacher account first.
          </p>
        </div>
      </div>
    );
  }

  if (authChecked && user && user.role !== "TEACHER") {
    return (
      <div className={styles.ledger}>
        <div className={styles.shell}>
          <div className={styles.eyebrow}>College ERP · Attendance</div>
          <h1 className={styles.title}>Wrong account</h1>
          <p className={styles.subtitle}>
            Signed in as {user.email} ({user.role}) — this view is for teachers. Try{" "}
            <Link className={styles.link} href="/student">
              the student view
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.ledger}>
      <div className={styles.shell}>
        <div className={styles.eyebrow}>College ERP · Attendance</div>
        <h1 className={styles.title}>Take attendance</h1>
        <p className={styles.status}>
          {user ? `${user.firstName} ${user.lastName} · ` : ""}
          {connection === "connecting" && "connecting…"}
          {connection === "connected" && "connected"}
          {connection === "closed" && "disconnected"}
        </p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {!session || session.status !== "OPEN" ? (
          <form className={styles.panel} onSubmit={handleCreate}>
            <div className={styles.field}>
              <label htmlFor="subjectOfferingId">Subject offering ID</label>
              <input
                id="subjectOfferingId"
                placeholder="uuid from subject_offerings — see seed output"
                value={subjectOfferingId}
                onChange={(e) => setSubjectOfferingId(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="sessionType">Session type</label>
              <select
                id="sessionType"
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as "LECTURE" | "LAB")}
              >
                <option value="LECTURE">Lecture</option>
                <option value="LAB">Lab</option>
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="sessionDate">Session date</label>
              <input
                id="sessionDate"
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="timetableEntryId">Timetable entry ID (optional)</label>
              <input
                id="timetableEntryId"
                placeholder="uuid from timetable_entries"
                value={timetableEntryId}
                onChange={(e) => setTimetableEntryId(e.target.value)}
              />
            </div>
            <button className={styles.button} type="submit" disabled={connection !== "connected"}>
              Create attendance
            </button>
          </form>
        ) : (
          <div className={styles.panel}>
            <h2 className={styles.cardTitle}>
              {session.subjectCode} — {session.sessionType}
            </h2>
            <p className={styles.cardMeta}>
              {session.sessionDate}
              {session.classroom ? ` · ${session.classroom}` : ""}
              {session.startTime ? ` · ${session.startTime}–${session.endTime}` : ""}
              {"  "}
              <span className={accepted ? styles.badgeDone : styles.badgeLive}>
                {accepted ? "accepted" : "live"}
              </span>
            </p>

            {students.length === 0 ? (
              <p className={styles.emptyState}>No one has clicked "Mark Attendance" yet.</p>
            ) : (
              students.map((s) => (
                <div className={styles.rollRow} key={s.studentId}>
                  <span className={styles.rollNo}>{s.sectionRollNo}</span>
                  <span className={styles.rollName}>{s.name}</span>
                  <span className={styles.rollTime}>
                    {new Date(s.markedAt).toLocaleTimeString()}
                  </span>
                  {!accepted && (
                    <button className={styles.buttonDanger} onClick={() => handleRemove(s.studentId)}>
                      Remove
                    </button>
                  )}
                </div>
              ))
            )}

            <div style={{ marginTop: "1.25rem" }}>
              <button className={styles.button} onClick={handleAccept} disabled={accepted}>
                {accepted ? "Accepted ✓" : `Accept (${students.length} present)`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
