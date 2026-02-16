---
name: custom-git-commit
description: Commits changes to git with an auto-generated description of what was done in the current iteration, then pushes to remote. Use when the user wants to commit and push their work. Stages all modified files automatically if nothing is staged.
disable-model-invocation: true
allowed-tools: Bash(git:*)
---

# Custom Git Commit

Commit currently staged changes with a detailed description of what was done, then push to the remote repository.

## Rules

1. If there are **staged changes**, commit only those (do not add anything extra).
2. If there are **no staged changes** but there are **modified tracked files**, run `git add -u` to stage all modified/deleted tracked files, then commit.
3. If there are **no staged changes** and **no modified tracked files**, inform the user that there is nothing to commit.
4. **Never** stage untracked files automatically — only the user decides when to add new files.

## Steps

1. Run `git status` to check the current state of the repository.
2. Run `git diff --cached --stat` and `git diff --cached` to see exactly what is staged.
3. If nothing is staged, check for modified tracked files. If they exist, run `git add -u` to stage them, then re-run `git diff --cached --stat` and `git diff --cached`. If no modified files either, stop and inform the user.
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
