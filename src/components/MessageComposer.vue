<script setup lang="ts">
import { nextTick, ref } from "vue";
import { useI18n } from "vue-i18n";
import IconButton from "./IconButton.vue";

const { t } = useI18n();

const emit = defineEmits<{
    send: [message: string];
}>();

const message = ref("");
const textareaRef = ref<HTMLTextAreaElement>();

function autoGrow() {
    const el = textareaRef.value;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
}

async function handleSend() {
    const trimmed = message.value.trim();
    if (!trimmed) return;
    emit("send", trimmed);
    message.value = "";
    await nextTick();
    autoGrow();
}
</script>

<template>
    <div class="composer">
        <textarea
            ref="textareaRef"
            v-model="message"
            class="input"
            :placeholder="t('message.composer_placeholder')"
            rows="1"
            @input="autoGrow"
            @keydown.enter.exact.prevent="handleSend"
        />
        <span class="send-btn">
            <IconButton
                icon="material-symbols-light:send"
                :size="36"
                color="#000000"
                textColor="white"
                @click="handleSend"
            />
        </span>
    </div>
</template>

<style scoped>
.composer {
    display: flex;
    align-items: center;
    width: 100%;
    border: 1px solid black;
    background-color: white;
    padding: 8px;
    gap: 8px;
    box-sizing: border-box;
}

.input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 15px;
    color: black;
    resize: none;
    line-height: 1.4;
    padding: 0;
    max-height: 25vh;
    overflow-y: auto;
}

.input::placeholder {
    color: #999;
}

.send-btn {
    align-self: flex-end;
    display: flex;
}
</style>
