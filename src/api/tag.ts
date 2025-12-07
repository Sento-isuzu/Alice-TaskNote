// src/api/tag.ts
import axios from 'axios';

// 配置后端基础地址 (假设与 task.ts 使用相同的配置)
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 5000,
});

// 基础标签接口
export interface Tag {
  id: number | null; // 允许 null，用于新建标签时
  name: string;
  color?: string;
}

// 带计数的标签接口 (对应后端的 TagCountResponse)
// 从后端返回的标签总是有 id
export interface TagCount extends Omit<Tag, 'id'> {
  id: number; // 后端返回的标签 id 不能为 null
  count: number;
  task_count?: number; // 任务标签计数
  note_count?: number; // 笔记标签计数
}

// 获取标签列表和计数，支持搜索
export const fetchTags = async (query?: string): Promise<TagCount[]> => {
  const params = query ? { q: query } : {};
  const res = await axiosInstance.get('/api/tags', {
    params,
  });
  return res.data;
};

export interface CreateTagRequest {
  name: string;
  color?: string;
}

export const createTag = async (data: CreateTagRequest): Promise<Tag> => {
  try {
    const res = await axiosInstance.post('/api/tags', data);
    // 确保返回的是包含 id/name 的 Tag 对象
    return res.data;
  } catch (error) {
    // 统一错误提示（可选，也可让组件层处理）
    console.error('创建标签失败:', error);
    throw error; // 抛出错误让组件捕获
  }
};

// 删除标签
export const deleteTag = async (tagId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/tags/${tagId}`);
  } catch (error) {
    console.error('删除标签失败:', error);
    throw error;
  }
};
