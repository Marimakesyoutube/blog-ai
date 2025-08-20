# Requires: Git in PATH, optional: curl/Invoke-WebRequest for hooks

param(
  [Parameter(Mandatory=$true)]
  [ValidateSet("stable","test")]
  [string]$Target
)

# === CONFIG ===
$StableBranch = "main"
$TestBranch   = "new-feature"

# Optional deploy hooks (set in system/user env or $env:VERCEL_DEPLOY_HOOK_MAIN)
# $env:VERCEL_DEPLOY_HOOK_MAIN = "https://api.vercel.com/v1/integrations/deploy/prj_.../main"
# $env:VERCEL_DEPLOY_HOOK_TEST = "https://api.vercel.com/v1/integrations/deploy/prj_.../new-feature"

# Check for dirty state
$dirty = git status --porcelain
if ($dirty) {
  Write-Host "❌ Uncommitted changes detected. Commit or stash before switching." -ForegroundColor Red
  git status
  exit 1
}

if ($Target -eq "stable") {
  $branch = $StableBranch
  $hook   = $env:VERCEL_DEPLOY_HOOK_MAIN
} else {
  $branch = $TestBranch
  $hook   = $env:VERCEL_DEPLOY_HOOK_TEST
}

Write-Host "➡️  Switching to branch: $branch"
git fetch origin $branch | Out-Null
git checkout $branch
git pull origin $branch --ff-only

if ($hook) {
  Write-Host "🚀 Triggering Vercel deploy for $branch ..."
  try {
    Invoke-WebRequest -Method POST -Uri $hook | Out-Null
    Write-Host "✅ Deploy hook sent"
  } catch {
    Write-Host "⚠️ Deploy hook failed (check URL)" -ForegroundColor Yellow
  }
} else {
  Write-Host "ℹ️ No deploy hook set. (Set VERCEL_DEPLOY_HOOK_MAIN/VERCEL_DEPLOY_HOOK_TEST to auto-deploy)"
}

Write-Host "✅ Done. Current branch: $(git rev-parse --abbrev-ref HEAD)"
