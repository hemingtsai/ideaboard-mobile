<script setup lang="ts">
// 字体
import "@fontsource-variable/noto-serif-sc";

import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { computed, ref, watch } from "vue";

import BottomNavigationBar from "./components/BottomNavigationBar.vue";
import BottomNavigationItem from "./components/BottomNavigationItem.vue";
import DefaultLayout from "./layouts/DefaultLayout.vue";
import HeaderLayout from "./layouts/HeaderLayout.vue";

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

const layoutMap: Record<string, any> = {
    default: DefaultLayout,
    header: HeaderLayout,
};

const currentLayout = computed(() => {
    const layout = route.meta.layout as string | undefined;
    return layout ? layoutMap[layout] : null;
});

const layoutProps = computed(() => {
    if (route.meta.layout === "header") {
        return { title: route.meta.title as string };
    }
    return {};
});
</script>

<template>
    <main class="container">
        <RouterView v-slot="{ Component, route: r }">
            <transition name="page" mode="out-in">
                <keep-alive>
                    <component
                        :is="currentLayout"
                        v-if="currentLayout"
                        v-bind="layoutProps"
                        :key="'layout-' + r.path"
                    >
                        <component :is="Component" />
                    </component>
                    <component :is="Component" v-else :key="'page-' + r.path" />
                </keep-alive>
            </transition>
        </RouterView>
    </main>
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

html,
body,
#app {
    margin: 0;
    padding: 0;
    background-color: var(--bg-primary);
    color: var(--text-primary);
}

#app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

/* 页面过渡动画 */
.page-enter-active {
    transition:
        opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-leave-active {
    transition:
        opacity 0.12s cubic-bezier(0.4, 0, 1, 1),
        transform 0.12s cubic-bezier(0.4, 0, 1, 1);
}

.page-enter-from {
    opacity: 0;
    transform: translateX(12px);
}

.page-leave-to {
    opacity: 0;
    transform: translateX(-12px);
}
</style>

<style scoped>
.container {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    scrollbar-gutter: stable;
    padding: env(safe-area-inset-top) 0 2vh 0;
    background-color: var(--bg-primary);
}

.nav {
    border-top: 1px solid var(--border-primary);
    padding: 0 3vh calc(env(safe-area-inset-bottom) + 2vh) 3vh;
    background-color: var(--bg-primary);
}
</style>
