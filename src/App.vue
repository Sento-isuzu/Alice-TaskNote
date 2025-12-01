<template>
  <!-- TODO:App.vue只负责全局包裹，把layout单独创建文件抽离出来 -->
  <!--比如<template>
            <router-view />
        </template> -->
  <div class="h-screen w-screen flex flex-col">
    <div>
      <HeaderBar />
    </div>

    <div class="flex flex-1 overflow-hidden">
      <aside class="w-[230px] shrink-0 h-full overflow-y-auto bg-white">
        <Sidebar />
      </aside>

      <main class="flex-1 bg-gray-100 p-0 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';
import HeaderBar from './components/HeaderBar.vue';
// 不需要脚本
</script>
