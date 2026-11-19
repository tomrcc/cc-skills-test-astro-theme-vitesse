# Phase 1 — Audit

Site: `astro-theme-vitesse-vue` (Astro theme "Vitesse"), repo root, one CloudCannon site. Remote `tomrcc/cc-skills-test-astro-theme-vitesse`.

## Checklist

- [x] Run `scripts/audit-astro.sh`
- [x] 1. Astro version and dependencies
- [x] 2. Content collections
- [x] 3. Pages and routing
- [x] 4. Layouts and components (islands, images, wrappers, hardcoded text, astro-icon)
- [x] Census table (classifying static pages)
- [x] Primitive-vs-computed census
- [x] Frontmatter co-location census (no registered components yet — see below)
- [x] 5. Build pipeline
- [x] 6. Flags and special patterns (incl. load-time behaviour, markdown-extension syntax, inline HTML)
- [x] Site-wide facts (package manager, repo position, hosting, headers/redirects, forms)
- [x] Existing hydration errors (no browser available — pages listed for the user)
- [x] 7. Sizing evaluation

## 1. Versions and dependencies

- Astro `^5.6.2` (installed 5.x). No Astro 4 upgrade question.
- Content config: **legacy** `src/content/config.ts`, collections defined with `schema` only (no `loader`). Astro 5 emulates them: routes use `entry.slug` and `entry.render()`. `slug` comes from the file path (`notes/post-1`), overridable by a frontmatter `slug` (none set).
- Integrations: `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/vue`, `unocss/astro` (`injectReset: true`). `@astrojs/rss` for the feed.
- Framework: **Vue 3** (`.vue` SFCs). No React, Svelte or Solid. Phase 4 needs `@cloudcannon/editable-regions/astro-vue-renderer` for any Vue component inside a registered Astro component, and the Vue registration function for standalone Vue components.
- CSS: UnoCSS (attributify mode, `i-*` Iconify icon classes via `@iconify/json`). No `astro-icon`.
- Markdown: Shiki dual theme (`github-light-default` / `github-dark-default`). No remark/rehype plugins.
- Bookshop: none.
- Package manager: npm (`package-lock.json`). `package-lock.json` already shows as modified in git before this audit (from the dependency install).
- Node: `engines.node` = `>=v18.17.1 || >=v20.3.0 || >=21`. No `.nvmrc`. CI uses `lts/*`.

## 2. Content collections

### `blog` (existing, page collection)

- Path: `src/content/blog/**` — legacy folder-based, flat files, three folders used as categories:
  - root: `post-1.md` … `post-8.md` (8)
  - `notes/post-1.md` … `post-4.md` (4)
  - `talks/post-1.md` … `post-4.md` (4)
- Schema (Zod): `title` string (required); `description` string?; `duration` string?; `image` {`src` string, `alt` string}?; `date` string|date (required, transformed to an `en-US` locale string like `May 1, 2024`); `draft` boolean default false; `lang` string default `en-US`; `tag` string?; `redirect` string?; `video` boolean default false.
- Consumed by `getPosts()` in `src/utils/posts.ts` (`getCollection('blog')`, drafts hidden in prod, optional folder filter by `post.slug.includes(path)`, sorted by date). Used by `posts/[...slug].astro`, `blog/[...path].astro`, `rss.xml.ts`.
- Body rendered with `<Content />` in `src/pages/posts/[...slug].astro` → `@content` candidate in Phase 4.
- URL: `/posts/<slug>/` where slug includes the folder (`/posts/notes/post-1/`). CC pattern: `/posts/[full_slug]/`.
- Bodies are one-line markdown placeholders. No inline HTML, no MDX.
- `redirect` posts link out from the listing but still build a `/posts/<slug>/` page.

### `pages` (existing, page collection)

- Path: `src/content/pages/` — `md-style.md`, `posts-props.md`.
- Schema: `title` string; `description` string?; `image` {`src`, `alt`}?.
- Rendered by `src/pages/[...slug].astro` at `/<slug>/` with h1 title, optional image, `<Content />`. CC pattern: `/[slug]/`.
- Both are long-form markdown with GFM tables and a fenced code block. This is the site's `default` schema.

### Data outside collections

- `src/site-config.ts` — a TS object holding author, title, subtitle, description, OG image, email, `socialLinks[]` (text, href, icon, optional `header` icon), `header.logo`, `header.navLinks[]`, `page.blogLinks[]`, `footer.navLinks[]`. Used by `BaseHead.astro`, `Header.vue`, `Footer.vue`, `index.astro`, `blog/[...path].astro`, `rss.xml.ts`. Not editable in CloudCannon as TS.
- `src/pages/projects/data.ts` — `projectData[]` groups `{title, projects[{text, description, icon, href}]}`. Used only by the projects page. Being inside `src/pages/` it also produces an empty `/projects/data` endpoint (build warns: "No API Route handler exists for the method GET").

