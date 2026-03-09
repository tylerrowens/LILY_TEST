// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['@/assets/css/global.css'],
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  pages: true,
  modules: ['@nuxtjs/sanity', '@nuxt/image'],
  sanity: {
    projectId:'ns5c94gl',
    dataset: 'production',
    useCdn: true,
  }
})