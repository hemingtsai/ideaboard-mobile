<script setup lang="ts">
import { Icon } from "@iconify/vue";

defineEmits<{
    click: [];
}>();

const props = defineProps({
    icon: {
        type: String,
        default: "material-symbols-light:10k-sharp",
    },
});
</script>

<template>
    <div class="icon-container" @click="$emit('click')">
        <Icon :icon="props.icon" class="icon"></Icon>
    </div>
</template>

<style scoped>
.icon {
    user-select: none;
    font-size: 17pt;
}
</style>
