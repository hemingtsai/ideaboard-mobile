<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        /** 当前选中状态 */
        modelValue: boolean;
        /** 禁用 */
        disabled?: boolean;
    }>(),
    {
        disabled: false,
    },
);

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
}>();

function toggle() {
    if (props.disabled) return;
    emit("update:modelValue", !props.modelValue);
}
</script>

<template>
    <div
        class="checkbox"
        :class="{ checked: modelValue, disabled }"
        @click="toggle"
    >
        <svg
            class="check-mark"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    </div>
</template>

<style scoped>
.checkbox {
    width: 24px;
    height: 24px;
    border: 2px solid var(--border-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
}

.checkbox.checked {
    background-color: var(--accent);
    border-color: var(--accent);
}

.checkbox.disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.check-mark {
    width: 16px;
    height: 16px;
    color: var(--accent-contrast);
    opacity: 0;
}

.checkbox.checked .check-mark {
    opacity: 1;
}
</style>
