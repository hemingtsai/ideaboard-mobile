<script setup lang="ts">
import ItemCard from "./ItemCard.vue";
import Checkbox from "./Checkbox.vue";

defineProps<{
    /** 任务标题 */
    title: string;
    /** 是否完成 */
    done: boolean;
}>();

const emit = defineEmits<{
    toggle: [];
}>();
</script>

<template>
    <ItemCard flush :notitle="true">
        <template #card-content>
            <div class="todo-item">
                <span class="todo-title" :class="{ done }">{{ title }}</span>
                <Checkbox
                    :modelValue="done"
                    @update:modelValue="$emit('toggle')"
                />
            </div>
        </template>
    </ItemCard>
</template>

<style scoped>
.todo-item {
    display: flex;
    align-items: center;
    gap: 3vw;
    padding: 1.5vh 2vh;
}

.todo-title {
    flex: 1;
    font-size: 15px;
    color: var(--text-primary);
    word-break: break-word;
    text-align: left;
}

.todo-title.done {
    color: var(--text-tertiary);
    text-decoration: line-through;
}
</style>
