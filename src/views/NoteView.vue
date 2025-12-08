<template>
  <div class="h-full flex flex-col p-6 overflow-hidden relative">
    <div v-show="!drawerVisible" class="h-full flex flex-col overflow-y-auto">
      <header class="h-16 bg-white rounded-lg flex items-center justify-between px-6 mb-8 shrink-0">
        <h2 class="text-2xl font-semibold">Notes</h2>
        <div class="flex items-center space-x-2">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索笔记..."
            :prefix-icon="Search"
            class="w-60"
            @input="handleSearch"
            @clear="resetSearch"
            clearable
          />
          <el-button :icon="Plus" type="primary" @click="handleCreateNote"> 新建 </el-button>
        </div>
      </header>

      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4"
      >
        <ItemCard
          v-for="noteItem in notes"
          :key="noteItem.id"
          :item="noteItem"
          @openDialog="handleOpenDialog"
          @delete="handleDeleteNote"
          @togglePin="handleTogglePin"
          @updatePriority="handleUpdatePriority"
          @updateStatus="handleUpdateStatus"
        />
      </div>
      <el-empty v-if="notes.length === 0" description="暂无笔记" />
    </div>

    <transition name="el-fade-in-linear">
      <div
        v-if="drawerVisible"
        class="absolute inset-0 z-50 bg-white flex flex-col shadow-lg overflow-hidden border border-gray-200"
      >
        <div class="h-14 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
          <div class="flex items-center flex-1 mr-4">
            <input
              v-model="editTitle"
              class="bg-transparent text-lg font-bold text-gray-800 placeholder-gray-400 focus:outline-none w-full"
              placeholder="请输入标题..."
            />
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-xs text-gray-400" v-if="isUnsaved">未保存</span>
            <el-button @click="handleSave" type="primary" size="small" :loading="saving"
              >保存</el-button
            >
            <el-button circle :icon="Close" size="small" @click="handleCloseEditor" />
          </div>
        </div>

        <div class="flex-1 flex overflow-hidden">
          <div class="w-1/2 h-full border-r border-gray-200 flex flex-col">
            <textarea
              v-model="editContent"
              class="w-full h-full p-6 resize-none focus:outline-none text-gray-700 leading-relaxed font-mono text-sm"
              placeholder="在此输入 Markdown 内容..."
            ></textarea>
          </div>

          <div class="w-1/2 h-full bg-white overflow-y-auto px-8 pb-8 pt-0">
            <div class="prose prose-slate max-w-none" v-html="renderMarkdown(editContent)"></div>
          </div>
        </div>
      </div>
    </transition>
  </div>

  <ManageTagsDialog
    v-if="currentEditingNote"
    v-model="isTagsDialogOpen"
    :item="currentEditingNote"
    @confirm="handleUpdateNoteTags"
  />
</template>

