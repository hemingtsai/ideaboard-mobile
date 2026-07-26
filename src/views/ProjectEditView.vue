<script setup lang="ts">
import { computed, nextTick, onActivated, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import HeaderLayout from "../layouts/HeaderLayout.vue";
import MessageBubble from "../components/MessageBubble.vue";
import MessageComposer from "../components/MessageComposer.vue";
import MarkdownRender from "../components/MarkdownRender.vue";
import Button from "../components/Button.vue";
import SkeletonBlock from "../components/SkeletonBlock.vue";
import { getProject } from "../api/modules/projects";
import { getConversations } from "../api/modules/conversations";
import { agentChatStream, approveAction } from "../api/modules/agent";
import type { Project, ConversationMessage, AgentActionProposal } from "../api/types";

const { t } = useI18n();
const route = useRoute();

interface ActionCard {
    id: number;
    proposal: AgentActionProposal;
    resolved: boolean;
    resultMessage: string;
}

const projectId = computed(() => Number(route.params.id));

const project = ref<Project | null>(null);
const messages = ref<ConversationMessage[]>([]);
const actionCards = ref<ActionCard[]>([]);
const loading = ref(true);
const sending = ref(false);
const streamingContent = ref("");
const scrollContainer = ref<HTMLElement | null>(null);

function scrollToBottom() {
    nextTick(() => {
        const el = scrollContainer.value;
        if (el) el.scrollTop = el.scrollHeight;
    });
}

async function loadConversations() {
    loading.value = true;
    try {
        const id = projectId.value;
        if (!id || isNaN(id)) return;
        const [proj, convs] = await Promise.all([getProject(id), getConversations(id)]);
        project.value = proj;
        messages.value = [...convs.items].reverse();
        actionCards.value = [];
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

    const userMsg: ConversationMessage = {
        id: Date.now(),
        role: "user",
        content: message,
        created_at: new Date().toISOString(),
    };
    messages.value.push(userMsg);
    scrollToBottom();

    const streamId = Date.now() + 1;
    const assistantMsg: ConversationMessage = {
        id: streamId,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
    };
    messages.value.push(assistantMsg);
    actionCards.value = [];
    streamingContent.value = "";

    try {
        const response = await agentChatStream(projectId.value, message);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

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
                    } else if (event.type === "action_proposal") {
                        const action = event.action as AgentActionProposal;
                        // list_todos 等自动执行的不需要审批
                        if (event.action?.auto_executed) continue;
                        // 审批卡片挂在当前消息下
                        actionCards.value.push({
                            id: streamId,
                            proposal: action,
                            resolved: false,
                            resultMessage: "",
                        });
                    }
                } catch { /* skip */ }
            }
        }
    } catch (e: unknown) {
        const err = e instanceof Error ? e.message : "请求失败，请重试";
        assistantMsg.content = assistantMsg.content || err;
    } finally {
        sending.value = false;
        scrollToBottom();
    }
}

async function handleApprove(card: ActionCard) {
    if (!card.proposal.id) return;
    try {
        await approveAction(projectId.value, card.proposal.id, true);
        card.resolved = true;
        card.resultMessage = t("message.action_approved");
    } catch {
        card.resultMessage = t("message.action_failed") || "操作失败";
    }
}

async function handleReject(card: ActionCard) {
    if (!card.proposal.id) return;
    try {
        await approveAction(projectId.value, card.proposal.id, false);
        card.resolved = true;
        card.resultMessage = t("message.action_rejected");
    } catch {
        card.resultMessage = t("message.action_failed") || "操作失败";
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
                <div class="skeleton-msg right"><SkeletonBlock height="36px" width="70%" /></div>
                <div class="skeleton-msg left"><SkeletonBlock height="48px" width="80%" /></div>
                <div class="skeleton-msg right"><SkeletonBlock height="24px" width="50%" /></div>
            </div>
        </template>

        <template v-else>
            <div ref="scrollContainer" class="message-list">
                <div v-if="messages.length === 0" class="empty-chat">
                    {{ t("message.start_conversation") }}
                </div>
                <template v-for="msg in messages" :key="msg.id">
                    <div class="message-row" :class="msg.role">
                        <MessageBubble v-if="msg.role === 'user'">{{ msg.content }}</MessageBubble>
                        <MarkdownRender v-else-if="msg.content" :content="msg.content" />
                    </div>
                    <!-- 审批卡片 -->
                    <div
                        v-for="card in actionCards.filter(c => c.id === msg.id)"
                        :key="'action-' + card.id + '-' + card.proposal.id"
                        class="action-card"
                    >
                        <div class="action-body">
                            <span class="action-icon">{{ card.proposal.action_type === 'create_todo' ? '📋' : '🔧' }}</span>
                            <span class="action-msg">{{ card.proposal.message }}</span>
                        </div>
                        <div v-if="!card.resolved" class="action-btns">
                            <Button variant="primary" @click="handleApprove(card)">{{ t("message.approve") }}</Button>
                            <Button @click="handleReject(card)">{{ t("message.reject") }}</Button>
                        </div>
                        <div v-else class="action-result">{{ card.resultMessage }}</div>
                    </div>
                </template>
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
    flex: 1; min-height: 0; overflow-y: auto; padding: 1vh 0;
}
.empty-chat {
    text-align: center; color: var(--text-tertiary); font-size: 14px; padding: 4vh 0;
}
.message-row {
    padding: 0.5vh 2vw;
}
.message-row.user {
    display: flex; justify-content: flex-end;
}
.typing-indicator {
    padding: 1.5vh 2vw; display: flex; align-items: center;
}
.dot-pulse {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--text-tertiary); animation: pulse 0.8s ease-in-out infinite;
}
@keyframes pulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
}

/* 审批卡片 */
.action-card {
    margin: 1vh 2vw;
    border: 1px solid var(--border-primary);
    padding: 1.5vh 2vh;
}
.action-body {
    display: flex; align-items: flex-start; gap: 1vw; margin-bottom: 1.5vh;
}
.action-icon {
    font-size: 16px; flex-shrink: 0;
}
.action-msg {
    font-size: 13px; color: var(--text-secondary); line-height: 1.4;
}
.action-btns {
    display: flex; gap: 2vh;
}
.action-btns :deep(.btn) {
    flex: 1;
}
.action-result {
    font-size: 14px; color: var(--text-secondary); text-align: center; padding: 1vh 0;
}

/* 骨架屏 */
.skeleton-chat { padding: 2vh 2vw; }
.skeleton-msg { margin-bottom: 1.5vh; display: flex; }
.skeleton-msg.right { justify-content: flex-end; }
.skeleton-msg.left { justify-content: flex-start; }
</style>
