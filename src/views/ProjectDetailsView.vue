<script setup lang="ts">
import Fab from "../components/Fab.vue";
import PageTitle from "../components/PageTitle.vue";
import ItemCard from "../components/ItemCard.vue";
import "@fontsource/barlow-condensed";
import WaveDots from "../components/WaveDots.vue";

import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import Heatmap from "../components/Heatmap.vue";
import { ref } from "vue";
import ProgressBar from "../components/ProgressBar.vue";
import TodoItem from "../components/TodoItem.vue";
import TodoList from "../components/TodoList.vue";

const { t } = useI18n();
const router = useRouter();

const heatmap_data = ref<number[][]>([
    [1, 4, 2, 5, 2, 8, 5, 2, 5, 7],
    [3, 9, 3, 5, 0, 1, 4, 2, 2, 10],
    [6, 3, 0, 1, 0, 1, 4, 6, 7, 9],
]);

function handleEdit() {
    router.push("/project/test/edit");
}
</script>

<template>
    <div class="view-content-container">
        <PageTitle>Test Project</PageTitle>

        <div class="cards">
            <ItemCard splited flush rightFull :splitRatio="0.7">
                <template #card-background>
                    <WaveDots
                        :dotSpacing="4"
                        :waveSpeed="0.15"
                        :waveWidth="0.4"
                        :mouseRadius="100"
                        :mouseStrength="0.4"
                        :ambientBrightness="0"
                        :peakBrightness="0.5"
                    />
                </template>
                <template #card-title>{{
                    t("message.project_progress")
                }}</template>
                <template #card-content-left>
                    <div style="padding: 3vw">
                        <div style="height: 2vh" />
                        <Heatmap
                            :data="heatmap_data"
                            style="padding-bottom: 1vh"
                        />
                        <ProgressBar :height="10" :value="86" />
                    </div>
                </template>
                <template #card-content-right
                    ><div class="percents-container">
                        <div class="percents">
                            <span class="percents-number">86%</span>
                        </div>
                    </div></template
                >
            </ItemCard>

            <TodoList>
                <template #title>
                    {{ t("message.todo_list") }}
                </template>
                <TodoItem
                    :key="1"
                    title="I do not know what to do."
                    :done="false"
                />
                <TodoItem
                    :key="1"
                    title="I do not know how to do it."
                    :done="false"
                />
            </TodoList>
        </div>
    </div>

    <Fab
        icon="material-symbols-light:edit-outline-sharp"
        :size="48"
        color="var(--accent)"
        textColor="var(--accent-contrast)"
        @click="handleEdit"
    />
</template>

<style scoped>
.view-content-container {
    min-height: 100%;
}

.cards {
    display: flex;
    flex-direction: column;
    gap: 2vh;
}

.percents-container {
    position: relative;
    background-color: var(--text-primary);
    height: 100%;
    width: 100%;
    clip-path: polygon(50% 0, 100% 0, 100% 100%, 30% 100%, 0 75%);
}

.percents {
    position: absolute;
    bottom: 1vh;
    right: 1vh;
}
.percents-number {
    font-family: "Barlow Condensed";
    color: var(--bg-primary);
    font-size: 10vw;
    transform: scaleX(0.8);
}
</style>
