'use client';

// Centralized role ranking and access helpers aligned with project.md

export type RoleKey = 'staff' | 'manager' | 'director' | 'hr' | 'sm' | 'senior management' | '';

const roleRank: Record<RoleKey, number> = {
  '': 0,
  'staff': 1,
  'manager': 2,
  'director': 3,
  'hr': 4,
  'senior management': 5,
  'sm': 5,
};

export function normalizeRole(role?: string): RoleKey {
  return (role || '').toLowerCase() as RoleKey;
}

export function getRoleRank(role?: string): number {
  return roleRank[normalizeRole(role)] || 0;
}

export function canViewTeam(role?: string): boolean {
  return getRoleRank(role) >= 2; // Manager+
}

export function canViewDepartment(role?: string): boolean {
  return getRoleRank(role) >= 3; // Director+
}

export function canViewAll(role?: string): boolean {
  return getRoleRank(role) >= 4; // HR/SM+
}

export type VisibleUsersScope = 'all' | 'department' | 'team' | 'none';

export function getVisibleUsersScope(role?: string): VisibleUsersScope {
  if (canViewAll(role)) return 'all';
  if (canViewDepartment(role)) return 'department';
  if (canViewTeam(role)) return 'team';
  return 'none';
}


