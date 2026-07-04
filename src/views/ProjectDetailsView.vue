<script setup lang="ts">
import IconButton from "../components/IconButton.vue";
import PageTitle from "../components/PageTitle.vue";
import ItemCard from "../components/ItemCard.vue";
import "@fontsource/barlow-condensed";
import WaveDots from "../components/WaveDots.vue";

import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import Heatmap from "../components/Heatmap.vue";
import { ref } from "vue";
import ProgressBar from "../components/ProgressBar.vue";

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
    <PageTitle>Test Project</PageTitle>

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
        <template #card-title>{{ t("message.project_progress") }}</template>
        <template #card-content-left>
            <div style="padding: 3vw">
                <div style="height: 2vh" />
                <Heatmap :data="heatmap_data" style="padding-bottom: 1vh" />
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

    <div class="fab">
        <IconButton
            icon="material-symbols-light:edit-outline-sharp"
            :size="48"
            color="var(--accent)"
            textColor="var(--accent-contrast)"
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
