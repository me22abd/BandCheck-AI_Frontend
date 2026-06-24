"use client";

import { FormEvent, useState } from "react";
import { EditorialButton } from "@/components/editorial/EditorialButton";
import { EditorialCard } from "@/components/editorial/EditorialCard";

const inputClass =
  "w-full rounded-xl border border-hairline bg-paper px-4 py-3 text-sm text-ink outline-none transition-shadow placeholder:text-ink-3 focus:border-accent focus:ring-2 focus:ring-accent/20";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, company: "" }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setError("Could not send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <EditorialCard className="p-8 text-center">
        <p className="font-serif text-xl text-ink">Message sent</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Thanks for getting in touch. We typically respond within 1–2 working days.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 text-sm font-medium text-accent hover:text-accent-deep"
        >
          Send another message
        </button>
      </EditorialCard>
    );
  }

  return (
    <EditorialCard className="p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-ink">
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-ink">
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${inputClass} resize-y min-h-[120px]`}
            placeholder="How can we help?"
          />
        </div>

        {/* Honeypot — hidden from users */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden
        />

        {error ? (
          <p className="text-sm font-medium text-accent">{error}</p>
        ) : null}

        <EditorialButton
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? "Sending…" : "Send message"}
        </EditorialButton>
      </form>
    </EditorialCard>
  );
}
