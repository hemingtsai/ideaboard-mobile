<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
    defineProps<{
        splited?: boolean;
        flush?: boolean;
        notitle?: boolean;
        rightFull?: boolean;
        leftFull?: boolean;
        /** 左栏宽度比例 (0–1)，默认 0.5 */
        splitRatio?: number;
    }>(),
    {
        splited: false,
        rightFull: false,
        leftFull: false,
        flush: false,
        notitle: false,
        splitRatio: 0.5,
    },
);

const leftStyle = computed(() => ({
    flex: `${props.splitRatio} 1 0`,
}));

const rightStyle = computed(() => ({
    flex: `${1 - props.splitRatio} 1 0`,
}));

const cardClass = computed<Record<string, boolean>>(() => ({
    flush: props.flush,
    splited: props.splited,
    "right-full": props.rightFull,
    "left-full": props.leftFull,
}));
</script>

<template>
    <div class="card" :class="cardClass">
        <div v-if="$slots['card-background']" class="card-bg">
            <slot name="card-background" />
        </div>
        <!-- 分栏模式 -->
        <template v-if="splited">
            <h2 v-if="!notitle && !rightFull && !leftFull">
                <slot name="card-title" />
            </h2>
            <div class="card-columns">
                <div class="card-column" :style="leftStyle">
                    <h2 v-if="!notitle && rightFull">
                        <slot name="card-title" />
                    </h2>
                    <slot name="card-content-left" />
                </div>
                <div class="card-column" :style="rightStyle">
                    <h2 v-if="!notitle && leftFull">
                        <slot name="card-title" />
                    </h2>
                    <slot name="card-content-right" />
                </div>
            </div>
        </template>

        <!-- 默认模式 -->
        <template v-else>
            <h2 v-if="!notitle"><slot name="card-title" /></h2>
            <div class="card-content">
                <slot name="card-content" />
            </div>
        </template>
    </div>
</template>

<style scoped>
.card {
    border: 1px solid var(--border-primary);
    padding: 2vh;
    position: relative;
    overflow: hidden;
}

.card-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
}

h2 {
    margin: 3vw;
    position: relative;
    z-index: 1;
}

.card-content {
    height: 100%;
    font-size: 14px;
    color: var(--text-secondary);
    position: relative;
    z-index: 1;
}

.card-columns {
    display: flex;
    position: relative;
    z-index: 1;
}

.card-column {
    flex: 1;
    min-width: 0;
}

.card.flush {
    padding: 0;
}
</style>
