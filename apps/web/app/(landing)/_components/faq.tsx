"use client";

import { useState } from "react";

const FAQS = [
  {
    question: "How does Kōro connect to my GitHub repositories?",
    answer:
      "Kōro uses the official GitHub App integration. You install the Kōro GitHub App on your organization or personal account, select which repositories to grant access to, and Kōro automatically starts listening to pull request events and syncing your codebase.",
  },
  {
    question: "What happens when I open a Pull Request?",
    answer:
      "When a PR is opened or updated, Kōro receives a webhook event from GitHub. It fetches the changed files, analyzes the diff against your PRD requirements and acceptance criteria, and posts an inline review comment on the PR with a verdict (PASS or FIX_REQUIRED) and a readiness score.",
  },
  {
    question: "How are PRDs generated?",
    answer:
      "You submit a simple feature request — just a title and a brief description. Kōro's AI expands it into a full Product Requirements Document including problem statement, user stories, acceptance criteria, edge cases, and success metrics. You can edit and refine the PRD before it's finalized.",
  },
  {
    question: "Can I use Kōro with private repositories?",
    answer:
      "Yes. Kōro fully supports private repositories. Your code is processed securely and is never stored beyond what's needed for the review. Repository access is controlled entirely through GitHub's permission model.",
  },
  {
    question: "What does the free plan include?",
    answer:
      "The free plan includes 1 workspace member, 1 connected repository, and 20 AI-powered code reviews per month. No credit card required. You can upgrade to Pro or Team when your usage grows.",
  },
  {
    question: "How is the readiness score calculated?",
    answer:
      "The readiness score (0–100%) measures how well your code changes fulfill the PRD requirements. It evaluates requirement coverage, acceptance criteria met, code quality signals, and potential edge cases. A score above 90% typically indicates the feature is ready to ship.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="px-6"
      style={{ paddingTop: "var(--koro-section)" }}
    >
      <div className="mx-auto max-w-[960px]">
        {/* Section divider */}
        <div style={{ borderTop: "1px solid var(--koro-hairline)" }} />

        {/* Section label */}
        <h2
          className="mt-8 text-[16px] font-bold leading-[1.5]"
          style={{ color: "var(--koro-ink)" }}
        >
          Frequently asked questions
        </h2>

        {/* FAQ items */}
        <div className="mt-8">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.question}
                style={{ borderBottom: "1px solid var(--koro-hairline)" }}
              >
                <button
                  className="w-full py-[16px] flex items-center justify-between gap-4 text-left transition-colors"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  style={{ color: "var(--koro-ink)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--koro-ink-deep)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--koro-ink)")}
                >
                  <span className="text-[16px] font-bold leading-[1.5]">
                    {faq.question}
                  </span>
                  <span
                    className="shrink-0 text-[18px] font-light transition-transform duration-200"
                    style={{
                      transform: isOpen ? "rotate(45deg)" : "none",
                      color: "var(--koro-mute)",
                    }}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div
                    className="pb-[16px] koro-animate-fade-in"
                  >
                    <p
                      className="text-[16px] font-normal leading-[1.6] max-w-[720px]"
                      style={{ color: "var(--koro-body)" }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
