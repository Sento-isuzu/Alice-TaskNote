export type Priority = 'high' | 'medium' | 'low' | 'none';

export interface SubTask {
  id: number;
  title: string;
  done: boolean;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Item {
  id: number;
  type: 'task' | 'note';
  title: string;
  content: string; // Markdown内容
  tags: Tag[];
  priority: Priority;
  status: 'todo' | 'doing' | 'done' | string;
  deadline?: string;
  created_at: string;
  updated_at?: string;
  isPinned: boolean;
  createdAt?: string;
  updatedAt: string;
  // 新增：你的组件已使用
  subTasks?: SubTask[];
}
