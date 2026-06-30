import { db, inArray } from "@repo/database";
import { repoSyncTable } from "@repo/database/schema";
import { inngest } from "@repo/workflows/client";

export async function getRepoSyncStatuses(repoFullNames: string[]) {
  if (repoFullNames.length === 0) return {};

  const syncs = await db
    .select({
      repoFullName: repoSyncTable.repoFullName,
      status: repoSyncTable.status,
    })
    .from(repoSyncTable)
    .where(inArray(repoSyncTable.repoFullName, repoFullNames));

  const statusByRepo: Record<string, string> = {};

  for (const sync of syncs) {
    statusByRepo[sync.repoFullName] = sync.status;
  }

  return statusByRepo;
}

export async function triggerRepoSync(
  installationId: number,
  repoFullName: string,
  branch: string,
) {
  const [repoSync] = await db
    .insert(repoSyncTable)
    .values({
      installationId,
      repoFullName,
      branch,
      status: "pending",
    })
    .onConflictDoUpdate({
      target: repoSyncTable.repoFullName,
      set: { installationId, branch, status: "pending" },
    })
    .returning();

  if (!repoSync) {
    throw new Error("Failed to create or update RepoSync record");
  }

  await inngest.send({
    name: "github/sync.requested",
    data: { repoSyncId: repoSync.id },
  });
}
