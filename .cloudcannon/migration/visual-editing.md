# Phase 4 — Visual editing

Input: `audit.md`, `configuration.md`, `content.md`. User answers: recommended defaults.

## Section census

Registered component = registered in `src/cloudcannon/registerComponents.ts`. Paths inside a page-builder block are relative to the block (`content_blocks.N`).

| Page | Section | Treatment | Binding plan | Data completeness | Justification |
| --- | --- | --- | --- | --- | --- |
| Page builder (`/`, `/projects/`, new pages) | Block list | array + component | `.page-blocks` div: `data-editable="array" data-prop="content_blocks" data-component-key="_type"`; each block in `<div data-editable="array-item" data-component={_type}>`; every `_type` registered from `componentMap.astroComponents` | All block fields in front matter | — |
| Block `page_heading` | Heading | text | `h1` `data-prop="text"` (span) | Complete | — |
| Block `rich_text` | Prose (markdown, image, lists) | text (block) | `ProseBlock` inner div `data-editable="text" data-type="block" data-prop="content"` | Complete; external-link `target` is added by the component | — |
| Block `divider` | Rule | none | Array item only | No fields | — |
| Block `social_links` | Heading | text | `p` `data-prop="heading"` (already guarded) | Complete | — |
| Block `social_links` | Social link list | data-file + array + component | `p.flex` `data-editable="array" data-prop="@data[social]" data-component="social_link"`; each `<a data-editable="array-item">`; `SocialLink.astro` renders the icon and `<editable-text data-prop="text">` | Label, link, icon, header icon all in `social.json` | — |
| Block `contact` | Lead-in text | text | `<editable-text data-prop="text">` | Complete | — |
| Block `contact` | Email address | data-file text | `<editable-text data-prop="@data[site].email">` inside the link | Email in `site.json`; `mailto:` href updates after rebuild | — |
| Block `project_group` | Group title | text | `span` in `h2` `data-prop="title"`; editor-only CSS makes the `h2` clickable | Complete | — |
| Block `project_group` | Project cards (`ListProjects.vue`) | array (sub-array) | `ul` `data-editable="array" data-prop="projects"`; `li` array items; name `data-prop="text"`, description `data-prop="description"`; icon and link re-render with the block | Name, description, icon, link in front matter | — |
| Default page (`/md-style/`, `/posts-props/`) | Title | text | `h1` `data-prop="title"` | Complete | — |
| Default page | Image | image | `<img data-editable="image" data-prop="image">` (object with `src`, `alt` only), inside the existing `image?.src` guard | Complete | — |
| Default page | Body | text (`@content`) | `<div class="prose-body" data-editable="text" data-prop="@content">` around `<Content />` | Complete | — |
| Post (`/posts/**`) | Title | text | `h1` `data-prop="title"` | Complete | — |
| Post | Date | sidebar-only | — | `date` in front matter | Dates are not text regions; the Zod transform formats the shown value. Input comment says it updates after a rebuild |
| Post | Duration, tag | text | `<editable-text data-prop="duration">` / `data-prop="tag"` inside the existing guards; the `· ` prefix stays in the template | Complete | — |
| Post | Image | image | `<img data-editable="image" data-prop="image">` inside the existing guard | Complete | — |
| Post | Body | text (`@content`) | `<div class="prose-body" data-editable="text" data-prop="@content">` | Complete | — |
| Blog listings (`/blog/**`) | Tabs, post list | sidebar-only | — | Tabs in `navigation.json`; posts are their own files | Generated pages with no file of their own, so the Visual Editor never opens them. Tabs are edited in Site settings, posts in the Blog collection |
| 404 | Heading, text | sidebar-only | — | Hardcoded in `404.mdx` | System page outside every collection (audit census: hardcoded template); no file editors open |
| All pages | Header (`Header.vue`, `client:load`) | data-file (sidebar) | — | Logo in `site.json`, links in `navigation.json`, header icons in `social.json` | See Decisions: hydrated Vue island reading three data files |
| All pages | Footer links (`Footer.vue`, server-only) | data-file text, bound by index | `<editable-text :data-prop="'@data[footer].navLinks.' + index + '.text'">` inside each link | Labels, links in `footer.json` | No array region: the `/` separators are siblings of the links in one flex row. See Decisions |
| All pages | Footer licence and author | data-file text | `<editable-text data-prop="@data[footer].license.text">`, `<editable-text data-prop="@data[site].author">` | Licence in `footer.json`, author in `site.json`; year computed | — |

## Checklist

Infrastructure (`astro/visual-editing.md`):

