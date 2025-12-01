<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="管理标签"
    width="400px"
  >
    <p class="text-sm text-gray-500 mb-3">为任务添加或移除标签。</p>

    <el-tag
      v-for="tag in currentTags"
      :key="tag"
      closable
      :disable-transitions="false"
      @close="handleTagClose(tag)"
      class="mr-2 mb-2"
    >
      {{ tag }}
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
import { type Item } from '@/types';
import { ElInput } from 'element-plus'; // 导入 ElInput 类型

const props = defineProps<{
  modelValue: boolean;
  item: Item;
}>();

const emit = defineEmits(['update:modelValue', 'confirm']);

const currentTags = ref<string[]>([]);
const inputValue = ref('');
const inputVisible = ref(false);
const inputRef = ref<InstanceType<typeof ElInput>>();

// 初始化标签列表
watch(
  () => props.item,
  (newItem) => {
    if (newItem && newItem.tags) {
      currentTags.value = [...newItem.tags];
    }
  },
  { immediate: true }
);

const handleTagClose = (tag: string) => {
  currentTags.value.splice(currentTags.value.indexOf(tag), 1);
};

const showInput = () => {
  inputVisible.value = true;
  // 等待 DOM 更新后聚焦
  setTimeout(() => {
    inputRef.value?.input?.focus();
  });
};

const handleInputConfirm = () => {
  if (inputValue.value && !currentTags.value.includes(inputValue.value)) {
    currentTags.value.push(inputValue.value);
  }
  inputVisible.value = false;
  inputValue.value = '';
};

const handleConfirm = () => {
  // 触发 confirm 事件，只传 tags 属性
  emit('confirm', { tags: currentTags.value });
  // 关闭弹窗
  emit('update:modelValue', false);
};
</script>
