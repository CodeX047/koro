"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { trpc } from "~/trpc/client";
import { TaskDialog } from "./task-dialog";

// ── Column Configuration ────────────────────────────────────────────────
const COLUMNS = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "REVIEW", title: "Review" },
  { id: "DONE", title: "Done" },
  { id: "BLOCKED", title: "Blocked" },
] as const;

// ── Sortable Task Item Component ──────────────────────────────────────────
function SortableTaskItem({
  task,
  onClick,
}: {
  task: any;
  onClick: (task: any) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { type: "Task", task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: "var(--koro-surface-dark-elevated)",
        border: "1px solid var(--koro-hairline-strong)",
      }}
      onClick={() => onClick(task)}
      className="group relative flex flex-col gap-2 p-3 mb-2 rounded-lg cursor-pointer transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hover:text-[var(--koro-on-primary)]"
          style={{ color: "var(--koro-ash)" }}
          onClick={(e) => e.stopPropagation()} // prevent opening dialog when just grabbing
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold leading-snug" style={{ color: "var(--koro-on-primary)" }}>
            {task.title}
          </h4>
          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
              style={{
                backgroundColor:
                  task.priority === "URGENT"
                    ? "var(--koro-danger)"
                    : task.priority === "HIGH"
                      ? "var(--koro-warning)"
                      : "var(--koro-surface-dark)",
                color:
                  task.priority === "URGENT" || task.priority === "HIGH"
                    ? "#fff"
                    : "var(--koro-ash)",
              }}
            >
              {task.priority}
            </span>
            {task.estimatedHours && (
              <span className="text-[9px] font-semibold uppercase" style={{ color: "var(--koro-ash)" }}>
                {task.estimatedHours}h
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Column Component ─────────────────────────────────────────────────────
function Column({
  column,
  tasks,
  onTaskClick,
}: {
  column: { id: string; title: string };
  tasks: any[];
  onTaskClick: (task: any) => void;
}) {
  return (
    <div className="flex flex-col flex-1 min-w-[250px] shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--koro-ash)" }}>
          {column.title}
        </h3>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--koro-surface-dark)", color: "var(--koro-mute)" }}>
          {tasks.length}
        </span>
      </div>
      <div
        className="flex-1 p-2 rounded-xl"
        style={{ backgroundColor: "var(--koro-surface-dark)" }}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskItem key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

// ── Main Kanban Board ────────────────────────────────────────────────────
export function KanbanBoard({ featureId }: { featureId: string }) {
  const utils = trpc.useUtils();
  const { data: initialTasks, isLoading } = trpc.task.listByFeature.useQuery({ featureId });
  const moveTask = trpc.task.move.useMutation({
    onSettled: () => {
      // Invalidate to ensure consistency, but we rely on optimistic updates mostly
      utils.task.listByFeature.invalidate({ featureId });
    }
  });

  const [tasks, setTasks] = useState<any[]>([]);
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  useEffect(() => {
    if (initialTasks) {
      // Sort tasks within their status by order
      const sorted = [...initialTasks].sort((a, b) => a.order - b.order);
      setTasks(sorted);
    }
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-[var(--koro-ash)]">Loading board...</div>;
  }

  // Handle Drag Start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  // Handle Drag Over (moving between columns)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    // Moving a Task over another Task
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          const newTasks = [...tasks];
          newTasks[activeIndex].status = tasks[overIndex].status;
          return arrayMove(newTasks, activeIndex, overIndex);
        }
        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // Moving a Task over an empty Column
    const isOverColumn = over.data.current?.type === "Column";
    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const newTasks = [...tasks];
        newTasks[activeIndex].status = overId as any;
        return arrayMove(newTasks, activeIndex, activeIndex);
      });
    }
  };

  // Handle Drag End (drop)
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    setTasks((tasks) => {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const overIndex = tasks.findIndex((t) => t.id === overId);
      
      let newTasks = tasks;
      if (activeIndex !== overIndex) {
        newTasks = arrayMove(tasks, activeIndex, overIndex);
      }

      // Find the final status and new order array for that status
      const movedTask = newTasks.find(t => t.id === activeId)!;
      const statusTasks = newTasks.filter(t => t.status === movedTask.status);
      const newOrder = statusTasks.findIndex(t => t.id === activeId);

      // Persist the move optimistically
      moveTask.mutate({
        taskId: activeId as string,
        status: movedTask.status,
        order: newOrder,
      });

      return newTasks;
    });
  };

  return (
    <div className="flex overflow-x-auto gap-4 pb-4 h-[600px]">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {COLUMNS.map((col) => (
          <Column
            key={col.id}
            column={col}
            tasks={tasks.filter((t) => t.status === col.id)}
            onTaskClick={setSelectedTask}
          />
        ))}

        <DragOverlay>
          {activeTask ? (
            <div className="opacity-80 scale-105 shadow-xl">
              <SortableTaskItem task={activeTask} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedTask && (
        <TaskDialog
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={() => utils.task.listByFeature.invalidate({ featureId })}
        />
      )}
    </div>
  );
}
