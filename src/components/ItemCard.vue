<template>
  <div
    class="mb-3 flex items-center rounded-lg border bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md"
    :class="{ 
      'opacity-60': item.type === 'task' && item.status === 'done',
      'border-l-4 border-blue-500': item.isPinned
    }"
  >
    <el-checkbox
      v-if="item.type === 'task'"
      :model-value="item.status === 'done'"
      @change="emit('toggle', item.id)"
      size="large"
      class="mr-3"
    />

    <div 
  class="flex-1 overflow-hidden cursor-pointer" 
  @click="item.type === 'note' ? emit('view', item.id) : null"
>
  <p 
    class="truncate text-base font-medium text-gray-800"
    :class="{ 'line-through text-gray-400': item.type === 'task' && item.status === 'done' }"
  >
    {{ item.title }}
  </p>

  <p v-if="item.type === 'note' && item.content" class="truncate text-sm text-gray-500 mt-1">
    {{ cleanContent(item.content) }}
  </p>
</div>

    <div class="ml-4 hidden space-x-1 md:block">
      <el-tag v-for="tag in item.tags.slice(0, 2)" :key="tag" type="info" size="small" effect="plain">
        {{ tag }}
      </el-tag>
      <el-tag v-if="item.tags.length > 2" size="small" effect="plain">
        +{{ item.tags.length - 2 }}
      </el-tag>
    </div>

    <el-dropdown class="ml-4">
      <span class="el-dropdown-link cursor-pointer p-2 text-gray-500 hover:text-blue-600">
        <el-icon><MoreFilled /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="handlePin">
            <el-icon><Flag /></el-icon>
            {{ item.isPinned ? '取消置顶' : '置顶' }}
          </el-dropdown-item>
          <el-dropdown-item>
            <el-icon><PriceTag /></el-icon>
            添加/编辑标签
          </el-dropdown-item>
          
          <el-dropdown-item v-if="item.type === 'note'">
            <el-icon><Lock /></el-icon>
            加密
          </el-dropdown-item>

          <el-dropdown-item v-if="item.type === 'task'">
            <el-icon><Flag /></el-icon>
            设置优先级
          </el-dropdown-item>

          <el-dropdown-item divided @click="emit('delete', item.id)">
            <span class="text-red-500">
              <el-icon><Delete /></el-icon>
              删除
            </span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { type Item } from '@/types'
import { updateItem } from '@/store/mockData'

// Props
const props = defineProps<{
  item: Item
}>()

// Emits
const emit = defineEmits<{
  (e: 'toggle', id: number): void
  (e: 'delete', id: number): void
  (e: 'view', id: number): void
}>()

// 移除Markdown
const cleanContent = (content: string) => {
  return content.replace(/^[#*->\s]+|\[.*?\]\(.*?\)/g, '').split('\n')[0] || ''
}

// 置顶
const handlePin = () => {
  updateItem(props.item.id, { isPinned: !props.item.isPinned })
}

</script>