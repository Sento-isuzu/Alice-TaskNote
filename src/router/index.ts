import { createRouter, createWebHistory } from 'vue-router';
// 引入视图
import TodoView from '@/views/TodoView.vue';
import NoteView from '@/views/NoteView.vue';
import Stats from '@/views/Stats.vue';
import TagsView from '../views/TagsView.vue';
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
    component: Stats, // 直接使用导入的 Stats 组件
  },
  {
    path: '/tags',
    name: 'Tags',
    component: TagsView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
