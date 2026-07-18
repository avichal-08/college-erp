"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import styles from "../styles/ledger.module.css";
import { login, getCurrentUser } from "../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      const user = await getCurrentUser();
      if (!user) throw new Error("Logged in, but couldn't load the account");
      if (user.role === "TEACHER") router.push("/teacher");
      else if (user.role === "STUDENT") router.push("/student");
      else throw new Error("This account has no attendance view");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.ledger}>
      <div className={styles.shell}>
        <div className={styles.eyebrow}>College ERP · Attendance</div>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>
          Seeded accounts: <code>teacher1@example.edu</code> or{" "}
          <code>student1@example.edu</code> through <code>student4@example.edu</code>
          , password <code>Passw0rd!</code> for all of them.
        </p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form className={styles.panel} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className={styles.button} type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
