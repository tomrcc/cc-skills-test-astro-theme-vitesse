<script lang="ts" setup>
// Footer links are bound by index: the separators sit between the links in one
// flex row, so there's no element an array region could own.
import siteConfig from '@/site-config'
import { getLinkTarget } from '@/utils/link'
</script>

<template>
  <footer class="w-full mt-18 pt-6 pb-8 max-w-3xl text-sm flex flex-col gap-4 border-main border-t !border-op-50 text-dark dark:text-white">
    <div v-if="siteConfig.footer.navLinks && siteConfig.footer.navLinks.length > 0" class="flex flex-wrap gap-4">
      <template v-for="(link, index) in siteConfig.footer.navLinks" :key="link.text">
        <a
          :aria-label="`${link.text}`" :target="getLinkTarget(link.href)" class="nav-link flex items-center"
          :href="link.href"
        >
          <editable-text :data-prop="`@data[footer].navLinks.${index}.text`">{{ link.text }}</editable-text>
        </a>
        <span v-if="index < siteConfig.footer.navLinks.length - 1" op-70> / </span>
      </template>
    </div>
    <div flex>
      <a nav-link :href="siteConfig.footer.license.href" target="_blank"><editable-text data-prop="@data[footer].license.text">{{ siteConfig.footer.license.text }}</editable-text></a>
      <span op-70>&nbsp;&nbsp;&copy;&nbsp;&nbsp;{{ new Date().getFullYear() }}&nbsp;&nbsp;<editable-text data-prop="@data[site].author">{{ siteConfig.author }}</editable-text>.</span>
    </div>
  </footer>
</template>
