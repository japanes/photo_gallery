---
name: custom-git-commit
description: Commits staged changes to git with an auto-generated description of what was done in the current iteration, then pushes to remote. Use when the user wants to commit and push their work. Does NOT add files — only commits what is already staged.
allowed-tools: Bash(git:*)
---

# Custom Git Commit

Commit currently staged changes with a detailed description of what was done, then push to the remote repository.

## Rules

1. **NEVER run `git add`** — do not add any files to the staging area. Only work with what is already staged.
2. If there are no staged changes, inform the user that there is nothing to commit and list unstaged/untracked files so they can stage manually.

## Steps

1. Run `git status` to check the current state of the repository.
2. Run `git diff --cached --stat` and `git diff --cached` to see exactly what is staged.
3. If nothing is staged, stop and tell the user. Show them unstaged changes and untracked files so they can decide what to stage.
4. Analyze the staged diff and compose a commit message:
   - **First line**: short summary (max 72 chars), imperative mood (e.g. "Add search feature", "Fix pagination bug")
   - **Body** (after a blank line): bullet-point list describing each meaningful change made in this iteration. Be specific — mention file names, functions, components, or logic that changed.
   - **Footer**: add `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`
5. Create the commit using a HEREDOC to preserve formatting:
   ```bash
   git commit -m "$(cat <<'EOF'
   Short summary here

   - Change detail 1
   - Change detail 2

   Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
   EOF
   )"
   ```
6. After a successful commit, run `git push`.
7. Report the result to the user: commit hash, summary, and push status.

## Edge Cases

- If `git push` fails (e.g. no remote, auth issue, behind remote), report the error clearly. Do NOT force-push.
- If the working directory is not a git repository, inform the user.
- Write the commit message in the same language the user has been using in the conversation (default: English).
