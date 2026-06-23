<script setup lang="ts">
import { provide, computed } from "vue";

const props = defineProps<{
    active: number;
}>();

const emit = defineEmits<{
    (e: "update:active", value: number): void;
}>();

// 提供一个 computed 只读的 activedIndex
const activedIndex = computed(() => props.active);

// 提供一个更新方法，由子组件调用
const setActivedIndex = (index: number) => {
    if (index !== props.active) {
        emit("update:active", index);
    }
};

// 向子组件提供数据（与之前 BottomNavigationItem 中的 inject 匹配）
provide("navigation", {
    activedIndex,
    setActivedIndex,
});
</script>

<template>
    <div class="bottom-navigation-bar">
        <slot></slot>
    </div>
</template>

<style scoped>
.bottom-navigation-bar {
    display: flex;
    flex-shrink: 0;
    justify-content: space-around;
    align-items: center;
    padding-top: 2vh;
}
</style>
