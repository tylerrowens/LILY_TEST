<template>
  <button
    class="sound-button"
    :class="{ active: !isMuted }"
    v-if="activeSlide?.kind === 'video'"
    type="button"
    @click.stop="toggleSound"
  >
    Sound {{ isMuted ? "Off" : "On" }}
  </button>
  <Transition name="info">
    <div v-if="showInfo" @click="handleOverlayClick" class="project-info">
      <p class="credits">
        <template v-for="(credit, index) in credits" :key="index">
          {{ credit }}<br v-if="index !== credits.length - 1" />
        </template>
      </p>
    </div>
  </Transition>

  <div class="gallery" :class="activeSlide?.layoutOption">
    <template v-if="activeSlide.isNextProjectSlide">
      <div class="next-project-slide typewriter-block">
        <div class="type-line">
          <template
            v-for="(word, wordIndex) in animatedNextTitleWords"
            :key="'next-word-wrap-' + wordIndex"
          >
            <span class="word">
              <span
                v-for="(char, charIndex) in word"
                :key="'next-char-' + wordIndex + '-' + charIndex"
                class="letter"
                :class="{ visible: char.visible }"
              >
                {{ char.char }}
              </span>
            </span>

            <span
              v-if="wordIndex !== animatedNextTitleWords.length - 1"
              class="word-space"
            >
              &nbsp;
            </span>
          </template>
        </div>
      </div>
    </template>

    <template v-else-if="activeSlide.isPrevProjectSlide">
      <div class="prev-project-slide typewriter-block">
        <div class="type-line">
          <template
            v-for="(word, wordIndex) in animatedPrevTitleWords"
            :key="'prev-word-wrap-' + wordIndex"
          >
            <span class="word">
              <span
                v-for="(char, charIndex) in word"
                :key="'prev-char-' + wordIndex + '-' + charIndex"
                class="letter"
                :class="{ visible: char.visible }"
              >
                {{ char.char }}
              </span>
            </span>

            <span
              v-if="wordIndex !== animatedPrevTitleWords.length - 1"
              class="word-space"
            >
              &nbsp;
            </span>
          </template>
        </div>
      </div>
    </template>

    <template v-else-if="activeSlide.kind === 'video'">
      <iframe
        :key="`video-${activeSlide.vimeoId}`"
        ref="vimeoIframe"
        :src="vimeoEmbedUrl(activeSlide.vimeoId)"
        frameborder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen
      />
    </template>

    <template v-else>
      <img
        :key="`image-${imageUrl(activeSlide.image)}`"
        :src="imageUrl(activeSlide.image)"
      />
    </template>

    <div class="click-left" @click="prevImage"></div>
    <div class="click-right" @click="nextImage"></div>
  </div>

  <div
    v-if="
      showThumbnails &&
      !activeSlide?.isNextProjectSlide &&
      !activeSlide?.isPrevProjectSlide
    "
    class="thumbnailContainer"
  >
    <div
      v-for="(item, index) in posts"
      :key="item._key || index"
      class="thumbnail"
      :class="{
        'thumb-fade-item': true,
        'thumb-fade-ready': thumbnailsReady,
        active: index === currentIndex - 1,
      }"
      :style="{ '--thumb-delay': `${index * 60}ms` }"
      @click="currentIndex = index + 1"
    >
      <template v-if="item.kind === 'video'">
        <img :src="vimeoThumbnail(item.vimeoId)" alt="" />
      </template>

      <template v-else>
        <img :src="imageUrl(item.image)" />
      </template>
    </div>
  </div>
</template>

<script setup>
// 🔴 ACCEPT PROPS INSTEAD OF FETCHING
const props = defineProps({
  title: String,
  projectMedia: {
    type: Array,
    default: () => [],
  },
  credits: {
    type: Array,
    default: () => [],
  },
});

// === Imports ===
import {
  ref,
  computed,
  onMounted,
  inject,
  watch,
  nextTick,
  onBeforeUnmount,
} from "vue";
import { useState } from "#app";
import { useRouter, useRoute } from "vue-router";
import client from "~/utils/sanityClient";
import imageUrlBuilder from "@sanity/image-url";
import { ref as vueRef } from "vue";
import { gsap } from "gsap";
import Player from "@vimeo/player";

const builder = imageUrlBuilder(client);

const imageUrl = (image) => builder.image(image).fit("crop").url();

const vimeoEmbedUrl = (id, muted = true) => {
  const params = new URLSearchParams({
    autoplay: "1",
    loop: "1",
    muted: muted ? "1" : "0",
    background: "1",
    title: "0",
    byline: "0",
    portrait: "0",
    controls: "0",
    dnt: "1",
  });

  return `https://player.vimeo.com/video/${id}?${params.toString()}`;
};

const vimeoThumbnail = (id) => `https://vumbnail.com/${id}.jpg`;

const router = useRouter();
const projects = ref([]);
const route = useRoute();
const animatedNextTitleWords = vueRef([]);
const animatedPrevTitleWords = vueRef([]);
const thumbnailsReady = ref(false);

const hideFooter = useState("hide-footer", () => false);

const vimeoIframe = ref(null);
const isMuted = ref(true);
let vimeoPlayer = null;

watch(
  () => route.fullPath,
  () => {
    showInfo.value = false; // close overlay on any navigation
  }
);

onBeforeUnmount(() => {
  hideFooter.value = false;
});

const typeWriterWords = (text, targetRef, delay = 0, speed = 50) => {
  const words = text.split(" ");

  targetRef.value = words.map((word) =>
    word.split("").map((char) => ({
      char,
      visible: false,
    }))
  );

  let charCount = 0;

  targetRef.value.forEach((word) => {
    word.forEach((charObj) => {
      setTimeout(() => {
        charObj.visible = true;
      }, delay * 1000 + charCount * speed);

      charCount++;
    });
  });
};

