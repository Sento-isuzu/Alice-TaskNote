import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import TodoView from '@/views/TodoView.vue';
import NoteView from '@/views/NoteView.vue';
import Stats from '@/views/Stats.vue';
import TagsView from '../views/TagsView.vue';
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    redirect: '/notes',
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
    component: Stats,
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
