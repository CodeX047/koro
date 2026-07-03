import { db, eq, and, inArray, desc, asc } from "@repo/database";
import {
  tasksTable,
  taskDependenciesTable,
  taskHistoryTable,
  planningVersionsTable,
  githubIssuesTable,
} from "@repo/database/schema";
import { TaskStatus, TaskPriority, TaskComplexity, TaskCategory } from "@repo/database/models/task";

type NewTaskInput = typeof tasksTable.$inferInsert;

export async function getTasksByFeatureId(featureId: string) {
  const tasks = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.featureId, featureId))
    .orderBy(asc(tasksTable.order), desc(tasksTable.createdAt));

  if (tasks.length === 0) return [];

  const taskIds = tasks.map((t) => t.id);

  const dependencies = await db
    .select()
    .from(taskDependenciesTable)
    .where(inArray(taskDependenciesTable.taskId, taskIds));

  const issues = await db
    .select()
    .from(githubIssuesTable)
    .where(inArray(githubIssuesTable.taskId, taskIds));

  // Map dependencies back to tasks
  return tasks.map((task) => {
    const issue = issues.find(i => i.taskId === task.id);
    return {
      ...task,
      dependencies: dependencies.filter((d) => d.taskId === task.id).map((d) => d.dependsOnTaskId),
      githubIssueUrl: issue?.url || null,
      githubIssueNumber: issue?.issueNumber || null,
    };
  });
}

export async function getTaskById(taskId: string) {
  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, taskId)).limit(1);

  return task || null;
}

export async function createTasksBatch(
  tasksToInsert: NewTaskInput[],
  dependenciesToInsert: { taskId: string; dependsOnTaskId: string }[],
) {
  return await db.transaction(async (tx) => {
    // 1. Insert tasks
    const insertedTasks = await tx.insert(tasksTable).values(tasksToInsert).returning();

    // 2. Insert dependencies if any
    if (dependenciesToInsert.length > 0) {
      await tx.insert(taskDependenciesTable).values(dependenciesToInsert);
    }

    // 3. Log history for creation
    const historyEntries = insertedTasks.map((t) => ({
      taskId: t.id,
      changes: { status: { old: null, new: "CREATED" } },
    }));
    if (historyEntries.length > 0) {
      await tx.insert(taskHistoryTable).values(historyEntries);
    }

    return insertedTasks;
  });
}

export async function updateTask(
  taskId: string,
  data: Partial<Omit<NewTaskInput, "id" | "projectId" | "featureId" | "prdId" | "createdAt">>,
) {
  return await db.transaction(async (tx) => {
    const [oldTask] = await tx.select().from(tasksTable).where(eq(tasksTable.id, taskId));
    if (!oldTask) throw new Error("Task not found");

    const changes: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      const typedKey = key as keyof typeof data;
      if (data[typedKey] !== oldTask[typedKey as keyof typeof oldTask]) {
        changes[key] = { old: oldTask[typedKey as keyof typeof oldTask], new: data[typedKey] };
      }
    }

    const [updated] = await tx
      .update(tasksTable)
      .set(data)
      .where(eq(tasksTable.id, taskId))
      .returning();

    if (Object.keys(changes).length > 0) {
      await tx.insert(taskHistoryTable).values({
        taskId,
        changes,
      });
    }

    return updated;
  });
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  return await updateTask(taskId, { status });
}

export async function moveTask(taskId: string, status: TaskStatus, order: number) {
  return await updateTask(taskId, { status, order });
}

export async function deleteTask(taskId: string) {
  const [deleted] = await db.delete(tasksTable).where(eq(tasksTable.id, taskId)).returning();
  return deleted;
}

export async function deleteTasksByFeatureId(featureId: string): Promise<void> {
  await db.delete(tasksTable).where(eq(tasksTable.featureId, featureId));
}

export async function createTask(data: NewTaskInput) {
  return await db.transaction(async (tx) => {
    const [inserted] = await tx.insert(tasksTable).values(data).returning();

    if (inserted) {
      await tx.insert(taskHistoryTable).values({
        taskId: inserted.id,
        changes: { status: { old: null, new: "CREATED_MANUALLY" } },
      });
    }

    return inserted;
  });
}

export async function snapshotPlan(featureId: string) {
  return await db.transaction(async (tx) => {
    // Determine next version
    const existingVersions = await tx
      .select({ version: planningVersionsTable.version })
      .from(planningVersionsTable)
      .where(eq(planningVersionsTable.featureId, featureId))
      .orderBy(desc(planningVersionsTable.version))
      .limit(1);

    const nextVersion = (existingVersions[0]?.version ?? 0) + 1;

    // Get current tasks
    const tasks = await getTasksByFeatureId(featureId);

    // Save snapshot
    const [snapshot] = await tx
      .insert(planningVersionsTable)
      .values({
        featureId,
        version: nextVersion,
        snapshot: tasks,
      })
      .returning();

    return snapshot;
  });
}
