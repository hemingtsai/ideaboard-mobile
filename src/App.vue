<script setup lang="ts">
// 字体
import "@fontsource-variable/noto-serif-sc";

import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { ref, watch } from "vue";

import BottomNavigationBar from "./components/BottomNavigationBar.vue";
import BottomNavigationItem from "./components/BottomNavigationItem.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// 定义路由路径到索引的映射
const routeToIndex: Record<string, number> = {
    "/": 0,
    "/projects": 1,
    "/settings": 2,
};

// 当前激活索引（与导航栏 v-model 绑定）
const activedIndex = ref(0);

// 监听路由变化，同步 activeIndex
watch(
    () => route.path,
    (newPath) => {
        const index = routeToIndex[newPath];
        if (index !== undefined) {
            activedIndex.value = index;
        }
    },
    { immediate: true },
);

// 监听 activeIndex 变化（由点击导航栏引起），同步路由
watch(activedIndex, (newIndex) => {
    const targetPath = Object.keys(routeToIndex).find(
        (path) => routeToIndex[path] === newIndex,
    );
    if (targetPath && targetPath !== route.path) {
        router.push(targetPath);
    }
});
</script>

<template>
    <keep-alive>
        <main class="container">
            <RouterView></RouterView>
        </main>
    </keep-alive>
    <nav class="nav">
        <BottomNavigationBar v-model:active="activedIndex">
            <BottomNavigationItem :index="0">
                {{ t("message.home") }}
            </BottomNavigationItem>
            <BottomNavigationItem :index="1">
                {{ t("message.projects") }}
            </BottomNavigationItem>
            <BottomNavigationItem :index="2">
                {{ t("message.settings") }}
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
    padding: env(safe-area-inset-top) 2vh 0 2vh;
}

.nav {
    padding: 0 3vh calc(env(safe-area-inset-bottom) + 2vh) 3vh;
}
</style>
