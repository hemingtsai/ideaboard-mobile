<script setup lang="ts">
import { ref, provide } from "vue";

const activedIndex = ref(0);

const setActivedIndex = (index: number) => {
    activedIndex.value = index;
};

provide("navigation", { activedIndex, setActivedIndex });
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
}
</style>
