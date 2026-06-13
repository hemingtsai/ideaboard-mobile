<script setup lang="ts"></script>

<template>
    <div class="message-bubble">
        <span class="message-content"><slot></slot></span>
    </div>
</template>

<style scoped>
.message-bubble {
    width: 100%;
    display: flex;
    justify-content: flex-end;
}
.message-content {
    max-width: 80%;
}
</style>
