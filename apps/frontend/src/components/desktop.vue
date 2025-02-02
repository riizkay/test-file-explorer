<script setup lang="ts">
import { Icon } from "@iconify/vue";
import Window from "./window.vue";
import { generateUniqueId } from "@utils";
import Explorer from "./Explorer.vue";
import ShortcutIcon from "./ShortcutIcon.vue";
import { ref, type Component } from "vue";

type Window = {
  id: string;
  title: string;
  component: Component;
  props?: Record<string, any>;
};
const windows = ref<Window[]>([
  {
    id: generateUniqueId(),
    title: "File Explorer",
    component: Explorer,
    props: {
      path: "/",
    },
  },
]);
const shortcutClick = (shortcut: string) => {
  windows.value.push({
    id: generateUniqueId(),
    title: shortcut,
    component: Explorer,
    props: {
      path: "/",
    },
  });
};
const handleClose = (id: string) => {
  const index = windows.value.findIndex((window) => window.id === id);
  if (index !== -1) {
    windows.value.splice(index, 1);
  }
};
</script>

<template>
  <div class="w-screen h-screen flex flex-row items-start flex-wrap relative">
    <ShortcutIcon Name="File Explorer" @click="shortcutClick('File Explorer')" />
    <div v-for="window in windows" :key="window.id">
      <Window :Title="window.title" @close="handleClose(window.id)">
        <component :is="window.component" v-bind="window.props" />
      </Window>
    </div>
    <p class="absolute bottom-0 left-1/2 transform -translate-x-1/2">
      Copyright created by Rizki A.R
    </p>
    <!-- <HelloWorld msg="Vite + Vue" /> -->
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

<script lang="ts">
export default {
  methods: {},
};
</script>
