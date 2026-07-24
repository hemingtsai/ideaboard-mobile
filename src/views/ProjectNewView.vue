<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import HeaderLayout from "../layouts/HeaderLayout.vue";
import ItemCard from "../components/ItemCard.vue";
import Input from "../components/Input.vue";
import Button from "../components/Button.vue";
import { createProject } from "../api/modules/projects";

const router = useRouter();

const projectName = ref("");
const projectDesc = ref("");
const loading = ref(false);
const error = ref("");

async function handleCreate() {
    const name = projectName.value.trim();
    if (!name) return;

    loading.value = true;
    error.value = "";
    try {
        await createProject({ name, description: projectDesc.value.trim() || undefined });
        router.push("/projects");
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "";
        error.value = msg || "创建失败，请重试";
    } finally {
        loading.value = false;
    }
}

function handleCancel() {
    router.back();
}
</script>

<template>
    <HeaderLayout title="新建项目">
        <ItemCard class="info-input">
            <template #card-title>项目信息</template>
            <template #card-content>
                <div class="field">
                    <label class="label">名称</label>
                    <Input v-model="projectName" placeholder="输入项目名称…" />
                </div>
                <div class="field">
                    <label class="label">简介</label>
                    <Input v-model="projectDesc" placeholder="简要描述项目…" />
                </div>
                <p v-if="error" class="error-msg">{{ error }}</p>
            </template>
        </ItemCard>
        <template #footer>
            <div class="actions">
                <Button @click="handleCancel">取消</Button>
                <Button variant="primary" :disabled="loading" @click="handleCreate">
                    {{ loading ? "..." : "创建" }}
                </Button>
            </div>
        </template>
    </HeaderLayout>
</template>

<style scoped>
.info-input {
    margin: 2vh 0 2vh 0;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.5vh;
}

.field + .field {
    margin-top: 1.5vh;
}

.label {
    font-size: 14px;
    color: var(--text-secondary);
}

.actions {
    display: flex;
    gap: 2vh;
}

.actions :deep(.btn) {
    flex: 1;
}

.error-msg {
    color: #e74c3c;
    font-size: 13px;
    margin: 1vh 0 0 0;
}
</style>
