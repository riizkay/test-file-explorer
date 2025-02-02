<script setup lang="ts">
import { defineProps } from "vue";

defineProps<{ show: boolean }>();
</script>

<template>
  <div v-if="show" class="modal-backdrop z-[999]">
    <div class="modal z-[1000]">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
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
