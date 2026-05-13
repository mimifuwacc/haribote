import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { fetchMeta, setMeta } from "haribote/client";
import App from "./App.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: () => import("./pages/Home.vue") },
    { path: "/about", component: () => import("./pages/About.vue") },
    { path: "/articles/:id", component: () => import("./pages/Article.vue") },
  ],
});

router.afterEach((to) => {
  fetchMeta(to.path).then(setMeta);
});

createApp(App).use(router).mount("#root");
