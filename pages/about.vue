<template>
  <div class="about-bio">
    <p>
      SE London based Art Director and Production Designer <br />
      <a class="about-link" href="mailto:Lily.purbrick@gmail.com"> Contact </a>
      <br /><NuxtLink
        class="about-link"
        to="https://www.instagram.com/lilypurbrick/?hl=en"
        >Instagram</NuxtLink
      >
    </p>
  </div>
  <div class="site-credit">
    <p>Site by: Dexin Chen and Tyler Owens</p>
  </div>
  <div class="scroll-container">
    <div class="scroll-track" v-if="scrollItems.length">
      <!-- pass 1 -->
      <div
        v-for="(item, index) in scrollItems"
        :key="`a-${item._key || index}`"
        class="scroll-item"
      >
        <template v-if="item.kind === 'video'">
          <video
            :src="item.videoUrl"
            :class="item.layoutOption"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
          />
        </template>
        <template v-else>
          <img :src="item.imageUrl" :class="item.layoutOption" alt="" />
        </template>
      </div>

      <!-- pass 2 -->
      <div
        v-for="(item, index) in scrollItems"
        :key="`b-${item._key || index}`"
        class="scroll-item"
        aria-hidden="true"
      >
        <template v-if="item.kind === 'video'">
          <video
            :src="item.videoUrl"
            :class="item.layoutOption"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
          />
        </template>
        <template v-else>
          <img :src="item.imageUrl" :class="item.layoutOption" alt="" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import client from "~/utils/sanityClient";
import imageUrlBuilder from "@sanity/image-url";
import { computed } from "vue";

definePageMeta({
  hideInfoButton: true,
  hideTime: true,
});

const builder = imageUrlBuilder(client);
const imageUrl = (image) => builder.image(image).fit("crop").url();

const query = `*[_type == "about"][0]{
  media[]{
    _key,
    kind,
    layoutOption,
    videoUrl,
    image{
      asset->{ _id, url },
      crop,
      hotspot
    }
  }
}`;

const { data: about } = await useSanityQuery(query);

const scrollItems = computed(() => {
  const a = about.value;
  if (!a) return [];

  return (a.media || [])
    .filter((m) => m && (m.kind === "image" || m.kind === "video"))
    .map((m) => {
      if (m.kind === "video") {
        return {
          _key: m._key,
          kind: "video",
          videoUrl: m.videoUrl,
          layoutOption: m.layoutOption || "cover",
        };
      }

      return {
        _key: m._key,
        kind: "image",
        imageUrl: imageUrl(m.image),
        layoutOption: m.layoutOption || "cover",
      };
    });
});

const activeProject = inject("activeProject");

onBeforeMount(() => {
  if (activeProject) activeProject.value = "";
});
</script>

<style src="~/assets/css/about.css"></style>
