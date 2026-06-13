<script setup lang="ts">
import IconButton from "./IconButton.vue";
import MarkdownRender from "./MarkdownRender.vue";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";

const props = defineProps<{
    /** AI 回复的 Markdown 内容（支持流式增量更新） */
    content: string;
}>();

async function handleCopy() {
    try {
        await writeText(props.content);
    } catch {
        // 剪贴板写入失败时静默处理
    }
}
</script>

<template>
    <div class="ai-reply">
        <div class="reply-content">
            <MarkdownRender :content="content" />
        </div>
        <div class="buttons-bar">
            <IconButton @click="handleCopy" />
        </div>
    </div>
</template>

<style scoped>
.ai-reply {
    width: 100%;
}

.reply-content {
    width: 100%;
}

.buttons-bar {
    width: 100%;
    display: flex;
}
</style>
