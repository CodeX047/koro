"use client";

import React, { useState } from "react";
import { Loader2, MessageSquare, SkipForward } from "lucide-react";
import { trpc } from "~/trpc/client";

interface Clarification {
  id: string;
  question: string;
  answer: string | null;
  status: string;
  order: number;
}

interface ClarificationFormProps {
  featureId: string;
  clarifications: Clarification[];
  onSubmitted: () => void;
}

export function ClarificationForm({
  featureId,
  clarifications,
  onSubmitted,
}: ClarificationFormProps) {
  const pending = clarifications.filter((c) => c.status === "PENDING");
  const answered = clarifications.filter((c) => c.status === "ANSWERED");

  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    clarifications.forEach((c) => {
      init[c.id] = c.answer ?? "";
    });
    return init;
  });

  const [error, setError] = useState<string | null>(null);

  const submitAnswers = trpc.clarification.submitAnswers.useMutation({
    onSuccess: () => {
      onSubmitted();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const answersPayload = pending
      .filter((c) => answers[c.id]?.trim())
      .map((c) => ({ clarificationId: c.id, answer: answers[c.id]!.trim() }));

    if (answersPayload.length === 0) {
      setError("Please answer at least one question before submitting.");
      return;
    }

    submitAnswers.mutate({ featureId, answers: answersPayload });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pending questions */}
      {pending.length > 0 && (
        <div className="space-y-4">
          <p
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--koro-ash)" }}
          >
            <MessageSquare className="inline w-3.5 h-3.5 mr-1 mb-0.5" />
            {pending.length} question{pending.length !== 1 ? "s" : ""} from the AI
          </p>

          {pending.map((c, i) => (
            <div key={c.id} className="space-y-2">
              <label
                htmlFor={`answer-${c.id}`}
                className="block text-sm font-medium"
                style={{ color: "var(--koro-on-primary)" }}
              >
                <span className="text-xs font-bold mr-2" style={{ color: "var(--koro-accent)" }}>
                  Q{i + 1}.
                </span>
                {c.question}
              </label>
              <textarea
                id={`answer-${c.id}`}
                value={answers[c.id] ?? ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [c.id]: e.target.value }))}
                rows={3}
                placeholder="Your answer…"
                className="w-full px-3 py-2 rounded-lg text-xs resize-none focus:outline-none"
                style={{
                  backgroundColor: "var(--koro-surface-dark)",
                  border: "1px solid var(--koro-hairline-strong)",
                  color: "var(--koro-on-primary)",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Previously answered (read-only) */}
      {answered.length > 0 && (
        <div className="space-y-3 opacity-60">
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--koro-ash)" }}>
            Already answered
          </p>
          {answered.map((c) => (
            <div key={c.id} className="space-y-1">
              <p className="text-xs font-medium" style={{ color: "var(--koro-ash)" }}>
                {c.question}
              </p>
              <p
                className="text-xs px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: "var(--koro-surface-dark)",
                  color: "var(--koro-on-primary)",
                }}
              >
                {c.answer}
              </p>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-[11px] text-red-400">{error}</p>}

      {pending.length > 0 && (
        <button
          type="submit"
          disabled={submitAnswers.isPending}
          className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "var(--koro-accent)", color: "#fff" }}
        >
          {submitAnswers.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
          {submitAnswers.isPending ? "Submitting…" : "Submit Answers → Generate PRD"}
        </button>
      )}
    </form>
  );
}
