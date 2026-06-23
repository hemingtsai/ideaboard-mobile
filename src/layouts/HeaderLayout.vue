<script setup lang="ts">
import PageHeader from "../components/PageHeader.vue";
import ScrollContainer from "../components/ScrollContainer.vue";

defineProps<{
    title?: string;
}>();
</script>

<template>
    <div class="header-layout">
        <PageHeader>{{ title }}</PageHeader>
        <ScrollContainer fill>
            <slot />
        </ScrollContainer>
        <div class="footer">
            <slot name="footer" />
        </div>
    </div>
</template>

<style scoped>
.header-layout {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.footer {
    padding: 0 2vh 0 2vh;
}
</style>
