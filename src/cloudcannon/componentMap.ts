import Contact from '@/components/blocks/Contact.astro'
import Divider from '@/components/blocks/Divider.astro'
import PageHeading from '@/components/blocks/PageHeading.astro'
import ProjectGroup from '@/components/blocks/ProjectGroup.astro'
import RichText from '@/components/blocks/RichText.astro'
import SocialLinks from '@/components/blocks/SocialLinks.astro'

export const astroComponents: Record<string, any> = {
  page_heading: PageHeading,
  rich_text: RichText,
  divider: Divider,
  social_links: SocialLinks,
  contact: Contact,
  project_group: ProjectGroup,
}

export const componentMap: Record<string, any> = { ...astroComponents }
