<template>
  <div
    class="bg-white rounded-xl p-3 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 flex items-center justify-between cursor-pointer"
  >
    <div class="flex items-center">
      <el-icon class="text-gray-500 mr-2"><PriceTag /></el-icon>
      <span class="font-medium">{{ tag.name }}</span>
      <span
        v-if="tag.color"
        class="w-3 h-3 rounded-full ml-2 border border-gray-200"
        :style="{ backgroundColor: tag.color }"
      ></span>
    </div>
    <div class="flex items-center">
      <div class="bg-alice-accent text-gray-700 rounded-full px-2 py-0.5 text-sm mr-2">
        {{ displayCount }}
      </div>
      <el-icon class="text-gray-400 hover:text-red-500 cursor-pointer" @click.stop="handleDelete">
        <Delete />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PriceTag } from '@element-plus/icons-vue';
import { deleteTag } from '@/api/tag';
import { ElMessage } from 'element-plus';
import { computed } from 'vue';

interface Tag {
  id: number;
  name: string;
  color?: string;
  count?: number;
  task_count?: number;
  note_count?: number;
  total_count?: number;
}

const props = defineProps<{
  tag: Tag;
  type: 'task' | 'note';
}>();

const emit = defineEmits<{
  (e: 'deleted', tagId: number): void;
}>();

const displayCount = computed(() => {
  const tag = props.tag;
  if (props.type === 'task') {
    return tag.task_count || tag.count || 0;
  } else {
    return tag.note_count || tag.count || 0;
  }
});

const handleDelete = async () => {
  try {
    await deleteTag(props.tag.id);
    ElMessage.success('标签删除成功');
    emit('deleted', props.tag.id); // 传递ID
  } catch (error) {
    ElMessage.error('标签删除失败');
  }
};
</script>

<style scoped>
.bg-alice-accent {
  background-color: var(--alice-accent);
}
</style>
