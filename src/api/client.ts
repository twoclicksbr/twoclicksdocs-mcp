import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env.js';
import { getTokenForProject } from '../config/tokens.js';

export function apiClient(projectSlug: string): AxiosInstance {
  const token = getTokenForProject(projectSlug);

  return axios.create({
    baseURL: env.apiBaseUrl,
    timeout: 30000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    validateStatus: () => true,
  });
}

export function publicClient(): AxiosInstance {
  return axios.create({
    baseURL: env.apiBaseUrl,
    timeout: 30000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    validateStatus: () => true,
  });
}

export function handleResponse<T = any>(res: { status: number; data: any }): T {
  if (res.status >= 200 && res.status < 300) {
    return res.data;
  }
  const msg = res.data?.message || `HTTP ${res.status}`;
  const errors = res.data?.errors ? ` | ${JSON.stringify(res.data.errors)}` : '';
  throw new Error(`API erro (${res.status}): ${msg}${errors}`);
}
