<script setup lang="ts">
import { onActivated, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import PageTitle from "../components/PageTitle.vue";
import ItemCard from "../components/ItemCard.vue";
import Button from "../components/Button.vue";
import SkeletonBlock from "../components/SkeletonBlock.vue";
import { useAuth } from "../stores/auth";
import { getUserSettings, updateUserSettings } from "../api/modules/settings";
import type { UserSettings } from "../api/types";

const { t } = useI18n();
const router = useRouter();
const { state: authState, logout } = useAuth();

const settings = ref<UserSettings | null>(null);
const loading = ref(true);

async function loadSettings() {
    loading.value = true;
    try {
        settings.value = await getUserSettings();
    } catch {
        settings.value = null;
    } finally {
        loading.value = false;
    }
}

async function handleToggleTheme() {
    if (!settings.value) return;
    const currentTheme = (settings.value.general?.theme as string) || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    try {
        const updated = await updateUserSettings({ "general.theme": newTheme });
        settings.value = updated;
    } catch {
        // 忽略
    }
}

function handleLogout() {
    logout();
    router.push("/login");
}

onMounted(loadSettings);
onActivated(loadSettings);
</script>

<template>
    <div class="view-content-container">
        <PageTitle>{{ t("message.settings") }}</PageTitle>

        <div class="cards">
            <!-- 账号 -->
            <ItemCard v-if="loading" noborder flush>
                <template #card-title>{{ t("message.account") }}</template>
                <template #card-content>
                    <div class="skeleton-info">
                        <div v-for="n in 3" :key="n" class="skeleton-row">
                            <SkeletonBlock height="14px" width="30%" />
                            <SkeletonBlock height="14px" width="50%" />
                        </div>
                    </div>
                </template>
            </ItemCard>
            <ItemCard v-else-if="authState.user" noborder flush>
                <template #card-title>{{ t("message.account") }}</template>
                <template #card-content>
                    <div class="info-row">
                        <span class="info-label">{{ t("message.username") }}</span>
                        <span class="info-value">{{ authState.user.username }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">{{ t("message.email") }}</span>
                        <span class="info-value">{{ authState.user.email }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">{{ t("message.role") }}</span>
                        <span class="info-value">{{ authState.user.role }}</span>
                    </div>
                </template>
            </ItemCard>

            <!-- 偏好 -->
            <ItemCard v-if="loading" noborder flush>
                <template #card-title>{{ t("message.preferences") }}</template>
                <template #card-content>
                    <SkeletonBlock height="16px" width="100%" />
                </template>
            </ItemCard>
            <ItemCard v-else-if="settings" noborder flush>
                <template #card-title>{{ t("message.preferences") }}</template>
                <template #card-content>
                    <div class="setting-row" @click="handleToggleTheme">
                        <span class="setting-label">{{ t("message.theme") }}</span>
                        <span class="setting-value">
                            {{ settings.general?.theme || "light" }}
                        </span>
                    </div>
                </template>
            </ItemCard>

            <!-- 退出 -->
            <ItemCard noborder flush notitle>
                <template #card-content>
                    <Button @click="handleLogout">{{ t("message.logout") }}</Button>
                </template>
            </ItemCard>
        </div>
    </div>
</template>

<style scoped>
.view-content-container {
    min-height: 100%;
}

.cards {
    display: flex;
    flex-direction: column;
    gap: 2vh;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8vh 0;
}

.info-row + .info-row {
    border-top: 1px solid var(--border-primary);
}

.info-label {
    font-size: 14px;
    color: var(--text-secondary);
}

.info-value {
    font-size: 14px;
    color: var(--text-primary);
}

.setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
}

.setting-label {
    font-size: 14px;
    color: var(--text-primary);
}

.setting-value {
    font-size: 13px;
    color: var(--text-secondary);
}

.skeleton-info {
    display: flex;
    flex-direction: column;
    gap: 1vh;
}

.skeleton-row {
    display: flex;
    justify-content: space-between;
}
</style>
