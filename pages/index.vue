<template>
  <div class="container">
    <template
      v-if="heroVisible && (activeItem?.mediaUrl || activeItem?.vimeoId)"
    >
      <img
        v-if="activeItem.mediaType?.toLowerCase?.() === 'image'"
        :key="`image:${activeItem.mediaUrl}`"
        :src="activeItem.mediaUrl"
        :class="activeItem.resolvedLayoutOption"
      />

      <iframe
        v-else-if="activeItem.mediaType?.toLowerCase?.() === 'video'"
        :key="`video:${activeItem.vimeoId}`"
        :src="vimeoEmbedUrl(activeItem.vimeoId)"
        :class="[activeItem.resolvedLayoutOption, { 'is-ready': activeReady }]"
        frameborder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        loading="lazy"
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

const vimeoEmbedUrl = (id) => {
  const params = new URLSearchParams({
    background: "1",
    autopause: "0",
    byline: "0",
    title: "0",
    portrait: "0",
    muted: "1",
    loop: "1",
    autoplay: "1",
    dnt: "1",
  });

  return `https://player.vimeo.com/video/${id}?${params.toString()}`;
};

const { client } = useSanity();

const { data } = await useAsyncData("homepageImages", () => {
  const query = /* groq */ `
*[_type == "homePage"][0]{
  featuredProjects[]->{
    _id,
    title,
    slug,
    "mediaType": select(defined(mainMedia.vimeoId) => "video", "image"),
    "mediaUrl": coalesce(
      mainMedia.image.asset->url,
      mainImage.asset->url
    ),
    "vimeoId": mainMedia.vimeoId,
    "resolvedLayoutOption": coalesce(mainMedia.layoutOption, "fullscreen")
  }
}
`;
  return client.fetch(query);
});

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
    activeReady.value = true;
  },
  { immediate: true }
);

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
