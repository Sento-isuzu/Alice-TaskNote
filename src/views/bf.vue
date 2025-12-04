<template>
  <div class="h-full flex flex-col p-6 overflow-y-auto">
    <header class="h-16 bg-white rounded-lg flex items-center justify-between px-6">
      <h2 class="text-2xl font-semibold">Notes</h2>
      <div class="flex items-center space-x-2">
        <el-input placeholder="搜索..." :prefix-icon="Search" class="w-60" />
        <el-button :icon="Plus" @click="handleCreateNote"> 新建 </el-button>
      </div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
      <ItemCard
        v-for="note in notes"
        :key="note.id"
        :item="note"
        @view="handleViewNote(note.id)"
        @delete="handleDeleteNote"
        @togglePin="handleTogglePin"
      />
    </div>
    <el-empty v-if="notes.length === 0" description="暂无笔记" />
  </div>
  <!-- TODO:编辑笔记，预览，md格式 -->
  <el-drawer
    v-model="drawerVisible"
    :title="isEditing ? '编辑笔记' : currentNote?.title"
    direction="rtl"
    size="50%"
  >
    <template #default>
      <div v-if="currentNote">
        <div v-if="!isEditing" class="prose" v-html="renderMarkdown(currentNote.content)"></div>

        <div v-else>
          <el-input v-model="editTitle" class="mb-4" size="large" />
          <el-input
            v-model="editContent"
            type="textarea"
            :rows="20"
            placeholder="支持 Markdown..."
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between">
        <div>
          <el-button @click="handleCancelEdit" v-if="isEditing">取消</el-button>
          <el-button type="primary" @click="handleSave" v-if="isEditing"> 保存 </el-button>
        </div>
        <el-button type="primary" @click="isEditing = true" v-if="!isEditing"> 编辑 </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { getItems, createItem, updateItem, deleteItem, getItemById } from '@/store/mockData';
import ItemCard from '@/components/ItemCard.vue';
import { Search, Plus } from '@element-plus/icons-vue';
import { marked } from 'marked'; // 一个简单的 Markdown 渲染库
const notesRaw = getItems('note');
const notes = computed(() =>
  notesRaw.value.slice().sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
);
const drawerVisible = ref(false);
const isEditing = ref(false);
const currentNoteId = ref<number | null>(null);

// 编辑器内容
const editTitle = ref('');
const editContent = ref('');

// 计算属性，获取当前查看的笔记
const currentNote = computed(() => {
  if (currentNoteId.value === null) return null;
  return getItemById(currentNoteId.value).value || null;
});

// 渲染 Markdown (简单实现)
const renderMarkdown = (md: string) => {
  return marked.parse(md);
};

// 查看笔记
const handleViewNote = (id: number) => {
  currentNoteId.value = id;
  if (currentNote.value) {
    editTitle.value = currentNote.value.title;
    editContent.value = currentNote.value.content;
  }
  isEditing.value = false;
  drawerVisible.value = true;
};

// 新建笔记
const handleCreateNote = () => {
  // 创建一个新笔记并立即打开编辑
  const newId = Date.now(); // 临时ID，在mockData.ts中会被覆盖
  createItem({
    type: 'note',
    title: '未命名笔记',
    content: '# 新笔记\n\n开始写作...',
    tags: [],
    priority: 'medium',
    status: 'done',
  });
  // 假设 createItem 是同步的，并且新项在列表顶部
  const newNote = notes.value[0];
  handleViewNote(newNote.id);
  isEditing.value = true;
};

// 保存
const handleSave = () => {
  if (currentNoteId.value) {
    updateItem(currentNoteId.value, {
      title: editTitle.value,
      content: editContent.value,
    });
    ElMessage.success('保存成功');
    isEditing.value = false;
  }
};

// 取消编辑
const handleCancelEdit = () => {
  if (currentNote.value) {
    editTitle.value = currentNote.value.title;
    editContent.value = currentNote.value.content;
  }
  isEditing.value = false;
};

// 删除
const handleDeleteNote = (id: number) => {
  deleteItem(id);
  ElMessage.success('删除成功');
};

const handleTogglePin = (id: number) => {
  const item = getItemById(id).value;
  if (!item) return;
  updateItem(id, { isPinned: !item.isPinned });
};
</script>

<style>
/* Markdown 渲染样式 */
.prose {
  max-width: 100%;
}
.prose h1,
.prose h2,
.prose h3 {
  font-weight: 600;
}
.prose p {
  margin: 1em 0;
}
.prose ul {
  list-style: disc;
  margin-left: 1.5em;
}
.prose pre {
  background-color: #f4f4f5;
  padding: 1em;
  border-radius: 4px;
}
</style>
