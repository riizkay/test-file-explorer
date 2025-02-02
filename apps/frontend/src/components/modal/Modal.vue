<script setup lang="ts">
import { defineProps } from "vue";

defineProps<{ show: boolean; width?: string }>();
</script>

<template>
  <div v-if="show" class="modal-backdrop z-[999] w-screen h-screen">
    <div class="modal z-[1000]" :style="{ width: width || 'auto' }">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
}
</style>
