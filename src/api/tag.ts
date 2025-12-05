// src/api/tag.ts
import axios from 'axios';

// 配置后端基础地址 (假设与 task.ts 使用相同的配置)
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 5000,
});

// 接口返回类型 (对应后端的 TagCountResponse)
export interface TagCount {
  id: number;
  name: string;
  color?: string;
  count: number;
}

// 获取标签列表和计数，支持搜索
export const fetchTags = async (query?: string): Promise<TagCount[]> => {
  const params = query ? { q: query } : {};
  const res = await axiosInstance.get('/api/tags', {
    params,
  });
  return res.data;
};
