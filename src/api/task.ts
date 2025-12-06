// task.ts - 统一使用 localhost:8000
import axios from 'axios';

// 配置后端基础地址 - 改为与 notes.ts 一致
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // 改为 localhost
  timeout: 5000,
});

// 获取所有任务
export const fetchTasks = async () => {
  const res = await axiosInstance.get('/api/tasks/'); // 添加末尾斜杠
  return res.data;
};

// 创建任务
export const createTask = async (taskData: any) => {
  const res = await axiosInstance.post('/api/tasks/', taskData); // 添加末尾斜杠
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
  const res = await axiosInstance.get('/api/tasks/', {
    // 添加末尾斜杠
    params: { q: query },
  });
  return res.data;
};
