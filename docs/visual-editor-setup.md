# Activate click-to-edit text on the existing Vercel website

This change keeps the React/Vite design and GitHub/Vercel deployment. It adds an authenticated, in-page text editor with no CMS subscription and no new npm dependencies. Only named GitHub collaborators with repository write access can publish. Public visitors see the normal site.

## One-time setup (repository owner / Vercel project owner)

1. Review and merge this change. Check the build and editor tests first.
2. At https://github.com/settings/developers create an **OAuth App** (not a GitHub App). Use the actual canonical production origin from Vercel's Domains settings for the Homepage URL. For the current intended domain this is `https://huilin-huang.vercel.app`.
3. Set **Authorization callback URL** to `https://huilin-huang.vercel.app/api/editor?action=callback` (substitute your actual domain if different). Create a client secret. Keep it out of GitHub code, messages, screenshots, and chat.
4. In the existing Vercel project's **Settings → Environment Variables**, add the following for **Production only**:

| Variable | Value |
| --- | --- |
| `EDITOR_ORIGIN` | Actual production origin, with `https://` and no trailing slash |
| `EDITOR_CLIENT_ID` | OAuth App Client ID |
| `EDITOR_CLIENT_SECRET` | OAuth App Client secret |
| `EDITOR_SESSION_SECRET` | A fresh random secret of at least 32 characters; use `openssl rand -hex 32` |
| `EDITOR_USERS` | `hhllbao93` (change this list if needed) |
| `EDITOR_REPOSITORY` | `hhllbao93/huilin-huang-site` |
| `EDITOR_BRANCH` | `main` |

5. Redeploy in Vercel after setting the variables. The editor intentionally does not accept production sessions on preview domains.
6. Ensure each editor has write access to this GitHub repository. The GitHub OAuth consent asks for `public_repo`, which can access the user's public repositories; this endpoint is restricted to the configured repository and one text JSON file. Review that consent before enabling it. If repository rules prohibit direct pushes to `main`, publishing will be refused; do not weaken branch rules silently. A PR-based publishing flow would need a separate implementation.

## Everyday editing (Huilin)

1. Open the live website and click **Edit website** at the bottom.
2. Sign in with the authorized GitHub account on GitHub's own login page.
3. Click any outlined text and type or paste plain text. Draft changes appear immediately.
4. Navigate between pages to edit more text. Click **Preview** to hide the outlines and review. **Undo changes** discards all unsaved edits in this session.
5. Click **Save & publish**. This creates a GitHub commit, then Vercel rebuilds the live site. Wait for deployment before checking in another browser.
6. Click **Exit** to sign out. Unsaved edits do not survive closing/reloading the page; the browser warns before leaving with unsaved edits.

## What this first version edits

- Existing homepage, research, people, teaching, opportunities and footer text.
- Existing research-theme titles and descriptions, synchronized on Home and Research.
- Existing publication titles, authors and journals (search uses the edited values).
- Existing team-member names and course text.

This version does not add/remove/reorder publication or team records, replace images/CV files, change DOI/email/link targets, or edit publication status/year filters. Those require structured record/media controls and are not implied by editing displayed text. Edit visible link labels without changing where the links lead.

## Where content lives

Editable text is stored in `src/data/site-content.json`; JSX uses `EditableText` with stable keys. When changing the original data arrays later, keep publication/member/course keys attached to the same records. Reordering original arrays without migrating keys will attach overrides to the wrong records. Add new editable fields to the JSON and corresponding component together. Do not rerun a text extraction over existing keys.

API: `/api/editor?action=...`, using a Vercel Node 22 Function. GitHub OAuth tokens stay in encrypted, Secure, HttpOnly, SameSite cookies for four hours. Login uses expiring state and PKCE. Writes require a matching Origin, an allowed account, current repository write permission, and the current file SHA. The endpoint accepts only known string fields, always writes the fixed content JSON path, and never accepts source files or raw HTML. A stale revision is refused instead of overwriting another editor's work. Public rendering treats saved text as text, so angle brackets and quotes cannot become executable markup.

## Validation

- `npm run test:editor`: authorization, sessions, Origin/CSRF, OAuth state/PKCE, conflicts, fixed-path writes, and plain-text preservation.
- `npm run build`: full Vite build.
- Browser check: normal site, signed-in edit, type/paste, navigate, preview, undo, save, then reload after deployment. OAuth/publishing needs the real production app and environment configuration.

If `/research` works only when reached from Home, `vercel.json` also supplies the SPA history fallback. The `/api` and asset routes are excluded.

### Layout and text appearance

Click a paragraph or heading, then use Color, Italic, Width and Align in the editor toolbar. These settings apply to the whole selected paragraph or heading. Reset style restores its original appearance; it does not restore deleted paragraphs or reset ordering. All controls participate in Preview, Undo changes, and Save & publish.

Adjacent headings and paragraphs in a content section have a small ⠿ handle while editing. Drag the handle onto another paragraph in the same section to move it to that position. Move up / Move down offer the same operation for keyboard and touch users. Moving across sections, photos or cards is not supported. Deleted blocks can be restored with their style and order retained. The handles disappear in Preview and on the public site.

### Selected-word formatting

Highlight words with the mouse or keyboard before choosing Selected color or Italic. The toolbar reports “selected text only” and the number of selected characters; these controls are disabled with no highlighted text. Selection is retained while interacting with the color picker. A selection may span multiple editable text fields. Clear selected style removes only the highlighted words' color and italic overrides. Reset style remains a whole-paragraph/heading control for the older block styles, width, alignment and font size; use it to undo an earlier whole-heading color change.

Inline formatting persists as validated character ranges in `__inlineStyles`, and public/preview rendering uses text nodes and style spans. No user-supplied HTML is interpreted. Typing adjusts formatting ranges so later words keep their style. The API accepts the reserved metadata key without requiring a content migration and validates ranges against the final text before committing.

While editing, ordinary link clicks are reserved for editing. Hold Command on Mac or Ctrl on Windows/Linux and click to follow a link using the browser's usual new-tab behavior. This also applies to linked card backgrounds, icons and navigation. Public and Preview mode keep normal link behavior. Links are temporarily disabled during saving.

### Empty lines inside headings

Click a heading and choose Remove empty lines to hide empty text rows and their fixed line breaks. Remaining nonempty rows, text formatting and content are preserved. This applies in editing, Preview and the public page after Save & publish. Restore line breaks (or Reset style) restores the original rows, including their empty editable fields. Delete heading removes the entire heading and is a separate action. This cleanup handles the fixed `<br>` rows used by the existing multi-line headings.

### Whole sections on Our Team

The PI introduction, Students, Experience and service, and Join the team each have a section handle and Move section up / Move section down controls while editing. Drag the section handle onto another section, or use the buttons, to move the entire area with its images, cards and text. For example, moving Students down once places it below Experience and service. Moving it up again returns it directly below the PI introduction. These controls disappear in Preview and on the public site. Save & publish persists the order; Undo changes restores the saved order. Whole-section sorting currently applies to the Our Team page.
