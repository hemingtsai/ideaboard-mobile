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
        <div class="fab">
            <IconButton
                icon="material-symbols-light:edit-outline-sharp"
                :size="48"
                color="#000000"
                textColor="white"
                @click="handleEdit"
            />
        </div>
        <div class="bottom-spacer" />
    </div>
</template>

<style scoped>
.project-details-container {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.fab {
    position: sticky;
    bottom: 2vh;
    align-self: flex-end;
    margin-top: 2vh;
    z-index: 10;
}

.bottom-spacer {
    flex: 1;
    min-height: 8vh;
}
</style>
