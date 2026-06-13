<script setup lang="ts">
import Divider from "../components/Divider.vue";
import MessageBubble from "../components/MessageBubble.vue";
import PageHeader from "../components/PageHeader.vue";
</script>

<template>
    <div class="project-details-container">
        <PageHeader>Test Project</PageHeader>
        <h1>Test Project</h1>
        <Divider />
        <MessageBubble>This is a test message</MessageBubble>
    </div>
</template>
