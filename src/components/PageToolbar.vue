<template>
  <div class="flex items-center justify-between p-4 border-b bg-white">
    <h1 class="text-lg font-semibold capitalize">{{ title }}</h1>
    <div class="flex items-center gap-2">
      <el-input v-model="search" placeholder="Search..." size="small" clearable class="w-48" />
      <el-button size="small" type="primary">Delete</el-button>
      <el-button size="small">Filter</el-button>
      <el-button size="small">Sort</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const search = ref('')

const title = computed(() => {
  return route.path.replace('/', '') || 'Notes'
})
</script>
