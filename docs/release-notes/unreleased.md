# Mindwtr Unreleased

Changes collected after `v0.9.10` and before the next version tag.

## Highlights

- Desktop sync status updates are now device-local, avoiding full snapshot rewrites and reducing stale-store overwrite risk.
- Calendar planning is more useful on desktop and mobile, with due next actions included, a collapsible desktop planning panel, and shared mobile planning-list UI.
- Follow-up fixes tightened sync diagnostics, token autocomplete, MCP task creation, board sort feedback, production store compatibility, and auto-archive coverage.
- Documentation now covers manual sync, Calendar planning, Weekly Review Mind Sweep, MCP people tools, Core person APIs, entity persistence checks, and current release-note indexes.

## Full Change List

- refactor(mobile): share calendar planning list
- feat(calendar): allow collapsing planning panel
- docs: add entity persistence checklist
- refactor(store): centralize auto-archive entry points
- fix(store): avoid visible-only collection adoption
- test(sync): cover one-sided attachment uri sanitization
- docs: refresh workflow and API guides
- chore(mobile): clean up sync and focus code
- fix(board): explain sort-controlled ordering
- fix(mcp): identify newly added task after refresh
- fix(calendar): include due next actions in planning
- fix(desktop): avoid implicit token autocomplete selection
- fix(sync): gate payload trace diagnostics
- docs(sync): clarify desktop auto-sync triggers
- fix(sync): store local sync status outside snapshots
- fix(mobile): clarify calendar planning and future starts
- feat(review): add mind sweep weekly review nudge
- feat(calendar): add next action planning panel
- feat(feedback): guide in-app reports
- fix(sync): stop desktop sqlite watcher loops
- fix(sync): back off desktop auto-sync failures
- fix(sync): preserve duplicate areas after merge
- test(sync): update desktop fast-sync status expectation
- chore(sync): add desktop sync loop diagnostics
- fix(sync): preserve data when writing sync status
- fix(sync): quiet desktop WebDAV retry loops
- fix(desktop): pass task creator to inbox processor
- fix(inbox): reveal quick-complete check on row hover
- fix(inbox): center mind sweep prompt in empty inbox
- fix(board): reconcile board ordering conflicts
- fix(inbox): refine mind sweep entry points on desktop and mobile
- feat(desktop): add manual sync shortcut
- fix(desktop): reduce unnecessary auto sync
- fix(calendar): show projected recurrence dates
- fix(mobile): ignore repeated native markdown pair changes
- fix(projects): sort completed tasks by completion date
- feat(review): add label autocomplete to inbox processing
- fix(mcp): retry desktop sqlite write conflicts safely
- fix(mobile): prevent overlapping calendar blocks
- fix(mobile): compact icon-only project toolbar with sort menu
- fix(mobile): declutter project detail toolbar and meta controls
- fix(sync): ignore sync-owned sqlite writes
- fix(android): dismiss fired notification on snooze
- fix(mobile): pin project task controls
- fix(android): default FOSS release app config
- fix(recurrence): preserve date-only fluid starts
- test(desktop): keep review calendar fixture current
- ci(release): remove official homebrew cask bump
- ci(android): parallelize release package builds
