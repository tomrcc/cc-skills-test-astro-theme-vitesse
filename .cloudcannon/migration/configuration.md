# Phase 2 — Configuration

Input: `audit.md` (no `plan.md`). User answers: none; the audit's defaults are taken.

## Checklist

Shared (`cloudcannon-configuration/configuration.md`):

- [x] JSON schemas downloaded to `.cloudcannon/migration/`; `*.schema.json` gitignored
- [x] Baseline generated (`configure generate --auto --initial-site-settings --ssg astro`), then rewritten from the audit
- [x] Structures four rules: every array and object linked by full path, every structure value has `preview` + `picker_preview`, nested objects (`image`, `logo`, `license`) have `type: object` + preview icon. Field completeness on real files is re-checked in Phase 3
- [x] `npx @cloudcannon/cli validate` passes (config, 6 structure-value files, initial-site-settings)
- [x] `cloudcannon.config.yml` valid YAML; no `source` key; no anchors/aliases (grep clean)
- [x] Build settings nested under `build`
- [x] Build command alone produces the full output (`astro build`, no generators)
- [x] `.cloudcannon/README.md` written
- [x] `collections_config` covers every audit collection: `pages`, `blog`, plus `data` for editable data files
- [x] No defunct keys; no non-content directories; no single-file collection
- [x] `collection_groups`: Content (pages, blog), Site (data)
- [x] Every collection has `url` or `disable_url: true`
- [x] Every file checked against a build: 16 blog files at `/posts/[full_slug]/`, 2 existing pages at `/[slug]/`; planned `index.md` → `/` and `projects.md` → `/projects/` match existing built routes
- [x] Index-page schemas: none needed (blog has no index file)
- [x] Every field has an explicit `_inputs` entry (blog: 10 keys; pages: 3 + `content_blocks`; every data-file key planned below)
- [x] Every select has options (`lang` inline; icons via `data.icons`)
- [x] Icon fields are `select` + `value_key: id` + named values; `allow_create` off (see Decisions)
- [x] Enum keys in structure values (`icon`, `header`) have inputs on the value
- [x] No numeric values on text inputs
- [x] `_schema` and `_type` hidden
- [x] `file_config` in array format
- [x] `paths.uploads: public/images`
- [x] `_enabled_editors`: visual first on `pages`/`blog`, `[visual, data]` on `page_builder`, `[data]` on `data`
- [x] Styled HTML in front matter: home prose becomes a `rich_text` markdown block (Phase 3 moves it)
- [x] `markdown.options.table: true` (GFM tables in `md-style.md`, `posts-props.md`); toolbar `superscript` saves `<sup>`, which Astro keeps
- [x] Every `type: markdown` has its own `options`
- [x] Every switch/enum toggles something: `draft` (filtered in prod), `video` (film icon), `lang` (中文 marker), `header` (header membership)
- [x] Array data files (`social.json`, `icons.json`) are top-level arrays
- [x] `add_options` limit the Add menu; every `_schema` value used is a key under `schemas`
- [x] `data` has `disable_add`; creatable schemas have `new_preview_url` or `editor: content`
- [x] Page builder schema exists (6 block types)

Astro (`cloudcannon-configuration/astro/configuration.md`):

- [x] `"ssg": "astro"`; `node_version: "file"` reading `.nvmrc`
- [x] MDX gate: no `.mdx` in content (`404.mdx` is a page with no components); no snippets needed
- [x] Images: all static in `public/`; no `src/assets/` overrides
- [x] Every Zod field has an input; Zod constraints mapped (`title`, `date` → `required: true`)
- [x] Package manager pinned (`packageManager: npm@11.19.1`)

## Files written

- `cloudcannon.config.yml`
- `.cloudcannon/initial-site-settings.json`
- `.cloudcannon/README.md`
- `.cloudcannon/schemas/page.md`, `page-builder.md`, `post.md`
- `src/components/blocks/*.cloudcannon.structure-value.yml` — `page_heading`, `rich_text`, `social_links`, `contact`, `divider`, `project_group`

## Cross-phase fixes made

- `src/content/config.ts`: optional strings and `image` (and its `src`/`alt`) are `.nullish()`; `lang` maps null to `en-US`. CloudCannon writes `null` for cleared inputs and the schema files seed bare keys, which `.optional()` rejects.
- `src/pages/[...slug].astro`, `src/pages/posts/[...slug].astro`: `image &&` → `image?.src &&`, since an empty image object is truthy.
- `package.json`: `packageManager: "npm@11.19.1"` (the local npm that wrote the lockfile).
- `.nvmrc`: `24` (the local Node version, inside the `engines.node` range).
- `.gitignore`: `.cloudcannon/migration/*.schema.json`.

Build after these: succeeds, same 24 routes (the `/projects/data` warning is unchanged; Phase 3 removes `data.ts`). `dist/` and `.astro/` deleted afterwards.

## For Phase 3: planned files the config expects

Config references these; none exist yet. Shapes must match the inputs exactly.

