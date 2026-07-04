<script setup lang="ts">
import { nextTick, ref } from "vue";
import { useI18n } from "vue-i18n";
import IconButton from "./IconButton.vue";
import WaveDots from "./WaveDots.vue";

const { t } = useI18n();

const emit = defineEmits<{
    send: [message: string];
}>();

const message = ref("");
const textareaRef = ref<HTMLTextAreaElement>();
const waveDotsRef = ref<InstanceType<typeof WaveDots>>();
const animating = ref(false);

/** 渐隐/渐显各 0.2s，总动画 0.75s */
const FADE_MS = 200;
const WAVE_MS = 750;

let savedHeight = 0;

let prevHeight = 0;

function autoGrow() {
    const el = textareaRef.value;
    if (!el) return;
    const newH = el.scrollHeight;
    if (newH === prevHeight) return;
    el.style.height = prevHeight + "px";
    el.offsetHeight;
    el.style.height = newH + "px";
    prevHeight = newH;
}

/** 锁定当前高度 + 清空文字 */
function lockAndClear() {
    const el = textareaRef.value;
    if (!el) return;
    savedHeight = el.scrollHeight;
    el.style.height = savedHeight + "px";
    el.offsetHeight;
    message.value = "";
}

/** 平滑收缩到自然高度 */
function shrinkToFit() {
    const el = textareaRef.value;
    if (!el) return;
    el.style.height = "";
    const natural = el.scrollHeight;
    el.style.height = savedHeight + "px";
    el.offsetHeight;
    // 只在收缩时启用 height 过渡
    el.style.transition = "height 0.2s ease";
    el.style.height = natural + "px";
    prevHeight = natural;
    // 过渡完成后移除
    setTimeout(() => {
        el.style.transition = "";
    }, 200);
}

async function handleSend() {
    const trimmed = message.value.trim();
    if (!trimmed || animating.value) return;
    emit("send", trimmed);
    // 开始渐隐文字
    animating.value = true;
    waveDotsRef.value?.triggerWave();
    // 渐隐完成后锁高度 + 清空文本
    setTimeout(() => {
        lockAndClear();
    }, FADE_MS);
    // 渐显开始
    setTimeout(() => {
        animating.value = false;
    }, WAVE_MS - FADE_MS);
    // 动画结束后平滑收缩高度
    setTimeout(async () => {
        await nextTick();
        shrinkToFit();
    }, WAVE_MS);
    await nextTick();
    autoGrow();
}
</script>

<template>
    <div class="composer">
        <div class="composer-bg">
            <WaveDots
                ref="waveDotsRef"
                :playing="false"
                :waveSpeed="1.25"
                :waveWidth="0.5"
                :duration="0.75"
                :peakBrightness="0.45"
                :dotSpacing="3"
                easing
            />
        </div>
        <textarea
            ref="textareaRef"
            v-model="message"
            class="input"
            :class="{ animating }"
            :placeholder="t('message.composer_placeholder')"
            rows="1"
            @input="autoGrow"
            @keydown.enter.exact.prevent="handleSend"
        />
        <span class="send-btn">
            <IconButton
                icon="material-symbols-light:send"
                :size="36"
                color="var(--accent)"
                textColor="var(--accent-contrast)"
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
    border: 1px solid var(--border-primary);
    background-color: var(--bg-primary);
    padding: 8px;
    gap: 8px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
}

.composer-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
}

.input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 15px;
    color: var(--text-primary);
    resize: none;
    line-height: 1.4;
    padding: 0;
    max-height: 25vh;
    overflow-y: auto;
    position: relative;
    z-index: 1;
    transition:
        color 0.2s ease,
        caret-color 0.2s ease;
}

.input::placeholder {
    color: var(--text-tertiary);
    transition: color 0.2s ease;
}

.input.animating {
    color: transparent;
    caret-color: transparent;
}

.input.animating::placeholder {
    color: transparent;
}

.send-btn {
    align-self: flex-end;
    display: flex;
    position: relative;
    z-index: 1;
}
</style>
