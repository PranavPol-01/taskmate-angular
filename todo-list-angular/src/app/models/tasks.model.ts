// src/app/models/tasks.model.ts

// Reusable types for status and priority
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

// Main Task interface
export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  due_date?: string;
  created_at?: string;
  user_id?: string;
}

// Interface used for creating new tasks
export interface CreateTask {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  due_date?: string;
}

// Interface for aggregated task statistics
export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  status_stats: {
    [key in TaskStatus]?: number;
  };
  priority_stats: {
    [key in TaskPriority]?: number;
  };
}
