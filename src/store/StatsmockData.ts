// src/store/StatsmockData.ts
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

// 统计数据的模拟数据
export const MOCK_STATS_DATA = {
  today: { completed: 8, inProgress: 3, remaining: 2, total: 13 },
  week: [
    { day: '周一', completed: 1, inProgress: 1, remaining: 1 },
    { day: '周二', completed: 2, inProgress: 1, remaining: 0 },
    { day: '周三', completed: 1, inProgress: 1, remaining: 1 },
    { day: '周四', completed: 0, inProgress: 2, remaining: 1 },
    { day: '周五', completed: 3, inProgress: 0, remaining: 1 },
    { day: '周六', completed: 1, inProgress: 1, remaining: 1 },
    { day: '周日', completed: 4, inProgress: 1, remaining: 0 },
  ],
  month: Array.from({ length: 30 }, (_, i) => ({
    label: `${i + 1}日`,
    completed: Math.floor(Math.random() * 5) + 1,
    inProgress: Math.floor(Math.random() * 3) + 1,
    remaining: Math.floor(Math.random() * 4) + 1,
  })),
  year: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'].map(
    (month) => ({
      label: month,
      completed: Math.floor(Math.random() * 15) + 5,
      inProgress: Math.floor(Math.random() * 8) + 2,
      remaining: Math.floor(Math.random() * 5) + 1,
    })
  ),
  priority: [
    { level: 'high', completed: 8, inProgress: 3, remaining: 2, total: 13 },
    { level: 'medium', completed: 12, inProgress: 5, remaining: 4, total: 21 },
    { level: 'low', completed: 15, inProgress: 2, remaining: 8, total: 25 },
  ],
};

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
export const createItem = (
  newItemData: Omit<Item, 'id' | 'created_at' | 'isPinned' | 'tags'> & { tags?: string[] }
) => {
  const newItem: Item = {
    ...newItemData,
    id: nextId++,
    content: newItemData.content || '',
    tags: newItemData.tags || [],
    priority: newItemData.priority || 'medium',
    status: newItemData.status || 'todo',
    created_at: new Date().toISOString(),
    isPinned: false,
  };
  items.value.unshift(newItem);
  console.log('Created:', newItem);
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
