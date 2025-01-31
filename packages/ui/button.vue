<script setup>
defineProps<{ label: string }>();
</script>

<template>
  <button class="px-4 py-2 bg-blue-500 text-white rounded">
    {{ label }}
  </button>
</template>
