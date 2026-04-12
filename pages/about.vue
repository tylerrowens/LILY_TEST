<template>
  <div class="about-bio">
    <p>
      SE London based Art Director and <br class="mobile-break" />
      Production Designer <br />
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
      <div
        v-for="(item, index) in scrollItems"
        :key="`a-${item._key || index}`"
        class="scroll-item"
      >
        <template v-if="item.kind === 'video'">
          <div class="vimeo-frame" :class="item.layoutOption">
            <iframe
              :src="vimeoEmbedUrl(item.vimeoId)"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture"
            />
          </div>
        </template>
        <template v-else>
          <img :src="item.imageUrl" :class="item.layoutOption" alt="" />
        </template>
      </div>

      <div
        v-for="(item, index) in scrollItems"
        :key="`b-${item._key || index}`"
        class="scroll-item"
        aria-hidden="true"
      >
        <template v-if="item.kind === 'video'">
          <div class="vimeo-frame" :class="item.layoutOption">
            <iframe
              :src="vimeoEmbedUrl(item.vimeoId)"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture"
            />
          </div>
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

const query = `*[_type == "about"][0]{
  media[]{
    _key,
    kind,
    layoutOption,
    vimeoId,
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
          vimeoId: m.vimeoId,
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
