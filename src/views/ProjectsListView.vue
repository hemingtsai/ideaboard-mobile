<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import ItemCard from "../components/ItemCard.vue";

const { t } = useI18n();
const router = useRouter();

function handleClick() {
    router.push("project/test");
}
</script>

<template>
    <h1>{{ t("message.projects") }}</h1>
    <ItemCard @click="handleClick">
        <template #card-title>Test Project</template>
        <template #card-content>Details for the project</template>
    </ItemCard>
</template>
