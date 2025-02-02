<script setup lang="ts">
import { Icon } from "@iconify/vue";

defineProps<{ Name: string }>();
</script>

<template>
  <div
    class="flex flex-row items-center gap-2 cursor-pointer text-lg hover:bg-gray-600 rounded-lg p-2"
  >
    <Icon icon="material-symbols:folder" width="48" height="48" class="text-gray-300" />
    <span class="text-gray-300">{{ Name }}</span>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
<script lang="ts">
export default {
  name: "ShortcutIcon",
  components: {
    Icon,
  },
  emits: ["close"],
  data() {
    return {};
  },
  methods: {},
  beforeUnmount() {},
};
</script>
