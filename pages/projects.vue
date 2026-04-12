<template>
  <div class="main-child">
    <div class="main-grid-container">
      <NuxtLink
        v-for="(item, index) in filteredImages"
        :key="item.slug.current"
        :to="`/${item.slug.current}`"
        class="media"
        :class="{
          'grid-fade-item': !hasInteracted,
          'grid-fade-ready': gridReady && !hasInteracted,
        }"
        :style="{ '--delay': `${index * 80}ms` }"
        @mouseenter="hoveredIndex = index"
        @mouseleave="hoveredIndex = null"
      >
        <template v-if="item.kind === 'video'">
          <iframe
            :src="vimeoEmbedUrl(item.vimeoId)"
            frameborder="0"
            allow="autoplay; fullscreen"
            loading="lazy"
          />
        </template>

        <template v-else>
          <img :src="item.imageUrl" alt="Post image" />
        </template>

        <span class="img-title">{{ item.title }}</span>
      </NuxtLink>
    </div>
  </div>

  <div class="filter-grid">
    <div
      v-for="cat in categories"
      :key="cat"
      class="category"
      :class="{ active: hasInteracted && activeCategory === cat }"
      @click="handleCategoryClick(cat)"
    >
      {{ cat }}
    </div>
    <div
      class="category"
      :class="{ active: hasInteracted && activeCategory === null }"
      @click="handleCategoryClick(null)"
    >
      all
    </div>
  </div>
</template>

<script setup>
// === Imports ===
import { ref, computed, onMounted, inject, watch } from "vue";
import { useAsyncData } from "#imports";

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

// === Page Meta ===
// Hides footer elements specific to this page
definePageMeta({
  hideInfoButton: true,
  hideTime: true,
});

// === Sanity Image Fetch ===
const { data } = await useAsyncData("postImages", async () => {
  const query = `*[_type == "projectsGrid"][0]{
  items[]->{
    title,
    slug,
    category,
    "kind": coalesce(mainMedia.kind, "image"),
    "imageUrl": coalesce(mainMedia.image.asset->url, mainImage.asset->url),
    "vimeoId": mainMedia.vimeoId
  }
}`;

  const { data: sanityData } = await useSanityQuery(query);

  // sanityData.value is { items: [...] }
  return sanityData.value?.items || [];
});

// === Reactive State ===
const posts = ref(data.value || []);
const hasInteracted = ref(false); // Currently selected category (null = 'all')
const activeCategory = ref(null); // Tracks if user has clicked a filter
const hoveredIndex = ref(null); // Tracks which image is currently hovered
const gridReady = ref(false);
const activeProject = inject("activeProject");

// === Static Category List ===
const categories = ["commercial", "editorial", "music", "film", "personal"];

// === Event Handler ===
// Set the active category and mark interaction
const handleCategoryClick = (cat) => {
  activeCategory.value = cat;
  hasInteracted.value = true;
};

// === Filtered Posts (Reactive) ===
// Filters posts by the selected category
const filteredImages = computed(() => {
  if (!activeCategory.value) return posts.value;
  return posts.value.filter((item) => item.category === activeCategory.value);
});

onMounted(() => {
  if (activeProject) {
    activeProject.value = null;
  }

  requestAnimationFrame(() => {
    gridReady.value = true;
  });
});
</script>

<style src="~/assets/css/grid-image-fetch.css"></style>
