<template>
  <div class="h-full flex flex-col p-6 overflow-y-auto">
    <header class="h-16 bg-white rounded-lg flex items-center justify-between px-6 mb-6">
      <h2 class="text-2xl font-semibold">Tags</h2>
      <div class="flex items-center">
        <el-input
          placeholder="搜索标签..."
          :prefix-icon="Search"
          class="w-60"
          v-model="searchQuery"
        />
      </div>
    </header>

    <!-- 任务标签部分 -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold text-gray-700 mb-3">任务标签</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <TagCard
          v-for="tag in filteredTaskTags"
          :key="'task-' + tag.name"
          :tag="tag"
          :type="'task'"
        />
      </div>
      <el-empty v-if="filteredTaskTags.length === 0" description="暂无任务标签" />
    </div>

    <div class="my-6 border-t border-gray-200"></div>

    <!-- 笔记标签部分 -->
    <div>
      <h3 class="text-lg font-semibold text-gray-700 mb-3">笔记标签</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <TagCard
          v-for="tag in filteredNoteTags"
          :key="'note-' + tag.name"
          :tag="tag"
          :type="'note'"
        />
      </div>
      <el-empty v-if="filteredNoteTags.length === 0" description="暂无笔记标签" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { getItems } from '@/store/mockData';
import { Search } from '@element-plus/icons-vue';
import TagCard from '@/components/TagCard.vue';

const tasks = getItems('task');
const notes = getItems('note');

// 搜索查询
const searchQuery = ref('');

// 统计任务标签数量
const taskTags = computed(() => {
  const tagCount: Record<string, number> = {};

  tasks.value.forEach((task) => {
    task.tags.forEach((tag) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCount).map(([name, count]) => ({ name, count }));
});

// 统计笔记标签数量
const noteTags = computed(() => {
  const tagCount: Record<string, number> = {};

  notes.value.forEach((note) => {
    note.tags.forEach((tag) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCount).map(([name, count]) => ({ name, count }));
});

// 过滤后的标签
const filteredTaskTags = computed(() => {
  if (!searchQuery.value) return taskTags.value;
  const query = searchQuery.value.toLowerCase();
  return taskTags.value.filter((tag) => tag.name.toLowerCase().includes(query));
});

const filteredNoteTags = computed(() => {
  if (!searchQuery.value) return noteTags.value;
  const query = searchQuery.value.toLowerCase();
  return noteTags.value.filter((tag) => tag.name.toLowerCase().includes(query));
});
</script>

<style scoped></style>
