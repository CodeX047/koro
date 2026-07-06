"use client";

import { useState } from "react";
import { authClient } from "@repo/auth/client";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function OrganizationSettingsPage() {
  const { data: orgs, isPending: orgsPending } = authClient.useListOrganizations();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const [newOrgName, setNewOrgName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [updateName, setUpdateName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize update name when active org loads
  useState(() => {
    if (activeOrg) setUpdateName(activeOrg.name);
  });

  const handleCreate = async () => {
    if (!newOrgName.trim()) return;
    setIsCreating(true);
    const { error } = await authClient.organization.create({
      name: newOrgName,
      slug: `${newOrgName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Math.random().toString(36).substring(2, 8)}`,
    });
    setIsCreating(false);
    if (error) {
      toast.error(error.message || "Failed to create organization");
    } else {
      toast.success("Organization created successfully");
      setNewOrgName("");
    }
  };

  const handleUpdate = async () => {
    if (!updateName.trim() || !activeOrg) return;
    setIsUpdating(true);
    const { error } = await authClient.organization.update({
      organizationId: activeOrg.id,
      data: {
        name: updateName,
      },
    });
    setIsUpdating(false);
    if (error) {
      toast.error(error.message || "Failed to update organization");
    } else {
      toast.success("Organization updated successfully");
    }
  };

  const handleDelete = async () => {
    if (!activeOrg) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this organization? All projects, features, and repositories will be permanently deleted. This action cannot be undone.",
    );
    if (!confirmed) return;

    setIsDeleting(true);

    // Fire the async cleanup workflow
    await fetch("/api/inngest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        { name: "organization/delete.requested", data: { organizationId: activeOrg.id } },
      ]),
    }).catch(console.error);

    const remainingOrgs = orgs?.filter((org) => org.id !== activeOrg.id) || [];

    // Delete natively in better-auth
    const { error } = await authClient.organization.delete({
      organizationId: activeOrg.id,
    });
    setIsDeleting(false);

    if (error) {
      toast.error(error.message || "Failed to delete organization");
    } else {
      const nextOrg = remainingOrgs[0];
      if (nextOrg) {
        await authClient.organization.setActive({ organizationId: nextOrg.id });
      }
      toast.success("Organization deleted successfully");
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Organization Settings</h1>
        <p className="text-[var(--koro-ash)] text-sm">
          Manage your organizations, create new ones, or update existing settings.
        </p>
      </div>

      <div className="bg-[var(--koro-surface)] border border-[var(--koro-surface-border)] rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-medium">Create New Organization</h2>
        <div className="flex gap-4 items-end">
          <div className="space-y-2 flex-1">
            <Label htmlFor="newOrg">Organization Name</Label>
            <Input
              id="newOrg"
              placeholder="e.g. Acme Corp"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
            />
          </div>
          <Button onClick={handleCreate} disabled={!newOrgName.trim() || isCreating}>
            {isCreating ? "Creating..." : "Create Organization"}
          </Button>
        </div>
      </div>

      {activeOrg && (
        <div className="bg-[var(--koro-surface)] border border-[var(--koro-surface-border)] rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-1">Active Organization: {activeOrg.name}</h2>
            <p className="text-[var(--koro-ash)] text-sm">
              Update settings for your currently selected organization.
            </p>
          </div>

          <div className="flex gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="updateOrg">Rename Organization</Label>
              <Input
                id="updateOrg"
                defaultValue={activeOrg.name}
                onChange={(e) => setUpdateName(e.target.value)}
              />
            </div>
            <Button onClick={handleUpdate} disabled={!updateName.trim() || isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <div className="pt-4 border-t border-[var(--koro-surface-border)]">
            <h3 className="text-red-500 font-medium mb-2">Danger Zone</h3>
            <div className="text-[var(--koro-ash)] text-sm mb-4">
              Permanently delete this organization and all its data. This will fire a background
              cleanup job to:
              <ul className="list-disc pl-5 mt-2 mb-2">
                <li>Delete Pinecone namespace</li>
                <li>Remove repository associations</li>
                <li>Delete stored installation metadata</li>
              </ul>
              <span className="text-xs italic opacity-80">
                Note: Kōro cannot uninstall the GitHub App from your GitHub account automatically. It only disconnects the integration.
              </span>
            </div>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Organization"}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-[var(--koro-surface)] border border-[var(--koro-surface-border)] rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Your Organizations</h2>
        {orgsPending ? (
          <div className="text-[var(--koro-ash)] text-sm">Loading organizations...</div>
        ) : (
          <div className="space-y-2">
            {orgs?.map((org) => (
              <div
                key={org.id}
                className="flex justify-between items-center p-3 border border-[var(--koro-surface-border)] rounded-md"
              >
                <span className="font-medium">{org.name}</span>
                {activeOrg?.id === org.id ? (
                  <span className="text-xs bg-[var(--koro-primary)] text-green-500 px-2 py-1 rounded-full font-medium">
                    Active
                  </span>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await authClient.organization.setActive({ organizationId: org.id });
                      window.location.reload();
                    }}
                  >
                    Switch
                  </Button>
                )}
              </div>
            ))}
            {!orgs?.length && (
              <div className="text-[var(--koro-ash)] text-sm italic">
                You don't belong to any organizations yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
