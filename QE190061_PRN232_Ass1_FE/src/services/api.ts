import axios from 'axios';
import type {
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  Tag,
  CreateTagDto,
  UpdateTagDto,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ==================== DEPARTMENTS ====================
export const departmentApi = {
  getAll: () => api.get<Department[]>('/departments').then(r => r.data),
  getById: (id: number) => api.get<Department>(`/departments/${id}`).then(r => r.data),
  search: (name: string) => api.get<Department[]>(`/departments/search?name=${encodeURIComponent(name)}`).then(r => r.data),
  create: (dto: CreateDepartmentDto) => api.post<Department>('/departments', dto).then(r => r.data),
  update: (id: number, dto: UpdateDepartmentDto) => api.put<Department>(`/departments/${id}`, dto).then(r => r.data),
  delete: (id: number) => api.delete(`/departments/${id}`).then(r => r.status === 204),
};

// ==================== PROJECTS ====================
export const projectApi = {
  getAll: (params?: { name?: string; status?: number; departmentId?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.name) searchParams.append('name', params.name);
    if (params?.status !== undefined) searchParams.append('status', String(params.status));
    if (params?.departmentId !== undefined) searchParams.append('departmentId', String(params.departmentId));
    const query = searchParams.toString();
    return api.get<Project[]>(`/projects${query ? '?' + query : ''}`).then(r => r.data);
  },
  getById: (id: number) => api.get<Project>(`/projects/${id}`).then(r => r.data),
  getByDepartmentId: (departmentId: number) => api.get<Project[]>(`/projects/department/${departmentId}`).then(r => r.data),
  create: (dto: CreateProjectDto) => api.post<Project>('/projects', dto).then(r => r.data),
  update: (id: number, dto: UpdateProjectDto) => api.put<Project>(`/projects/${id}`, dto).then(r => r.data),
  delete: (id: number) => api.delete(`/projects/${id}`).then(r => r.status === 204),
};

// ==================== TASKS ====================
export const taskApi = {
  getAll: (params?: { title?: string; status?: number; priority?: number; projectId?: number; tagId?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.title) searchParams.append('title', params.title);
    if (params?.status !== undefined) searchParams.append('status', String(params.status));
    if (params?.priority !== undefined) searchParams.append('priority', String(params.priority));
    if (params?.projectId !== undefined) searchParams.append('projectId', String(params.projectId));
    if (params?.tagId !== undefined) searchParams.append('tagId', String(params.tagId));
    const query = searchParams.toString();
    return api.get<Task[]>(`/tasks${query ? '?' + query : ''}`).then(r => r.data);
  },
  getById: (id: number) => api.get<Task>(`/tasks/${id}`).then(r => r.data),
  getByProjectId: (projectId: number) => api.get<Task[]>(`/tasks/project/${projectId}`).then(r => r.data),
  create: (dto: CreateTaskDto) => api.post<Task>('/tasks', dto).then(r => r.data),
  update: (id: number, dto: UpdateTaskDto) => api.put<Task>(`/tasks/${id}`, dto).then(r => r.data),
  delete: (id: number) => api.delete(`/tasks/${id}`).then(r => r.status === 204),
};

// ==================== TAGS ====================
export const tagApi = {
  getAll: () => api.get<Tag[]>('/tags').then(r => r.data),
  getById: (id: number) => api.get<Tag>(`/tags/${id}`).then(r => r.data),
  create: (dto: CreateTagDto) => api.post<Tag>('/tags', dto).then(r => r.data),
  update: (id: number, dto: UpdateTagDto) => api.put<Tag>(`/tags/${id}`, dto).then(r => r.data),
  delete: (id: number) => api.delete(`/tags/${id}`).then(r => r.status === 204),
};
