<template>
  <div class="h-13 flex items-center px-4 bg-(--alice-section) shadow-md relative">
    <h3 class="p-18 text-xl font-bold text-white">{{ title }}</h3>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const title = ref('Alice');
</script>
