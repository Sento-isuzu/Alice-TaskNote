<template>
  <div
    class="group mb-3 flex items-center rounded-xl p-3 shadow-sm transition-all duration-200 hover:shadow-md"
    :class="[
      cardBackgroundClass,
      { 'opacity-60': item.type === 'task' && item.status === 'done' },
      item.isPinned ? 'border border-slate-300' : 'border border-transparent',
    ]"
  >
    <div class="flex items-center justify-center mr-4">
      <el-checkbox
        v-if="item.type === 'task'"
        :model-value="item.status === 'done'"
        @change="emit('toggleStatus', props.item.id)"
        size="large"
        :class="priorityClass"
      />
    </div>

    <div class="flex-1 overflow-hidden cursor-pointer py-0.5" @click="handleContentClick">
      <p
        class="wrap-break-word text-base font-medium text-gray-800 leading-snug"
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
            {{ tag.name }}
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
          <template v-if="item.type === 'note'">
            <el-dropdown-item command="togglePin">
              <el-icon><Top /></el-icon>
              {{ item.isPinned ? '取消置项' : '置项' }}
            </el-dropdown-item>

            <el-dropdown-item command="encrypt">
              <el-icon><Lock /></el-icon>
              加密
            </el-dropdown-item>

            <el-dropdown placement="left-start" trigger="hover" class="w-full">
              <div
                class="flex items-center justify-between w-full px-4 py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
              >
                <span class="flex items-center gap-2">
                  <el-icon><Flag /></el-icon>
                  优先级
                </span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click.stop="setPriority('high')">
                    <el-icon><Flag /></el-icon> 高 (P1)
                  </el-dropdown-item>
                  <el-dropdown-item @click.stop="setPriority('medium')">
                    <el-icon><Flag /></el-icon> 中 (P2)
                  </el-dropdown-item>
                  <el-dropdown-item @click.stop="setPriority('low')">
                    <el-icon><Flag /></el-icon> 低 (P3)
                  </el-dropdown-item>
                  <el-dropdown-item @click.stop="setPriority('none')">
                    <el-icon><Flag /></el-icon> 无
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-dropdown-item command="setTags">
              <el-icon><PriceTag /></el-icon>
              管理标签
            </el-dropdown-item>

            <el-dropdown-item divided command="delete">
              <span class="text-red-500">
                <el-icon><Delete /></el-icon>
                删除
              </span>
            </el-dropdown-item>
          </template>
          <template v-else>
            <el-dropdown-item command="edit">
              <el-icon><Edit /></el-icon> 编辑
            </el-dropdown-item>

            <el-dropdown-item command="togglePin">
              <el-icon><Top /></el-icon>
              {{ item.isPinned ? '取消置顶' : '置顶' }}
            </el-dropdown-item>
            <el-dropdown placement="left-start" trigger="hover" class="w-full">
              <div
                class="flex items-center justify-between w-full px-4 py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <span class="flex items-center gap-2">
                  <el-icon><Flag /></el-icon> 优先级
                </span>
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

            <el-dropdown-item command="setDate">
              <el-icon><Calendar /></el-icon> 设置日期
            </el-dropdown-item>
            <el-dropdown-item command="setTags">
              <el-icon><PriceTag /></el-icon> 管理标签
            </el-dropdown-item>
            <el-dropdown-item divided command="delete">
              <span class="text-red-500">
                <el-icon><Delete /></el-icon> 删除
              </span>
            </el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type Item, type Priority } from '@/types';
import { ElMessageBox } from 'element-plus';
import {
  Calendar,
  PriceTag,
  Flag,
  MoreFilled,
  Delete,
  Edit,
  Operation,
  Top,
  Lock,
} from '@element-plus/icons-vue';

const props = defineProps<{ item: Item }>();

const emit = defineEmits<{
  (e: 'toggleStatus', id: number): void;
  (e: 'togglePin', item: Item): void;
  (e: 'updatePriority', id: number, priority: Priority): void;
  (e: 'delete', id: number): void;
  (e: 'openDialog', command: 'edit' | 'setTags' | 'setDate', item: Item): void;
}>();

const cleanContent = (content: string) => {
  if (!content) return '';
  return content.replace(/^[#*->\s]+|\[.*?\]\(.*?\)/g, '').split('\n')[0] || '';
};

const handleContentClick = () => emit('openDialog', 'edit', props.item);

const handleCommand = (command: string) => {
  switch (command) {
    case 'edit':
      emit('openDialog', 'edit', props.item);
      break;
    case 'togglePin':
      // 3. 不再本地更新，而是通知父组件
      emit('togglePin', props.item);
      break;
    case 'setDate':
      emit('openDialog', 'setDate', props.item);
      break;
    case 'setTags':
      emit('openDialog', 'setTags', props.item);
      break;
    case 'delete':
      ElMessageBox.confirm('确定要删除此项吗？', '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => emit('delete', props.item.id))
        .catch(() => {});
      break;
  }
};

const setPriority = (p: Priority) => {
  emit('updatePriority', props.item.id, p);
};

const cardBackgroundClass = computed(() => {
  switch (props.item.priority) {
    case 'high':
      return 'bg-red-50';
    case 'medium':
      return 'bg-orange-50';
    case 'low':
      return 'bg-blue-50';
    default:
      return 'bg-white hover:border-gray-300';
  }
});

const priorityClass = computed(() => `priority-${props.item.priority || 'none'}`);
const shouldShowMeta = computed(() => {
  return (
    props.item.isPinned ||
    props.item.deadline ||
    (props.item.tags && props.item.tags.length > 0) ||
    (props.item.subTasks && props.item.subTasks.length > 0)
  );
});

const shouldShowDividerForSubtask = computed(() => {
  return (
    props.item.isPinned || props.item.deadline || (props.item.tags && props.item.tags.length > 0)
  );
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '无效日期';

  const today = new Date();
  // 关键：将日期转换为UTC时间进行比较（避免时区影响）
  const dateUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const todayUTC = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );

  const isToday = dateUTC.getTime() === todayUTC.getTime();
  // 按UTC时间格式化显示（月/日）
  return isToday ? '今天' : `${date.getUTCMonth() + 1}月${date.getUTCDate()}日`;
};

const dateStatusClass = computed(() => {
  if (!props.item.deadline) return '';
  const targetDate = new Date(props.item.deadline);
  const today = new Date();

  const target = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  ).getTime();

  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  if (target < localToday) return 'text-red-500';
  if (target === localToday) return 'text-green-600';
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
