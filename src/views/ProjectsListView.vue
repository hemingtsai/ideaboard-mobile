<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import ItemCard from "../components/ItemCard.vue";
import PageTitle from "../components/PageTitle.vue";

const { t } = useI18n();
const router = useRouter();

function handleClick() {
    router.push("project/test");
}
</script>

<template>
    <PageTitle>{{ t("message.projects") }}</PageTitle>
    <ItemCard @click="handleClick">
        <template #card-title>Test Project</template>
        <template #card-content>Details for the project</template>
    </ItemCard>
</template>
