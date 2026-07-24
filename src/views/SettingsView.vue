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
    <PageTitle>{{ t("message.settings") }}</PageTitle>

    <!-- 账号信息骨架 -->
    <ItemCard v-if="loading" flush>
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
    <ItemCard v-else-if="authState.user" flush>
        <template #card-title>{{ t("message.account") }}</template>
        <template #card-content>
            <div class="user-info">
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
            </div>
        </template>
    </ItemCard>

    <!-- 偏好设置骨架 -->
    <ItemCard v-if="loading" flush>
        <template #card-title>{{ t("message.preferences") }}</template>
        <template #card-content>
            <div class="skeleton-setting">
                <SkeletonBlock height="16px" width="100%" />
            </div>
        </template>
    </ItemCard>
    <ItemCard v-else-if="settings" flush>
        <template #card-title>{{ t("message.preferences") }}</template>
        <template #card-content>
            <div class="setting-row" @click="handleToggleTheme">
                <span>{{ t("message.theme") }}</span>
                <span class="setting-value">
                    {{ settings.general?.theme || "light" }}
                </span>
            </div>
        </template>
    </ItemCard>

    <div class="logout-section">
        <Button @click="handleLogout">{{ t("message.logout") }}</Button>
    </div>
</template>

<style scoped>
.user-info {
    display: flex;
    flex-direction: column;
    gap: 1.2vh;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    padding: 1vh 0;
    cursor: pointer;
    font-size: 14px;
}

.setting-row + .setting-row {
    border-top: 1px solid var(--border-primary);
}

.setting-value {
    color: var(--text-secondary);
    font-size: 13px;
}

.logout-section {
    margin-top: 3vh;
    padding: 0 2vw;
}

.skeleton-info {
    display: flex;
    flex-direction: column;
    gap: 1.2vh;
}

.skeleton-row {
    display: flex;
    justify-content: space-between;
}

.skeleton-setting {
    padding: 1vh 0;
}
</style>
