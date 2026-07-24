<script setup lang="ts">
withDefaults(
    defineProps<{
        width?: string;
        height?: string;
        radius?: string;
    }>(),
    {
        width: "100%",
        height: "16px",
        radius: "2px",
    },
);
</script>

<template>
    <div class="skeleton" :style="{ width, height, borderRadius: radius }" />
</template>

<style scoped>
.skeleton {
    background: linear-gradient(
        90deg,
        var(--border-primary) 25%,
        var(--bg-secondary, #e0e0e0) 50%,
        var(--border-primary) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}
</style>