`src/data/site.json` (object):
`author`, `title`, `description`, `email`, `image {src, alt}`, `logo {src, alt}`. `subtitle` is dropped: nothing reads it. `logo` comes from `header.logo`.

`src/data/navigation.json` (object): `navLinks[]` and `blogLinks[]`, items `{text, href}`.

`src/data/social.json` (top-level array): items `{text, href, icon, header}`. Every item carries all four keys; items not in the header get `"header": ""`.

`src/data/footer.json` (object): `navLinks[]` items `{text, href}`; `license {text: "CC BY-NC-SA 4.0", href: "https://creativecommons.org/licenses/by-nc-sa/4.0/"}`. Year stays computed; author comes from `site.json`.

`src/data/icons.json` (top-level array, developer-owned, not in the `data` collection): `{name, id}` for every class in the current UnoCSS safelist (`i-ri-file-list-2-line`, `i-carbon-campsite`, the eight `i-simple-icons-*`, `i-ri-github-line`, `i-ri-twitter-x-line`). `uno.config.ts` builds `safelist` from this file, so the select list and the generated CSS can't drift.

`src/site-config.ts` keeps its export shape (`header.logo`, `header.navLinks`, `page.blogLinks`, `footer.navLinks`, `socialLinks`) by assembling it from the JSON files, so consumers don't change.

`src/content/pages/index.md` and `projects.md`: `_schema: page_builder`, `title`, `description`, `content_blocks`. Block shapes are in the structure-value files; every block carries every key in its `value`.

- Home: `page_heading` ("Vitesse theme"), `rich_text` (the prose, image and feature list as markdown; links keep `target="_blank"` only as raw HTML), `divider`, `social_links` (`heading: Find me on`), `contact` (`text: If you have any questions, please email me at`). Home `title` is the CMS label; the home route keeps its current tab title (site title only) and `description` = the site description.
- Projects: `title: Projects`, `description: List of projects that I am proud of`, `page_heading` ("Projects"), then one `project_group` per `data.ts` group, including the empty one (`projects: []`, renders "nothing here yet").

Zod: `pages` becomes a `z.union` (page builder first, then default), with `content_blocks` a `z.discriminatedUnion('_type', …)` over the six types.

Rendering: home and projects must render through the same page-builder layout as a new Page Builder page, because `page_builder.new_preview_url` is `/`. The simplest route is the catch-all rendering every page-builder entry (including `index` → `/` and `projects`) and removing `index.astro` and `projects/index.astro`; otherwise keep the three in step. `rich_text` needs a markdown renderer for front matter (Astro has none built in for strings).

## Decisions and why

- **One `pages` collection, two schemas** (`default`, `page_builder`), both on the Add menu. Why: audit census; editors may add landing or showcase pages.
- **Six block types, co-located structure values in `src/components/blocks/`.** `page_heading` exists because the home h1 ("Vitesse theme") differs from the tab title, and the projects h1 sits outside `prose`. `social_links` and `contact` are reference blocks reading `social.json` / `site.json`, with only their lead-in text per instance.
- **`new_preview_url`**: default pages → `/md-style/` (the only other page on the catch-all's markdown layout); page builder → `/`. Named in the README.
- **`blog` stays one collection**, URL `/posts/[full_slug]/`, three add options (`Blog post`, `Note`, `Talk`) with `base_path` `/`, `/notes`, `/talks`, all `editor: content` because posts have `draft`. `disable_add_folder: true` because a new folder gets no tab unless navigation adds one.
- **`blogLinks` is its own structure** (`blog_tabs`) with a `^/blog(/[a-z0-9-]+)?$` pattern, because each href generates a route.
- **Icons: dataset `icons.json`, `allow_create: false`.** UnoCSS only generates icon classes it finds in source or the safelist; a typed-in name would render nothing.
- **`date` is `type: date`** with `instance_value: NOW` and `required`. Existing values are dates with no time; the Zod transform formats them.
- **`lang` is a select** (English `en-US`, Chinese `zh`); the template only branches on `zh`.
- **Data files in one `data` collection** (`Site settings`) with per-file `file_config`; `icons.json` is a dataset only.
- **Hosting: CloudCannon** (audit default). `install_command: npm ci`, `output_path: dist`.
- **`node_version: "file"`, `.nvmrc` = `24`.** `engines.node` alone gives 18, which is end-of-life and can't run the pinned npm 11 (needs 20.17+); 24 is the local build version and within `engines.node`.
- **`timezone: Etc/UTC`**: the site sets none.

## Open questions

1. **Timezone.** Default `Etc/UTC`. Post dates have no time, so this only affects new posts' `NOW` date near midnight.
2. **`prepare` runs `simple-git-hooks` during `npm ci`.** Default: leave it; Phase 5 confirms the CloudCannon install doesn't fail on it.
3. **`base_path` for Note and Talk.** Default `/notes` and `/talks` (relative to the collection). Phase 5 confirms new files land in the right folder.
4. Audit questions carried forward with their defaults: separate Notes/Talks collections (no), footer licence editable (yes, in `footer.json`), "SEO-riendly" typo (keep), `recording` field (leave).
