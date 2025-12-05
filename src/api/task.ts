// src/api/task.ts
import axios from 'axios';

// 配置后端基础地址
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 5000,
});

// 获取所有任务
export const fetchTasks = async () => {
  const res = await axiosInstance.get('/api/tasks');
  return res.data;
};

// 创建任务
export const createTask = async (taskData: any) => {
  const res = await axiosInstance.post('/api/tasks', taskData);
  return res.data;
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
  const res = await axiosInstance.get('/api/tasks', {
    params: { q: query },
  });
  return res.data;
};
