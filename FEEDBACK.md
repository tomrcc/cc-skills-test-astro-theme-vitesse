# astro-theme-vitesse-vue feedback

## Run notes

- The header (`Header.vue`, a `client:load` Vue island) is edited in the sidebar only. Vue hydration can remove runtime-added controls inside region hosts, and the header's content spans three data files.
- Footer links are bound by index, so they can't be added or reordered on the page. The `/` separators are sibling elements in the same flex row.
- `RichText.astro` imports `micromark` and `micromark-extension-gfm` without declaring them; installing a new dependency wasn't permitted in that run.
- The home and projects pages now render through the catch-all route as page-builder pages.

## User testing

- Home and Projects open in the Visual Editor and match the Astro dev server. Social link labels edit, project icon changes re-render the card in place, and the blog body edits in place with prose styling.
- Project name in a card (text region inside `<a target="_blank">`): typing works and no tab opens, but no caret is visible. The GitHub social label (also a text region inside a link) shows its caret.
  - Fix agent's cause, from `@cloudcannon/editable-regions` 0.0.22 source: when a text region mounts, `setupListeners()` in `nodes/editable.ts` sets `draggable = false` on each ancestor `<a>`, because a draggable ancestor hides the caret in a contenteditable. When the `project_group` block re-renders on each keystroke, `updateNode()` copies the fresh render's attributes onto the card's `<a>`, which isn't a region host, so `draggable="false"` is removed and never set again. The social link's `<a>` is the array-item host and keeps the attribute. No click guard is involved: the runtime's own text region click handler stops the navigation.
  - Fix: `ListProjects.vue` renders `draggable="false"` on the card link under `ENV_CLIENT` only, so visitor HTML is unchanged.
  - Skill gap: `visual-editing-reference.md` § Regions inside interactive elements says clicking a text region inside an `<a>` follows the link, but at 0.0.22 the runtime prevents that itself. It also doesn't say that a re-render drops `draggable="false"` from a link that isn't a region host. Suggested new row: render `draggable="false"` on the link under the editor flag, or make the `<a>` the array-item host.
  - The fix didn't help: after rebuilding (confirmed in the editor bundle) and hard-refreshing, the caret is still missing. The cause is unexplained. The user judged it cosmetic: typing, saving and navigation all work. Don't turn the `draggable` theory into a skill rule.
- Hosted on CloudCannon: the build succeeds, a body edit on `post-1.md` commits only that word, and there are no hydration errors in the console. The user is happy with the site.
- The agent's handoff check "edit the Blog label in the footer" doesn't match the site: the footer has no Blog link. The orchestrator relayed it without verifying.
