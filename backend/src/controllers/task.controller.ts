import { Request, Response, NextFunction } from 'express';
import { store } from '../services/store';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { Task, TaskStatus } from '../types';

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, clientId, assignedToId, status, priority } = req.query;
    let tasks = store.getTasks();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      tasks = tasks.filter(t => 
        t.title.toLowerCase().includes(q) ||
        t.clientName.toLowerCase().includes(q) ||
        t.assignedToName.toLowerCase().includes(q)
      );
    }
    if (clientId && clientId !== 'all') {
      tasks = tasks.filter(t => t.clientId === clientId);
    }
    if (assignedToId && assignedToId !== 'all') {
      tasks = tasks.filter(t => t.assignedToId === assignedToId);
    }
    if (status && status !== 'all') {
      tasks = tasks.filter(t => t.status === status);
    }
    if (priority && priority !== 'all') {
      tasks = tasks.filter(t => t.priority === priority);
    }

    return successResponse(res, tasks, 'Tasks retrieved');
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newTask: Task = {
      ...data,
      id: 'tsk-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    store.setTasks([newTask, ...store.getTasks()]);
    store.addLog('System', 'Admin', 'Created task', `${newTask.title} for ${newTask.clientName}`, 'task');
    return successResponse(res, newTask, 'Task created', 201);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const tasks = store.getTasks().map(t => t.id === id ? { ...t, ...updates } : t);
    store.setTasks(tasks);
    const updated = tasks.find(t => t.id === id);
    return successResponse(res, updated, 'Task updated');
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: TaskStatus };
    const tasks = store.getTasks().map(t => t.id === id ? { ...t, status } : t);
    store.setTasks(tasks);
    const updated = tasks.find(t => t.id === id);
    return successResponse(res, updated, 'Task status updated');
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    store.setTasks(store.getTasks().filter(t => t.id !== id));
    return successResponse(res, { id }, 'Task deleted');
  } catch (error) {
    next(error);
  }
};
