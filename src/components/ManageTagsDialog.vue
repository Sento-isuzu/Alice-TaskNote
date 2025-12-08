<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="管理标签"
    width="400px"
  >
    <p class="text-sm text-gray-500 mb-3">
      为{{ item.type === 'task' ? '任务' : '笔记' }}添加或移除标签。
    </p>

    <el-tag
      v-for="tag in currentTagObjects"
      :key="tag.id ?? `temp-${tag.name}`"
      closable
      :disable-transitions="false"
      @close="handleTagClose(tag)"
      class="mr-2 mb-2"
      :style="{ backgroundColor: tag.color || '#e9e9eb' }"
    >
      {{ tag.name }}
    </el-tag>

    <el-input
      v-if="inputVisible"
      ref="inputRef"
      v-model="inputValue"
      class="w-20"
      size="small"
      @keyup.enter="handleInputConfirm"
      @blur="handleInputConfirm"
    />
    <el-button v-else size="small" @click="showInput"> + New Tag </el-button>

    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="handleConfirm">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { createTag, fetchTags, Tag } from '@/api/tag';
import { type Item } from '@/types';
import { ElInput, ElMessage } from 'element-plus';

const props = defineProps<{
  modelValue: boolean;
  item: Item;
}>();

const emit = defineEmits(['update:modelValue', 'confirm', 'confirm-tags']);
const currentTagObjects = ref<Tag[]>([]);
const inputValue = ref('');
const inputVisible = ref(false);
const inputRef = ref<InstanceType<typeof ElInput>>();

// 初始化标签列表
watch(
  () => props.item,
  (newItem) => {
    if (newItem && newItem.tags) {
      currentTagObjects.value = newItem.tags.map((tag) => ({
        id: tag.id || 0,
        name: tag.name || '',
        color: tag.color || '#909399',
      }));
      console.log('当前标签对象:', currentTagObjects.value);
    } else {
      currentTagObjects.value = [];
    }
  },
  { immediate: true }
);
const handleTagClose = (tag: Tag) => {
  currentTagObjects.value = currentTagObjects.value.filter((t) => t.id !== tag.id);
};
const showInput = () => {
  inputVisible.value = true;
  setTimeout(() => {
    inputRef.value?.input?.focus();
  });
};

const handleInputConfirm = async () => {
  if (inputValue.value.trim()) {
    const newTagName = inputValue.value.trim();

    // 检查是否已存在同名标签
    const existingTag = currentTagObjects.value.find(
      (tag) => tag.name.toLowerCase() === newTagName.toLowerCase()
    );

    if (!existingTag) {
      const newTag: Tag = {
        id: null,
        name: newTagName,
        color: '#909399',
      };
      currentTagObjects.value.push(newTag);
    } else {
      ElMessage.warning('该标签已存在');
    }
  }

  inputVisible.value = false;
  inputValue.value = '';
};

const handleConfirm = async () => {
  try {
    const existingTags = await fetchTags();
    const finalTagObjects: Tag[] = [];

    for (const tag of currentTagObjects.value) {
      if (tag.id !== null && tag.id > 0) {
        const existingTag = existingTags.find((t) => t.id === tag.id);
        if (existingTag) {
          finalTagObjects.push(existingTag);
          continue;
        }
      }

      // 否则按名称查找或创建
      const existingTagByName = existingTags.find(
        (t) => t.name.toLowerCase() === tag.name.toLowerCase()
      );

      if (existingTagByName) {
        finalTagObjects.push(existingTagByName);
      } else {
        // 创建新标签
        const newTag = await createTag({
          name: tag.name,
          color: tag.color || '#909399',
        });
        if (newTag.id) {
          finalTagObjects.push(newTag);
        }
      }
    }

    const validTags = finalTagObjects.filter((tag) => tag.id !== null && tag.id !== undefined);

    // 根据item类型触发不同的事件
    if (props.item.type === 'task') {
      emit('confirm-tags', validTags);
    } else {
      emit('confirm', validTags);
    }

    emit('update:modelValue', false);
    ElMessage.success('标签设置成功');
  } catch (error) {
    ElMessage.error('标签设置失败，请重试');
    console.error('标签处理错误:', error);
  }
};
</script>
