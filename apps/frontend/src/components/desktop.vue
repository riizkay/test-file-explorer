<script setup lang="ts">
import Window from "./window.vue";
import DesignArchitecture from "./modal/DesignArchitecture.vue";
import Specifications from "./modal/Specifications.vue";
import { generateUniqueId } from "@utils/index";
import Explorer from "./Explorer.vue";
import ShortcutIcon from "./ShortcutIcon.vue";
import { ref, type Component } from "vue";
import Core, { URLSource } from "../common/core_client";

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
var modal1 = ref(false);
var modal2 = ref(false);
const handleDesignClick = () => {
  modal1.value = true;
};
const handleSpecificationsClick = () => {
  modal2.value = true;
};



</script>
 
<template>
  <Teleport to="body">

    <DesignArchitecture :show="modal1" @close="modal1 = false" />
    <Specifications :show="modal2" @close="modal2 = false" />

  </Teleport>
  
  <div class="w-screen h-screen flex flex-row items-start flex-wrap relative">
    <ShortcutIcon Name="File Explorer" @click="shortcutClick('File Explorer')" />
    <div v-for="window in windows" :key="window.id">
      <Window :Title="window.title" @close="handleClose(window.id)">
        <component :is="window.component" v-bind="window.props" />
      </Window>
    </div>
    <p class="absolute bottom-0 left-1/2 transform -translate-x-1/2">
      <div class="flex flex-row items-center gap-2">
        <div>
          Copyright created by Rizki A.R
        </div>
        <span>|</span>
        <div>
          <a href="#" 
           @click.prevent="handleDesignClick"
          >
                 
            Design Architecture
          </a>
        </div>
        <span>|</span>
        <div>
          <a href="#" 
           @click.prevent="handleSpecificationsClick"
          >
                 
            Specifications
          </a>
        </div>
       
        
      </div>
 

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
