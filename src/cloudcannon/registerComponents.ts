// Loaded only inside the Visual Editor (see BaseLayout.astro).
import SocialLink from '@/components/SocialLink.astro'
import { registerAstroComponent } from '@cloudcannon/editable-regions/astro'
import { astroComponents } from './componentMap'
// ProjectGroup renders ListProjects.vue, which needs the Vue renderer.
import '@cloudcannon/editable-regions/astro-vue-renderer'

for (const [key, component] of Object.entries(astroComponents))
  registerAstroComponent(key, component)

registerAstroComponent('social_link', SocialLink)
