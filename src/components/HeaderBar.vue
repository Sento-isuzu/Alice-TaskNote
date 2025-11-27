<template>
  <div class="h-16 flex items-center px-4 bg-gray-200">
    <h3 class="p-18 text-xl font-bold text-gray-500">{{ title }}</h3>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref('Alice')
</script>