<script setup lang="ts">
import ManageTagsDialog from '@/components/ManageTagsDialog.vue';
import { ref, computed, watch, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { type Item, type Tag } from '@/types';
import ItemCard from '@/components/ItemCard.vue';
import { Search, Plus, Close } from '@element-plus/icons-vue';
import { marked } from 'marked';
import notesApi from '@/api/notes';

//添加类型导入
interface Note {
  id: number;
  type: string;
  title: string;
  content: string;
  priority: string;
  status: string;
  isPinned: boolean;
  tags: { id: number; name: string; color?: string }[];
  created_at: string;
  updated_at: string;
}

// 响应式数据
const notes = ref<Item[]>([]);
const loading = ref(false);
const searchKeyword = ref('');

const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

// 编辑器状态
const drawerVisible = ref(false);
const currentNoteId = ref<number | null>(null);
const editTitle = ref('');
const editContent = ref('');
const isUnsaved = ref(false);
const saving = ref(false);

// 标签对话框状态
const isTagsDialogOpen = ref(false);
const currentEditingNote = ref<Item | null>(null);

const handleSetTags = (item: Item) => {
  currentEditingNote.value = item;
  isTagsDialogOpen.value = true;
};

// 获取当前笔记
const currentNote = computed(() => {
  if (currentNoteId.value === null) return null;
  return notes.value.find((note) => note.id === currentNoteId.value) || null;
});

// 监听输入，判断是否需要保存
watch([editTitle, editContent], ([newTitle, newContent]) => {
  if (currentNote.value) {
    const originalTitle = currentNote.value.title;
    const originalContent = currentNote.value.content;
    if (newTitle !== originalTitle || newContent !== originalContent) {
      isUnsaved.value = true;
    } else {
      isUnsaved.value = false;
    }
  }
});

// 渲染 Markdown
const renderMarkdown = (md: string) => {
  return md ? marked.parse(md) : '<p class="text-gray-400 italic">空内容...</p>';
};

// 加载笔记列表
const loadNotes = async () => {
  try {
    loading.value = true;
    const response = await notesApi.getAllNotes({
      search: searchKeyword.value || undefined,
      sort_by: 'isPinned',
      order: 'desc',
    });

    notes.value = response.map(convertNoteToItem);
    console.log('加载的笔记数据:', notes.value);
  } catch (error) {
    console.error('加载笔记失败:', error);
    ElMessage.error('加载笔记失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  searchTimeout.value = setTimeout(() => {
    loadNotes();
  }, 300);
};

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = '';
  loadNotes();
};

// 打开笔记（查看/编辑）
const handleViewNote = async (id: number) => {
  try {
    const response = await notesApi.getNoteById(id);
    currentNoteId.value = id;
    editTitle.value = response.title;
    editContent.value = response.content;
    isUnsaved.value = false;
    drawerVisible.value = true;
  } catch (error) {
    console.error('打开笔记失败:', error);
    ElMessage.error('无法找到该笔记');
  }
};

// 关闭编辑器
const handleCloseEditor = () => {
  const close = () => {
    drawerVisible.value = false;
    currentNoteId.value = null;
    editTitle.value = '';
    editContent.value = '';
  };

  if (isUnsaved.value) {
    ElMessageBox.confirm('有未保存的更改，确定要关闭吗？更改将丢失。', '提示', {
      confirmButtonText: '强制关闭',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        close();
      })
      .catch(() => {});
  } else {
    close();
  }
};

// 新建笔记
const handleCreateNote = async () => {
  try {
    const newNoteData = {
      title: '未命名笔记',
      content: '',
      priority: 'medium' as const,
      status: 'done' as const,
      tags: [],
      isPinned: false,
    };

    const response = await notesApi.createNote(newNoteData);

    currentNoteId.value = response.id;
    editTitle.value = response.title;
    editContent.value = response.content;
    drawerVisible.value = true;
    isUnsaved.value = false;

    // 刷新笔记列表
    await loadNotes();
  } catch (error) {
    console.error('创建笔记失败:', error);
    ElMessage.error('创建笔记失败，请重试');
  }
};

// 保存逻辑
const handleSave = async () => {
  if (!currentNoteId.value) return;

  try {
    saving.value = true;
    const titleToSave = editTitle.value.trim() || '未命名笔记';
    const updatedData = {
      title: titleToSave,
      content: editContent.value,
    };

    await notesApi.updateNote(currentNoteId.value, updatedData);

    if (editTitle.value !== titleToSave) {
      editTitle.value = titleToSave;
    }

    ElMessage.success('保存成功');
    isUnsaved.value = false;

    // 刷新笔记列表
    await loadNotes();
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败，请重试');
  } finally {
    saving.value = false;
  }
};

// 删除逻辑
const handleDeleteNote = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该笔记吗？', '警告', { type: 'warning' });

    await notesApi.deleteNote(id);

    if (currentNoteId.value === id) {
      drawerVisible.value = false;
      currentNoteId.value = null;
    }

    ElMessage.success('删除成功');

    // 刷新笔记列表
    await loadNotes();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败，请重试');
    }
  }
};

// 置顶逻辑
const handleTogglePin = async (item: Item) => {
  try {
    await notesApi.togglePinNote(item.id);

    // 显示切换后的状态
    ElMessage.success(!item.isPinned ? '已置顶' : '已取消置顶');

    // 刷新笔记列表
    await loadNotes();
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败，请重试');
  }
};

