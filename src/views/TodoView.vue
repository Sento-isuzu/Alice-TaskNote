<template>
  <div class="h-full flex flex-col p-6 overflow-y-auto">
    <header class="h-16 bg-white rounded-lg flex items-center justify-between px-6">
      <h2 class="text-2xl font-semibold">TODOs</h2>
      <div class="flex items-center space-x-2">
        <el-input placeholder="搜索..." :prefix-icon="Search" class="w-60" />
        <el-button :icon="Filter">过滤</el-button>
        <el-button :icon="Plus" @click="showInput = !showInput">添加</el-button>
      </div>
    </header>
    <transition name="slide-fade">
      <div v-if="showInput" class="mt-4 mb-2">
        <el-input
          v-model="newTaskTitle"
          placeholder="一句话快速创建任务 (例如：下午3点开会) ... 按 Enter 提交"
          size="large"
          @keyup.enter="handleQuickCreate"
        >
          <template #prepend>
            <el-icon><Plus /></el-icon>
          </template>
        </el-input>
        <el-button text class="mt-1" @click="dialogVisible = true"> 或使用手动创建... </el-button>
      </div>
    </transition>
    <h2 class="text-lg font-semibold text-gray-700 mb-3" :class="{ 'mt-8': !showInput }">
      未完成 ({{ pendingTasks.length }})
    </h2>
    <div v-if="pendingTasks.length > 0">
      <ItemCard
        v-for="task in pendingTasks"
        :key="task.id"
        :item="task"
        @toggle="handleToggleStatus"
        @delete="handleDeleteTask"
        @openDialog="handleOpenDialog"
      />
    </div>
    <el-empty v-else description="太棒了，全部完成了！" />
    <div class="my-8 border-t border-gray-200"></div>
    <h2 class="text-lg font-semibold text-gray-700 mb-3">已完成 ({{ completedTasks.length }})</h2>
    <div v-if="completedTasks.length > 0">
      <ItemCard
        v-for="task in completedTasks"
        :key="task.id"
        :item="task"
        @toggle-pin="handleToggleStatus"
        @delete="handleDeleteTask"
        @openDialog="handleOpenDialog"
      />
    </div>
    <el-empty v-else description="暂无已完成任务" />
  </div>
  <CreateItemDialog v-model="dialogVisible" type="task" @confirm="handleCreateTask" />
  <EditTaskDialog
    v-if="currentEditingItem"
    v-model="isEditDialogOpen"
    :item="currentEditingItem"
    @confirm="handleUpdateTask"
  />
  <ManageTagsDialog
    v-if="currentEditingItem"
    v-model="isTagsDialogOpen"
    :item="currentEditingItem"
    @confirm="handleUpdateTask"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchTasks, createTask, updateTask, deleteTask } from '@/api/task';
import ItemCard from '@/components/ItemCard.vue';
import CreateItemDialog from '@/components/CreateItemDialog.vue';
import { Search, Filter, Plus } from '@element-plus/icons-vue';
import EditTaskDialog from '@/components/EditTaskDialog.vue';
import ManageTagsDialog from '@/components/ManageTagsDialog.vue';
import { type Item } from '@/types';

const tasks = ref<Item[]>([]);

const newTaskTitle = ref('');
const dialogVisible = ref(false);
const isEditDialogOpen = ref(false);
const isTagsDialogOpen = ref(false);
const currentEditingItem = ref<Item | null>(null);
const showInput = ref(false);

const loadTasks = async () => {
  try {
    // 调用后端接口获取所有任务
    const res = await fetchTasks();
    tasks.value = res as Item[];
  } catch (error) {
    ElMessage.error('加载任务失败，请刷新重试');
    console.error('加载任务错误：', error);
  }
};
// 页面挂载时加载任务
onMounted(() => loadTasks());

const pendingTasks = computed(() =>
  tasks.value
    .filter((t) => t.status !== 'done')
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
);
const completedTasks = computed(() =>
  tasks.value
    .filter((t) => t.status === 'done')
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
);

const handleQuickCreate = async () => {
  if (!newTaskTitle.value.trim()) return;
  try {
    // 调用后端创建任务接口
    await createTask({
      type: 'task',
      title: newTaskTitle.value,
      content: '',
      status: 'todo',
      priority: 'none',
      tags: [], // 对齐后端 tags 字段（空数组避免 undefined）
    });
    newTaskTitle.value = '';
    ElMessage.success('快速创建成功');
    loadTasks(); // 刷新任务列表
  } catch (error) {
    ElMessage.error('快速创建失败，请重试');
    console.error('快速创建任务错误：', error);
  }
};

const handleCreateTask = async (data: {
  title: string;
  content: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}) => {
  try {
    const utcDeadline = data.deadline
      ? new Date(data.deadline + 'T00:00:00').toISOString()
      : undefined;

    await createTask({
      type: 'task',
      title: data.title,
      content: data.content,
      status: 'todo',
      deadline: utcDeadline || undefined,
      priority: data.priority,
      tags: [],
    });
    ElMessage.success('任务创建成功');
    dialogVisible.value = false;
    loadTasks(); // 刷新任务列表
  } catch (error) {
    ElMessage.error('创建任务失败，请重试');
    console.error('详细创建任务错误：', error);
  }
};

const handleToggleStatus = async (id: number) => {
  const task = tasks.value.find((t) => t.id === id);
  if (!task) return;

  const newStatus = task.status === 'done' ? 'todo' : 'done';
  try {
    // 调用后端更新任务状态接口
    await updateTask(id, { status: newStatus });
    ElMessage.success(`任务已${newStatus === 'done' ? '完成' : '恢复待完成'}`);
    loadTasks(); // 刷新任务列表
  } catch (error) {
    ElMessage.error('更新状态失败，请重试');
    console.error('切换任务状态错误：', error);
  }
};

// 👇 替换：删除任务（对接后端接口）
const handleDeleteTask = async (id: number) => {
  try {
    // 调用后端删除任务接口
    await deleteTask(id);
    ElMessage.success('删除成功');
    loadTasks(); // 刷新任务列表
  } catch (error) {
    ElMessage.error('删除失败，请重试');
    console.error('删除任务错误：', error);
  }
};

const handleOpenDialog = (command: 'edit' | 'setTags' | 'setDate', item: Item) => {
  currentEditingItem.value = item;
  if (command === 'edit' || command === 'setDate') {
    isEditDialogOpen.value = true;
  } else if (command === 'setTags') {
    isTagsDialogOpen.value = true;
  }
};

const handleUpdateTask = async (updatedData: Partial<Item>) => {
  if (!currentEditingItem.value) return;

  const mergedData: Partial<Item> = { ...updatedData };

  // 标签合并（保持你的逻辑）
  if (updatedData.tags) {
    const oldTags = currentEditingItem.value.tags || [];
    const newTags = updatedData.tags || [];
    mergedData.tags = Array.from(new Set([...oldTags, ...newTags]));
  }

  try {
    await updateTask(currentEditingItem.value.id, mergedData);
    ElMessage.success('任务更新成功');

    isEditDialogOpen.value = false;
    isTagsDialogOpen.value = false;
    currentEditingItem.value = null;

    loadTasks();
  } catch (error) {
    ElMessage.error('更新任务失败，请重试');
    console.error(error);
  }
};
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.25s ease;
}
.slide-fade-enter-from,
.mt-big {
  margin-top: 32px;
}
</style>
