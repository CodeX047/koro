"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@repo/auth/client";

export function CreateOrgCard() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await authClient.organization.create({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      });
      if (data) {
        await authClient.organization.setActive({ organizationId: data.id });
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="text-center py-20 border border-dashed rounded-sm"
      style={{ borderColor: "var(--koro-hairline-strong)" }}
    >
      <h2 className="text-xl font-bold mb-2">No Active Organization</h2>
      <p className="text-gray-400 mb-6 text-sm">Please create an organization to get started.</p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Organization Name"
          className="bg-transparent border px-3 py-2 text-sm rounded-sm outline-none focus:border-[var(--koro-accent)] w-full sm:w-auto flex-1"
          style={{ borderColor: "var(--koro-hairline-strong)", color: "var(--koro-on-primary)" }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <button
          className="px-4 py-2 text-sm font-bold rounded-sm whitespace-nowrap transition-colors w-full sm:w-auto"
          style={{
            backgroundColor: "var(--koro-accent)",
            color: "var(--koro-canvas)",
            opacity: loading || !name.trim() ? 0.7 : 1,
          }}
          onClick={handleCreate}
          disabled={loading || !name.trim()}
        >
          {loading ? "Creating..." : "Create Organization"}
        </button>
      </div>
    </div>
  );
}
