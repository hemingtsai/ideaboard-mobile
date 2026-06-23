<script setup lang="ts"></script>

<template>
    <div class="card">
        <h2><slot name="card-title"></slot></h2>
        <div class="card-content"><slot name="card-content"></slot></div>
    </div>
</template>

<style scoped>
.card {
    border: 1px solid var(--border-primary);
    padding: 2vh;
}

.card h2 {
    margin: 0 0 1vh 0;
    font-size: 16px;
}

.card-content {
    font-size: 14px;
    color: var(--text-secondary);
}
</style>
