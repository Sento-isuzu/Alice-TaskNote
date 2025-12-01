<template>
  <div
    class="group mb-3 flex items-center rounded-xl p-3 shadow-sm transition-all duration-200 hover:shadow-md"
    :class="[cardBackgroundClass, { 'opacity-60': item.type === 'task' && item.status === 'done' }]"
  >
    <div class="flex items-center justify-center mr-4">
      <el-checkbox
        v-if="item.type === 'task'"
        :model-value="item.status === 'done'"
        @change="emit('toggle', item.id)"
        size="large"
        :class="priorityClass"
      />
    </div>

    <div class="flex-1 overflow-hidden cursor-pointer py-0.5" @click="handleContentClick">
      <p
        class="break-words text-base font-medium text-gray-800 leading-snug"
        :class="{ 'line-through text-gray-400': item.type === 'task' && item.status === 'done' }"
      >
        {{ item.title }}
      </p>

      <p v-if="item.content" class="truncate text-sm text-gray-500 mt-1">
        {{ cleanContent(item.content) }}
      </p>

      <div v-if="shouldShowMeta" class="mt-2 flex flex-wrap items-center gap-3 text-xs">
        <span
          v-if="item.isPinned"
          class="flex items-center rounded-lh gap-1 text-orange-500 font-bold bg-orange-100 px-1 py-1 rounded text-[10px]"
        >
          <el-icon><Top /></el-icon>
        </span>

        <span
          v-if="item.deadline"
          class="flex items-center gap-1 transition-colors"
          :class="dateStatusClass"
        >
          <el-icon><Calendar /></el-icon>
          <span>{{ formatDate(item.deadline) }}</span>
        </span>

        <div v-if="item.tags && item.tags.length > 0" class="flex items-center gap-2">
          <span v-if="item.deadline || item.isPinned" class="text-gray-300">|</span>
          <span
            v-for="tag in item.tags"
            :key="tag"
            class="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-0.5"
          >
            <el-icon class="scale-75"><PriceTag /></el-icon>
            {{ tag }}
          </span>
        </div>

        <span
          v-if="item.subTasks && item.subTasks.length > 0"
          class="text-gray-400 flex items-center gap-1"
        >
          <span v-if="shouldShowDividerForSubtask" class="text-gray-300">|</span>
          <el-icon><Operation /></el-icon>
          {{ item.subTasks.filter((t) => t.done).length }}/{{ item.subTasks.length }}
        </span>
      </div>
    </div>

    <el-dropdown
      class="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
      trigger="click"
      @command="handleCommand"
    >
      <span class="el-dropdown-link cursor-pointer p-1 text-gray-400 hover:text-gray-700">
        <el-icon><MoreFilled /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="edit"
            ><el-icon><Edit /></el-icon> 编辑</el-dropdown-item
          >

          <el-dropdown placement="left-start" trigger="hover" class="w-full">
            <div
              class="flex items-center justify-between w-full px-4 py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <span class="flex items-center gap-2">
                <el-icon><Flag /></el-icon> 优先级
              </span>
              <el-icon><ArrowRight /></el-icon>
            </div>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click.stop="setPriority('high')">
                  <el-icon class="text-red-500"><Flag /></el-icon> 高 (P1)
                </el-dropdown-item>
                <el-dropdown-item @click.stop="setPriority('medium')">
                  <el-icon class="text-orange-500"><Flag /></el-icon> 中 (P2)
                </el-dropdown-item>
                <el-dropdown-item @click.stop="setPriority('low')">
                  <el-icon class="text-blue-500"><Flag /></el-icon> 低 (P3)
                </el-dropdown-item>
                <el-dropdown-item @click.stop="setPriority('none')">
                  <el-icon class="text-gray-400"><Flag /></el-icon> 无 (P4)
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-dropdown-item command="setDate"
            ><el-icon><Calendar /></el-icon> 设置日期...</el-dropdown-item
          >
          <el-dropdown-item command="setTags"
            ><el-icon><PriceTag /></el-icon> 管理标签...</el-dropdown-item
          >
          <el-dropdown-item divided command="delete">
            <span class="text-red-500"
              ><el-icon><Delete /></el-icon> 删除</span
            >
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type Item, type Priority } from '@/types';
import { updateItem } from '@/store/mockData';
import { ElMessageBox } from 'element-plus';
import {
  Calendar,
  PriceTag,
  Flag,
  MoreFilled,
  Delete,
  Edit,
  ArrowRight,
  Operation,
  Top,
} from '@element-plus/icons-vue';

