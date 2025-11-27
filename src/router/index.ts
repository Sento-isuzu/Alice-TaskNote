// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
// 引入视图
import TodoView from '@/views/TodoView.vue'
import NoteView from '@/views/NoteView.vue'

const routes = [
  {
    path: '/',
    redirect: '/notes', // 默认重定向到笔记
  },
  {
    path: '/notes',
    name: 'Notes',
    component: NoteView,
  },
  {
    path: '/todo',
    name: 'TODO',
    component: TodoView,
  },
  {
    path: '/stats',
    name: 'Stats',
    // 懒加载占位
    component: () => import('@/views/PlaceholderView.vue'),
  },
  {
    path: '/tags',
    name: 'Tags',
    component: () => import('@/views/PlaceholderView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router