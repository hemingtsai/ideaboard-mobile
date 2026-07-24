import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router.ts";
import { i18n } from "./i18n.ts";
import { useAuth } from "./stores/auth";
import "./theme.css";
import "./main.css";

const app = createApp(App);
app.use(router).use(i18n).mount("#app");

// 启动时初始化认证状态（检查本地 token 是否有效）
const { initAuth } = useAuth();
initAuth();
