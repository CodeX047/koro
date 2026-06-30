import { inngest } from "../client";
import { db, eq } from "@repo/database";
import { repoSyncTable } from "@repo/database/schema";
import {
    buildRepoNamespace,
    chunkRepoFiles,
    deleteRepoNamespace,
    getRepoFiles,
    saveRepoChunks,
} from "@repo/services/github/repo-sync";

export const githubSync = inngest.createFunction(
    {
        id: "sync-repo-codebase",
        triggers: [{ event: "github/sync.requested" }],
        retries: 3,
        concurrency: { limit: 2 },
        onFailure: async ({ event }: { event: any }) => {
            const repoSyncId = event.data.event.data.repoSyncId;
            await db.update(repoSyncTable).set({ status: "failed" })
                .where(eq(repoSyncTable.id, repoSyncId));
        }
    },
    async ({ event, step }: { event: any, step: any }) => {
        const repoSyncId = event.data.repoSyncId;

        const [repoSync] = await step.run("mark-syncing", async () => {
            return db.update(repoSyncTable).set({ status: "syncing" })
                .where(eq(repoSyncTable.id, repoSyncId)).returning();
        });

        if (!repoSync) {
            throw new Error(`RepoSync with ID ${repoSyncId} not found`);
        }

        const chunks = await step.run("fetch-and-chunk-codebase", async () => {
            const files = await getRepoFiles(
                repoSync.installationId,
                repoSync.repoFullName,
                repoSync.branch
            );

            return chunkRepoFiles(files);
        });

        const namespace = buildRepoNamespace(repoSync.repoFullName);

        if (repoSync.syncedAt) {
            await step.run("delete-old-vectors", async () => {
                await deleteRepoNamespace(namespace);
            });
        }

        await step.run("save-vectors-to-pinecone", async () => {
            await saveRepoChunks(namespace, chunks);
        });

        await step.run("mark-synced", async () => {
            await db.update(repoSyncTable).set({
                status: "synced",
                syncedAt: new Date(),
                chunkCount: chunks.length,
            }).where(eq(repoSyncTable.id, repoSyncId));
        });

        return {
            repoSyncId,
            status: "synced",
            chunkCount: chunks.length,
        };
    }
);
