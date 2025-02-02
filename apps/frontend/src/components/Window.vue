<script setup lang="ts">
defineProps<{
  Title: string;
  onClose?: () => void;
}>();
</script>
<template>
  <div
    v-motion
    :initial="{
      opacity: 0,
      y: 100,
    }"
    :enter="{
      opacity: 1,
      y: 0,
    }"
    class="w-[600px] h-[400px] flex flex-col bg-white shadow-lg rounded-xl overflow-hidden absolute z-[30]"
    :style="{
      left: position.x + 'px',
      top: position.y + 'px',
      width: width + 'px',
      height: height + 'px',
    }"
  >
    <!-- Title Bar yang dapat di-drag -->
    <div
      class="flex items-center justify-between px-4 py-2 bg-gray-800 rounded-t-xl cursor-move"
      @mousedown="startDragging"
      ref="titleBar"
    >
      <div class="flex items-center">
        <Icon icon="material-symbols:folder" class="text-gray-300" />
        <span class="text-white font-medium select-none ml-11">{{ Title }}</span>
      </div>
      <div class="flex gap-2">
        <button @click="$emit('close')" class="p-1.5 hover:bg-red-500 rounded-lg transition-colors">
          <Icon icon="material-symbols:close" class="text-gray-300" />
        </button>
      </div>
    </div>

    <slot></slot>

    <!-- Resize Handles -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- Corners -->
      <div
        class="absolute top-0 left-0 w-3 h-3 cursor-nw-resize pointer-events-auto"
        @mousedown.stop="startResize('nw', $event)"
      ></div>
      <div
        class="absolute top-0 right-0 w-3 h-3 cursor-ne-resize pointer-events-auto"
        @mousedown.stop="startResize('ne', $event)"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize pointer-events-auto"
        @mousedown.stop="startResize('sw', $event)"
      ></div>
      <div
        class="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize pointer-events-auto"
        @mousedown.stop="startResize('se', $event)"
      ></div>

      <!-- Edges -->
      <div
        class="absolute top-0 left-3 right-3 h-2 cursor-n-resize pointer-events-auto"
        @mousedown.stop="startResize('n', $event)"
      ></div>
      <div
        class="absolute bottom-0 left-3 right-3 h-2 cursor-s-resize pointer-events-auto"
        @mousedown.stop="startResize('s', $event)"
      ></div>
      <div
        class="absolute left-0 top-3 bottom-3 w-2 cursor-w-resize pointer-events-auto"
        @mousedown.stop="startResize('w', $event)"
      ></div>
      <div
        class="absolute right-0 top-3 bottom-3 w-2 cursor-e-resize pointer-events-auto"
        @mousedown.stop="startResize('e', $event)"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Icon } from "@iconify/vue";

export default {
  name: "Window",
  components: {
    Icon,
  },
  emits: ["close"],
  data() {
    const maxX = window.innerWidth - 600; // Lebar jendela
    const maxY = window.innerHeight - 400; // Tinggi jendela
    return {
      resizeDirection: "",
      position: {
        x: Math.random() * maxX,
        y: Math.random() * maxY,
      },
      startPosition: {
        x: 0,
        y: 0,
      },
      width: 600,
      height: 400,
      minWidth: 400,
      minHeight: 300,
    };
  },
  methods: {
    startResize(direction: string, event: MouseEvent) {
      if (event.button !== 0) return;

      this.isResizing = true;
      this.resizeDirection = direction;

      const handleMouseMove = (e: MouseEvent) => {
        if (!this.isResizing) return;

        const dx = e.clientX - this.startPosition.x;
        const dy = e.clientY - this.startPosition.y;

        if (direction.includes("e")) {
          this.width = Math.max(this.minWidth, this.width + dx);
        }
        if (direction.includes("w")) {
          const newWidth = Math.max(this.minWidth, this.width - dx);
          if (newWidth !== this.width) {
            this.position.x += this.width - newWidth;
            this.width = newWidth;
          }
        }
        if (direction.includes("s")) {
          this.height = Math.max(this.minHeight, this.height + dy);
        }
        if (direction.includes("n")) {
          const newHeight = Math.max(this.minHeight, this.height - dy);
          if (newHeight !== this.height) {
            this.position.y += this.height - newHeight;
            this.height = newHeight;
          }
        }

        this.startPosition = {
          x: e.clientX,
          y: e.clientY,
        };
      };

      const handleMouseUp = () => {
        this.isResizing = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      this.startPosition = {
        x: event.clientX,
        y: event.clientY,
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },

    startDragging(event: MouseEvent) {
      if (event.button !== 0) return;

      this.isDragging = true;
      this.startPosition = {
        x: event.clientX - this.position.x,
        y: event.clientY - this.position.y,
      };

      document.addEventListener("mousemove", this.onDrag);
      document.addEventListener("mouseup", this.stopDragging);
      document.body.style.userSelect = "none";
    },

    onDrag(event: MouseEvent) {
      if (!this.isDragging) return;

      event.preventDefault();
      const maxX = window.innerWidth - this.$el.offsetWidth;
      const maxY = window.innerHeight - this.$el.offsetHeight;

      this.position = {
        x: Math.min(Math.max(0, event.clientX - this.startPosition.x), maxX),
        y: Math.min(Math.max(0, event.clientY - this.startPosition.y), maxY),
      };
    },

    stopDragging() {
      if (!this.isDragging) return;

      this.isDragging = false;
      document.removeEventListener("mousemove", this.onDrag);
      document.removeEventListener("mouseup", this.stopDragging);
      document.body.style.userSelect = "";
    },

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
  beforeUnmount() {
    document.removeEventListener("mousemove", this.onDrag);
    document.removeEventListener("mouseup", this.stopDragging);
    document.body.style.userSelect = "";
  },
};
</script>
