<script setup lang="ts">
import MessageComposer from "../components/MessageComposer.vue";
import HeaderLayout from "../layouts/HeaderLayout.vue";

function handleSend(_message: string) {
    // TODO: 处理发送逻辑
}
</script>

<template>
    <HeaderLayout title="编辑项目">
        <!-- 编辑内容区域 -->
        <template #footer>
            <MessageComposer @send="handleSend" />
        </template>
    </HeaderLayout>
</template>
