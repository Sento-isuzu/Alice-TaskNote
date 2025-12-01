<template>
  <div class="bar-chart">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

const canvas = ref(null);
let chartInstance = ref(null);

const props = defineProps({
  data: Array,
});

// 获取 CSS 变量的实际颜色值
const getCssVariable = (variableName) => {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
};

const updateChart = () => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) {
    console.error('Canvas context not found for BarChart!');
    return;
  }

  // 销毁旧图表实例
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  // 获取 CSS 变量颜色值 - 使用与AreaChart相同的颜色定义
  const chartPrimary = getCssVariable('--chart-primary') || '#597eb7';
  const chartSecondary = getCssVariable('--chart-secondary') || '#7bb3d6';
  const chartAccent = getCssVariable('--chart-accent') || '#eed75e';
  const aliceText = getCssVariable('--alice-text') || '#2a2a2a';
  const aliceTextMuted = getCssVariable('--alice-text-muted') || '#5b5b5b';
  const aliceCard = getCssVariable('--alice-card') || '#cee0e5';
  const aliceBorder = getCssVariable('--alice-border') || 'rgba(0, 0, 0, 0.08)';
  const chartGrid = getCssVariable('--chart-grid') || 'rgba(0, 0, 0, 0.08)';

  // 创建颜色对象，确保与AreaChart一致
  const colors = {
    completed: chartPrimary,
    inProgress: chartSecondary,
    remaining: chartAccent,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          color: aliceText,
          font: {
            family: 'inherit',
          },
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: aliceCard,
        titleColor: aliceText,
        bodyColor: aliceText,
        borderColor: aliceBorder,
        borderWidth: 1,
        titleFont: {
          family: 'inherit',
        },
        bodyFont: {
          family: 'inherit',
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: aliceTextMuted,
          font: {
            family: 'inherit',
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: chartGrid,
        },
        ticks: {
          precision: 0,
          color: aliceTextMuted,
          font: {
            family: 'inherit',
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  // 准备数据
  const labels = props.data?.map((item) => item.day) || [];
  const completed = props.data?.map((item) => item.completed) || [];
  const inProgress = props.data?.map((item) => item.inProgress || 0) || [];
  const remaining = props.data?.map((item) => item.remaining) || [];

  // 如果没有数据，显示空状态
  if (labels.length === 0) {
    return;
  }

  // 创建图表
  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '已完成',
          data: completed,
          backgroundColor: colors.completed, // 使用统一的颜色
          borderColor: colors.completed, // 使用统一的颜色
          borderWidth: 1,
        },
        {
          label: '进行中',
          data: inProgress,
          backgroundColor: colors.inProgress, // 使用统一的颜色
          borderColor: colors.inProgress, // 使用统一的颜色
          borderWidth: 1,
        },
        {
          label: '待完成',
          data: remaining,
          backgroundColor: colors.remaining, // 使用统一的颜色
          borderColor: colors.remaining, // 使用统一的颜色
          borderWidth: 1,
        },
      ],
    },
    options,
  });
};

onMounted(() => {
  updateChart();
});

// 监听数据变化，更新图表
watch(
  () => props.data,
  () => {
    updateChart();
  },
  { deep: true }
);
</script>

<style scoped>
.bar-chart {
  width: 100%;
  height: 400px;
}
</style>
