<template>
  <div class="flex flex-col p-6 overflow-y-auto">
    <header class="h-16 bg-white rounded-lg flex items-center justify-between px-6">
      <h2 class="text-2xl font-semibold" style="font-family: inherit; color: black">Status</h2>
    </header>

    <!-- 加载状态 -->
    <div
      v-if="loading"
      class="flex-1 flex justify-center items-center"
      style="font-family: inherit; color: black"
    >
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-(--alice-primary) mx-auto"
        ></div>
        <p class="mt-2" style="font-family: inherit; color: black">加载数据中...</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div
      v-else-if="error"
      class="flex-1 flex justify-center items-center"
      style="font-family: inherit; color: black"
    >
      <div class="text-center">
        <p class="text-lg" style="font-family: inherit; color: black">数据加载失败</p>
        <p class="text-sm mt-2" style="font-family: inherit; color: black">{{ error }}</p>
        <el-button
          @click="fetchData"
          type="primary"
          class="mt-4"
          style="font-family: inherit; color: black"
          >重试</el-button
        >
      </div>
    </div>

    <!-- 主内容 -->
    <div v-else class="flex-1" style="font-family: inherit; color: black">
      <div class="space-y-7">
        <!-- 主展示面板 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-7 px-0 pt-7">
          <!-- 今日进度 -->
          <div
            class="bg-white border border-(--alice-border) rounded-lg p-7"
            style="font-family: inherit; color: black"
          >
            <h2 class="text-lg font-semibold mb-4" style="font-family: inherit; color: black">
              今日进度
            </h2>
            <div class="flex items-center justify-center mt-18">
              <ProgressRing
                :completed="todayStats.completed"
                :inProgress="todayStats.inProgress"
                :remaining="todayStats.remaining"
                :total="todayStats.total"
                :size="200"
              />
            </div>
            <div class="mt-4 grid grid-cols-3 gap-2 text-center">
              <div style="font-family: inherit; color: black">
                <div
                  class="text-2xl font-bold text-(--chart-primary)"
                  style="font-family: inherit; color: black"
                >
                  {{ todayStats.completed }}
                </div>
                <div class="text-sm" style="font-family: inherit; color: black">已完成</div>
              </div>
              <div style="font-family: inherit; color: black">
                <div
                  class="text-2xl font-bold text-(--chart-secondary)"
                  style="font-family: inherit; color: black"
                >
                  {{ todayStats.inProgress }}
                </div>
                <div class="text-sm" style="font-family: inherit; color: black">进行中</div>
              </div>
              <div style="font-family: inherit; color: black">
                <div
                  class="text-2xl font-bold text-(--chart-accent)"
                  style="font-family: inherit; color: black"
                >
                  {{ todayStats.remaining }}
                </div>
                <div class="text-sm" style="font-family: inherit; color: black">待完成</div>
              </div>
            </div>
          </div>

          <!-- 月度总览 -->
          <div
            class="bg-white border border-(--alice-border) rounded-lg p-6"
            style="font-family: inherit; color: black"
          >
            <h2 class="text-lg font-semibold mb-4" style="font-family: inherit; color: black">
              月度总览
            </h2>
            <AreaChart :data="monthData" />
          </div>
        </div>

        <!-- 可切换面板 -->
        <div
          class="bg-white border border-(--alice-border) rounded-lg p-6 mx-0"
          style="font-family: inherit; color: black"
        >
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold" style="font-family: inherit; color: black">
              进度趋势
            </h2>
            <div class="flex space-x-2">
              <el-button
                :type="activeView === 'week' ? 'primary' : ''"
                @click="activeView = 'week'"
                style="font-family: inherit; color: black"
              >
                本周
              </el-button>
              <el-button
                :type="activeView === 'year' ? 'primary' : ''"
                @click="activeView = 'year'"
                style="font-family: inherit; color: black"
              >
                年度
              </el-button>
            </div>
          </div>

          <div v-if="activeView === 'week'">
            <BarChart :data="weekData" />
          </div>
          <div v-else>
            <AreaChart :data="yearData" />
          </div>
        </div>

        <!-- 任务优先级分布 -->
        <div
          v-if="priorityData"
          class="bg-white border border-(--alice-border) rounded-lg p-6 mx-0"
          style="font-family: inherit; color: black"
        >
          <h2 class="text-lg font-semibold mb-4" style="font-family: inherit; color: black">
            任务优先级分布
          </h2>

          <!-- 图例 -->
          <div class="flex justify-center mb-6">
            <div
              class="flex items-center space-x-6 text-sm"
              style="font-family: inherit; color: black"
            >
              <div class="flex items-center space-x-2" style="font-family: inherit; color: black">
                <div class="w-5 h-5 bg-(--chart-primary) rounded-full"></div>
                <span style="font-family: inherit; color: black">已完成</span>
              </div>
              <div class="flex items-center space-x-2" style="font-family: inherit; color: black">
                <div class="w-5 h-5 bg-(--chart-secondary) rounded-full"></div>
                <span style="font-family: inherit; color: black">进行中</span>
              </div>
              <div class="flex items-center space-x-2" style="font-family: inherit; color: black">
                <div class="w-5 h-5 bg-(--chart-accent) rounded-full"></div>
                <span style="font-family: inherit; color: black">待完成</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              v-for="priority in priorityData"
              :key="priority.level"
              class="text-center"
              style="font-family: inherit; color: black"
            >
              <ProgressRing
                :completed="priority.completed"
                :inProgress="priority.inProgress"
                :remaining="priority.remaining"
                :total="priority.total"
                :size="150"
              />

              <h3
                :class="['mt-2 font-medium', priorityClasses[priority.level]]"
                style="font-family: inherit; color: black"
              >
                {{ priorityLabels[priority.level] }}
              </h3>

              <div class="mt-3 space-y-1 text-sm" style="font-family: inherit; color: black">
                <div class="flex justify-between" style="font-family: inherit; color: black">
                  <span style="font-family: inherit; color: black">已完成:</span>
                  <span
                    class="font-medium text-(--chart-primary)"
                    style="font-family: inherit; color: black"
                    >{{ priority.completed }}</span
                  >
                </div>
                <div class="flex justify-between" style="font-family: inherit; color: black">
                  <span style="font-family: inherit; color: black">进行中:</span>
                  <span
                    class="font-medium text-(--chart-secondary)"
                    style="font-family: inherit; color: black"
                    >{{ priority.inProgress }}</span
                  >
                </div>
                <div class="flex justify-between" style="font-family: inherit; color: black">
                  <span style="font-family: inherit; color: black">待完成:</span>
                  <span
                    class="font-medium text-(--chart-accent)"
                    style="font-family: inherit; color: black"
                    >{{ priority.remaining }}</span
                  >
                </div>
                <div
                  class="border-t border-(--alice-border) pt-1 mt-1 flex justify-between"
                  style="font-family: inherit; color: black"
                >
                  <span style="font-family: inherit; color: black">总计:</span>
                  <span class="font-medium" style="font-family: inherit; color: black">{{
                    priority.total
                  }}</span>
                </div>
              </div>

              <div class="mt-2 text-xs" style="font-family: inherit; color: black">
                完成率: {{ Math.round((priority.completed / priority.total) * 100) }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElButton, ElMessage } from 'element-plus';
