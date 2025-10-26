import { API_URL } from './config';

export const metricsService = {
  getDepartmentMetrics: async (token: string) => {
    const res = await fetch(`${API_URL}/metrics/departments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  getTeamMetrics: async (token: string) => {
    const res = await fetch(`${API_URL}/metrics/teams`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  getPersonalMetrics: async (token: string) => {
    const res = await fetch(`${API_URL}/metrics/personal`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  getSingleTeamMetrics: async (token: string, teamId: string) => {
    const res = await fetch(`${API_URL}/metrics/teams/${teamId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  }
};

