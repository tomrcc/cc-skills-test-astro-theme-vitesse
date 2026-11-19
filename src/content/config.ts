import { defineCollection, z } from 'astro:content'

// CloudCannon writes null for cleared inputs, so optional fields are nullish.
const image = z
  .object({
    src: z.string().nullish(),
    alt: z.string().nullish(),
  })
  .nullish()

const project = z.object({
  text: z.string().nullish(),
  description: z.string().nullish(),
  icon: z.string().nullish(),
  href: z.string().nullish(),
})

const contentBlock = z.discriminatedUnion('_type', [
  z.object({ _type: z.literal('page_heading'), text: z.string().nullish() }),
  z.object({ _type: z.literal('rich_text'), content: z.string().nullish() }),
  z.object({ _type: z.literal('divider') }),
  z.object({ _type: z.literal('social_links'), heading: z.string().nullish() }),
  z.object({ _type: z.literal('contact'), text: z.string().nullish() }),
  z.object({
    _type: z.literal('project_group'),
    title: z.string().nullish(),
    projects: z.array(project).nullish(),
  }),
])

const pageBuilderPage = z.object({
  title: z.string(),
  description: z.string().nullish(),
  content_blocks: z.array(contentBlock),
})

const defaultPage = z.object({
  title: z.string(),
  description: z.string().nullish(),
  image,
})

const pages = defineCollection({
  schema: z.union([pageBuilderPage, defaultPage]),
})

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().nullish(),
    duration: z.string().nullish(),
    image,
    date: z
      .string()
      .or(z.date())
      .transform((val: string | number | Date) => new Date(val).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })),
    draft: z.boolean().default(false).optional(),
    lang: z.string().nullish().transform(val => val || 'en-US'),
    tag: z.string().nullish(),
    redirect: z.string().nullish(),
    video: z.boolean().default(false).optional(),
  }),
})

export const collections = { pages, blog }
