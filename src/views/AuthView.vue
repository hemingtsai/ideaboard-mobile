<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import Button from "../components/Button.vue";
import Input from "../components/Input.vue";
import PageTitle from "../components/PageTitle.vue";
import { useAuth } from "../stores/auth";

const { t } = useI18n();
const router = useRouter();
const { login, register } = useAuth();

const isLogin = ref(true);
const username = ref("");
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

function toggleMode() {
  isLogin.value = !isLogin.value;
  error.value = "";
}

async function handleSubmit() {
  error.value = "";
  loading.value = true;

  try {
    if (isLogin.value) {
      await login(username.value, password.value);
    } else {
      await register(username.value, email.value, password.value);
    }
    router.push("/");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    error.value =
      msg || (isLogin.value ? t("message.login_failed") : t("message.register_failed"));
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-view">
    <PageTitle>{{ isLogin ? t("message.login") : t("message.register") }}</PageTitle>

    <form class="auth-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label class="form-label">{{ t("message.username") }}</label>
        <Input v-model="username" placeholder="Username" />
      </div>

      <div v-if="!isLogin" class="form-group">
        <label class="form-label">{{ t("message.email") }}</label>
        <Input v-model="email" type="email" placeholder="email@example.com" />
      </div>

      <div class="form-group">
        <label class="form-label">{{ t("message.password") }}</label>
        <Input v-model="password" type="password" placeholder="••••••" />
      </div>

      <p v-if="error" class="error-msg">{{ error }}</p>

      <Button variant="primary" :disabled="loading">
        {{ loading ? "..." : (isLogin ? t("message.login_action") : t("message.register_action")) }}
      </Button>
    </form>

    <p class="toggle-link" @click="toggleMode">
      {{ isLogin ? t("message.no_account") : t("message.has_account") }}
    </p>
  </div>
</template>

<style scoped>
.auth-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8vh 6vw 4vh;
  min-height: 100%;
  box-sizing: border-box;
}

.auth-form {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 2.5vh;
  margin-top: 4vh;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.8vh;
}

.form-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.error-msg {
  color: #e74c3c;
  font-size: 13px;
  margin: 0;
  text-align: center;
}

.toggle-link {
  margin-top: 3vh;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
