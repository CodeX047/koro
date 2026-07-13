import React from "react";
import { Settings } from "lucide-react";
import { requireAuth } from "~/features/auth/utils/auth";
import { SettingsTabs } from "./_components/settings-tabs";

export default async function SettingsPage() {
  await requireAuth();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 font-sans">
      <div className="space-y-6">
        <header className="border-b pb-4" style={{ borderColor: "var(--koro-hairline-strong)" }}>
          <h1
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: "var(--koro-on-primary)" }}
          >
            <Settings className="w-6 h-6" style={{ color: "var(--koro-ash)" }} />
            Settings
          </h1>
          <p className="text-[12px] mt-1" style={{ color: "var(--koro-ash)" }}>
            Configure your user profile, organizations, billing, and integration credentials.
          </p>
        </header>

        <SettingsTabs />
      </div>
    </div>
  );
}
