<script setup lang="ts"></script>

<template>
    <div class="todo-list">
        <h2 v-if="$slots.title" class="todo-list-title">
            <slot name="title" />
        </h2>
        <slot />
    </div>
</template>

<style scoped>
.todo-list {
    border: 1px solid var(--border-primary);
    padding: 2vh;
    display: flex;
    flex-direction: column;
    gap: 1.5vh;
}

.todo-list h2 {
    margin: 0;
}
</style>