const handleKeydown = (event) => {
  const tag = event.target?.tagName;

  if (tag === "INPUT" || tag === "TEXTAREA") return;

  if (event.key === "ArrowDown") {
    nextImage();
  }

  if (event.key === "ArrowUp") {
    prevImage();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});

const extendedSlides = computed(() => [
  { isPrevProjectSlide: true }, // Add at the start
  ...posts.value, // All project images
  { isNextProjectSlide: true }, // Add at the end
]);

// === Global State ===
// Show/hide overlay info panel (toggled from footer '+' button)
const showInfo = useState("global-show-info");

// Handle click to close info overlay
const handleOverlayClick = () => {
  showInfo.value = false;
};

// Reactive array of image URLs
const posts = computed(() => props.projectMedia || []);

const currentIndex = ref(0); // Index of currently visible image

const showThumbnails = ref(true); // Responsive thumbnail visibility

// Computed: current image object
const activeSlide = computed(() => extendedSlides.value[currentIndex.value]);

watch(activeSlide, (newSlide) => {
  if (newSlide.isNextProjectSlide && nextProject.value?.title) {
    typeWriterWords(nextProject.value.title, animatedNextTitleWords);
  }

  if (newSlide.isPrevProjectSlide && prevProject.value?.title) {
    typeWriterWords(prevProject.value.title, animatedPrevTitleWords);
  }
});

watch(
  activeSlide,
  (slide) => {
    hideFooter.value = !!(
      slide?.isNextProjectSlide || slide?.isPrevProjectSlide
    );
  },
  { immediate: true }
);

watch(
  () => posts.value.length,
  (len) => {
    if (len > 0) {
      currentIndex.value = 1; // first real media item (because index 0 is prev slide)
    } else {
      currentIndex.value = 0;
    }
  },
  { immediate: true }
);

watch(
  () => props.projectMedia,
  (val) => console.log("projectMedia:", val),
  { immediate: true }
);

// Carousel navigation
const nextImage = () => {
  if (currentIndex.value < extendedSlides.value.length - 1) {
    currentIndex.value += 1;
  } else {
    if (nextProject.value?.slug?.current) {
      router.push({
        path: `/${nextProject.value.slug.current}`,
        query: { fromNext: "true" },
      });
    } else {
      console.log("No next project to navigate to");
    }
  }
};

const nextProject = computed(() => {
  const currentSlug = route.params.slug;
  const currentProjectIndex = projects.value.findIndex(
    (p) => p.slug.current === currentSlug
  );

  if (currentProjectIndex === -1 || projects.value.length === 0) {
    return null;
  }

  return projects.value[(currentProjectIndex + 1) % projects.value.length];
});

const { data: allProjects } = await useAsyncData("allProjects", async () => {
  const query = `*[_type == "projectsGrid"][0]{
    items[]->{
      title,
      slug
    }
  }`;

  const { data } = await useSanityQuery(query);
  return data.value?.items || [];
});

projects.value = allProjects.value || [];

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value -= 1;
  } else {
    if (prevProject.value?.slug?.current) {
      router.push({
        path: `/${prevProject.value.slug.current}`,
        query: { fromPrev: "true" },
      });
    } else {
      console.log("No previous project to navigate to");
    }
  }
};

async function toggleSound() {
  isMuted.value = !isMuted.value;

  if (!vimeoPlayer) return;

  try {
    await vimeoPlayer.setMuted(isMuted.value);

    if (!isMuted.value) {
      await vimeoPlayer.setVolume(1);
    }
  } catch (error) {
    console.error("Failed to toggle Vimeo sound:", error);
  }
}

const prevProject = computed(() => {
  const currentSlug = route.params.slug;
  const currentIndex = projects.value.findIndex(
    (p) => p.slug.current === currentSlug
  );

  if (currentIndex > 0) {
    return projects.value[currentIndex - 1];
  }
  return null;
});

// === Inject Project Title for Footer ===
const activeProject = inject("activeProject");

// === onMounted: Initialization ===
onMounted(() => {
  if (activeProject && props.title) {
    activeProject.value = props.title;
  }

  requestAnimationFrame(() => {
    thumbnailsReady.value = true;
  });

  // Handle thumbnail responsiveness
  const mediaQuery = window.matchMedia("(min-width: 1180px)");
  showThumbnails.value = mediaQuery.matches;
  mediaQuery.addEventListener("change", (e) => {
    showThumbnails.value = e.matches;
  });

  // 👇 NEW: Set starting slide based on query
  if (route.query.fromNext === "true") {
    currentIndex.value = 1; // First image
  } else if (route.query.fromPrev === "true") {
    currentIndex.value = posts.value.length; // Last image (after prev slide offset)
  } else {
    currentIndex.value = 1; // Default to first image
  }
});

watch(
  () => activeSlide.value,
  async (slide) => {
    if (vimeoPlayer) {
      vimeoPlayer.destroy();
      vimeoPlayer = null;
    }

    if (slide?.kind !== "video") return;

    await nextTick();

    if (!vimeoIframe.value) return;

    vimeoPlayer = new Player(vimeoIframe.value);

    try {
      await vimeoPlayer.setMuted(isMuted.value);
      await vimeoPlayer.play();
    } catch (error) {
      console.error("Failed to initialize Vimeo player:", error);
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (vimeoPlayer) {
    vimeoPlayer.destroy();
    vimeoPlayer = null;
  }
});
</script>

<style src="~/assets/css/project-page.css"></style>
