<template>
  <div class="area-chart">
    <canvas ref="areaChartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

const areaChartCanvas = ref(null);
let chartInstance = ref(null);

const props = defineProps({
  data: Array,
});

// 获取 CSS 变量的实际颜色值
const getCssVariable = (variableName) => {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
};

// 将十六进制颜色转换为 RGBA
const hexToRgba = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const updateChart = () => {
  const ctx = areaChartCanvas.value?.getContext('2d');
  if (!ctx) {
    console.error('Canvas context not found for AreaChart!');
    return;
  }

  // 销毁旧图表实例
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  const labels = props.data?.map((item) => item.label) || [];
  const completedData = props.data?.map((item) => item.completed) || [];
  const inProgressData = props.data?.map((item) => item.inProgress) || [];
  const remainingData = props.data?.map((item) => item.remaining) || [];

  // 如果没有数据，显示空状态
  if (labels.length === 0) {
    return;
  }

  // 获取 CSS 变量颜色值 - 使用与BarChart相同的颜色定义
  const chartPrimary = getCssVariable('--chart-primary') || '#597eb7';
  const chartSecondary = getCssVariable('--chart-secondary') || '#7bb3d6';
  const chartAccent = getCssVariable('--chart-accent') || '#eed75e';
  const aliceText = getCssVariable('--alice-text') || '#2a2a2a';
  const aliceTextMuted = getCssVariable('--alice-text-muted') || '#5b5b5b';
  const aliceCard = getCssVariable('--alice-card') || '#cee0e5';
  const aliceBorder = getCssVariable('--alice-border') || 'rgba(0, 0, 0, 0.08)';
  const chartGrid = getCssVariable('--chart-grid') || 'rgba(0, 0, 0, 0.08)';

  // 创建颜色对象，确保与BarChart一致
  const colors = {
    completed: chartPrimary,
    inProgress: chartSecondary,
    remaining: chartAccent,
  };

  // 创建半透明版本的颜色
  const chartPrimaryFade = hexToRgba(colors.completed, 0.3);
  const chartSecondaryFade = hexToRgba(colors.inProgress, 0.3);
  const chartAccentFade = hexToRgba(colors.remaining, 0.3);

  // 创建图表
  chartInstance.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '已完成',
          data: completedData,
          fill: {
            target: 'origin',
            above: chartPrimaryFade,
          },
          backgroundColor: chartPrimaryFade,
          borderColor: colors.completed, // 使用统一的颜色
          tension: 0.4,
          // 移除点的显示
          pointRadius: 0,
          pointHoverRadius: 0,
          pointHitRadius: 0,
        },
        {
          label: '进行中',
          data: inProgressData,
          fill: {
            target: 'origin',
            above: chartSecondaryFade,
          },
          backgroundColor: chartSecondaryFade,
          borderColor: colors.inProgress, // 使用统一的颜色
          tension: 0.4,
          // 移除点的显示
          pointRadius: 0,
          pointHoverRadius: 0,
          pointHitRadius: 0,
        },
        {
          label: '待完成',
          data: remainingData,
          fill: {
            target: 'origin',
            above: chartAccentFade,
          },
          backgroundColor: chartAccentFade,
          borderColor: colors.remaining, // 使用统一的颜色
          tension: 0.4,
          // 移除点的显示
          pointRadius: 0,
          pointHoverRadius: 0,
          pointHitRadius: 0,
        },
      ],
    },
    options: {
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
      elements: {
        line: {
          tension: 0.4,
        },
      },
    },
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
.area-chart {
  width: 100%;
  height: 400px;
  position: relative;
}
</style>