## 3. Pages and routing

Build of the unchanged site: 24 pages, succeeds (one warning, above).

- `/` — `src/pages/index.astro` (hardcoded prose + `siteConfig.socialLinks` + `siteConfig.email`)
- `/projects/` — `src/pages/projects/index.astro` (reads `projects/data.ts`)
- `/blog/`, `/blog/notes/`, `/blog/talks/` — `src/pages/blog/[...path].astro`, generated from `siteConfig.page.blogLinks`; lists posts filtered by folder (generated listings)
- `/posts/<slug>/` × 16 — `src/pages/posts/[...slug].astro` from `blog` (`post.slug`)
  - `/posts/post-1/` … `/posts/post-8/`
  - `/posts/notes/post-1/` … `/posts/notes/post-4/`
  - `/posts/talks/post-1/` … `/posts/talks/post-4/`
- `/md-style/`, `/posts-props/` — `src/pages/[...slug].astro` from `pages` (`page.slug`)
- `/404.html` — `src/pages/404.mdx`
- `/rss.xml` — `src/pages/rss.xml.ts` (endpoint, prerendered)
- `/robots.txt` — `src/pages/robots.txt.ts` (endpoint, prerendered)
- `/sitemap-index.xml` — `@astrojs/sitemap`
- `/projects/data` — accidental empty endpoint from `data.ts` (file not created)

No pagination, no taxonomy routes, no SSR, no redirects in `astro.config.ts`. `output` static (default).

## 4. Layouts and components

