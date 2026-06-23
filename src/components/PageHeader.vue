<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();

function back() {
    router.back();
}
</script>

<template>
    <header class="app-header">
        <div class="back-btn" @click="back">←</div>
        <div class="header-title">
            <slot></slot>
        </div>
    </header>
</template>

<style scoped>
.app-header {
    position: sticky;
    padding: 2vh 2vh 2vh 2vh;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    background-color: var(--bg-primary);
    border-bottom: 1px solid var(--border-primary);
    box-sizing: border-box;
}

.back-btn {
    position: absolute;
    left: 2vh;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    background: none;
    border: none;
    z-index: 1;
}

.header-title {
    flex: 1;
    text-align: center;
    font-size: 18px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
}
</style>
