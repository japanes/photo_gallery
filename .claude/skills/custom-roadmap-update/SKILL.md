---
name: custom-roadmap-update
description: Updates docs/ROADMAP.md to mark completed tasks. Reads the current roadmap, identifies which tasks have been completed based on user input or conversation context, and toggles checkboxes from [ ] to [x].
disable-model-invocation: true
compatibility: Designed for Claude Code. Requires access to the project filesystem.
allowed-tools: Read Edit Glob Grep
metadata:
  author: team
  version: "1.0"
---

# Custom Roadmap Update

Mark completed tasks in `docs/ROADMAP.md` by toggling checkboxes from `- [ ]` to `- [x]`.

## When to activate

- **ONLY** when the user explicitly invokes `/custom-roadmap-update`
- **NEVER** activate automatically, proactively, or as a side effect of other work
- **NEVER** activate based on conversation context alone — require explicit invocation

## Steps

1. **Read the roadmap**: Read `docs/ROADMAP.md` to get the current state of all tasks.

2. **Determine what to mark**: Check if the user provided arguments (task descriptions or line numbers). If yes, use those. If no arguments were provided, review the conversation history to identify tasks that were demonstrably completed in this session. Only mark tasks that are genuinely done — do not guess or assume.

3. **Show the user what will change**: Before editing, list the exact tasks you intend to mark as completed. Format:
   ```
   Tasks to mark as completed:
   - Line N: "Task description here"
   - Line M: "Task description here"
   ```
   Ask the user for confirmation before proceeding.

4. **Apply changes**: After confirmation, use the `Edit` tool to replace each `- [ ]` with `- [x]` for the confirmed tasks. Edit one task at a time to avoid mistakes.

5. **Handle parent tasks**: If ALL sub-tasks under a parent task are now `[x]`, also mark the parent task as `[x]`.

6. **Report result**: Show the updated section(s) of the roadmap so the user can verify.

## Rules

- **Read-only by default**: Do NOT edit the file until the user confirms the proposed changes.
- Only modify `docs/ROADMAP.md` — never touch any other file.
- Never uncheck a task (never change `[x]` to `[ ]`) unless the user explicitly asks.
- If no tasks can be identified as completed, inform the user and do nothing.
- Preserve the exact formatting, indentation, and structure of the roadmap file.
- Write responses in the same language the user has been using in the conversation.

## Examples

**User invokes with arguments:**
```
/custom-roadmap-update Convert PhotoGalleryComponent to standalone, Remove GalleryModule
```
→ Find matching lines, propose marking them, confirm, edit.

**User invokes without arguments:**
```
/custom-roadmap-update
```
→ Review conversation context, propose tasks that were completed in this session, confirm, edit.

## Edge Cases

- If a task description is ambiguous and matches multiple lines, ask the user to clarify.
- If the file does not exist, inform the user.
- If all tasks are already marked as completed, inform the user that nothing needs to change.
