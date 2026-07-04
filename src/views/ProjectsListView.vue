<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import PageTitle from "../components/PageTitle.vue";
import ProjectCard from "../components/ProjectCard.vue";
import Fab from "../components/Fab.vue";

const { t } = useI18n();
const router = useRouter();

function handleNew() {
    router.push("/project/new");
}
</script>

<template>
    <div class="view-content-container">
        <PageTitle>{{ t("message.projects") }}</PageTitle>
        <ProjectCard
            to="test"
            title="Test Project"
            description="Details for the project"
            :progress="86"
        />
    </div>
    <Fab icon="material-symbols-light:add" @click="handleNew" />
</template>

<style scoped>
.view-content-container {
    min-height: 100%;
}
</style>
