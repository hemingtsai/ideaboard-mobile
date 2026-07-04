<script setup lang="ts">
withDefaults(
    defineProps<{
        /** 按钮风格：primary 强调 / secondary 次要 */
        variant?: "primary" | "secondary";
    }>(),
    {
        variant: "secondary",
    },
);

defineEmits<{
    click: [];
}>();
</script>

<template>
    <button class="btn" :class="variant" @click="$emit('click')">
        <slot />
    </button>
</template>

<style scoped>
.btn {
    padding: 1.5vh 0;
    border: 1px solid var(--border-primary);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: inherit;
    font-size: 14px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
}

.primary {
    background: var(--accent);
    color: var(--accent-contrast);
    border-color: var(--accent);
}
</style>
