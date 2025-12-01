<template>
  <div
    class="bg-white rounded-xl p-3 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 flex items-center justify-between cursor-pointer"
  >
    <div class="flex items-center">
      <el-icon class="text-gray-500 mr-2"><PriceTag /></el-icon>
      <span class="font-medium">{{ tag.name }}</span>
    </div>
    <div class="bg-alice-accent text-gray-700 rounded-full px-2 py-0.5 text-sm">
      {{ tag.count }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { PriceTag } from '@element-plus/icons-vue';

const props = defineProps<{
  tag: { name: string; count: number };
  type: 'task' | 'note';
}>();
</script>

<style scoped>
.bg-alice-accent {
  background-color: var(--alice-accent);
}
</style>
