"use client";

import { authClient } from "@repo/auth/client";
import Link from "next/link";
import { Settings } from "lucide-react";

export function OrgSelector() {
  const { data: orgs } = authClient.useListOrganizations();
  const { data: activeOrg } = authClient.useActiveOrganization();

  return (
    <div className="flex items-center gap-2 text-[12px]">
      <span style={{ color: "var(--koro-ash)" }}>Org:</span>
      <select
        className="bg-transparent text-[var(--koro-on-primary)] outline-none cursor-pointer font-medium"
        style={{ appearance: "none" }}
        value={activeOrg?.id || ""}
        onChange={async (e) => {
          if (e.target.value) {
            await authClient.organization.setActive({ organizationId: e.target.value });
            window.location.reload();
          }
        }}
        aria-label="Organization"
      >
        {!orgs?.length && <option value="">Personal Workspace</option>}
        {orgs?.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
      <span style={{ color: "var(--koro-ash)" }}>▼</span>
      <Link
        href="/dashboard/settings/organization"
        className="ml-2 text-[var(--koro-ash)] hover:text-white transition-colors flex items-center"
        title="Manage Organizations"
      >
        <Settings className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
