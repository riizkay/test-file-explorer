<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { ref } from "vue";

defineProps<{ path: string }>();

const count = ref(0);
</script>

<template>
  <div>
    <!-- Navbar -->
    <div class="flex gap-2 p-4 bg-gray-50 border-b">
      <div class="flex gap-1.5">
        <button
          class="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-colors"
          @click="goBack"
        >
          <Icon icon="material-symbols:arrow-back" class="text-gray-600" />
        </button>
        <button
          class="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-colors"
          @click="goForward"
        >
          <Icon icon="material-symbols:arrow-forward" class="text-gray-600" />
        </button>
        <button
          class="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-colors"
          @click="goUp"
        >
          <Icon icon="material-symbols:arrow-upward" class="text-gray-600" />
        </button>
      </div>
      <div class="flex-grow">
        <input
          type="text"
          v-model="currentPath"
          @keyup.enter="navigateTo"
          class="w-full px-4 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex flex-grow">
      <!-- Sidebar -->
      <div class="w-56 bg-gray-50 p-4">
        <div class="space-y-1">
          <div
            v-for="(item, index) in sidebarItems"
            :key="index"
            class="p-3 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors flex items-center"
            @click="selectFolder(item)"
          >
            <Icon :icon="item.icon" class="mr-3 text-gray-500" />
            <span class="text-gray-700">{{ item.name }}</span>
          </div>
        </div>
      </div>

      <!-- File List -->
      <div class="flex-grow flex flex-col bg-white">
        <div class="flex bg-gray-50 px-6 py-3">
          <div class="w-2/5 font-medium text-gray-600">Name</div>
          <div class="w-1/5 font-medium text-gray-600">Date modified</div>
          <div class="w-1/5 font-medium text-gray-600">Type</div>
          <div class="w-1/5 font-medium text-gray-600">Size</div>
        </div>
        <div class="flex-grow overflow-y-auto">
          <div
            v-for="(file, index) in files"
            :key="index"
            class="flex px-6 py-3 cursor-pointer hover:bg-blue-50 transition-colors rounded-lg mx-2 my-1"
            :class="{ 'bg-blue-50': selectedFile === file }"
            @click="selectFile(file)"
          >
            <div class="w-2/5 flex items-center">
              <Icon :icon="file.icon" class="mr-3 text-gray-500" />
              <span class="text-gray-700">{{ file.name }}</span>
            </div>
            <div class="w-1/5 text-gray-600">{{ file.dateModified }}</div>
            <div class="w-1/5 text-gray-600">{{ file.type }}</div>
            <div class="w-1/5 text-gray-600">{{ file.size }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
<script lang="ts">
export default {
  name: "Window",
  components: {
    Icon,
  },
  emits: ["close"],
  data() {
    return {
      currentPath: "C:\\",
      selectedFile: null,
      isDragging: false,
      isResizing: false,
      resizeDirection: "",
      position: {
        x: 100,
        y: 100,
      },
      startPosition: {
        x: 0,
        y: 0,
      },
      width: 600,
      height: 400,
      minWidth: 400,
      minHeight: 300,
      sidebarItems: [
        { name: "Desktop", icon: "material-symbols:desktop-windows" },
        { name: "Documents", icon: "material-symbols:folder" },
        { name: "Downloads", icon: "material-symbols:download" },
        { name: "Pictures", icon: "material-symbols:image" },
        { name: "Music", icon: "material-symbols:music-note" },
        { name: "Videos", icon: "material-symbols:video-library" },
      ],
      files: [
        {
          name: "Document.txt",
          dateModified: "2023-12-25 10:30",
          type: "Text Document",
          size: "1 KB",
          icon: "material-symbols:description",
        },
        {
          name: "Images",
          dateModified: "2023-12-24 15:45",
          type: "File folder",
          size: "",
          icon: "material-symbols:folder",
        },
        {
          name: "Project.pdf",
          dateModified: "2023-12-23 09:15",
          type: "PDF Document",
          size: "2.5 MB",
          icon: "material-symbols:picture-as-pdf",
        },
        {
          name: "Presentation.pptx",
          dateModified: "2023-12-22 14:20",
          type: "PowerPoint Presentation",
          size: "5.8 MB",
          icon: "material-symbols:presentation",
        },
      ],
    };
  },
  methods: {
    goBack() {
      // Implementasi navigasi ke belakang
    },
    goForward() {
      // Implementasi navigasi ke depan
    },
    goUp() {
      // Implementasi navigasi ke atas
    },
    navigateTo() {
      // Implementasi navigasi ke path tertentu
    },
    selectFolder(folder: any) {
      // Implementasi pemilihan folder
    },
    selectFile(file: any) {
      this.selectedFile = file;
    },
  },
  beforeUnmount() {},
};
</script>
