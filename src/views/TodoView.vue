<template>
  <div class="h-full flex flex-col">
    <header class="h-16 flex-shrink-0 border-b bg-white flex items-center justify-between px-6">
      <h1 class="text-2xl font-semibold">TODOs</h1>
      <div class="flex items-center space-x-2">
        <el-input placeholder="搜索..." :prefix-icon="Search" class="w-60" />
        <el-button type="danger" :icon="Delete" plain>多选删除</el-button>
        <el-button :icon="Filter">过滤</el-button>
        <el-button :icon="Sort">排序</el-button>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto p-6">
      <div class="mb-6">
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
        <el-button text class="mt-1" @click="dialogVisible = true">
          或使用手动创建...
        </el-button>
      </div>
       
      <h2 class="text-lg font-semibold text-gray-700 mb-3">未完成 ({{ pendingTasks.length }})</h2>
      <div v-if="pendingTasks.length > 0">
        <ItemCard
          v-for="task in pendingTasks"
          :key="task.id"
          :item="task"
          @toggle="handleToggleStatus"
          @delete="handleDeleteTask"
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
        />
      </div>
      <el-empty v-else description="暂无已完成任务" />

    </div>

    <CreateItemDialog 
      v-model="dialogVisible" 
      type="task" 
      @confirm="handleCreateTask" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getItems, createItem, updateItem, deleteItem } from '@/store/mockData'
import ItemCard from '@/components/ItemCard.vue'
import CreateItemDialog from '@/components/CreateItemDialog.vue'
import { Search, Delete, Filter, Sort, Plus } from '@element-plus/icons-vue'

// 模拟数据
const tasks = getItems('task')
// const activeCollapse = ref(['completed']) // 已删除，不再需要
const newTaskTitle = ref('')
const dialogVisible = ref(false)

// 计算属性分离列表
const pendingTasks = computed(() => tasks.value.filter(t => t.status !== 'done'))
const completedTasks = computed(() => tasks.value.filter(t => t.status === 'done'))

// 快速创建
const handleQuickCreate = () => {
  if (!newTaskTitle.value.trim()) return
  // MVP: 直接创建
  createItem({
    type: 'task',
    title: newTaskTitle.value,
  })
  newTaskTitle.value = ''
  ElMessage.success('快速创建成功')
}

// 详细创建
const handleCreateTask = (data: { title: string, content: string, deadline: string, priority: 'high' | 'medium' | 'low' }) => {
  createItem({
    type: 'task',
    title: data.title,
    content: data.content,
    deadline: data.deadline,
    priority: data.priority,
  })
  ElMessage.success('任务创建成功')
  dialogVisible.value = false
}

// 切换状态
const handleToggleStatus = (id: number) => {
  const task = tasks.value.find(t => t.id === id)
  if (task) {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    updateItem(id, { status: newStatus })
  }
}

// 删除
const handleDeleteTask = (id: number) => {
  deleteItem(id)
  ElMessage.success('删除成功')
}
</script>