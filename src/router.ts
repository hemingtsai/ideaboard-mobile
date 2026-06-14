import { createMemoryHistory, createRouter } from "vue-router";

import HomeView from "./views/HomeView.vue";
import ProjectsListView from "./views/ProjectsListView.vue";
import SettingsView from "./views/SettingsView.vue";
import ProjectDetailsView from "./views/ProjectDetailsView.vue";
import ProjectEditView from "./views/ProjectEditView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/projects", component: ProjectsListView },
  { path: "/settings", component: SettingsView },
  { path: "/project/:id", component: ProjectDetailsView },
  { path: "/project/:id/edit", component: ProjectEditView },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
