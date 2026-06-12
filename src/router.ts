import { createMemoryHistory, createRouter } from "vue-router";

import HomeView from "./views/HomeView.vue";
import ProjectsListView from "./views/ProjectsListView.vue";
import SettingsView from "./views/SettingsView.vue";
import ProjectDetailsView from "./views/ProjectDetailsView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/projects", component: ProjectsListView },
  { path: "/settings", component: SettingsView },
  { path: "/projects/:id", component: ProjectDetailsView },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
