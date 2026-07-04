<script setup lang="ts">
import PageTitle from "../components/PageTitle.vue";
import ProjectCard from "../components/ProjectCard.vue";
import ItemCard from "../components/ItemCard.vue";
import Heatmap from "../components/Heatmap.vue";

import { useI18n } from "vue-i18n";
import { ref } from "vue";

const { t } = useI18n();

const heatmap_data = ref<number[][]>([
    [1, 4, 2, 5, 2, 8, 5, 2, 5, 7, 1, 4, 6, 7],
    [3, 9, 3, 5, 0, 1, 4, 2, 2, 10, 5, 2, 5, 4],
    [6, 3, 0, 1, 0, 1, 4, 6, 7, 9, 2, 7, 4, 3],
    [6, 3, 0, 1, 0, 1, 4, 6, 7, 9, 2, 5, 1, 7],
]);
</script>

<template>
    <PageTitle>{{ t("message.ideaboard") }}</PageTitle>
    <ItemCard noborder flush>
        <template #card-title>{{ t("message.heatmap") }}</template>
        <template #card-content>
            <Heatmap :data="heatmap_data" :cellSize="20" />
        </template>
    </ItemCard>

    <ItemCard noborder flush>
        <template #card-title>{{ t("message.recent_projects") }}</template>
        <template #card-content>
            <ProjectCard
                to="test"
                title="Test Project"
                description="Details for the project"
                :progress="86"
            />
            <ProjectCard
                to="test"
                title="Another Project"
                description="Some description"
                :progress="42"
            />
        </template>
    </ItemCard>
</template>
