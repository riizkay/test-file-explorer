<script setup lang="ts">
import { defineComponent } from "vue";
import Modal from "./Modal.vue";
defineProps<{ show: boolean; onClose: () => void }>();
</script>
<template>
  <Modal :show="show" width="70%">
    <div class="flex flex-col w-[100%]">
      <div class="flex-grow">
        <img src="/scheme.png" alt="Design Architecture" width="100%" height="100%" />
      </div>
      <div class="flex justify-end gap-2 mt-3">
        <v-btn class="bg-blue-500 text-white px-4 py-1.5 rounded-lg" @click="onClose">
          Close
        </v-btn>
      </div>
    </div>
  </Modal>
</template>
