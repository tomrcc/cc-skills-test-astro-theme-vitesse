# Phase 5 — Build and test

Input: `audit.md`, `configuration.md`, `content.md`, `visual-editing.md`. Tools: Node 24.22.1, npm 11.19.1 (matches `packageManager`), Astro 5.6.2, `@cloudcannon/editable-regions` 0.0.22. No browser was used.

## Checklist

Shared (`build.md`):

- [x] **Full build.** `.astro/` and `dist/` removed, then `npm ci` and `npm run build` from `initial-site-settings.json` (no environment variables set there). 24 pages, exit 0, no warnings.
- [x] **Frozen install.** `npm ci` from an empty npm cache (temporary, inside the gitignored `.astro/`, deleted after): exit 0. Run with `SKIP_INSTALL_SIMPLE_GIT_HOOKS=1` so the local `.git/hooks` stayed untouched. `npm audit` reports 42 advisories in the existing dependency tree; not migration-related.
- [x] **`prepare` (`simple-git-hooks`) can't fail the CloudCannon install** (configuration.md question 2). Its `cli.js` 2.12.1 wraps `setHooksFromConfig` in `.catch(e => console.log('[ERROR] …'))`, so a missing or odd `.git` logs a line and exits 0.
- [x] **Regions in the output.** Home: 2 arrays, 10 array items, 3 `data-editable="text"`, 13 `<editable-text>`. Projects: 6 arrays, 16 items, 26 text. Default page (`/md-style/`) and post (`/posts/post-1/`): `title` and `@content`; `/posts/notes/post-1/` adds `duration`. Footer `@data[footer]`/`@data[site]` regions on every page, including `/blog/` and `/404`. Every region type in the Phase 4 census appears.
- [x] **Image regions.** No content file sets `image.src`, so the guarded `<img data-editable="image">` never renders in the normal build. Controlled test: set `image.src: /hero.jpg` on `blog/post-1.md` and `pages/md-style.md`, built, both pages had `<img … data-editable="image" data-prop="image">`; files restored byte-for-byte from a gitignored backup, which was then deleted.
- [x] **Config validates.** `npx @cloudcannon/cli validate`: config, six structure-value files and `initial-site-settings.json` all valid.
- [x] **Collection URLs match the build.** All 20 files: `pages` (4, `index.md` → `/`) and `blog` (16 across root, `notes/`, `talks/`) each have `dist/<url>index.html`. No drafts. `data` has `disable_url`.
- [x] **Schema keys resolve.** `_schema: page_builder` (`index.md`, `projects.md`) and `add_options` schemas `default`/`page_builder` (pages) and `default` (blog) all exist under their collection's `schemas`.
- [x] **Search index.** None (no Pagefind or other indexer).
- [x] **Schema round-trip.** Every content file's keys (nested `image.*` included) compared to its schema: no file is missing a key, so no backfill build was needed.
- [ ] **No hydration errors.** Not run: no browser. Vue islands are `Header.vue` (with `ThemeToggle.vue`) and `ScrollToTop.vue`, none holding regions. Handed to the user below.
- [x] **Hand off.** Below.

Astro (`astro/build.md`):

- [x] **Cache cleared first** (`rm -rf .astro dist`).
- [x] **Registration bundled and editor-only.** `_astro/registerComponents.*.js` (124 KB) registers all six block keys plus `social_link`; it is the only chunk containing editable-regions code. It is reached only through the dynamic `import()` behind `window.inEditorMode` in the 1.5 KB `BaseLayout` script. No built HTML page references it or modulepreloads it.
- [x] **`prose` typography.** `prose` comes from UnoCSS `presetTypography` plus `src/styles/prose.css`, not Tailwind, so the `@tailwindcss/typography` check doesn't apply. Every page loads the one stylesheet that holds the `.prose`, `.prose-body` and `.cms-editor-active` rules.

## Phase 4 claims checked in source

- **ClientRouter off in the editor.** Astro 5.6.2 `dist/transitions/router.js`: `transitionEnabledOnThisPage()` checks for `[name="astro-view-transitions-enabled"]`; without it, `navigate()` sets `location.href` and `onPopState` calls `location.reload()`. The built `BaseLayout` script removes that meta only when `window.inEditorMode` is set. Whether CloudCannon follows the in-iframe reload to the new file is visible only in the editor (handoff check 6).
- **Text regions inside links don't follow the link.** editable-regions 0.0.22 `nodes/editable-text.ts` `mount()`: `this.element.addEventListener("click", (e) => e.preventDefault())`. Applies to footer link labels, the licence label, social link labels, the contact email and project card name/description. Clicking the icon or padding of the same link (outside the region) still follows it; social and project links open a new tab.
- **Home social icons.** Built home page shows `i-ri-github-line` and `i-ri-twitter-x-line` for the two links with a header icon, matching `SocialLink.astro`'s override.

## Fixes made

None needed.

## Decisions and why

- **Hooks skipped locally only.** `SKIP_INSTALL_SIMPLE_GIT_HOOKS=1` kept the local install from writing a pre-commit hook into the working repo; CloudCannon runs `npm ci` unchanged, and the hook script can't fail it.
- **Image regions tested with a temporary value** rather than adding images to content: the guard keeps visitor markup unchanged and the copy was kept verbatim (audit default).
- **No preview server.** Every check here reads `dist/` directly; hydration needs a browser, so it goes to the user.

## Open questions

1. **Adding an image from the page.** With `image.src` empty, posts and default pages show no image region, so the first image is set in the sidebar and appears after a rebuild. Default: keep the guard (no empty `<img>` for visitors).
2. **Carried forward with their defaults:** header sidebar-only, footer links bound by index, ~7 KB extra visitor JS, `micromark` packages undeclared (visual-editing.md 1–5; content.md 1–5; configuration.md 1, 3).

## Handoff: CloudCannon checks

Already run locally: clean `npm ci` + `npm run build`, `cloudcannon validate`, collection URLs, schema keys and round-trip, region counts, editor bundle kept out of visitor pages.

Each check is yes/no or one pasted line.

1. Does the first CloudCannon build succeed? If no, paste the last error line from the build log.
2. In **Pages**, open **Projects** (`projects.md`) in the Visual Editor. Click a project's name ("Project Name") inside its card. Do you get a text cursor without a new tab opening?
3. On the home page in the Visual Editor, click the **GitHub** label under the social links. Do you get a text cursor without leaving the page?
4. On any page in the Visual Editor, edit the **Blog** label in the footer, then **Save**. Paste the file path the resulting commit changed (expected `src/data/footer.json`).
5. In **Blog**, open **Blog Title** (`post-1.md`) in the Visual Editor, change one word in the body, then **Save**. Does the commit diff show only that word changed in `src/content/blog/post-1.md`?
6. On the home page in the Visual Editor, click **Projects** in the site header. Does the editor's open file switch to `projects.md`? Then change one project name and **Save**: paste the file path the commit changed (expected `src/content/pages/projects.md`).
7. In **Blog**, click **+ Add** → **Note**. Paste the new file's path (expected under `src/content/blog/notes/`).
8. Open the built site's home page (the CloudCannon site URL) in dark mode with the browser console open. Paste any console line mentioning "Hydration", or "none".

Reply with the answers, and any failures or odd behaviour.
