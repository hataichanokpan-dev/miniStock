# --- Claude execution environment (cron-safe) ---
export EDITOR="${EDITOR:-nano}"
export VISUAL="${VISUAL:-nano}"
export CI=1
export NO_COLOR=1

echo "[agent] Running Claude for issue #$ISSUE_NUMBER..."

# Run Claude Code (stdin prompt). If Claude exits non-zero, mark blocked and stop.
if ! claude <<'PROMPT'
You are the repo maintainer.

Task: Implement the GitHub issue described below.

Hard rules:
- PR only; do NOT push to main directly.
- Keep changes small and focused (prefer <= 300 lines changed). If larger, split and leave a note.
- Do not add secrets or real API keys. Only update .env.example if needed.
- Prefer Next.js App Router conventions.
- Must pass: npm run lint AND npm run build.
- If anything is unclear, make a reasonable MVP choice and document it briefly in README or comments.
- Do not introduce heavy dependencies unless necessary.

Output requirements:
- Implement the change in the codebase.
- Ensure lint/build pass locally.
- Summarize what you changed at the end.
PROMPT
then
  echo "[agent] Claude failed (non-zero exit). Marking blocked."
  gh issue comment "$ISSUE_NUMBER" -R "$REPO" --body "Claude run failed on the runner. Please check runner logs and clarify requirements if needed."
  gh issue edit "$ISSUE_NUMBER" -R "$REPO" --remove-label "$LABEL_READY" --add-label "agent:blocked"
  exit 1
fi

# --- Quality gates ---
echo "[agent] Running lint/build..."
npm run lint
npm run build

# --- Commit only actual changes ---
git add -A
if git diff --cached --quiet; then
  echo "[agent] No changes detected. Marking blocked."
  gh issue comment "$ISSUE_NUMBER" -R "$REPO" --body "I couldn't produce a meaningful change from this issue. Please clarify requirements or provide more concrete acceptance criteria."
  gh issue edit "$ISSUE_NUMBER" -R "$REPO" --remove-label "$LABEL_READY" --add-label "agent:blocked"
  exit 0
fi

# --- Commit message: safer than always 'feat' ---
COMMIT_MSG="chore: address issue #$ISSUE_NUMBER"
git commit -m "$COMMIT_MSG"

# --- Push branch (SSH) ---
echo "[agent] Pushing branch $BRANCH..."
git push -u origin "$BRANCH"

# --- Create PR (idempotent): if PR already exists, reuse it ---
echo "[agent] Creating PR (or reusing existing)..."
PR_URL="$(
  gh pr view "$BRANCH" -R "$REPO" --json url --jq '.url' 2>/dev/null || true
)"

if [ -z "${PR_URL:-}" ]; then
  PR_URL="$(
    gh pr create -R "$REPO" \
      --base main \
      --head "$BRANCH" \
      --title "[AI] #$ISSUE_NUMBER $TITLE" \
      --body "Auto PR for issue #$ISSUE_NUMBER."
  )"
fi

# --- Update issue status ---
gh issue comment "$ISSUE_NUMBER" -R "$REPO" --body "Opened PR: $PR_URL"
gh issue edit "$ISSUE_NUMBER" -R "$REPO" --remove-label "$LABEL_READY" --add-label "agent:done"

echo "[agent] Done. PR: $PR_URL"
