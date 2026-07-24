<script setup lang="ts">
import { computed, onActivated, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import HeaderLayout from "../layouts/HeaderLayout.vue";
import MessageBubble from "../components/MessageBubble.vue";
import MessageComposer from "../components/MessageComposer.vue";
import MarkdownRender from "../components/MarkdownRender.vue";
import WaveDots from "../components/WaveDots.vue";
import SkeletonBlock from "../components/SkeletonBlock.vue";
import { getProject } from "../api/modules/projects";
import { getConversations, sendMessage } from "../api/modules/conversations";
import type { Project, ConversationMessage } from "../api/types";

const { t } = useI18n();
const route = useRoute();

const projectId = computed(() => Number(route.params.id));

const project = ref<Project | null>(null);
const messages = ref<ConversationMessage[]>([]);
const loading = ref(true);
const sending = ref(false);

async function loadConversations() {
    loading.value = true;
    try {
        const id = projectId.value;
        if (!id || isNaN(id)) return;

        const [proj, convs] = await Promise.all([
            getProject(id),
            getConversations(id),
        ]);

        project.value = proj;
        messages.value = [...convs.items].reverse();
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

watch(() => route.params.id, () => {
    if (route.params.id) loadConversations();
});

onMounted(loadConversations);
onActivated(loadConversations);
</script>

<template>
    <HeaderLayout :title="project?.name || t('message.conversation')">
        <!-- 加载骨架 -->
        <template v-if="loading">
            <div class="skeleton-chat">
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
        </template>

        <template v-else>
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
        </template>

        <template #footer>
            <MessageComposer @send="handleSend" />
        </template>
    </HeaderLayout>
</template>

<style scoped>
.empty-chat {
    text-align: center;
    color: var(--text-tertiary);
    font-size: 14px;
    padding: 4vh 0;
}

.message-row {
    padding: 0.5vh 2vw;
}

.message-row.user {
    display: flex;
    justify-content: flex-end;
}

.typing-indicator {
    padding: 1vh 2vw;
    width: 60px;
}

/* 骨架屏 */
.skeleton-chat {
    padding: 2vh 2vw;
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
