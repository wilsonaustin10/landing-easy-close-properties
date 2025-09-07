# Rollback Instructions

## Quick Rollback

If any issues arise from the performance optimizations, follow these steps:

### Option 1: Full Revert (Recommended)
```bash
# Switch to main branch
git checkout main

# Delete the feature branch locally
git branch -D feat/perf-easyclose-m01

# If pushed to remote, delete remote branch
git push origin --delete feat/perf-easyclose-m01
```

### Option 2: Selective Revert
```bash
# Stay on feature branch
git checkout feat/perf-easyclose-m01

# Revert specific commits (use git log to find commit hashes)
git revert <commit-hash>

# Or reset to baseline commit
git reset --hard 693f0d2
```

### Option 3: Cherry-pick Safe Changes
```bash
# Create new branch from main
git checkout -b feat/perf-safe main

# Cherry-pick only safe optimizations
git cherry-pick <safe-commit-hash>
```

## Verification After Rollback

1. **Rebuild the application**
   ```bash
   npm run build
   npm start
   ```

2. **Test critical functionality**
   - Submit a test lead through the form
   - Verify Google Analytics events fire
   - Check that all pages load correctly

3. **Clear caches**
   - Clear Vercel cache if deployed
   - Clear browser cache for testing

## Known Safe Optimizations

These changes can be kept even during rollback:
- WebP image conversions (backward compatible)
- Accessibility improvements (labels, ARIA attributes)
- Next.js config optimizations

## Emergency Contacts

If issues persist after rollback:
- Check Vercel deployment logs
- Review Google Analytics real-time data
- Monitor error tracking (if configured)