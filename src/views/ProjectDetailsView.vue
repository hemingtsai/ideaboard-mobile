<script setup lang="ts">
import AIReply from "../components/AIReply.vue";
import IconButton from "../components/IconButton.vue";
import MessageBubble from "../components/MessageBubble.vue";
import PageTitle from "../components/PageTitle.vue";

import { useRouter } from "vue-router";
const router = useRouter();

function handleEdit() {
    router.push("/project/test/edit");
}
</script>

<template>
    <PageTitle>Test Project</PageTitle>
    <MessageBubble>This is a test message</MessageBubble>
    <AIReply
        content="Hello, this is a **Markdown** test with $E=mc^2$.
```js
console.log(test)
```
```mermaid
graph TD
    A[Start] --> B[End]
```
Hello, this is a **Markdown** test with $E=mc^2$.
```js
console.log(test)
```
```mermaid
graph TD
A[Start] --> B[End]
```
Hello, this is a **Markdown** test with $E=mc^2$.
```js
console.log(test)
```
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
</template>

<style scoped>
.fab {
    position: sticky;
    bottom: 2vh;
    align-self: flex-end;
    margin-top: 2vh;
    z-index: 10;
}
</style>
