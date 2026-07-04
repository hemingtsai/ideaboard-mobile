import { createMemoryHistory, createRouter } from "vue-router";

import HomeView from "./views/HomeView.vue";
import ProjectsListView from "./views/ProjectsListView.vue";
import SettingsView from "./views/SettingsView.vue";
import ProjectDetailsView from "./views/ProjectDetailsView.vue";
import ProjectEditView from "./views/ProjectEditView.vue";
import ProjectNewView from "./views/ProjectNewView.vue";

const routes = [
  { path: "/", component: HomeView, meta: { layout: "default" } },
  {
    path: "/projects",
    component: ProjectsListView,
    meta: { layout: "default" },
  },
  { path: "/settings", component: SettingsView, meta: { layout: "default" } },
  {
    path: "/project/new",
    component: ProjectNewView,
    meta: { layout: "none" },
  },
  {
    path: "/project/:id",
    component: ProjectDetailsView,
    meta: { layout: "header", title: "Test Project" },
  },
  {
    path: "/project/:id/edit",
    component: ProjectEditView,
    meta: { layout: "none" },
  },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
