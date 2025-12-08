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
      <span class="text-sm text-gray-500">共 {{ filteredTaskTags.length }} 个</span>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <TagCard
          v-for="tag in filteredTaskTags"
          :key="'task-' + tag.name"
          :tag="tag"
          :type="'task'"
          @deleted="handleTagDeleted"
        />
      </div>
      <el-empty v-if="filteredTaskTags.length === 0" description="暂无任务标签" />
    </div>

    <div class="my-6 border-t border-gray-200"></div>

    <!-- 笔记标签部分 -->
    <div>
      <h3 class="text-lg font-semibold text-gray-700 mb-3">笔记标签</h3>
      <span class="text-sm text-gray-500">共 {{ filteredNoteTags.length }} 个</span>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <TagCard
          v-for="tag in filteredNoteTags"
          :key="'note-' + tag.name"
          :tag="tag"
          :type="'note'"
          @deleted="handleTagDeleted"
        />
      </div>
      <el-empty v-if="filteredNoteTags.length === 0" description="暂无笔记标签" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Search } from '@element-plus/icons-vue';
import TagCard from '@/components/TagCard.vue';
import { fetchTags, type TagCount } from '@/api/tag';

let searchTimer: any = null;
const DEBOUNCE_TIME = 300;

const allTags = ref<TagCount[]>([]);
// 搜索查询
const searchQuery = ref('');

const loadTags = async (query?: string) => {
  try {
    const tags = await fetchTags(query);
    console.log('加载的标签数据:', tags); // 调试用
    allTags.value = tags;
  } catch (error) {
    console.error('加载标签失败:', error);
  }
};

onMounted(() => loadTags());
// 统计任务标签数量 - 只显示有任务关联的标签
const taskTags = computed(() => {
  return allTags.value
    .filter((tag) => (tag.task_count || 0) > 0)
    .map((tag) => ({
      ...tag,
      task_count: tag.task_count || 0,
      name: tag.name || '',
      color: tag.color || '#909399',
    }));
});
// 统计笔记标签数量 - 只显示有笔记关联的标签
const noteTags = computed(() => {
  return allTags.value
    .filter((tag) => (tag.note_count || 0) > 0)
    .map((tag) => ({
      ...tag,
      note_count: tag.note_count || 0,
      name: tag.name || '',
      color: tag.color || '#909399',
    }));
});

// 过滤后的标签
const filteredTaskTags = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return taskTags.value;

  return taskTags.value.filter((tag) => tag.name.toLowerCase().includes(query));
});

const filteredNoteTags = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return noteTags.value;

  return noteTags.value.filter((tag) => tag.name.toLowerCase().includes(query));
});

const handleTagDeleted = () => {
  // 重新加载标签数据
  loadTags(searchQuery.value.trim() || undefined);
};

onMounted(() => {
  loadTags();
});

watch(searchQuery, (newQuery) => {
  if (searchTimer !== null) {
    clearTimeout(searchTimer);
  }

  const queryStr = newQuery ? newQuery.trim() : '';

  searchTimer = setTimeout(() => {
    loadTags(queryStr);
  }, DEBOUNCE_TIME);
});
</script>

<style scoped></style>