import ProgressRing from '../components/ProgressRing.vue';
import BarChart from '../components/BarChart.vue';
import AreaChart from '../components/AreaChart.vue';
import { MOCK_STATS_DATA } from '@/store/StatsmockData';

// 响应式数据
const loading = ref(true);
const error = ref(null);
const activeView = ref('week');

// 数据结构
const statsData = ref({
  today: {},
  week: [],
  month: [],
  year: [],
  priority: [],
});

// 配置
const priorityLabels = {
  high: '高优先级',
  medium: '中优先级',
  low: '低优先级',
};

const priorityClasses = {
  high: 'text-(--alice-primary)',
  medium: 'text-(--chart-secondary)',
  low: 'text-(--chart-accent)',
};

// 数据获取
const fetchData = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await fetch('/api/stats', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    statsData.value = await response.json();
  } catch (err) {
    console.error('获取数据失败:', err);
    error.value = err.message || '未知错误';
    ElMessage.error('数据加载失败');
  } finally {
    loading.value = false;
  }
};

// 模拟数据
const fetchMockData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  statsData.value = MOCK_STATS_DATA;
};

// 计算属性
const todayStats = computed(() => statsData.value.today);
const weekData = computed(() => statsData.value.week);
const monthData = computed(() => statsData.value.month);
const yearData = computed(() => statsData.value.year);
const priorityData = computed(() => statsData.value.priority);

// 初始化
onMounted(async () => {
  await fetchMockData();
  loading.value = false;
});
</script>

<style scoped>
/* 使用与 TodoView 和 NoteView 一致的样式 */
</style>
