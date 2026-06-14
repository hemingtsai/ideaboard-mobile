<script setup lang="ts">
import AIReply from "../components/AIReply.vue";
import Divider from "../components/Divider.vue";
import IconButton from "../components/IconButton.vue";
import MessageBubble from "../components/MessageBubble.vue";
import PageHeader from "../components/PageHeader.vue";

import { useRouter } from "vue-router";
const router = useRouter();

function handleEdit() {
    router.push("/project/test/edit");
}
</script>

<template>
    <div class="project-details-container">
        <PageHeader>Test Project</PageHeader>
        <h1>Test Project</h1>
        <Divider />
        <MessageBubble>This is a test message</MessageBubble>
        <AIReply
            content="Hello, this is a **Markdown** test with $E=mc^2$.

```mermaid
graph TD
    A[Start] --> B[End]
```"
        />
        <IconButton
            icon="material-symbols-light:edit-outline-sharp"
            @click="handleEdit"
        />
    </div>
</template>
