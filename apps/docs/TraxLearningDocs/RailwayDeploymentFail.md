# Railway Deployment Spike – Notes

## Goal
Validate early backend deployment for Anchor using Railway.

## Context
- Monorepo setup
- Backend located at `apps/backend`
- TypeScript + Node + Express
- Expo mobile client planned to consume this API

## What Was Attempted
- Railway GitHub integration
- Nixpacks-based deployment
- Explicit Dockerfile-based deployment
- Root directory + Dockerfile path configurations

## Issues Encountered
- Nixpacks deprecated / unstable behavior
- `tsc` permission errors in CI containers
- Alpine Linux + npm binary execution issues
- Railway path resolution conflicts with monorepo structure
- High tooling friction relative to MVP value

## What We Learned
- Production builds ≠ local dev
- TypeScript build tooling must be treated as infra
- Docker removes ambiguity but adds config overhead
- Monorepos amplify platform quirks
- Railway is optional, not foundational

## Decision
Pause Railway deployment for now.

Proceed with:
- Local-first backend development
- Mobile app development against local / LAN backend
- Revisit deployment later using a calmer, more explicit setup
  (Docker + Fly.io / Render / Railway retry)

## Next Steps
- Continue Anchor feature development
- Treat deployment as Task 2.5 / Task 3
- Avoid blocking product progress on infra
