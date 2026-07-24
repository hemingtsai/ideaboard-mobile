<script setup lang="ts">
import { onActivated, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import PageTitle from "../components/PageTitle.vue";
import ProjectCard from "../components/ProjectCard.vue";
import SkeletonBlock from "../components/SkeletonBlock.vue";
import Fab from "../components/Fab.vue";
import { getProjects } from "../api/modules/projects";
import type { Project } from "../api/types";

const { t } = useI18n();
const router = useRouter();

const projects = ref<Project[]>([]);
const loading = ref(true);

async function fetchProjects() {
    loading.value = true;
    try {
        const res = await getProjects();
        projects.value = res.items;
    } catch {
        projects.value = [];
    } finally {
        loading.value = false;
    }
}

function handleNew() {
    router.push("/project/new");
}

function handleProjectClick(id: number) {
    router.push(`/project/${id}`);
}

onMounted(fetchProjects);
onActivated(fetchProjects);
</script>

<template>
    <div class="view-content-container">
        <PageTitle>{{ t("message.projects") }}</PageTitle>

        <!-- 骨架屏 -->
        <template v-if="loading">
            <div v-for="n in 4" :key="n" class="skeleton-card">
                <SkeletonBlock height="18px" width="60%" />
                <SkeletonBlock height="13px" width="90%" style="margin-top: 8px" />
            </div>
        </template>

        <p v-else-if="projects.length === 0" class="hint">{{ t("message.no_projects") }}</p>

        <ProjectCard
            v-for="p in projects"
            :key="p.id"
            :to="String(p.id)"
            :title="p.name"
            :description="p.description"
            @click="handleProjectClick(p.id)"
        />
    </div>
    <Fab icon="material-symbols-light:add" @click="handleNew" />
</template>

<style scoped>
.view-content-container {
    min-height: 100%;
}

.hint {
    text-align: center;
    color: var(--text-tertiary);
    font-size: 14px;
    margin-top: 4vh;
}

.skeleton-card {
    padding: 2vh 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.skeleton-card + .skeleton-card {
    border-top: 1px solid var(--border-primary);
}
</style>
