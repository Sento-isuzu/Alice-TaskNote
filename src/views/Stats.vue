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
          v-if="priorityData && priorityData.length > 0"
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
                完成率: {{ Math.round((priority.completed / priority.total) * 100) || 0 }}%
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

// 响应式数据
const loading = ref(true);
const error = ref(null);
const activeView = ref('week');

// 数据的结构
const statsData = ref({
  today: {
    completed: 0,
    inProgress: 0,
    remaining: 0,
    total: 0,
  },
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

    // 使用正确的后端 URL
    const apiUrl = 'http://localhost:8000/api/stats';
    console.log('请求 URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    console.log('响应状态码:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP 错误! 状态码: ${response.status}`);
    }

    const data = await response.json();
    console.log('成功获取原始数据:', data);

    // 转换数据格式以适应前端组件
    const weekData = data.week.map((item) => ({
      ...item,
      inProgress: item.inProgress || 0, // 确保有 inProgress 字段
    }));

    // 转换月份数据：date -> label，并确保有 inProgress 字段
    const monthData = data.month.map((item) => ({
      label: item.date, // 将 date 改为 label
      completed: item.completed || 0,
      inProgress: item.inProgress || 0,
      remaining: item.remaining || 0,
    }));

    // 转换年份数据：month -> label，并确保有 inProgress 字段
    const yearData = data.year.map((item) => ({
      label: item.month, // 将 month 改为 label
      completed: item.completed || 0,
      inProgress: item.inProgress || 0,
      remaining: item.remaining || 0,
    }));

    // 确保优先级数据有正确的字段
    const priorityData = data.priority.map((item) => ({
      level: item.level,
      completed: item.completed || 0,
      inProgress: item.inProgress || 0,
      remaining: item.remaining || 0,
      total: item.total || item.completed + item.inProgress + item.remaining,
    }));

    // 设置转换后的数据
    statsData.value = {
      today: {
        completed: data.today.completed || 0,
        inProgress: data.today.inProgress || 0,
        remaining: data.today.remaining || 0,
        total: data.today.total || 0,
      },
      week: weekData,
      month: monthData, // 使用转换后的 monthData
      year: yearData, // 使用转换后的 yearData
      priority: priorityData,
    };

    console.log('转换后的数据:', statsData.value);
  } catch (err) {
    console.error('获取数据失败:', err);
    error.value = err.message || '未知错误';
    ElMessage.error('数据加载失败，使用模拟数据');

    // 如果后端未就绪，使用内置模拟数据
    await fetchMockData();
  } finally {
    loading.value = false;
  }
};

// 模拟数据（作为后备）
const fetchMockData = async () => {
  // 模拟延迟
  await new Promise((resolve) => setTimeout(resolve, 800));

  const today = new Date();

  // 周数据 - 格式与后端返回一致
  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const weekData = weekDays.map((day, index) => ({
    day,
    completed: Math.floor(Math.random() * 10) + 5,
    inProgress: Math.floor(Math.random() * 5) + 2,
    remaining: Math.floor(Math.random() * 3) + 1,
  }));

  // 月数据 - 格式要转换
  const monthData = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    monthData.push({
      label: `${date.getMonth() + 1}-${date.getDate()}`, // 使用 label
      completed: Math.floor(Math.random() * 15) + 5,
      inProgress: Math.floor(Math.random() * 8) + 3,
      remaining: Math.floor(Math.random() * 5) + 1,
    });
  }

  // 年数据 - 格式要转换
  const months = [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ];
  const yearData = months.map((month, index) => ({
    label: month, // 使用 label
    completed: 30 + index * 8,
    inProgress: 10 + index * 3,
    remaining: 5 + index * 2,
  }));

  // 优先级数据
  const priorityData = [
    {
      level: 'high',
      completed: Math.floor(Math.random() * 10) + 5,
      inProgress: Math.floor(Math.random() * 5) + 2,
      remaining: Math.floor(Math.random() * 3) + 1,
      total: 15,
    },
    {
      level: 'medium',
      completed: Math.floor(Math.random() * 15) + 8,
      inProgress: Math.floor(Math.random() * 8) + 3,
      remaining: Math.floor(Math.random() * 5) + 2,
      total: 25,
    },
    {
      level: 'low',
      completed: Math.floor(Math.random() * 8) + 4,
      inProgress: Math.floor(Math.random() * 4) + 2,
      remaining: Math.floor(Math.random() * 3) + 1,
      total: 15,
    },
  ];

  statsData.value = {
    today: {
      completed: Math.floor(Math.random() * 10) + 5,
      inProgress: Math.floor(Math.random() * 5) + 3,
      remaining: Math.floor(Math.random() * 4) + 2,
      total: Math.floor(Math.random() * 15) + 10,
    },
    week: weekData,
    month: monthData, // 使用转换后的格式
    year: yearData, // 使用转换后的格式
    priority: priorityData,
  };
};

// 计算属性
const todayStats = computed(() => statsData.value.today);
const weekData = computed(() => statsData.value.week);
const monthData = computed(() => statsData.value.month);
const yearData = computed(() => statsData.value.year);
const priorityData = computed(() => statsData.value.priority);

// 初始化
onMounted(async () => {
  await fetchData();
});
</script>

<style scoped>
/* 使用与 TodoView 和 NoteView 一致的样式 */
</style>
