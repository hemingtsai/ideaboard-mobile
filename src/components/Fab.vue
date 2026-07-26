<script setup lang="ts">
import IconButton from "./IconButton.vue";

withDefaults(
    defineProps<{
        /** Iconify 图标名 */
        icon?: string;
        /** 按钮尺寸 */
        size?: number;
        /** 背景色 */
        color?: string;
        /** 图标色 */
        textColor?: string;
    }>(),
    {
        icon: "material-symbols-light:edit-outline-sharp",
        size: 48,
        color: "var(--accent)",
        textColor: "var(--accent-contrast)",
    },
);

defineEmits<{
    click: [];
}>();
</script>

<template>
    <div class="fab">
        <IconButton
            :icon="icon"
            :size="size"
            :color="color"
            :textColor="textColor"
            @click="$emit('click')"
        />
    </div>
</template>

<style scoped>
.fab {
    position: fixed;
    /* 底部导航栏上方：导航栏约 8vh + safe-area */
    bottom: calc(env(safe-area-inset-bottom) + 8vh);
    right: 3vh;
    z-index: 10;
}
</style>
