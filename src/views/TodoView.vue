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
        @toggle="handleToggleStatus"
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
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { getItems, createItem, updateItem, deleteItem } from '@/store/mockData';
import ItemCard from '@/components/ItemCard.vue';
import CreateItemDialog from '@/components/CreateItemDialog.vue';
import { Search, Filter, Plus } from '@element-plus/icons-vue';
import EditTaskDialog from '@/components/EditTaskDialog.vue';
import ManageTagsDialog from '@/components/ManageTagsDialog.vue';
import { type Item } from '@/types';

// 模拟数据
const tasks = getItems('task');
// const activeCollapse = ref(['completed']) // 已删除，不再需要
const newTaskTitle = ref('');
const dialogVisible = ref(false);

// 新增状态：用于控制编辑和标签弹窗
const isEditDialogOpen = ref(false);
const isTagsDialogOpen = ref(false);
// 存储当前正在编辑的 Item 对象
const currentEditingItem = ref<Item | null>(null);

// 计算属性分离列表
const pendingTasks = computed(() => tasks.value.filter((t) => t.status !== 'done'));
const completedTasks = computed(() => tasks.value.filter((t) => t.status === 'done'));

const showInput = ref(false);
// 快速创建
const handleQuickCreate = () => {
  if (!newTaskTitle.value.trim()) return;
  // MVP: 直接创建
  createItem({
    type: 'task',
    title: newTaskTitle.value,
    priority: 'none',
  });
  newTaskTitle.value = '';
  ElMessage.success('快速创建成功');
};

// 详细创建
const handleCreateTask = (data: {
  title: string;
  content: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}) => {
  createItem({
    type: 'task',
    title: data.title,
    content: data.content,
    deadline: data.deadline,
    priority: data.priority,
  });
  ElMessage.success('任务创建成功');
  dialogVisible.value = false;
};

// 切换状态
const handleToggleStatus = (id: number) => {
  const task = tasks.value.find((t) => t.id === id);
  if (task) {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    updateItem(id, { status: newStatus });
  }
};

// 删除
const handleDeleteTask = (id: number) => {
  deleteItem(id);
  ElMessage.success('删除成功');
};

/**
 * 响应 ItemCard 的 openDialog 事件，设置要编辑的对象并打开对应的弹窗。
 */
const handleOpenDialog = (command: 'edit' | 'setTags' | 'setDate', item: Item) => {
  currentEditingItem.value = item;
  if (command === 'edit' || command === 'setDate') {
    // “编辑”和“设置日期”都指向同一个详细编辑弹窗
    isEditDialogOpen.value = true;
  } else if (command === 'setTags') {
    // “管理标签”指向标签管理弹窗
    isTagsDialogOpen.value = true;
  }
};

/**
 * 处理编辑弹窗或标签弹窗返回的更新数据。
 */
const handleUpdateTask = (updatedData: Partial<Item>) => {
  if (currentEditingItem.value) {
    // 使用当前编辑的 Item ID 和弹窗返回的局部更新数据进行更新
    updateItem(currentEditingItem.value.id, updatedData);
    ElMessage.success('任务更新成功');
    // 关闭所有可能打开的弹窗
    isEditDialogOpen.value = false;
    isTagsDialogOpen.value = false;
    currentEditingItem.value = null; // 清除编辑状态
  }
};
</script>

<style scoped>
/* 下滑动画 */
.slide-fade-enter-active {
  transition: all 0.25s ease;
}
.slide-fade-enter-from,

/* 当输入框隐藏时加大顶距 */
.mt-big {
  margin-top: 32px;
}
</style>
