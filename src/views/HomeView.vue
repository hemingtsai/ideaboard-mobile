<script setup lang="ts">
import { useI18n } from "vue-i18n";
import PageTitle from "../components/PageTitle.vue";

const { t } = useI18n();
</script>

<template>
    <PageTitle>{{ t("message.ideaboard") }}</PageTitle>
</template>
