# Phase 3 — Content

Input: `audit.md`, `configuration.md`. User answers: none; recommended defaults taken.

## Checklist

Shared (`migrate-to-cloudcannon/content.md`):

- [x] Parity baseline built from the working tree before the first edit (gitignored, deleted at the end)
- [x] Front matter: every schema key in every file (16 posts, 2 default pages, 2 page-builder pages)
- [x] Defaults written into files: `lang: en-US`, `video: false`, `draft: false` on posts
- [x] `draft: false` on published posts; post add options already open in the content editor
- [x] Dates: one format (`YYYY-MM-DD`) across `blog`; left as dates with no time (Zod formats them)
- [x] Image paths: `public/` paths (`/hero.jpg`); no `src/assets/` images
- [x] Field naming matches component props (`text`, `href`, `icon`, `header`, `description`); no reserved keys
- [x] Mixed-type fields: none
- [x] String references: none
- [x] Markdown bodies: no components, shortcodes or inline HTML needing snippets; no body components moved
- [x] Styled HTML in front matter: home prose is a markdown `rich_text` block with no attributed HTML (see Decisions)
- [x] Page-builder content: every block carries every key in its structure `value` (scripted cross-check, both files)
- [x] Resolved defaults: no block component defaults a prop the original page relied on
- [x] YAML quoting: markdown in a `|-` block; no `{"` artifacts
- [x] Null values: block and page fields are `.nullish()`; templates guard on truthiness
- [x] One field per visual slot: home `description` is the page's own; `site.json` `description` feeds RSS only
- [x] API-driven content: none
- [x] Settings in code → data files: `site`, `navigation`, `social`, `footer`, `icons` JSON in `src/data/`
- [x] Data files: valid JSON, ≤ 2 levels deep, `social.json` and `icons.json` top-level arrays, consistent shapes

Astro (`migrate-to-cloudcannon/astro/content.md`, `astro/page-building.md`):

- [x] Zod: `pages` is a `z.union` (page builder first, then default); `content_blocks` a `z.discriminatedUnion('_type', …)` over the six types
- [x] Home is `src/content/pages/index.md`; `getStaticPaths` maps slug `index` to `/`
- [x] Catch-all `src/pages/[...slug].astro` renders every `pages` entry; page builder when `content_blocks` is present, markdown otherwise
- [x] `BlockRenderer.astro` dispatches on `_type` through `src/cloudcannon/componentMap.ts`
- [x] No layout-slot overrides to convert
- [x] JSON imports: `site-config.ts` keeps its export shape; no `astro check` in the build, so no casts needed

Addendum:

- [x] Field completeness on every block
- [x] Unpassed fields hold resolved defaults or empty values
- [x] No block-level HTML in non-markdown strings
- [x] Arrays in structure-value files link to `_structures` (`project_group.projects` → `_structures.projects`)
- [x] Visible values in data-file consumers live in the data files (footer licence moved into `footer.json`)
- [x] New files match the config: `index.md` → `/`, `projects.md` → `/projects/` (built); every `_inputs` key names a field in `src/data/*.json`
- [x] This note records every structural change

## Structural changes

- Created `src/data/site.json`, `navigation.json`, `social.json`, `footer.json`, `icons.json`, with the shapes `configuration.md` gave. `site-config.ts` assembles its existing export from them; `subtitle` is dropped (nothing read it).
- `Footer.vue` reads the licence link and label from `footer.json`.
- `uno.config.ts` builds `safelist` from `icons.json`.
- Created `src/content/pages/index.md` (home) and `projects.md` (generated from `src/pages/projects/data.ts`: 5 groups, 10 projects, the empty group kept).
- Deleted `src/pages/index.astro`, `src/pages/projects/index.astro`, `src/pages/projects/data.ts` (and the folder). The `/projects/data` build warning is gone.
- Block components in `src/components/blocks/`, beside their structure values: `PageHeading`, `RichText`, `Divider`, `SocialLinks`, `Contact`, `ProjectGroup`, plus the `ProseBlock` wrapper. `src/components/BlockRenderer.astro` and `src/cloudcannon/componentMap.ts` added.
- `src/content/config.ts`: `pages` union and block schemas. `src/types.ts`: unused `ProjectData` removed.
- `BaseHead.astro`: `description` falls back to `''` when null; a page title equal to the site title shows once.
- Backfilled front matter on all 16 posts (schema order, defaults) and on `md-style.md`, `posts-props.md` (`description`, `image`).

## Parity

Baseline: build of the working tree before this phase. After: 24 pages, same routes, no warnings.

