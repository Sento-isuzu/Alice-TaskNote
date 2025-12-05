<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="编辑任务"
    width="500px"
  >
    <el-form :model="form" label-width="80px">
      <el-form-item label="标题">
        <el-input v-model="form.title" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.content" type="textarea" />
      </el-form-item>
      <el-form-item label="截止日期">
        <!-- 不使用 value-format，这样 v-model 将是 Date | null -->
        <el-date-picker
          v-model="form.deadline"
          type="date"
          placeholder="选择日期"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="优先级">
        <el-radio-group v-model="form.priority">
          <el-radio label="high">高 (P1)</el-radio>
          <el-radio label="medium">中 (P2)</el-radio>
          <el-radio label="low">低 (P3)</el-radio>
          <el-radio label="none">无 (P4)</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="handleConfirm">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { type Item } from '@/types';

const props = defineProps<{
  modelValue: boolean;
  item: Item | null;
}>();

const emit = defineEmits(['update:modelValue', 'confirm']);

// 表单里 deadline 使用 Date | null
const form = ref<{
  title: string;
  content: string;
  deadline: Date | null;
  priority: string;
}>({
  title: '',
  content: '',
  deadline: null,
  priority: 'none',
});

watch(
  () => props.item,
  (newItem) => {
    if (newItem) {
      form.value.title = newItem.title ?? '';
      form.value.content = newItem.content ?? '';
      // 如果后端给的是 ISO 字符串 -> 转 Date
      form.value.deadline = newItem.deadline ? new Date(newItem.deadline) : null;
      form.value.priority = newItem.priority ?? 'none';
    } else {
      // 清空
      form.value.title = '';
      form.value.content = '';
      form.value.deadline = null;
      form.value.priority = 'none';
    }
  },
  { immediate: true }
);

const handleConfirm = () => {
  emit('confirm', {
    title: form.value.title,
    content: form.value.content,
    priority: form.value.priority,
    deadline: form.value.deadline
      ? form.value.deadline.toISOString().split('T')[0] // ← 截取成 YYYY-MM-DD
      : undefined,
  });
  emit('update:modelValue', false);
};
</script>