- `src/layouts/BaseLayout.astro` — `<BaseHead>`, `<ViewTransitions />` (Astro's ClientRouter), `<Header client:load />`, `<main transition:animate={fade}>` with `<slot />`, `<ScrollToTop client:load />`, `<Footer />` (SSR-only Vue).
- `src/components/BaseHead.astro` — meta/OG tags from props + `siteConfig`; nprogress script on `astro:before-preparation` / `astro:page-load`.
- `Header.vue` (island, `client:load`) — logo, `header.navLinks`, social icons (links with a `header` value), RSS, `ThemeToggle.vue`, mobile drawer. Shared UI → data file.
- `Footer.vue` (SSR) — `footer.navLinks`, CC licence link, `© year author`. Shared UI → data file.
- `ScrollToTop.vue` (island) — no content.
- `ThemeToggle.vue` (inside Header) — dark mode via `useDark`.
- `ListPosts.vue` (SSR) — post list with year dividers; reads `title`, `date`, `duration`, `tag`, `lang`, `redirect`, `video`, `draft`, `description`, and `recording` (not in the Zod schema, so always stripped).
- `ListProjects.vue` (SSR) — project cards; `icon` is a UnoCSS class string (`i-carbon-campsite`).

Visual-editing candidates: home page sections, projects groups, post/page title, image and body. Data panel: header nav, social links, footer links, site meta.

Images: all plain `<img>` with `public/` paths (`/hero.jpg`, `/favicon.svg`, frontmatter `image.src`). No `astro:assets`. Uploads go to `public/` (suggest `public/images/`).

Presentational wrappers inside editable content: none. No `set:html`. No `astro-icon`.

Icons: UnoCSS `i-*` classes are generated at build time from classes found in source. An icon class typed by an editor into a data file is only generated if UnoCSS scans that file — Phase 2/3 must add the data file paths to UnoCSS content scanning or a safelist.

## Census table

| Page file | Distinct content sections | Layout repeated on other pages? | Editor will add similar pages? | Recommended pattern | Needs editable region? |
| --- | --- | --- | --- | --- | --- |
| `src/pages/index.astro` | title, intro prose with hero image and feature list, "Find me on" social links, contact email | No | Maybe (landing/about pages) | Page builder — `src/content/pages/index.md` in `pages` | Yes |
| `src/pages/projects/index.astro` | title, repeated project groups (group title + project cards) | No | Maybe (other showcase pages) | Page builder — `src/content/pages/projects.md` in `pages`, each group a block | Yes |
| `src/pages/blog/[...path].astro` | tab links (from `blogLinks`), post list | Yes (3 generated listings) | No (tabs come from data) | Hardcoded template; tab labels/links in the navigation data file | No (data panel) |
| `src/pages/404.mdx` | heading, one line | No | No | Hardcoded template | No |
| `src/pages/[...slug].astro` (`md-style`, `posts-props`) | title, optional image, markdown body | Yes | Yes | `default` schema in `pages` (already a collection) | Title, image, body |
| `src/pages/posts/[...slug].astro` (`blog`) | title, date/duration/tag meta, image, body | Yes | Yes | Fixed-schema `blog` collection (existing) | Title, image, body |
| Header / Footer / social (`src/site-config.ts`) | nav, socials, footer links, author | All pages | — | Data files (shared-UI table) | No (data panel) |

## Primitive-vs-computed census

`src/pages/posts/[...slug].astro`

| Interpolation | Kind | Action |
| --- | --- | --- |
| `{title}` | primitive | keep |
| `{date.split(',')}` + `getDate(date)` | computed (Zod transform + split) | extract to a registered component (post meta) or leave non-editable |
| `{duration}`, `{tag}` with `· ` prefix inside conditionals | computed (conditional) | include in the post-meta component |
| `{image.src}`, `{image.alt \|\| ''}` | primitive in conditional | image editable on `image` |

`src/pages/[...slug].astro` — `{title}`, `{image.src}`, `{image.alt}`: primitive. Keep.

`src/pages/index.astro` — `siteConfig.socialLinks.map(...)`, `siteConfig.email` (×3): computed (shared data). Becomes blocks reading the data file, or `@data[...]` bindings.

`src/pages/blog/[...path].astro` — `nav.text`, `nav.href`, `activeLink(...)`: computed (shared data + active state). Stays in the template; edited through the data file.

`src/pages/projects/index.astro` — `{i.title}` and `ListProjects` props from `data.ts`: data moves into blocks; the block component renders primitives.

Target after Phase 3/4: zero computed interpolations left in route files that carry editable regions.

## Frontmatter co-location census

No `registerComponents.ts` / component map exists yet. Planned registered components (Phase 4) and their front matter home:

| Component file | Used from page template? | Fields nested under one frontmatter key? | Action |
| --- | --- | --- | --- |
| Home/projects blocks (new) | Yes, via block renderer | Yes — each block one item of `content_blocks` | Build co-located from the start |
| Post meta (date/duration/tag, new) | Yes, posts route | No — top-level `date`, `duration`, `tag` | Decide in Phase 4: pass whole `data` or keep as non-editable display |

## 5. Build pipeline

- `build`: `astro build` only. No pre-build steps or code generation. `prepare` runs `simple-git-hooks` on install (harmless in CI; installs a git hook if `.git` exists).
- `astro.config.ts`: `site: https://astro-theme-vitesse.netlify.app/`, no `base`, no `trailingSlash`, default `build.format` (directory), `output` static.
- No env vars, no `astro:env`.
- CloudCannon: install `npm i`, build `npm run build`, output `dist`.

## 6. Flags and special patterns

- **Legacy content collections** (no loader) in Astro 5. Routes rely on `entry.slug` and `entry.render()`. Phase 3 may move to `src/content.config.ts` with `glob()`; if so, routes switch to `entry.id` + `render(entry)` and the `blog` id keeps its folder prefix. Not required for CloudCannon.
- **`date` Zod transform** to a locale string: CloudCannon edits the raw `YYYY-MM-DD` value; display formatting stays in code.
- **Folder-as-category** in `blog` (`notes/`, `talks/`): the listing filter is `post.slug.includes(path)`, so a root post whose filename contains "notes" or "talks" would leak into those tabs. New posts must be created in the right folder.
- **`recording`** read by `ListPosts.vue` but absent from the schema.
- **`src/pages/projects/data.ts`** produces an empty route; moving the data out of `src/pages/` fixes the build warning.
- **Icon classes as data** (`socialLinks[].icon`, `header`, project `icon`): UnoCSS scanning (see §4).
- **ClientRouter / View Transitions** (`<ViewTransitions />`, `transition:animate`, `astro:*` events for nprogress and dark mode). The skills don't cover ClientRouter in the Visual Editor. Phase 4 should check that in-editor re-renders and page loads behave, and gate ClientRouter off in the editor if not.
- **Load-time behaviour:**
  - `Header.vue` — hides on scroll (`header-hide` translateY), blur on scroll; mobile drawer `translateX(-100%)` until toggled.
  - `ScrollToTop.vue` — `op0 pointer-events-none` until scrolled past 300px (intended).
  - `BaseLayout.astro` — `<main>` fades in on client-side navigation (`transition:animate={fade}`).
  - `ThemeToggle.vue` — dark class applied after hydration.
  - No carousels, timers, IntersectionObserver or reveal classes.
- **Markdown-extension syntax:** no plugins that add syntax. Grepped `src/content` for footnotes, math, escaped dollars, citations, alerts: none. GFM tables in `md-style.md` and `posts-props.md`.
- **Inline HTML in markdown:** none. `404.mdx` is a page, not content.
- **Styled HTML for front matter:** the home page prose contains links, `<b>`, `<sup>👆</sup>` and a list — move it as markdown (rich text), not plain strings.
- **Typo in home copy:** "SEO-riendly". Keep as-is during conversion (content fix is the editor's call).

## Site-wide facts

- Package manager: npm.
- Repo position: root; one CloudCannon site.
- Production hosting: not stated in repo config. README and `site` point to the upstream theme's Netlify demo; no `netlify.toml`. See Open questions.
- Headers and redirects: none in any source (`astro.config.ts`, `_headers`, `_redirects`, `netlify.toml`, `vercel.json` all absent).
- Forms: none.

## Existing hydration errors

No browser in this phase. Vue islands: `Header.vue` (with `ThemeToggle.vue`) and `ScrollToTop.vue` on every page. Likely mismatch sources: `ThemeToggle` `aria-label` (SSR `isDark=false` vs client dark preference) and Header's `header-bg-blur` class when a page loads scrolled. Pages for the user (or Phase 5) to load with the console open, in dark mode: `/`, `/projects/`, `/blog/`, `/posts/post-1/`, `/md-style/`. Vue patches mismatches rather than re-rendering the page, so these are lower risk than React's.

## 7. Sizing

- Total pages (content files + static routes, excluding generated listings): 16 posts + 2 pages entries + `/` + `/projects/` + 404 = **21** (>30: ok)
- Hardcoded → YAML conversions (census rows to page builder / fixed-schema): `index.astro`, `projects/index.astro` = **2** (>15: ok)
- Distinct collections: `blog`, `pages` = **2** (>5: ok). Data files are `data_config`, not collections.
- Tripped: 0/3 — no `plan.md`.

## Decisions and why

- **One `pages` collection** holds `index.md`, `projects.md`, `md-style.md`, `posts-props.md`. Schemas: `default` (title, description, image, markdown body — existing shape) and a page-builder schema with `content_blocks`. Why: two unique-layout pages the project owns, each with 2+ sections; no collection-of-one.
- **Home → page builder** (`src/content/pages/index.md`). Proposed blocks: rich text (markdown prose including the hero image and feature list), social links (reads the social data file), contact email (reads site data), divider. Why: 4 sections and well over 5 strings; sections are reusable on other pages. `[...slug].astro` must exclude `index` (legacy slug `index`) and `index.astro` render the entry; CC URL `/` via `[slug]` collapse.
- **Projects → page builder** (`src/content/pages/projects.md`), each project group one `project_group` block (`title`, `projects[]` of `text`, `description`, `icon`, `href`). Why: data used on one page only belongs in that page's front matter; groups are the repeated section editors add/reorder. `data.ts` is removed from `src/pages/`.
- **`blog` stays one collection** across root/`notes`/`talks`, URL `/posts/[full_slug]/`. Why: one shape, one route; folders are categories. Phase 2 can add `add_options`/views so editors create posts in the right folder.
- **`site-config.ts` → data files** read by `site-config.ts` (keep its export so consumers don't change): `src/data/site.json` (author, title, subtitle, description, image, email, logo), `src/data/navigation.json` (header `navLinks`, `blogLinks`), `src/data/social.json` (`socialLinks`), `src/data/footer.json` (`navLinks`). JSON, because Vite imports it natively. Why: shared-UI table — header, footer and social links are data files; social links are used on two surfaces.
- **404 and blog listings stay hardcoded templates.** Why: system/generated pages; listing tab labels are edited via navigation data.
- **Images stay in `public/`** with plain `<img>`; uploads to `public/images/`.
- **No content restructuring needed for `blog`/`pages`** beyond the two new page entries; legacy collection format is kept unless Phase 3 chooses to move to `glob()`.

## Open questions

1. **Production hosting** — CloudCannon, or Netlify with CloudCannon for editing only? Default: CloudCannon hosts (test site; no headers, redirects or forms to move either way).
2. **Separate CMS collections for Notes and Talks?** Default: one `blog` collection with folder-aware add options; split views only if editors ask.
3. **Footer copyright line** (`CC BY-NC-SA 4.0` link, `© year author`) — editable? Default: licence link/label goes into `footer.json`; year stays computed; author comes from `site.json`.
4. **Fix the "SEO-riendly" typo during conversion?** Default: keep the copy verbatim.
5. **`recording` field** read by the post list but not in the schema — add it to the schema or drop the check? Default: leave as-is (out of scope).
