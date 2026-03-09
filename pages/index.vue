<template>
  <div class="container">
    <template v-if="heroVisible && activeItem?.mediaUrl">
      <img
        v-if="activeItem.mediaType?.toLowerCase?.() === 'image'"
        :key="`image:${activeItem.mediaUrl}`"
        :src="activeItem.mediaUrl"
        :class="activeItem.resolvedLayoutOption"
      />

      <video
        v-else-if="activeItem.mediaType?.toLowerCase?.() === 'video'"
        :key="`video:${activeItem.mediaUrl}`"
        :src="activeItem.mediaUrl"
        :class="[activeItem.resolvedLayoutOption, { 'is-ready': activeReady }]"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
        @loadeddata="onVideoReady"
      />

      <!-- Fallback: if mediaType is missing/odd, still show something -->
      <img
        v-else
        :key="`fallback:${activeItem.mediaUrl}`"
        :src="activeItem.mediaUrl"
        :class="activeItem.resolvedLayoutOption"
      />
    </template>

    <!-- Invisible Click Areas -->
    <div class="click-left" @click="prevImage"></div>
    <div class="click-right" @click="nextImage"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, onMounted } from "vue";
import { useAsyncData } from "#imports";
import { useSanity } from "#imports"; // or from your sanity module composable

definePageMeta({
  hideInfoButton: true,
});

const { client } = useSanity();

const { data } = await useAsyncData("homepageImages", () => {
  const query = /* groq */ `
  *[_type == "homePage"][0]{
    featuredProjects[]->{
      _id,
      title,
      slug,
      "mediaType": select(defined(mainMedia.videoUrl) => "video", "image"),
      "mediaUrl": coalesce(
        mainMedia.image.asset->url,
        mainImage.asset->url,
        mainMedia.videoUrl
      ),
      "resolvedLayoutOption": coalesce(mainMedia.layoutOption, "fullscreen")
    }
  }
`;
  return client.fetch(query);
});

// helper: turn mainMedia into what your template expects
const normalize = (p) => {
  const mm = p?.mainMedia || {};
  return {
    ...p,
    mediaType: mm.mediaType,
    mediaUrl: mm.mediaUrl, // adjust if your URL lives elsewhere
    resolvedLayoutOption: mm.layoutOption || "fullscreen",
  };
};

const posts = computed(() => data.value?.featuredProjects || []);

const currentIndex = ref(0);
const activeItem = computed(() => posts.value[currentIndex.value] || {});

const activeProject = inject("activeProject");

watch(
  activeItem,
  (newItem) => {
    if (activeProject && newItem?.title) activeProject.value = newItem.title;
  },
  { immediate: true }
);

const activeReady = ref(true);

watch(
  activeItem,
  () => {
    activeReady.value = activeItem.value.mediaType === "image";
  },
  { immediate: true }
);

const onVideoReady = () => {
  activeReady.value = true;
};

const nextImage = () => {
  if (!posts.value.length) return;
  currentIndex.value = (currentIndex.value + 1) % posts.value.length;
};

const prevImage = () => {
  if (!posts.value.length) return;
  currentIndex.value =
    currentIndex.value === 0 ? posts.value.length - 1 : currentIndex.value - 1;
};

const heroVisible = ref(false);
onMounted(() => {
  requestAnimationFrame(() => (heroVisible.value = true));
});
</script>

<style src="~/assets/css/index.css"></style>
