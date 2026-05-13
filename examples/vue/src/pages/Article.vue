<template>
  <p>Article {{ id }} detail</p>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();
const id = computed(() => route.params.id);
</script>
