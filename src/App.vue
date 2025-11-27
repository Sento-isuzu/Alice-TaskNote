<template>
    <!-- TODO:App.vue只负责全局包裹，把layout单独创建文件抽离出来 -->
    <!--<template>
            <router-view />
        </template> -->
    <!-- TODO:配置printter -->
  <el-container class="h-screen w-screen">
    <el-header class="p-0 h-auto">
        <HeaderBar />
    </el-header>

    <el-container class="overflow-hidden">

    <el-aside width="230px">
        <Sidebar />
    </el-aside>

        <!-- 主内容区域 -->
        <el-main class="bg-gray-100 p-0 overflow-x-hidden">
        <router-view />
        </el-main>

    </el-container>

</el-container>

</template>

<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';
import HeaderBar from './components/HeaderBar.vue'
// 不需要脚本
</script>