<template>
  <ProjectLayout
    v-if="project"
    :title="project.title"
    :projectMedia="projectMedia"
    :credits="project.credits"
  />
</template>

<script setup>
import ProjectLayout from "~/components/ProjectLayout.vue";
import { useRoute } from "vue-router";
import { computed } from "vue";

const projectMedia = computed(() => {
  const p = project.value;
  if (!p) return [];
  return p.media?.length ? p.media : p.images || [];
});

// === Page Meta ===
// Hide the time display in the layout footer for this project page
definePageMeta({
  hideTime: true,
});

// Get the slug from the route
const route = useRoute();

// Fetch the project data by slug
const { data: project } = await useAsyncData("project", async () => {
  const query = `*[_type == "project" && slug.current == $slug][0]{
  title,
  credits[],
    media[]{
    kind,
    layoutOption,
    videoUrl,
    image{
      asset->{ _id, url },
      crop,
      hotspot
    }
  },
  images[]{
    layoutOption,
    image{
      asset->{
      _id,
        url
      },
      crop,
      hotspot
    }
  }
}`;

  const projectMedia = computed(() => {
    const p = project.value;
    if (!p) return [];
    return p.media?.length ? p.media : p.images || [];
  });

  const { data } = await useSanityQuery(query, { slug: route.params.slug });
  return data.value;
});
</script>
