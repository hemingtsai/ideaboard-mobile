<script setup lang="ts">
import { computed, onActivated, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Fab from "../components/Fab.vue";
import PageTitle from "../components/PageTitle.vue";
import ItemCard from "../components/ItemCard.vue";
import MessageBubble from "../components/MessageBubble.vue";
import MessageComposer from "../components/MessageComposer.vue";
import WaveDots from "../components/WaveDots.vue";
import ProgressBar from "../components/ProgressBar.vue";
import Heatmap from "../components/Heatmap.vue";
import MarkdownRender from "../components/MarkdownRender.vue";
import SkeletonBlock from "../components/SkeletonBlock.vue";
import { useI18n } from "vue-i18n";
import { getProject } from "../api/modules/projects";
import { getConversations, getOverview, sendMessage } from "../api/modules/conversations";
import { getConversationStats } from "../api/modules/users";
import type { Project, ConversationMessage, ProjectOverview } from "../api/types";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const projectId = computed(() => Number(route.params.id));

const project = ref<Project | null>(null);
const overview = ref<ProjectOverview | null>(null);
const messages = ref<ConversationMessage[]>([]);
const heatmapData = ref<number[][]>([]);
const loading = ref(true);
const sending = ref(false);

/** 基于真实数据计算进度百分比 */
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

        const [proj, convs, ov, stats] = await Promise.all([
            getProject(id),
            getConversations(id),
            getOverview(id),
            getConversationStats(21),
        ]);

        project.value = proj;
        overview.value = ov;
        messages.value = [...convs.items].reverse();
        heatmapData.value = buildHeatmap(stats.daily_breakdown);
    } catch {
        project.value = null;
    } finally {
        loading.value = false;
    }
}

async function handleSend(message: string) {
    if (sending.value) return;
    sending.value = true;

    const userMsg: ConversationMessage = {
        id: Date.now(),
        role: "user",
        content: message,
        created_at: new Date().toISOString(),
    };
    messages.value.push(userMsg);

    try {
        const reply = await sendMessage(projectId.value, { message });
        messages.value.push(reply);
        // 发送消息后刷新概览数据
        overview.value = await getOverview(projectId.value);
    } catch (e: unknown) {
        const errMsg: ConversationMessage = {
            id: Date.now(),
            role: "assistant",
            content: e instanceof Error ? e.message : "请求失败，请重试",
            created_at: new Date().toISOString(),
        };
        messages.value.push(errMsg);
    } finally {
        sending.value = false;
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
    <!-- 加载骨架 -->
    <template v-if="loading">
        <div class="skeleton-view">
            <SkeletonBlock height="24px" width="60%" style="margin-bottom: 2vh" />
            <div class="skeleton-progress">
                <SkeletonBlock height="14px" width="40%" style="margin-bottom: 2vh" />
                <div style="padding: 3vw">
                    <SkeletonBlock height="60px" width="100%" style="margin-bottom: 1vh" />
                    <SkeletonBlock height="10px" width="100%" />
                </div>
            </div>
            <div class="skeleton-chat">
                <SkeletonBlock height="14px" width="30%" style="margin-bottom: 2vh" />
                <div class="skeleton-msg right">
                    <SkeletonBlock height="36px" width="70%" />
                </div>
                <div class="skeleton-msg left">
                    <SkeletonBlock height="48px" width="80%" />
                </div>
                <div class="skeleton-msg right">
                    <SkeletonBlock height="24px" width="50%" />
                </div>
            </div>
        </div>
    </template>

    <template v-else-if="project">
        <div class="view-content-container">
            <PageTitle>{{ project.name }}</PageTitle>

            <div class="cards">
                <!-- 进度卡片 -->
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

                <!-- 对话区域 -->
                <div class="conversation-area">
                    <div class="message-list">
                        <div v-if="messages.length === 0" class="empty-chat">
                            {{ t("message.start_conversation") }}
                        </div>
                        <div
                            v-for="msg in messages"
                            :key="msg.id"
                            class="message-row"
                            :class="msg.role"
                        >
                            <MessageBubble v-if="msg.role === 'user'">
                                {{ msg.content }}
                            </MessageBubble>
                            <MarkdownRender v-else :content="msg.content" />
                        </div>
                        <div v-if="sending" class="typing-indicator">
                            <WaveDots
                                :dotSpacing="3"
                                :ambientBrightness="0.3"
                                :peakBrightness="0.6"
                            />
                        </div>
                    </div>
                    <MessageComposer @send="handleSend" />
                </div>
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
    display: flex;
    flex-direction: column;
}

.cards {
    display: flex;
    flex-direction: column;
    gap: 2vh;
    flex: 1;
    min-height: 0;
}

.conversation-area {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
}

.message-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 1vh 0;
}

.message-row {
    padding: 0.5vh 2vw;
}

.message-row.user {
    display: flex;
    justify-content: flex-end;
}

.empty-chat {
    text-align: center;
    color: var(--text-tertiary);
    font-size: 14px;
    padding: 4vh 0;
}

.error-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
    color: var(--text-tertiary);
}

.typing-indicator {
    padding: 1vh 2vw;
    width: 60px;
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

/* 骨架屏 */
.skeleton-view {
    padding: 0 2vw;
}

.skeleton-progress {
    border: 1px solid var(--border-primary);
    padding: 2vh;
    margin-bottom: 2vh;
}

.skeleton-chat {
    border: 1px solid var(--border-primary);
    padding: 2vh;
}

.skeleton-msg {
    margin-bottom: 1.5vh;
    display: flex;
}

.skeleton-msg.right {
    justify-content: flex-end;
}

.skeleton-msg.left {
    justify-content: flex-start;
}
</style>
