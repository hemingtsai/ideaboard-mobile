<script setup lang="ts">
import "@fontsource-variable/noto-serif-sc";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

import BottomNavigationBar from "./components/BottomNavigationBar.vue";
import BottomNavigationItem from "./components/BottomNavigationItem.vue";
</script>

<template>
    <main class="container">
        <RouterView></RouterView>
    </main>
    <nav class="nav">
        <BottomNavigationBar>
            <BottomNavigationItem :index="0">
                <template #label> {{ t("message.home") }} </template>
            </BottomNavigationItem>
            <BottomNavigationItem :index="1">
                <template #label> {{ t("message.projects") }} </template>
            </BottomNavigationItem>
            <BottomNavigationItem :index="2">
                <template #label> {{ t("message.settings") }} </template>
            </BottomNavigationItem>
        </BottomNavigationBar>
    </nav>
</template>

<style>
* {
    font-family: "Noto Serif SC Variable";
}

#app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

html,
body,
#app {
    margin: 0;
    padding: 0;
}
</style>

<style scoped>
.container {
    flex: 1;
    overflow-y: auto;
    padding: 0 2vh 0 2vh;
}

.nav {
    padding: 3vh;
}
</style>
