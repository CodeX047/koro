"use client";

import React, { useState } from "react";
import { Building2, User, CreditCard, Shield } from "lucide-react";
import { authClient } from "@repo/auth/client";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState<"organization" | "profile" | "billing">(
    "organization",
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Navigation links */}
      <div className="space-y-2">
        <button
          onClick={() => setActiveTab("organization")}
          className={`w-full flex items-center gap-3 px-4 py-3 border rounded-sm text-[13px] font-bold transition-colors text-left ${activeTab === "organization" ? "border-[var(--koro-hairline-strong)] bg-[var(--koro-surface-dark)] text-[var(--koro-on-primary)]" : "border-transparent hover:border-[var(--koro-hairline-strong)] text-[var(--koro-ash)]"}`}
        >
          <Building2
            className={`w-4 h-4 ${activeTab === "organization" ? "text-[var(--koro-accent)]" : ""}`}
          />
          Organization Settings
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center gap-3 px-4 py-3 border rounded-sm text-[13px] font-bold transition-colors text-left ${activeTab === "profile" ? "border-[var(--koro-hairline-strong)] bg-[var(--koro-surface-dark)] text-[var(--koro-on-primary)]" : "border-transparent hover:border-[var(--koro-hairline-strong)] text-[var(--koro-ash)]"}`}
        >
          <User
            className={`w-4 h-4 ${activeTab === "profile" ? "text-[var(--koro-accent)]" : ""}`}
          />
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`w-full flex items-center gap-3 px-4 py-3 border rounded-sm text-[13px] font-bold transition-colors text-left ${activeTab === "billing" ? "border-[var(--koro-hairline-strong)] bg-[var(--koro-surface-dark)] text-[var(--koro-on-primary)]" : "border-transparent hover:border-[var(--koro-hairline-strong)] text-[var(--koro-ash)]"}`}
        >
          <CreditCard
            className={`w-4 h-4 ${activeTab === "billing" ? "text-[var(--koro-accent)]" : ""}`}
          />
          Billing & Subscription
        </button>
      </div>

      {/* Content Area */}
      <div className="md:col-span-2 border rounded-sm p-6 bg-[var(--koro-surface-dark)] border-[var(--koro-hairline-strong)]">
        {activeTab === "organization" && <OrganizationSettings />}
        {activeTab === "profile" && <ProfileSettings />}
        {activeTab === "billing" && <BillingSettings />}
      </div>
    </div>
  );
}

function OrganizationSettings() {
  const { data: activeOrg, isPending } = authClient.useActiveOrganization();
  const [name, setName] = useState(activeOrg?.name || "");
  const [slug, setSlug] = useState(activeOrg?.slug || "");
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when activeOrg loads
  React.useEffect(() => {
    if (activeOrg) {
      setName(activeOrg.name);
      setSlug(activeOrg.slug);
    }
  }, [activeOrg]);

  const handleSave = async () => {
    if (!activeOrg) return;
    setIsSaving(true);
    try {
      const { data, error } = await authClient.organization.update({
        organizationId: activeOrg.id,
        data: { name, slug },
      });
      if (error) {
        toast.error(error.message || "Failed to update organization");
      } else {
        toast.success("Organization updated successfully");
      }
    } catch (err: any) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending)
    return <div className="text-[var(--koro-ash)] text-sm">Loading organization details...</div>;
  if (!activeOrg)
    return (
      <div className="text-[var(--koro-ash)] text-sm">
        No active organization selected. Please create one on the dashboard.
      </div>
    );

  return (
    <div className="space-y-6">
      <div
        className="text-[12px] font-bold uppercase tracking-wider"
        style={{ color: "var(--koro-on-primary)" }}
      >
        Organization Details
      </div>
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label
            className="text-[10px] uppercase tracking-widest"
            style={{ color: "var(--koro-ash)" }}
          >
            Organization Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--koro-accent)] transition-colors"
            style={{ borderColor: "var(--koro-hairline-strong)", color: "var(--koro-on-primary)" }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            className="text-[10px] uppercase tracking-widest"
            style={{ color: "var(--koro-ash)" }}
          >
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="bg-transparent border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--koro-accent)] transition-colors"
            style={{ borderColor: "var(--koro-hairline-strong)", color: "var(--koro-on-primary)" }}
          />
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-bold rounded-sm transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--koro-accent)", color: "var(--koro-canvas)" }}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function ProfileSettings() {
  const { data: session, isPending } = authClient.useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (session?.user) {
      setName(session.user.name);
    }
  }, [session]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await authClient.updateUser({ name });
      if (error) {
        toast.error(error.message || "Failed to update profile");
      } else {
        toast.success("Profile updated successfully");
      }
    } catch (err: any) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending)
    return <div className="text-[var(--koro-ash)] text-sm">Loading profile details...</div>;

  return (
    <div className="space-y-6">
      <div
        className="text-[12px] font-bold uppercase tracking-wider"
        style={{ color: "var(--koro-on-primary)" }}
      >
        Profile Details
      </div>
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label
            className="text-[10px] uppercase tracking-widest"
            style={{ color: "var(--koro-ash)" }}
          >
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--koro-accent)] transition-colors"
            style={{ borderColor: "var(--koro-hairline-strong)", color: "var(--koro-on-primary)" }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            className="text-[10px] uppercase tracking-widest"
            style={{ color: "var(--koro-ash)" }}
          >
            Email Address (Read-only)
          </label>
          <input
            type="email"
            value={session?.user?.email || ""}
            disabled
            className="bg-transparent border rounded-sm px-3 py-2 text-sm cursor-not-allowed opacity-50"
            style={{ borderColor: "var(--koro-hairline-strong)", color: "var(--koro-on-primary)" }}
          />
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-bold rounded-sm transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--koro-accent)", color: "var(--koro-canvas)" }}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function BillingSettings() {
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: subscription, isLoading } = trpc.billing.getSubscription.useQuery(undefined, {
    enabled: !!activeOrg,
  });

  const checkoutMutation = trpc.billing.createCheckoutSession.useMutation();
  const portalMutation = trpc.billing.getCustomerPortalUrl.useMutation();

  const handleUpgrade = async (planId: string) => {
    try {
      const { checkoutUrl } = await checkoutMutation.mutateAsync({
        planId,
        returnUrl: window.location.href,
      });
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error("Failed to generate checkout URL");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate checkout");
    }
  };

  const handleManageBilling = async () => {
    // If the activeOrg has a customerId (we would ideally store it on the org metadata or something)
    // Actually, createCheckoutSession usually handles upgrades. Let's provide an upgrade button for now.
    toast.error("Customer portal is not fully set up yet. Please use the upgrade button.");
  };

  if (!activeOrg)
    return (
      <div className="text-[var(--koro-ash)] text-sm">
        No active organization selected. Please create one.
      </div>
    );
  if (isLoading)
    return <div className="text-[var(--koro-ash)] text-sm">Loading billing details...</div>;

  const plan = subscription?.plan || "FREE";

  return (
    <div className="space-y-6">
      <div
        className="text-[12px] font-bold uppercase tracking-wider"
        style={{ color: "var(--koro-on-primary)" }}
      >
        Billing & Subscription
      </div>

      <div
        className="border rounded-sm p-5 space-y-4 bg-transparent"
        style={{ borderColor: "var(--koro-hairline-strong)" }}
      >
        <div
          className="flex justify-between items-center border-b pb-4"
          style={{ borderColor: "var(--koro-hairline-strong)" }}
        >
          <div>
            <h4 className="font-bold text-[16px]" style={{ color: "var(--koro-on-primary)" }}>
              Current Plan:{" "}
              <span style={{ color: "var(--koro-accent)" }}>{plan.toUpperCase()}</span>
            </h4>
            <p className="text-[11px] mt-1" style={{ color: "var(--koro-ash)" }}>
              {plan === "FREE"
                ? "You are currently on the free tier."
                : "Thank you for supporting Kōro!"}
            </p>
          </div>
          {plan !== "FREE" && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold tracking-wide"
              style={{
                backgroundColor: "var(--koro-surface-dark-elevated)",
                color: "var(--koro-success)",
              }}
            >
              ACTIVE
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 py-2">
          <div
            className="p-4 rounded-sm border"
            style={{
              borderColor: "var(--koro-hairline-strong)",
              backgroundColor: "var(--koro-surface-dark)",
            }}
          >
            <div
              className="text-[10px] uppercase tracking-widest mb-2"
              style={{ color: "var(--koro-ash)" }}
            >
              AI Reviews
            </div>
            <div className="text-[20px] font-bold" style={{ color: "var(--koro-on-primary)" }}>
              {subscription?.reviewsUsed}{" "}
              <span className="text-[12px] font-normal" style={{ color: "var(--koro-ash)" }}>
                / {subscription?.reviewsLimit}
              </span>
            </div>
            <div
              className="w-full rounded-full h-1 mt-3"
              style={{ backgroundColor: "var(--koro-hairline-strong)" }}
            >
              <div
                className="h-1 rounded-full transition-all"
                style={{
                  backgroundColor: "var(--koro-accent)",
                  width: `${Math.min(100, ((subscription?.reviewsUsed || 0) / (subscription?.reviewsLimit || 1)) * 100)}%`,
                }}
              ></div>
            </div>
          </div>
          <div
            className="p-4 rounded-sm border"
            style={{
              borderColor: "var(--koro-hairline-strong)",
              backgroundColor: "var(--koro-surface-dark)",
            }}
          >
            <div
              className="text-[10px] uppercase tracking-widest mb-2"
              style={{ color: "var(--koro-ash)" }}
            >
              Synced Repos
            </div>
            <div className="text-[20px] font-bold" style={{ color: "var(--koro-on-primary)" }}>
              {subscription?.repositoriesUsed}{" "}
              <span className="text-[12px] font-normal" style={{ color: "var(--koro-ash)" }}>
                / {subscription?.repositoriesLimit}
              </span>
            </div>
            <div
              className="w-full rounded-full h-1 mt-3"
              style={{ backgroundColor: "var(--koro-hairline-strong)" }}
            >
              <div
                className="h-1 rounded-full transition-all"
                style={{
                  backgroundColor: "var(--koro-accent)",
                  width: `${Math.min(100, ((subscription?.repositoriesUsed || 0) / (subscription?.repositoriesLimit || 1)) * 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {plan === "FREE" && (
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              onClick={() => handleUpgrade("PRO")}
              disabled={checkoutMutation.isPending}
              className="px-4 py-2 text-sm font-bold rounded-sm transition-colors disabled:opacity-50 border"
              style={{
                borderColor: "var(--koro-hairline-strong)",
                color: "var(--koro-on-primary)",
                backgroundColor: "transparent",
              }}
            >
              Upgrade to PRO
            </button>
            <button
              onClick={() => handleUpgrade("TEAM")}
              disabled={checkoutMutation.isPending}
              className="px-4 py-2 text-sm font-bold rounded-sm transition-colors disabled:opacity-50"
              style={{ backgroundColor: "var(--koro-accent)", color: "var(--koro-canvas)" }}
            >
              {checkoutMutation.isPending ? "Loading..." : "Upgrade to TEAM"}
            </button>
          </div>
        )}

        {plan !== "FREE" && (
          <div className="pt-4 flex items-center justify-end">
            <button
              onClick={handleManageBilling}
              className="px-4 py-2 text-sm font-bold rounded-sm transition-colors border"
              style={{
                borderColor: "var(--koro-hairline-strong)",
                color: "var(--koro-on-primary)",
                backgroundColor: "transparent",
              }}
            >
              Manage Billing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