const props = defineProps<{ item: Item }>();

const emit = defineEmits<{
  (e: 'toggle', id: number): void;
  (e: 'delete', id: number): void; // 用于执行删除
  (e: 'edit', item: Item): void; // 用于打开编辑/设置日期弹窗
  (e: 'view', id: number): void;
  (e: 'openDialog', command: 'edit' | 'setTags' | 'setDate', item: Item): void;
}>();

const cleanContent = (content: string) => {
  if (!content) return '';
  return content.replace(/^[#*->\s]+|\[.*?\]\(.*?\)/g, '').split('\n')[0] || '';
};

// 点击内容区域，打开编辑弹窗
const handleContentClick = () => emit('openDialog', 'edit', props.item);

// 2. 完善 handleCommand 逻辑
const handleCommand = (command: string) => {
  switch (command) {
    case 'edit':
    case 'setDate': // 设置日期也打开编辑弹窗，让用户修改 deadline
      emit('openDialog', 'edit', props.item);
      break;
    case 'setTags':
      emit('openDialog', 'setTags', props.item); // 打开标签管理弹窗
      break;
    case 'delete':
      // 弹出确认框
      ElMessageBox.confirm('确定要删除此项吗？', '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          emit('delete', props.item.id); // 确认后触发删除事件
        })
        .catch(() => {
          // 用户点击取消或关闭弹窗
        });
      break;
    default:
      break;
  }
};

// 设置优先级：逻辑保持不变，直接修改 item 属性
const setPriority = (p: Priority) => {
  // 假设 Priority 是定义的类型
  updateItem(props.item.id, { priority: p });
};

// 1. 卡片背景色逻辑
const cardBackgroundClass = computed(() => {
  switch (props.item.priority) {
    case 'high':
      return 'bg-red-50'; // 高优先级：浅红背景
    case 'medium':
      return 'bg-orange-50'; // 中优先级：浅橙背景
    case 'low':
      return 'bg-blue-50'; // 低优先级：浅蓝背景
    default:
      return 'bg-white hover:border-gray-300'; // 无优先级：白色背景
  }
});

// 2. 复选框边框颜色逻辑
const priorityClass = computed(() => `priority-${props.item.priority || 'none'}`);

// 3. 元数据行显示逻辑
const shouldShowMeta = computed(() => {
  return (
    props.item.isPinned || // 只要置顶就显示
    props.item.deadline ||
    (props.item.tags && props.item.tags.length > 0) ||
    (props.item.subTasks && props.item.subTasks.length > 0)
  );
});

// 是否显示子任务前的分隔线
const shouldShowDividerForSubtask = computed(() => {
  return (
    props.item.isPinned || props.item.deadline || (props.item.tags && props.item.tags.length > 0)
  );
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const today = new Date();
  const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
  return isToday ? '今天' : `${date.getMonth() + 1}月${date.getDate()}日`;
};
const dateStatusClass = computed(() => {
  if (!props.item.deadline) return '';
  const target = new Date(props.item.deadline).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  if (target < today) return 'text-red-500';
  if (target === today) return 'text-green-600';
  return 'text-purple-500';
});
</script>

<style scoped>
/* 优先级复选框颜色 (保持不变) */
:deep(.priority-high .el-checkbox__inner) {
  border-color: #d1453b;
}
:deep(.priority-high.is-checked .el-checkbox__inner) {
  background-color: #d1453b;
  border-color: #d1453b;
}

:deep(.priority-medium .el-checkbox__inner) {
  border-color: #eb8909;
}
:deep(.priority-medium.is-checked .el-checkbox__inner) {
  background-color: #eb8909;
  border-color: #eb8909;
}

:deep(.priority-low .el-checkbox__inner) {
  border-color: #246fe0;
}
:deep(.priority-low.is-checked .el-checkbox__inner) {
  background-color: #246fe0;
  border-color: #246fe0;
}

:deep(.priority-none .el-checkbox__inner) {
  border-color: #dcdfe6;
}

/* checkbox 改圆形 */
:deep(.el-checkbox__inner) {
  border-radius: 9999px !important;
}

:deep(.el-checkbox__inner::after) {
  border-radius: 9999px !important;
}

/* 修复 Element Plus 默认微妙偏移 */
:deep(.el-checkbox__input) {
  vertical-align: middle !important;
}

/* 修复 Checkbox 对齐 */
:deep(.el-checkbox__input) {
  vertical-align: top;
}
</style>
