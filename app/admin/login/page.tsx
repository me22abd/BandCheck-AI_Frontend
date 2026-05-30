"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError(true);
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-gradient px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold tracking-tight text-ink">
            BandCheck <span className="text-accent">· AI</span>
          </span>
          <p className="mt-1 text-sm text-ink-3">Admin access</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-editorial border border-hairline bg-paper-card p-6 shadow-editorial"
        >
          <label htmlFor="password" className="block text-sm font-medium text-ink-2 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-hairline bg-paper px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-ink-3"
            placeholder="Enter admin password"
          />
          {error && (
            <p className="mt-2 text-xs text-accent font-medium">Incorrect password</p>
          )}
          <button
            type="submit"
            disabled={!password || loading}
            className="mt-4 w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-paper shadow-btn-accent transition-all hover:bg-accent-deep disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Checking…" : "Sign in →"}
          </button>
        </form>
      </div>
    </div>
  );
}
