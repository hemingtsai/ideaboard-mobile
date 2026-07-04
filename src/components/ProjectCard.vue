<script setup lang="ts">
import ItemCard from "./ItemCard.vue";
import ProgressBar from "./ProgressBar.vue";
import { useRouter } from "vue-router";

const props = withDefaults(
    defineProps<{
        /** 项目标识，用于路由跳转 */
        to: string;
        /** 项目名称 */
        title: string;
        /** 项目简介 */
        description?: string;
        /** 进度百分比 (0–100) */
        progress?: number;
    }>(),
    {
        description: "",
    },
);

const router = useRouter();

function handleClick() {
    router.push("project/" + props.to);
}
</script>

<template>
    <ItemCard class="project-card" @click="handleClick">
        <template #card-title>{{ title }}</template>
        <template #card-content>
            <p v-if="description" class="desc">{{ description }}</p>
            <div v-if="progress !== undefined" class="progress-row">
                <ProgressBar :value="progress" :height="6" />
                <span class="progress-text">{{ progress }}%</span>
            </div>
        </template>
    </ItemCard>
</template>

<style scoped>
.project-card {
    cursor: pointer;
    margin-top: 1vh;
}

.desc {
    margin: 0 0 1vh 0;
    font-size: 14px;
    color: var(--text-secondary);
}

.progress-row {
    display: flex;
    align-items: center;
    gap: 2vw;
    margin-top: 1vh;
}

.progress-text {
    font-size: 14px;
    color: var(--text-tertiary);
    flex-shrink: 0;
}
</style>
