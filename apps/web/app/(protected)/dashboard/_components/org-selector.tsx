"use client";

import { authClient } from "@repo/auth/client";
import Link from "next/link";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";

export function OrgSelector() {
  const { data: orgs, isPending: orgsPending } = authClient.useListOrganizations();
  const { data: activeOrg, isPending: activeOrgPending } = authClient.useActiveOrganization();
  const [isAutoSelecting, setIsAutoSelecting] = useState(false);

  useEffect(() => {
    const firstOrg = orgs?.[0];
    if (!orgsPending && !activeOrgPending && firstOrg && !activeOrg && !isAutoSelecting) {
      setIsAutoSelecting(true);
      void authClient.organization.setActive({ organizationId: firstOrg.id }).then(() => {
        window.location.reload();
      });
    }
  }, [orgs, activeOrg, orgsPending, activeOrgPending, isAutoSelecting]);

  return (
    <div className="flex items-center gap-2 text-[12px]">
      <span style={{ color: "var(--koro-ash)" }}>Org:</span>
      <select
        className="bg-transparent text-[var(--koro-on-primary)] outline-none cursor-pointer font-medium"
        style={{ appearance: "none" }}
        value={activeOrg?.id || ""}
        onChange={(e) => {
          if (e.target.value) {
            void authClient.organization.setActive({ organizationId: e.target.value }).then(() => {
              window.location.reload();
            });
          }
        }}
        aria-label="Organization"
        disabled={isAutoSelecting}
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
