<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<template>
    <h1>{{ t("message.projects") }}</h1>
</template>
