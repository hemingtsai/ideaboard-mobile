<script setup lang="ts">
import PageHeader from "../components/PageHeader.vue";
import MessageComposer from "../components/MessageComposer.vue";

function handleSend(message: string) {
    // TODO: 处理发送逻辑
}
</script>

<template>
    <div class="edit-container">
        <PageHeader>编辑项目</PageHeader>
        <div class="edit-content">
            <!-- 编辑内容区域 -->
        </div>
        <MessageComposer @send="handleSend" />
    </div>
</template>

<style scoped>
.edit-container {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.edit-content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
}
</style>
