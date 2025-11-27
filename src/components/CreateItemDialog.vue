<template>
  <el-dialog
    :model-value="modelValue"
    :title="type === 'task' ? '创建新任务' : '创建新笔记'"
    width="500"
    @close="emit('update:modelValue', false)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入标题" />
      </el-form-item>

      <template v-if="type === 'task'">
        <el-form-item label="任务描述" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="3" placeholder="可选" />
        </el-form-item>
        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker
            v-model="form.deadline"
            type="datetime"
            placeholder="选择日期和时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="重要性" prop="priority">
          <el-radio-group v-model="form.priority">
            <el-radio-button label="high">高</el-radio-button>
            <el-radio-button label="medium">中</el-radio-button>
            <el-radio-button label="low">低</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </template>

      <el-form-item label="笔记内容 (支持Markdown)" prop="content" v-if="type === 'note'">
        <el-input v-model="form.content" type="textarea" :rows="5" />
      </el-form-item>

    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="emit('update:modelValue', false)">取消</el-button>
        <el-button type="primary" @click="handleConfirm">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

// Props
const props = defineProps<{
  modelValue: boolean // 控制显示/隐藏 (v-model)
  type: 'task' | 'note'
}>()

// Emits
const emit = defineEmits(['update:modelValue', 'confirm'])

const formRef = ref<FormInstance>()
const form = reactive({
  title: '',
  content: '',
  deadline: '',
  priority: 'medium' as 'high' | 'medium' | 'low',
})

const rules = reactive<FormRules>({
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
})

// 监听弹窗打开，重置表单
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    formRef.value?.resetFields()
    form.title = ''
    form.content = ''
    form.deadline = ''
    form.priority = 'medium'
  }
})

// 确认
const handleConfirm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('confirm', { ...form })
    }
  })
}
</script>