<template>
  <div class="progress-ring">
    <canvas ref="canvas" :width="size" :height="size" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

const canvas = ref(null);
let chartInstance = ref(null);

const props = defineProps({
  completed: Number,
  inProgress: Number,
  remaining: Number,
  total: Number,
  size: { type: Number, default: 150 },
});

// 获取 CSS 变量的实际颜色值
const getCssVariable = (variableName) => {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
};

const options = {
  responsive: false,
  maintainAspectRatio: true,
  circumference: 360,
  rotation: -90,
  cutout: '70%',
  plugins: {
    tooltip: {
      enabled: false,
    },
    legend: {
      display: false,
    },
  },
  animation: {
    animateRotate: true,
    animateScale: true,
  },
};

const updateChart = () => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx || props.total <= 0) return;

  // 销毁旧图表实例
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  // 获取 CSS 变量颜色值
  const chartPrimary = getCssVariable('--chart-primary') || '#597eb7';
  const chartSecondary = getCssVariable('--chart-secondary') || '#7bb3d6';
  const chartAccent = getCssVariable('--chart-accent') || '#eed75e';

  const colors = [chartPrimary, chartSecondary, chartAccent];

  // 计算百分比
  let completed = (props.completed / props.total) * 100 || 0;
  let inProgress = (props.inProgress / props.total) * 100 || 0;
  let remaining = (props.remaining / props.total) * 100 || 0;

  // 修正百分比总和
  const total = completed + inProgress + remaining;
  if (Math.abs(total - 100) > 0.1) {
    const factor = 100 / total;
    completed *= factor;
    inProgress *= factor;
    remaining *= factor;
  }

  // 创建新图表
  chartInstance.value = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [
        {
          data: [completed, inProgress, remaining],
          backgroundColor: colors,
          borderWidth: 0,
          borderRadius: 0,
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
  [() => props.completed, () => props.inProgress, () => props.remaining, () => props.total],
  () => {
    updateChart();
  }
);
</script>

<style scoped>
.progress-ring {
  display: inline-block;
}
</style>
