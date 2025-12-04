// src/store/mockData.ts
import { ref, computed } from 'vue';
import type { Item } from '@/types';

// 模拟数据库表
const MOCK_ITEMS: Item[] = [
  {
    id: 1,
    type: 'task',
    title: '完成文档',
    content: '详细编写文档 ',
    tags: ['study', 'project'],
    priority: 'high',
    status: 'todo',
    deadline: '2025-11-10 09:00',
    created_at: '2025-11-09 10:00',
    isPinned: true,
  },
  {
    id: 2,
    type: 'task',
    title: '学习 Vue 3 Composition API',
    content: '',
    tags: ['study'],
    priority: 'medium',
    status: 'todo',
    created_at: '2025-11-08 11:00',
    isPinned: false,
  },
  {
    id: 3,
    type: 'task',
    title: '倒垃圾',
    content: '',
    tags: ['life'],
    priority: 'low',
    status: 'done',
    created_at: '2025-11-08 09:00',
    isPinned: false,
  },
  {
    id: 4,
    type: 'note',
    title: 'Tailwind CSS 笔记',
    content: '# 常用指令\n- `bg-blue-500`\n- `text-lg`\n- `@apply`',
    tags: ['dev', 'css'],
    priority: 'medium',
    status: 'done',
    created_at: '2025-11-07 15:00',
    isPinned: true,
  },
  {
    id: 5,
    type: 'note',
    title: '会议纪要',
    content: '### 11月9日周会\n- 讨论MVP功能\n- 确定技术栈',
    tags: ['project', 'work'],
    priority: 'medium',
    status: 'done',
    created_at: '2025-11-09 14:00',
    isPinned: false,
  },
];

// ------------------------------------
// 模拟的 API 服务
// ------------------------------------

// 响应式的数据源
const items = ref<Item[]>(MOCK_ITEMS);
let nextId = 6; // 模拟自增ID

// 按类型获取 (Read)
export const getItems = (type: 'task' | 'note') => {
  return computed(
    () =>
      items.value
        .filter((item) => item.type === type)
        .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1)) // 置顶优先
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // 时间倒序
  );
};

// 获取单个Item (Read)
export const getItemById = (id: number) => {
  return computed(() => items.value.find((item) => item.id === id));
};

// 创建 (Create)
export const createItem = (newItemData: Partial<Item>): Item => {
  const id = typeof newItemData.id === 'number' ? newItemData.id : nextId++;
  const newItem: Item = {
    id,
    type: (newItemData.type as Item['type']) || 'task',
    title: newItemData.title || '未命名',
    content: newItemData.content || '',
    tags: newItemData.tags || [],
    priority: (newItemData.priority as Item['priority']) || 'medium',
    status: (newItemData.status as Item['status']) || 'todo',
    deadline: newItemData.deadline || '',
    created_at: newItemData.created_at || new Date().toISOString(),
    isPinned: !!newItemData.isPinned,
  };
  // 将新项放到头部（保持和之前一致）
  items.value.unshift(newItem);
  console.log('Created:', newItem);
  return newItem;
};

// 更新 (Update)
export const updateItem = (id: number, updatedData: Partial<Item>) => {
  const index = items.value.findIndex((item) => item.id === id);
  if (index !== -1) {
    items.value[index] = { ...items.value[index], ...updatedData };
    console.log('Updated:', items.value[index]);
  }
};

// 删除 (Delete)
export const deleteItem = (id: number) => {
  items.value = items.value.filter((item) => item.id !== id);
  console.log('Deleted:', id);
};
