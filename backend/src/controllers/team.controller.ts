import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { store } from '../services/store';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { User } from '../types';

export const getTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, role, workload } = req.query;
    let users = store.getUsers();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      users = users.filter(u => 
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    }
    if (role && role !== 'all') {
      users = users.filter(u => u.role === role);
    }
    if (workload && workload !== 'all') {
      users = users.filter(u => u.workload === workload);
    }

    const safeUsers = users.map(({ passwordHash: _, ...u }) => u);
    return successResponse(res, safeUsers, 'Team roster retrieved');
  } catch (error) {
    next(error);
  }
};

export const createTeamMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password, ...data } = req.body;

    if (!password || typeof password !== 'string' || !password.trim()) {
      return errorResponse(res, 'Password is mandatory for creating a team member', 400);
    }

    const plainPassword = password.trim();
    if (plainPassword.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters long', 400);
    }

    const newId = 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const newUser: User & { passwordHash?: string } = {
      ...data,
      id: newId,
      assignedTasksCount: 0,
      completedTasksCount: 0,
      overdueTasksCount: 0,
      passwordHash
    };

    store.setUsers([...store.getUsers(), newUser]);
    store.addLog('System', 'Admin', 'Added team member', `${newUser.name} (${newUser.role})`, 'system');
    const { passwordHash: _, ...safeUser } = newUser as any;
    return successResponse(res, safeUser, 'Team member added', 201);
  } catch (error) {
    next(error);
  }
};

export const updateTeamMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { password, ...updates } = req.body;

    let extraUpdates: { passwordHash?: string } = {};
    if (password && typeof password === 'string' && password.trim()) {
      extraUpdates.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const users = store.getUsers().map(u => u.id === id ? { ...u, ...updates, ...extraUpdates } : u);
    store.setUsers(users);
    const updated = users.find(u => u.id === id);
    const { passwordHash: _, ...safeUser } = updated as any;
    return successResponse(res, safeUser, 'Team member profile updated');
  } catch (error) {
    next(error);
  }
};

export const deleteTeamMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const users = store.getUsers();
    if (users.length <= 1) {
      return errorResponse(res, 'Cannot delete the only team member', 400);
    }
    const target = users.find(u => u.id === id);
    store.setUsers(users.filter(u => u.id !== id));
    if (target) {
      store.addLog('System', 'Admin', 'Deleted team member', target.name, 'system');
    }
    return successResponse(res, { id }, 'Team member removed');
  } catch (error) {
    next(error);
  }
};
