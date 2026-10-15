<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep this experience frontend-only with static mock data; no backend is required for the institutional UI.
- Use a shared DieselSite module for navigation, contact actions and service cards so all public pages remain consistent.
- Keep page-specific metadata on each content route and semantic visual tokens in the global stylesheet.
- Store catalog mock products and filtering in a client-safe data module; share ephemeral cart state through a root React provider so navigation preserves items without a backend or browser storage.
- Keep mock admin edits in an admin-layout React provider, isolated from the public catalog; the demo has no authentication or persistent writes.
- Use a shared right-side Sheet for the public cart, seeded from catalog data, with quantities and WhatsApp order text computed from current items.
