<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import ItemCard from "../components/ItemCard.vue";
import PageTitle from "../components/PageTitle.vue";
import Fab from "../components/Fab.vue";

const { t } = useI18n();
const router = useRouter();

function handleClick() {
    router.push("project/test");
}

function handleNew() {
    router.push("/project/new");
}
</script>

<template>
    <div class="view-content-container">
        <PageTitle>{{ t("message.projects") }}</PageTitle>
        <ItemCard @click="handleClick">
            <template #card-title>Test Project</template>
            <template #card-content>Details for the project</template>
        </ItemCard>
    </div>
    <Fab icon="material-symbols-light:add" @click="handleNew" />
</template>

<style scoped>
.view-content-container {
    min-height: 100%;
}
</style>
