import { db, eq, and, inArray, desc, asc } from "@repo/database";
import { tasksTable, taskDependenciesTable } from "@repo/database/schema";
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

  // Map dependencies back to tasks
  return tasks.map((task) => ({
    ...task,
    dependencies: dependencies
      .filter((d) => d.taskId === task.id)
      .map((d) => d.dependsOnTaskId),
  }));
}

export async function getTaskById(taskId: string) {
  const [task] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, taskId))
    .limit(1);

  return task || null;
}

export async function createTasksBatch(
  tasksToInsert: NewTaskInput[],
  dependenciesToInsert: { taskId: string; dependsOnTaskId: string }[]
) {
  return await db.transaction(async (tx) => {
    // 1. Insert tasks
    const insertedTasks = await tx
      .insert(tasksTable)
      .values(tasksToInsert)
      .returning();

    // 2. Insert dependencies if any
    if (dependenciesToInsert.length > 0) {
      await tx.insert(taskDependenciesTable).values(dependenciesToInsert);
    }

    return insertedTasks;
  });
}

export async function updateTask(
  taskId: string,
  data: Partial<Omit<NewTaskInput, "id" | "projectId" | "featureId" | "prdId" | "createdAt">>
) {
  const [updated] = await db
    .update(tasksTable)
    .set(data)
    .where(eq(tasksTable.id, taskId))
    .returning();
  return updated;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const [updated] = await db
    .update(tasksTable)
    .set({ status })
    .where(eq(tasksTable.id, taskId))
    .returning();
  return updated;
}

export async function moveTask(taskId: string, status: TaskStatus, order: number) {
  const [updated] = await db
    .update(tasksTable)
    .set({ status, order })
    .where(eq(tasksTable.id, taskId))
    .returning();
  return updated;
}

export async function deleteTask(taskId: string) {
  const [deleted] = await db
    .delete(tasksTable)
    .where(eq(tasksTable.id, taskId))
    .returning();
  return deleted;
}

export async function createTask(data: NewTaskInput) {
  const [inserted] = await db
    .insert(tasksTable)
    .values(data)
    .returning();
  return inserted;
}
