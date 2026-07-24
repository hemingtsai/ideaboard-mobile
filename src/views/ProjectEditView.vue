<script setup lang="ts">
import { computed, nextTick, onActivated, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import HeaderLayout from "../layouts/HeaderLayout.vue";
import MessageBubble from "../components/MessageBubble.vue";
import MessageComposer from "../components/MessageComposer.vue";
import MarkdownRender from "../components/MarkdownRender.vue";
import SkeletonBlock from "../components/SkeletonBlock.vue";
import { getProject } from "../api/modules/projects";
import { getConversations } from "../api/modules/conversations";
import { agentChatStream } from "../api/modules/agent";
import type { Project, ConversationMessage } from "../api/types";

const { t } = useI18n();
const route = useRoute();

const projectId = computed(() => Number(route.params.id));

const project = ref<Project | null>(null);
const messages = ref<ConversationMessage[]>([]);
const loading = ref(true);
const sending = ref(false);
const streamingContent = ref("");
const scrollContainer = ref<HTMLElement | null>(null);

function scrollToBottom() {
    nextTick(() => {
        const el = scrollContainer.value;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    });
}

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
        scrollToBottom();
    } catch {
        project.value = null;
    } finally {
        loading.value = false;
    }
}

async function handleSend(message: string) {
    if (sending.value) return;
    sending.value = true;

    // 添加用户消息
    const userMsg: ConversationMessage = {
        id: Date.now(),
        role: "user",
        content: message,
        created_at: new Date().toISOString(),
    };
    messages.value.push(userMsg);
    scrollToBottom();

    // 创建流式 assistant 消息占位
    const streamId = Date.now() + 1;
    const assistantMsg: ConversationMessage = {
        id: streamId,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
    };
    messages.value.push(assistantMsg);
    streamingContent.value = "";

    try {
        const response = await agentChatStream(projectId.value, message);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith("data: ")) continue;

                try {
                    const event = JSON.parse(trimmed.slice(6));
                    if (event.type === "text") {
                        streamingContent.value += event.content;
                        assistantMsg.content = streamingContent.value;
                    }
                    // action_proposal 和 done 暂时不需要前端特殊处理
                } catch {
                    // 跳过解析失败的行
                }
            }
        }
    } catch (e: unknown) {
        const errContent = e instanceof Error ? e.message : "请求失败，请重试";
        if (!assistantMsg.content) {
            assistantMsg.content = errContent;
        } else {
            assistantMsg.content += `\n\n> ⚠️ ${errContent}`;
        }
    } finally {
        sending.value = false;
        scrollToBottom();
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
            <div ref="scrollContainer" class="message-list">
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
                <div v-if="sending && !streamingContent" class="typing-indicator">
                    <div class="dot-pulse" />
                </div>
            </div>
        </template>

        <template #footer>
            <MessageComposer @send="handleSend" />
        </template>
    </HeaderLayout>
</template>

<style scoped>
.message-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 1vh 0;
}

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
    padding: 1.5vh 2vw;
    display: flex;
    align-items: center;
}

.dot-pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--text-tertiary);
    animation: pulse 0.8s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
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
