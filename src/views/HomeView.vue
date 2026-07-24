<script setup lang="ts">
import { onActivated, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import PageTitle from "../components/PageTitle.vue";
import ProjectCard from "../components/ProjectCard.vue";
import ItemCard from "../components/ItemCard.vue";
import Heatmap from "../components/Heatmap.vue";
import SkeletonBlock from "../components/SkeletonBlock.vue";
import { useI18n } from "vue-i18n";
import { useAuth } from "../stores/auth";
import { getConversationStats } from "../api/modules/users";
import { getProjects } from "../api/modules/projects";
import type { Project } from "../api/types";

const { t } = useI18n();
const router = useRouter();
const { state: authState } = useAuth();

const heatmapData = ref<number[][]>([]);
const recentProjects = ref<Project[]>([]);
const loading = ref(true);

function buildHeatmap(daily: { date: string; count: number }[]): number[][] {
    if (daily.length === 0) return [];
    const sorted = [...daily].sort((a, b) => a.date.localeCompare(b.date));
    const matrix: number[][] = [];
    for (let i = 0; i < sorted.length; i += 7) {
        const week = sorted.slice(i, i + 7).map((d) => d.count);
        while (week.length < 7) week.push(0);
        matrix.push(week);
    }
    return matrix;
}

async function loadData() {
    loading.value = true;
    try {
        const [stats, projectsRes] = await Promise.all([
            getConversationStats(28),
            getProjects({ page_size: 5 }),
        ]);
        heatmapData.value = buildHeatmap(stats.daily_breakdown);
        recentProjects.value = projectsRes.items;
    } catch {
        heatmapData.value = [];
        recentProjects.value = [];
    } finally {
        loading.value = false;
    }
}

function goToProject(id: number) {
    router.push(`/project/${id}`);
}

onMounted(loadData);
onActivated(loadData);
</script>

<template>
    <PageTitle>{{ t("message.ideaboard") }}</PageTitle>

    <div v-if="authState.user" class="greeting">
        {{ t("message.welcome") }}，{{ authState.user.username }}
    </div>

    <!-- 热力图骨架 -->
    <ItemCard v-if="loading" noborder flush>
        <template #card-title>{{ t("message.heatmap") }}</template>
        <template #card-content>
            <div class="skeleton-row">
                <SkeletonBlock v-for="n in 4" :key="n" height="20px" width="100%" />
            </div>
        </template>
    </ItemCard>
    <ItemCard v-else-if="heatmapData.length > 0" noborder flush>
        <template #card-title>{{ t("message.heatmap") }}</template>
        <template #card-content>
            <Heatmap :data="heatmapData" :cellSize="20" />
        </template>
    </ItemCard>

    <!-- 最近项目骨架 -->
    <ItemCard noborder flush>
        <template #card-title>{{ t("message.recent_projects") }}</template>
        <template #card-content>
            <template v-if="loading">
                <div v-for="n in 3" :key="n" class="skeleton-card">
                    <SkeletonBlock height="18px" width="60%" />
                    <SkeletonBlock height="13px" width="90%" style="margin-top: 8px" />
                </div>
            </template>
            <p v-else-if="recentProjects.length === 0" class="hint">
                {{ t("message.no_projects") }}
            </p>
            <ProjectCard
                v-for="p in recentProjects"
                :key="p.id"
                :to="String(p.id)"
                :title="p.name"
                :description="p.description"
                @click="goToProject(p.id)"
            />
        </template>
    </ItemCard>
</template>

<style scoped>
.greeting {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 2vh;
    padding: 0 1vw;
}

.hint {
    text-align: center;
    color: var(--text-tertiary);
    font-size: 14px;
}

.skeleton-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
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
