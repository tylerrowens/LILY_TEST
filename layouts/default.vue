<template>
  <header class="header">
    <div class="name">
      <NuxtLink to="/" class="nav-link">Lily Pubrick</NuxtLink>
    </div>

    <nav class="nav">
      <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
      <NuxtLink to="/about" class="nav-link">Info</NuxtLink>
    </nav>
  </header>

  <slot />

  <footer v-if="!hideFooter" class="footer">
    <div class="projectName">{{ activeProject }}</div>
    <div
      class="more nav-link"
      :style="{ visibility: hideInfoButton ? 'hidden' : 'visible' }"
      @click="toggleInfo"
    >
      <svg
        class="icon"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7 1L7 13M13 7L1 7"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </div>
    <div class="time" :style="{ visibility: hideTime ? 'hidden' : 'visible' }">
      {{ time }}
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted, provide, watch, computed } from "vue";
import { useState } from "#app";
import { useRoute } from "vue-router";

// Grab the current route to access meta values
const route = useRoute();

const hideFooter = useState("hide-footer", () => false);

// === Layout-specific metadata ===
// Controls visibility of footer "+" button
const hideInfoButton = computed(() => route.meta.hideInfoButton);

// Controls visibility of the time display
const hideTime = computed(() => route.meta.hideTime);

// === Global State ===
// Reusable global state for toggling the project info overlay
const showInfo = useState("global-show-info", () => false);

// === Footer Time Clock ===
// Reactive time value
const time = ref("");

// Update `time` every second
const updateTime = () => {
  const now = new Date();
  time.value = now.toLocaleTimeString([], { hour12: false });
};

// Initialize time updates when component mounts
onMounted(() => {
  updateTime(); // Set initial time
  setInterval(updateTime, 1000); // Update every second
});

// === Project Name Injection ===
// `activeProject` will be updated by individual pages and injected here
const activeProject = ref("");
provide("activeProject", activeProject);

// Log changes to the active project for debugging
watch(activeProject, (newTitle) => {
  console.log("Footer Received Project Name:", newTitle);
});

// === Toggle Function ===
// Toggles the info overlay visibility
const toggleInfo = () => {
  console.log("[default.vue] toggling...");
  showInfo.value = !showInfo.value;
  console.log("[default.vue] showInfo is now:", showInfo.value);
};
</script>

<style src="~/assets/css/layout-default.css"></style>
