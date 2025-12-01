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
  item: Item;
}>();

const emit = defineEmits(['update:modelValue', 'confirm']);

// 使用响应式引用来复制 prop 的值，以便在弹窗内修改
const form = ref<Partial<Item>>({});

// 监听 item 变化，初始化表单
watch(
  () => props.item,
  (newItem) => {
    if (newItem) {
      // 复制必要的属性到表单
      form.value = {
        title: newItem.title,
        content: newItem.content,
        deadline: newItem.deadline,
        priority: newItem.priority,
      };
    }
  },
  { immediate: true }
);

const handleConfirm = () => {
  // 触发 confirm 事件，将修改后的数据传给父组件
  emit('confirm', form.value);
  // 关闭弹窗
  emit('update:modelValue', false);
};
</script>
