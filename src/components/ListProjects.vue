<script lang="ts" setup>
defineProps<{
  list: {
    text: string
    description?: string
    icon?: string
    href: string
  }[]
}>()

// The editor's re-render resets the link's attributes to this markup, dropping the
// draggable="false" the runtime sets; a draggable link hides the caret in text regions inside it.
const linkDraggable = ENV_CLIENT ? 'false' : undefined
</script>

<template>
  <ul grid="~ cols-1 sm:cols-2 gap-4" data-editable="array" data-prop="projects">
    <template v-if="!list || list.length === 0">
      <div py10 opacity-50 text-lg>
        nothing here yet.
      </div>
    </template>
    <li v-for="project in list" :key="project.text" container-link w-full flex items-center rd-2 data-editable="array-item">
      <a flex items-center target="_blank" :href="project.href" :aria-label="project.text" :draggable="linkDraggable">
        <div ml-2 mr-4 pt-2>
          <i text-4xl inline-block :class="project.icon || 'i-carbon-unknown'" />
        </div>
        <div font-normal lh-tight>
          <div text-lg hover:text-main data-editable="text" data-prop="text">{{ project.text }}</div>
          <div opacity-50 text-sm data-editable="text" data-prop="description">{{ project.description }}</div>
        </div>
      </a>
    </li>
  </ul>
</template>