- [x] `@cloudcannon/editable-regions` 0.0.22 in `dependencies` (setup script, plain `npm install`; needs Node ≥ 20.19, `.nvmrc` is 24)
- [x] `editableRegions()` inside the `integrations` array in `astro.config.ts`
- [x] `src/cloudcannon/registerComponents.ts` exists and registers every block plus `social_link`
- [x] `BaseLayout.astro` imports `registerComponents` only under `window.inEditorMode`
- [x] `astro-vue-renderer` imported (ProjectGroup renders `ListProjects.vue`); Vue `isCustomElement` set for `editable-*` tags (Footer uses `<editable-text>`)
- [x] `astro-icon` not installed; no `src/icons/` needed
- [x] Registered components and everything they render grepped for `Astro.*` other than `props`/`slots`/`request`: none
- [x] Same set grepped for `.svg` imports: none
- [x] `astro build` passes

Universal (`visual-editing.md`):

- [x] Editor enablement: `pages` and `blog` have `visual`; data files are edited through `@data` regions
- [x] Census coverage: every row wired or justified (above, and Decisions)
- [x] Array containers and per-loop census: `content_blocks`, `@data[social]`, `projects` each have array + array-item + nested text regions. Footer links are bound by index (Decisions)
- [x] Array path scope: relative paths inside every item
- [x] Array container purity: block list and social links hold only items. The `projects` list holds one non-item child, ListProjects' "nothing here yet" placeholder, and only when the list is empty (Decisions)
- [x] Image editables: page and post images (`data-prop="image"`, object with `src`/`alt` only). The home hero image is markdown inside `rich_text`
- [x] Child component labels: none hardcoded in wired sections ("nothing here yet" is an empty-state message, not content)
- [x] Shared partials backed by data: footer wired to `@data[footer]`/`@data[site]`; header is a documented exception
- [x] Data file completeness: every visible header/footer/social value is in `src/data/*.json`; footer year is computed
- [x] Cross-collection select wiring: none (icon selects are option lists, not lookups)
- [x] `_inputs` audit: every `data-prop` has an input of a matching type (`text`/`textarea` → span; `rich_text.content` markdown → `data-type="block"`; `@content` → `_editables.content`). Added a comment to `blog.date` (sidebar-only, updates after rebuild)
- [x] Schema-file seed audit: every wired field is in `.cloudcannon/schemas/*.md`
- [x] `@content` on page and post bodies
- [x] Source editables: none needed (no hardcoded page copy left in editor-opened pages)
- [x] Conditional guards: images guarded on `image?.src`; duration, tag, heading already guarded. Text regions on keys the schema and structures always seed (`text`, `title`, `description`, `content`) stay unguarded: the region accepts `null`, and an empty heading stays clickable
- [x] Inline vs block: only `rich_text.content` is block; host is a `div`
- [x] Component prop contract: blocks destructure their own fields; `SocialLink` takes one `social.json` item
- [x] Cross-collection editable guard: not needed (no shared component renders another collection's items)
- [x] `<template>` blueprints: none needed (page builder and project sub-array re-render through registered blocks; social links render through the wrapper's `social_link`)
- [x] Data file input config: `site`, `social`, `footer` have `file_config` inputs covering every bound path

Page builder:

- [x] Wrapper: `data-editable="array" data-prop="content_blocks" data-component-key="_type"`
- [x] Items: `data-editable="array-item"` + `data-component={_type}` on a plain `div` per block in `[...slug].astro`; BlockRenderer stays a dispatcher
- [x] Widget nested editables and sub-arrays (see census)
- [x] UI component variants: none
- [x] Keys match `_type`; all six types registered from `componentMap.astroComponents`
- [x] Build output has `data-component-key`, `data-component=`, `data-editable="array-item"`

Astro items:

- [x] Collection/data file config follows the configuration guide (Phase 2; validated again after the date comment)
- [x] Component names resolve: `data-component` values = `page_heading`, `rich_text`, `divider`, `social_links`, `contact`, `project_group`, `social_link`, all registered
- [x] Markdown body hosts wrap `<Content />`
- [x] Slot content hosts: no Fragment hosts; `RichText` passes region attributes through `ProseBlock` to its inner `div`
- [x] Spread props: blocks take their block object; `SocialLink` takes the item
- [x] Shared component map: `componentMap.ts` exports `astroComponents` (per-framework map) and `componentMap`; BlockRenderer and registerComponents both import it

Self-check: field groups nested per block (yes); no schema defaults changed (no backfill needed); data-backed selects use `values: data.icons` (yes); no standalone registered components outside arrays (yes; `social_link` is an array wrapper's item component); no multi-field button gates (yes).

Pre-handoff sweep:

- [x] Census walk-through: every row implemented or justified
- [x] Shared-UI table: Header/Navigation (exception, Decisions); Footer links (bound by index, Decisions); Footer credits (wired); CTA, share block, author card, announcement bar: the site has none
- [x] Build grep: home has 10 array items, 2 arrays, 13 `<editable-text>`; projects 16 items, 6 arrays, 26 text regions; footer `@data[footer]`/`@data[site]` regions on every page; social and email `@data` regions on home

## Files changed

- `astro.config.ts`: `editableRegions()` integration; Vue `isCustomElement` for `editable-*`
- `package.json`, `package-lock.json`: `@cloudcannon/editable-regions` ^0.0.22
- `src/cloudcannon/registerComponents.ts` (new), `src/cloudcannon/componentMap.ts` (per-framework `astroComponents` map)
- `src/layouts/BaseLayout.astro`: editor-only script (ClientRouter off, registration import)
- `src/pages/[...slug].astro`, `src/pages/posts/[...slug].astro`: block array, title, image, body regions
- `src/components/blocks/*.astro`: block regions; `ProseBlock` forwards attributes to its inner div
- `src/components/SocialLink.astro` (new), `src/components/ListProjects.vue`, `src/components/Footer.vue`
- `src/styles/prose.css`: `.prose-body` shares `.prose`'s direct-child rules; `src/styles/global.css`: editor-only rule under `.cms-editor-active`
- `cloudcannon.config.yml`: `blog.date` comment; `.cloudcannon/README.md`: "Editing on the page" section
- Lint: changed files pass `eslint` (`--fix` applied to them only)

## Build parity

Baseline: build of the Phase 3 tree before any change (kept in a gitignored cache, deleted at the end). After: 24 pages, same routes, no warnings.

- Visible text, links, attributes and `<head>` identical on every page once region attributes and `<editable-text>` tags are removed. Whitespace differs only where lint formatting moved text onto its own line inside an element (`<h1>`, the post meta `<span>`, the social heading `<p>`); it collapses to the same rendering.
- Structure: one plain `div` around each page-builder block (array-item host) and `div.prose-body` around page and post bodies (`@content` host). Margins collapse through the block `div`s as they did through Phase 3's block wrappers. `.prose-body` gets copies of `.prose`'s direct-child rules (`> ul > li p`, `> ol > li > :first-child/:last-child`, `> :last-child`), so lists and the last paragraph keep their margins. `.prose` has a `min-height`, so without the `> :last-child` copy the last body element's bottom margin would add space inside the article.
- CSS: the `.prose-body` selectors, the `.cms-editor-active` rule, and two UnoCSS rules generated from the client-compiled `ListProjects.vue` (`.hover\:text-main`, `.rd-2`) that match no element. Stylesheet links per page unchanged.
- JS: island chunks are re-split because the editor-only bundle shares Vue and `site-config` with them: same code, two extra module requests and about 7 KB more uncompressed JS per page, plus a 1.5 KB editor-gate script. `registerComponents.*.js` (124 KB) loads only in the editor.
- Pre-existing, not changed: `ProjectGroup.astro`'s HTML comment ships in the page (`<!-- mt-10 collapses … -->`).

No browser was used. Everything below that depends on the Visual Editor at runtime is reasoned from `@cloudcannon/editable-regions` 0.0.22 and Astro 5.6.2 source.

## ClientRouter (View Transitions)

- **Regions follow a swap, but bind to the wrong file.** The runtime mounts regions through a `MutationObserver` on `document` (`components/index.ts`), so regions in a body the ClientRouter swaps in would mount. Every relative path and `@content` resolves against `CloudCannon.currentFile()` (`nodes/editable.ts`, `parseSource`): the file the editor opened. After a client-side navigation, the new page's regions would read and write the previous page's file.
- **The swap drops `.cms-editor-active`.** Astro replaces `<body>` (`swapBodyElement` in `astro/dist/transitions/swap-functions.js`), and CloudCannon puts that class on `<body>`, so editor-only CSS stops applying after a navigation.
- **Fix: full page loads in the editor.** Under `window.inEditorMode`, the layout script removes `<meta name="astro-view-transitions-enabled">`. Astro's router checks that meta at navigation time (`transitionEnabledOnThisPage()` in `astro/dist/transitions/router.js`): `transition()` falls back to `location.href = to.href`, and `onPopState` reloads. Visitors keep the ClientRouter, since the script does nothing outside the editor.
- **Clicks on text regions inside links don't navigate.** `EditableText.mount()` calls `preventDefault()` on clicks, and the ClientRouter skips clicks already prevented, so clicking an editable label in a footer link, a social link or a project card edits it without following the link. The skill's "regions inside interactive elements" table says a text region inside an `<a>` follows the link; at 0.0.22 it doesn't. Worth checking against the skill.
- **Not verifiable from source:** whether CloudCannon's editor reacts to in-iframe navigation at all. Phase 5 check: in the Visual Editor, click a header nav link and confirm the page reloads and the editor switches to that page's file.

## Decisions and why

- **Footer links bound by index, no array region.** The `/` separators are siblings of the links in one flex row. An array region needs each separator moved into a wrapper item with the link, which changes visitor markup and how the row wraps. Labels are editable on the page; adding, removing and reordering links happens in Site settings → Footer and shows after a rebuild.
- **Header stays sidebar-only (Site settings).** `Header.vue` is a `client:load` Vue island: the runtime appends controls inside region hosts, and Vue hydration removes DOM children it didn't render if it hydrates after the runtime mounts. Its content comes from three data files (`navigation`, `social`, `site`), which no single component region can bind; most of it is icon-only links whose icon is a computed class; the mobile drawer duplicates the nav. Editors change it in Site settings → Navigation, Site and Social links (README says so). See Open questions.
- **Social links: `@data[social]` array with a `social_link` item component.** The block reads `site-config`, which the editor bundle freezes at build time, so the list binds to the data file directly. The wrapper's `data-component` re-renders each link from its live data, so icon changes show without a rebuild. The link's `href` and `aria-label` sit on the item host and update after a rebuild.
- **`SocialLink` applies the header-icon override itself.** `Header.vue` swaps `icon` for `header` on the shared objects during the build, so the built home page shows header icons for GitHub and X. The editor bundle never runs `Header.vue`, so without the override the re-rendered links would show the other icon. Build output is unchanged.
- **Contact email is a text region on `@data[site].email`.** The `mailto:` href updates after a rebuild.
- **`rich_text` region host is `ProseBlock`'s inner div.** `ProseBlock` forwards its props as attributes there, so no extra element is added. The `target="_blank"` RichText adds to external links stays out of the content (the region loads its value from the field, not the DOM).
- **`.prose-body` wrapper for `@content`.** `<Content />` shares `article.prose` with the `h1` and image, so the body needs its own host. It gets its own class rather than `.prose`, whose `min-height` and `mb-16` would apply twice.
- **Project group titles: editor-only CSS.** The `h2` is `pointer-events-none select-none` for visitors; `.cms-editor-active .project-group h2` turns both back on so the title region is clickable.
- **`projects` array keeps ListProjects' empty-state div.** It sits inside the `ul` only when the group is empty. The runtime counts only array-item children (`nodes/editable-array.ts`), and the block re-render removes the placeholder once a project is added. Moving it out of the `ul` changes visitor markup for empty groups.
- **Post date sidebar-only; duration and tag inline.** Dates must not be text regions. Duration and tag are plain strings inside their guards; clearing one leaves its `· ` until a rebuild.
- **No `<template>` blueprints.** Every array either re-renders through a registered component or always has a first item to clone.
- **Blog listings and 404 not wired.** Neither is a file the editor opens; listing tabs live in `navigation.json`.

## Open questions

1. **Make the header editable on the page?** Default: Site settings only. Option: render the header shell in Astro with the scroll and drawer behaviour in a small script, then wire nav labels and the logo with `@data` regions.
2. **Footer links: on-page add, remove and reorder?** Default: labels inline, list in Site settings. Option: move each separator into a wrapper item with its link; the row then wraps with separators attached to the next link.
3. **Home social icons follow the header icon** (content.md question 2, now explicit in `SocialLink.astro`). Default: keep for parity. Fix: drop the override in `SocialLink.astro` and the mutation in `Header.vue`; the home page then shows `i-simple-icons-github`/`-x`.
4. **Visitor JS grows by about 7 KB** (uncompressed) from chunk sharing with the editor bundle. Default: accept.
5. **Declare `micromark` and `micromark-extension-gfm`** (content.md question 1). The editor bundle now ships them too. Default: still undeclared.
6. **Contact email region on an `email` input.** Default: kept; Phase 5 confirms it edits in place.

Phase 5 editor checks (each one line): a header link click reloads into the new page's file; the home social links show the GitHub/X header icons; a project group title is clickable; editing a project icon re-renders the card; the contact email edits in place.
