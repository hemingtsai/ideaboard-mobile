<script setup lang="ts">
import "@fontsource-variable/noto-serif-sc";

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
                <template #label> Home </template>
            </BottomNavigationItem>
            <BottomNavigationItem :index="1">
                <template #label> Projects </template>
            </BottomNavigationItem>
            <BottomNavigationItem :index="2">
                <template #label> Settings </template>
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
