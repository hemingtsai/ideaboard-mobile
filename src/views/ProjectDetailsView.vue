<script setup lang="ts">
import { computed, onActivated, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Fab from "../components/Fab.vue";
import PageTitle from "../components/PageTitle.vue";
import ItemCard from "../components/ItemCard.vue";
import WaveDots from "../components/WaveDots.vue";
import ProgressBar from "../components/ProgressBar.vue";
import Heatmap from "../components/Heatmap.vue";
import TodoItem from "../components/TodoItem.vue";
import TodoList from "../components/TodoList.vue";
import Input from "../components/Input.vue";
import SkeletonBlock from "../components/SkeletonBlock.vue";
import { useI18n } from "vue-i18n";
import { getProject } from "../api/modules/projects";
import { getOverview } from "../api/modules/conversations";
import { getConversationStats } from "../api/modules/users";
import { getTodos, createTodo, updateTodo } from "../api/modules/todos";
import type { Project, ProjectOverview, Todo } from "../api/types";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const projectId = computed(() => Number(route.params.id));

const project = ref<Project | null>(null);
const overview = ref<ProjectOverview | null>(null);
const heatmapData = ref<number[][]>([]);
const todos = ref<Todo[]>([]);
const newTodoTitle = ref("");
const loading = ref(true);

const progressPercent = computed(() => {
    if (!overview.value) return 0;
    const { total, this_month } = overview.value.conversations;
    if (total === 0) return 0;
    const max = Math.max(total, 100);
    return Math.min(100, Math.round((this_month / max) * 100));
});

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

async function loadProject() {
    loading.value = true;
    try {
        const id = projectId.value;
        if (!id || isNaN(id)) return;

        const [proj, ov, stats, todoRes] = await Promise.all([
            getProject(id),
            getOverview(id),
            getConversationStats(21),
            getTodos(id),
        ]);

        project.value = proj;
        overview.value = ov;
        heatmapData.value = buildHeatmap(stats.daily_breakdown);
        todos.value = todoRes.items;
    } catch {
        project.value = null;
    } finally {
        loading.value = false;
    }
}

async function handleToggleTodo(todo: Todo) {
    const newStatus = todo.status === "completed" ? "pending" : "completed";
    try {
        await updateTodo(projectId.value, todo.id, { status: newStatus });
        todo.status = newStatus;
    } catch {
        // 忽略
    }
}

async function handleAddTodo() {
    const title = newTodoTitle.value.trim();
    if (!title) return;
    try {
        const todo = await createTodo(projectId.value, { title });
        todos.value.unshift(todo);
        newTodoTitle.value = "";
    } catch {
        // 忽略
    }
}

function handleEdit() {
    router.push(`/project/${projectId.value}/edit`);
}

watch(() => route.params.id, () => {
    if (route.params.id) loadProject();
});

onMounted(loadProject);
onActivated(loadProject);
</script>

<template>
    <template v-if="loading">
        <div class="skeleton-view">
            <SkeletonBlock height="24px" width="60%" style="margin-bottom: 2vh" />
            <div class="cards">
                <div class="skeleton-progress">
                    <SkeletonBlock height="14px" width="40%" style="margin-bottom: 2vh" />
                    <div style="padding: 3vw">
                        <SkeletonBlock height="60px" width="100%" style="margin-bottom: 1vh" />
                        <SkeletonBlock height="10px" width="100%" />
                    </div>
                </div>
                <div class="skeleton-todo">
                    <SkeletonBlock height="14px" width="30%" style="margin-bottom: 1.5vh" />
                    <SkeletonBlock height="16px" width="100%" style="margin-bottom: 1vh" />
                    <SkeletonBlock height="16px" width="80%" />
                </div>
            </div>
        </div>
    </template>

    <template v-else-if="project">
        <div class="view-content-container">
            <PageTitle>{{ project.name }}</PageTitle>

            <div class="cards">
                <ItemCard splited flush rightFull :splitRatio="0.7">
                    <template #card-background>
                        <WaveDots
                            :dotSpacing="4"
                            :waveSpeed="0.15"
                            :waveWidth="0.4"
                            :mouseRadius="100"
                            :mouseStrength="0.4"
                            :ambientBrightness="0"
                            :peakBrightness="0.5"
                        />
                    </template>
                    <template #card-title>{{ t("message.project_progress") }}</template>
                    <template #card-content-left>
                        <div class="progress-left">
                            <Heatmap
                                v-if="heatmapData.length > 0"
                                :data="heatmapData"
                                style="padding-bottom: 1vh"
                            />
                            <ProgressBar :height="10" :value="progressPercent" />
                        </div>
                    </template>
                    <template #card-content-right>
                        <div class="percents-container">
                            <div class="percents">
                                <span class="percents-number">{{ progressPercent }}%</span>
                            </div>
                        </div>
                    </template>
                </ItemCard>

                <TodoList>
                    <template #title>
                        {{ t("message.todo_list") }}
                    </template>
                    <TodoItem
                        v-for="todo in todos"
                        :key="todo.id"
                        :title="todo.title"
                        :done="todo.status === 'completed'"
                        @toggle="handleToggleTodo(todo)"
                    />
                </TodoList>

                <form class="add-todo" @submit.prevent="handleAddTodo">
                    <Input v-model="newTodoTitle" :placeholder="t('message.todo_placeholder') || '添加待办…'" />
                </form>
            </div>
        </div>

        <Fab
            icon="material-symbols-light:edit-outline-sharp"
            :size="48"
            color="var(--accent)"
            textColor="var(--accent-contrast)"
            @click="handleEdit"
        />
    </template>

    <div v-else class="error-state">
        <p>{{ t("message.project_not_found") }}</p>
    </div>
</template>

<style scoped>
.view-content-container {
    min-height: 100%;
}

.cards {
    display: flex;
    flex-direction: column;
    gap: 2vh;
}

.error-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
    color: var(--text-tertiary);
}

.progress-left {
    padding: 3vw;
    padding-top: 2vh;
}

.percents-container {
    position: relative;
    background-color: var(--text-primary);
    height: 100%;
    width: 100%;
    clip-path: polygon(50% 0, 100% 0, 100% 100%, 30% 100%, 0 75%);
}

.percents {
    position: absolute;
    bottom: 1vh;
    right: 1vh;
}

.percents-number {
    font-family: "Barlow Condensed";
    color: var(--bg-primary);
    font-size: 10vw;
    transform: scaleX(0.8);
}

.add-todo {
    padding: 0;
}

/* 骨架屏 */
.skeleton-view {
    padding: 0 2vw;
}

.skeleton-progress {
    border: 1px solid var(--border-primary);
    padding: 2vh;
    margin-bottom: 2vh;
}

.skeleton-todo {
    border: 1px solid var(--border-primary);
    padding: 2vh;
}
</style>