- Visible text, link `href` and `target`, image file names and `alt`, icon classes, `<title>`, and every `<meta>` (including whether `content` is present): identical on all 24 pages.
- `rss.xml` and `sitemap-0.xml`: identical (ignoring `lastBuildDate`).
- Raw HTML: whitespace-only differences on every page except home and projects, which differ in structure (block wrappers).
- Visual differences, from CSS reasoning (no browser was used):
  - Home: none expected. Margins collapse across the block wrappers as they did between siblings. The hero `<img>` loses its `width`/`height` attributes; the file is 640×360, so it renders at the same size.
  - Projects: none expected. The first group's `mt-10` collapses with the heading's 2rem to the original 2.5rem gap; at ≥640px a `:has()` rule gives a page ending in project groups the original 6rem above the footer. Every `pages` entry now carries that small inline `<style>`; it matches nothing on other pages.

## Decisions and why

- **Home and projects render through the catch-all**, the same route as a new Page Builder page, because `page_builder.new_preview_url` is `/`. Why: one rendering path, so the preview matches what editors create.
- **Blocks own their wrappers.** Prose blocks wrap themselves in `ProseBlock` (`.prose` with its container margin and min-height cancelled, plus an inner div so the `> :first-child`/`> :last-child` rules don't zero the edge margins). `ProjectGroup` is not prose and carries `mt-10 mb-10`. The page-builder container is `div.page-blocks.mb-16`, raised to 6rem at ≥640px when the last block is a project group (global style in `[...slug].astro`, written to work through Phase 4's array-item wrappers). Why: a page-wide `.prose` would restyle project cards (bullets, link underlines, `h2` size); per-block wrappers keep each block correct on any page.
- **`page_heading` uses prose `h1` spacing** on every page; `ProjectGroup`'s top margin restores the projects page's larger gap. Why: matches both originals without a per-page option.
- **External links in `rich_text` get `target="_blank"` in `RichText.astro`**, not in the content. Why: the original prose opened every external link in a new tab, and attributed `<a>` tags become uneditable chips in the rich-text editor. Matches `getLinkTarget` used by the header and footer.
- **`rich_text` renders with `micromark` + `micromark-extension-gfm`** (CommonMark + GFM, raw HTML allowed). Why: browser-safe for Phase 4 re-rendering and matches `markdown.engine: commonmark` with tables. Both packages are already installed through Astro's markdown stack but are not declared in `package.json`; installing a new dependency was not permitted in this run (see Open questions).
- **Home prose kept verbatim**, including "SEO-riendly", the space before "." after the bold phrase, and `<b>` (not `**`). Why: audit default to keep copy as-is; `<b>` renders `bolder` (700, drawn with Inter's 800 face) where `**` gives `<strong>`, which `prose.css` sets to 600.
- **Home `title` is the site title** ("Vitesse theme for Astro"); `BaseHead` drops a page title equal to the site title, so the tab still reads "Vitesse theme for Astro". Why: the title field stays live (changing it changes the tab) instead of being ignored on one page.
- **Home `description`** lives in `index.md`; `site.json` `description` feeds only RSS. The `site.json` input comment now says so (`cloudcannon.config.yml`).
- **`SocialLinks` keeps the site's existing behaviour**: `Header.vue` swaps `icon` for the `header` icon on the shared objects during SSR, so the home page shows the header icons for GitHub and Twitter. Kept for parity (see Open questions).
- **Legacy content collections kept** (`src/content/config.ts`, `entry.slug`, `entry.render()`). Why: not needed for CloudCannon; moving to `glob()` changes ids and every route.

## Open questions

1. **Declare the markdown renderer.** `RichText.astro` imports `micromark` and `micromark-extension-gfm`, which resolve only because Astro's dependencies hoist them. Default: left undeclared, so the build works; recommend running `npm install micromark micromark-extension-gfm` (both already in the lockfile) so a future Astro upgrade can't remove them.
2. **Home social icons follow the header icons** for links that have one, because `Header.vue` mutates the shared social-link objects. Editing a link's **Icon** has no effect on the home page while **Header icon** is set. Default: kept for parity. Fix by mapping to copies in `Header.vue`; the home page would then show `i-simple-icons-github`/`-x`.
3. **`<b>` in the home prose** may be saved back as `**…**` after a rich-text edit, which renders lighter (`<strong>` is 600 in `prose.css`). Default: keep `<b>`; accept the change on first edit.
4. **Blog listing meta** (`title="Blog"`, `description="List of all the blog posts."` in `blog/[...path].astro`) stays hardcoded. Default: keep; listings are generated pages.
5. Carried forward with defaults: "SEO-riendly" typo (keep), `recording` field (leave), timezone (`Etc/UTC`).