const refreshTagList = async () => {
  try {
    console.log('标签已更新，请切换到标签页面查看');
    await loadNotes();
  } catch (error) {
    console.error('刷新标签列表失败:', error);
  }
};

// 标签更新逻辑
const handleUpdateNoteTags = async (tags: Tag[]) => {
  if (!currentEditingNote.value) return;

  try {
    const tagIds = tags.map((tag) => tag.id).filter((id) => id !== null);

    await notesApi.updateNoteTags(currentEditingNote.value.id, tagIds);

    ElMessage.success('标签更新成功');
    currentEditingNote.value = null;
    isTagsDialogOpen.value = false;

    // 刷新笔记列表
    await loadNotes();

    refreshTagList();
  } catch (error) {
    console.error('更新标签失败:', error);
    ElMessage.error('更新标签失败');
  }
};

// 更新优先级
const handleUpdatePriority = async (id: number, priority: string) => {
  try {
    const validPriorities = ['high', 'medium', 'low'] as const;
    let priorityValue: 'high' | 'medium' | 'low';

    if (validPriorities.includes(priority as any)) {
      priorityValue = priority as 'high' | 'medium' | 'low';
    } else {
      priorityValue = 'medium';
    }

    await notesApi.updateNote(id, { priority: priorityValue });
    ElMessage.success('优先级更新成功');
    // 刷新笔记列表
    await loadNotes();
  } catch (error) {
    console.error('更新优先级失败:', error);
    ElMessage.error('更新优先级失败，请重试');
  }
};

// 更新状态
const handleUpdateStatus = async (id: number, status: string) => {
  try {
    const validStatuses = ['todo', 'doing', 'done'] as const;
    const statusValue = validStatuses.includes(status as any)
      ? (status as 'todo' | 'doing' | 'done')
      : 'done';

    await notesApi.updateNote(id, { status: statusValue });
    ElMessage.success('状态更新成功');
    // 刷新笔记列表
    await loadNotes();
  } catch (error) {
    console.error('更新状态失败:', error);
    ElMessage.error('更新状态失败，请重试');
  }
};

const convertNoteToItem = (note: any): Item => {
  let priority: 'high' | 'medium' | 'low' | 'none';
  if (note.priority === 'high' || note.priority === 'medium' || note.priority === 'low') {
    priority = note.priority;
  } else {
    priority = 'none';
  }

  let tagsArray = [];
  if (note.tags && Array.isArray(note.tags)) {
    tagsArray = note.tags.map((tag: any) => ({
      id: tag.id || 0,
      name: tag.name || '',
      color: tag.color || '#909399',
    }));
  } else if (note.tags) {
    console.warn('Note tags 不是数组:', note.tags);
    tagsArray = [];
  }

  return {
    id: note.id,
    type: 'note' as const,
    title: note.title || '',
    content: note.content || '',
    priority: priority,
    status: (note.status || 'done') as 'todo' | 'doing' | 'done' | string,
    isPinned: note.isPinned || false,
    tags: tagsArray,
    created_at: note.created_at || note.createdAt || new Date().toISOString(),
    updated_at: note.updated_at || note.updatedAt || new Date().toISOString(),
    createdAt: note.createdAt || note.created_at || new Date().toISOString(),
    updatedAt: note.updatedAt || note.updated_at || new Date().toISOString(),
  };
};

const handleOpenDialog = (command: 'edit' | 'setTags' | 'setDate', item: Item) => {
  if (command === 'edit') {
    handleViewNote(item.id);
  } else if (command === 'setTags') {
    handleSetTags(item);
  }
  // 注意：笔记没有 setDate 命令，可以忽略
};

// 组件挂载时加载笔记
onMounted(() => {
  loadNotes();
});
</script>

<style scoped>
textarea::-webkit-scrollbar,
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
textarea::-webkit-scrollbar-track,
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
textarea::-webkit-scrollbar-thumb,
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}
textarea::-webkit-scrollbar-thumb:hover,
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}
</style>
