<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="管理标签"
    width="400px"
  >
    <p class="text-sm text-gray-500 mb-3">为任务添加或移除标签。</p>

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
const currentTags = ref<string[]>([]);
const inputValue = ref('');
const inputVisible = ref(false);
const inputRef = ref<InstanceType<typeof ElInput>>();

// 初始化标签列表
watch(
  () => props.item,
  (newItem) => {
    if (newItem && newItem.tags) {
      currentTags.value = newItem.tags.map((tag) => tag.name);
      currentTagObjects.value = [...newItem.tags];
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

const handleInputConfirm = () => {
  if (inputValue.value && !currentTags.value.includes(inputValue.value)) {
    const newTagName = inputValue.value;
    currentTags.value.push(newTagName);
    currentTagObjects.value.push({ id: null, name: newTagName, color: '#909399' });
  }
  inputVisible.value = false;
  inputValue.value = '';
};

const handleConfirm = async () => {
  try {
    const existingTags = await fetchTags();
    const tagObjects: Tag[] = [];

    for (const tag of currentTagObjects.value) {
      // 如果标签已经有ID，直接使用
      if (tag.id !== null) {
        const existingTag = existingTags.find((t) => t.id === tag.id);
        if (existingTag) {
          tagObjects.push(existingTag);
          continue;
        }
      }

      // 否则按名称查找或创建
      const existingTag = existingTags.find((t) => t.name === tag.name);
      if (existingTag) {
        tagObjects.push(existingTag);
      } else {
        const newTag = await createTag({
          name: tag.name,
          color: tag.color || '#909399',
        });
        tagObjects.push(newTag);
      }
    }

    emit('confirm-tags', tagObjects);
    emit('update:modelValue', false);
    ElMessage.success('标签设置成功');
  } catch (error) {
    ElMessage.error('标签设置失败，请重试');
    console.error('标签处理错误:', error);
  }
};
</script>
