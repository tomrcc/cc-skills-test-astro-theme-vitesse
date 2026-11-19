import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import vue from '@astrojs/vue'
import editableRegions from '@cloudcannon/editable-regions/astro-integration'
import { defineConfig } from 'astro/config'
import UnoCSS from 'unocss/astro'

export default defineConfig({
  site: 'https://astro-theme-vitesse.netlify.app/',
  server: {
    port: 1977,
  },
  integrations: [
    editableRegions(),
    mdx(),
    sitemap(),
    UnoCSS({
      injectReset: true,
    }),
    vue({
      template: {
        compilerOptions: { isCustomElement: tag => tag.startsWith('editable-') },
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light-default',
        dark: 'github-dark-default',
      },
      wrap: true,
    },
  },
})
