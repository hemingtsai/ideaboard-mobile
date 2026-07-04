<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
    defineProps<{
        /** 当前进度 (0–100) */
        value: number;
        /** 进度条高度 */
        height?: number;
    }>(),
    {
        value: 0,
        height: 4,
    },
);

const clampedValue = computed(() => Math.max(0, Math.min(100, props.value)));

const barStyle = computed(() => ({
    width: clampedValue.value + "%",
}));

const trackStyle = computed(() => ({
    height: props.height + "px",
}));
</script>

<template>
    <div class="progress-track" :style="trackStyle">
        <div class="progress-bar" :style="barStyle" />
    </div>
</template>

<style scoped>
.progress-track {
    width: 100%;
    background-color: var(--bg-tertiary);
}

.progress-bar {
    height: 100%;
    background-color: var(--text-primary);
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
