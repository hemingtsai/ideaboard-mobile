<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
    <div class="todo-list">
        <h2 v-if="$slots.title">
            <slot name="title" />
        </h2>
        <div v-if="$slots.default" class="todo-items">
            <slot />
        </div>
        <p v-else class="todo-empty">{{ t("message.todo_empty") }}</p>
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

.todo-items {
    display: flex;
    flex-direction: column;
    gap: 1vh;
}

.todo-empty {
    margin: 0;
    font-size: 14px;
    color: var(--text-tertiary);
    text-align: center;
    padding: 2vh 0;
}
</style>
