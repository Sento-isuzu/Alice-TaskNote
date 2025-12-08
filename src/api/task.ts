// task.ts - 统一使用 localhost:8000
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000,
});

// 类型定义
export interface TaskCreateParams {
  title: string;
  content: string;
  status?: 'todo' | 'doing' | 'done';
  priority: 'high' | 'medium' | 'low' | 'none';
  deadline?: string;
  tags?: number[];
}

export interface TaskUpdateParams {
  title?: string;
  content?: string;
  status?: 'todo' | 'doing' | 'done';
  isPinned?: boolean;
  priority?: 'high' | 'medium' | 'low' | 'none';
  deadline?: string;
  tags?: number[];
}

export interface TaskResponse {
  id: number;
  type: 'task';
  title: string;
  content: string;
  status: 'todo' | 'doing' | 'done';
  priority: 'high' | 'medium' | 'low' | 'none';
  deadline?: string;
  tags: { id: number; name: string; color?: string }[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// 获取所有任务
export const fetchTasks = async () => {
  const res = await axiosInstance.get('/api/tasks/');
  return res.data;
};

// 创建任务
export const createTask = async (taskData: any) => {
  const res = await axiosInstance.post('/api/tasks/', taskData);
};

// 更新任务
export const updateTask = async (taskId: number, taskData: any) => {
  const res = await axiosInstance.patch(`/api/tasks/${taskId}`, taskData);
  return res.data;
};

// 删除任务
export const deleteTask = async (taskId: number) => {
  const res = await axiosInstance.delete(`/api/tasks/${taskId}`);
  return res.data;
};

// 搜索任务
export const searchTasks = async (query: string) => {
  const res = await axiosInstance.get('/api/tasks/', {
    params: { q: query },
  });
  return res.data;
};
