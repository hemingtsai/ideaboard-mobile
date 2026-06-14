<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";

defineEmits<{
    click: [];
}>();

const props = withDefaults(
    defineProps<{
        /** Iconify 图标名 */
        icon?: string;
        /** 圆形按钮直径 (px)，同时控制图标大小 */
        size?: number;
        /** 背景颜色 */
        color?: string;
        /** 图标颜色 */
        textColor?: string;
    }>(),
    {
        icon: "material-symbols-light:10k-sharp",
        size: 36,
        color: "#FFFFFF",
        textColor: "black",
    },
);

const containerStyle = computed(() => ({
    width: props.size + "px",
    height: props.size + "px",
    backgroundColor: props.color,
}));

const iconStyle = computed(() => ({
    fontSize: props.size * 0.47 + "pt",
    color: props.textColor,
}));
</script>

<template>
    <div class="icon-container" :style="containerStyle" @click="$emit('click')">
        <Icon :icon="props.icon" class="icon" :style="iconStyle"></Icon>
    </div>
</template>

<style scoped>
.icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
}

.icon {
    user-select: none;
}
</style>
