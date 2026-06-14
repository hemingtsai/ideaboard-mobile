<script setup lang="ts">
import { computed, inject, ref, type Ref } from "vue";

const scrollY = inject<Ref<number>>("scrollY", ref(0));

const maxPad = 7;
const minPad = 2;
const padRange = maxPad - minPad; // 5vh top + 5vh bottom = 10vh total

const vhToPx = typeof window !== "undefined" ? window.innerHeight / 100 : 8;
const collapseDistance = padRange * 2 * vhToPx; // 10vh → px

/** 随滚动线性收缩 padding，收缩总量恰好"吸收"等量滚动距离 */
const paddingVh = computed(() => {
    if (scrollY.value <= 0) return maxPad;
    if (scrollY.value >= collapseDistance) return minPad;
    return maxPad - (scrollY.value / collapseDistance) * padRange;
});

const padding = computed(() => `${paddingVh.value}vh 0 ${paddingVh.value}vh 0`);
</script>

<template>
    <div class="page-title-container" :style="{ padding }">
        <h1><slot></slot></h1>
    </div>
</template>

<style scoped></style>
