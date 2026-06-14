<script setup lang="ts">
import { useScroll } from "@vueuse/core";
import { provide, ref } from "vue";

defineProps<{
    /** 是否撑满父级高度（flex: 1） */
    fill?: boolean;
}>();

const el = ref<HTMLElement>();
const { y } = useScroll(el);
provide("scrollY", y);
</script>

<template>
    <div ref="el" class="scroll-container" :class="{ fill }">
        <slot />
    </div>
</template>

<style scoped>
.scroll-container {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    scrollbar-gutter: stable;
    padding-left: 2vh;
    padding-right: 2vh;
}

.fill {
    flex: 1;
    min-height: 0;
}
</style>
