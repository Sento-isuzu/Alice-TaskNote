// src/types/index.ts
export interface Item {
  id: number;
  type: 'task' | 'note';
  title: string;
  content: string; // Markdown内容
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'doing' | 'done';
  deadline?: string;
  created_at: string;
  isPinned: boolean; // 置顶
}