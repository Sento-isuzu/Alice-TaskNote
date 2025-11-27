<template>
  <div class="flex flex-col h-full">
    <el-menu :default-active="$route.path" router class="flex-1 border-r-0">
      <el-menu-item 
        v-for="item in menu" 
        :key="item.path" 
        :index="item.path"
        > <el-icon>
          <component :is="item.icon" />
        </el-icon>
        <span>{{ item.name }}</span>
      </el-menu-item>
    </el-menu>

    <el-menu class="border-r-0">
      <el-menu-item index="/setting"> <el-icon><Setting /></el-icon>
        <span>Setting</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { Notebook, Checked, DataLine, PriceTag, Setting } from '@element-plus/icons-vue'

const menu = [
  { name: 'Notes', path: '/notes', icon: Notebook },
  { name: 'TODO', path: '/todo', icon: Checked },
  { name: 'Stats', path: '/stats', icon: DataLine },
  { name: 'Tags', path: '/tags', icon: PriceTag }
]
</script>

<style>


.el-menu-item {
    justify-content: flex-start !important;
    padding-left: 20px !important; 
    font-size: 1rem !important;
}


.el-menu-item .el-icon {
    font-size: 1.35rem !important;
    margin-right: 48px !important; 
    width: 24px; 
}
</style>