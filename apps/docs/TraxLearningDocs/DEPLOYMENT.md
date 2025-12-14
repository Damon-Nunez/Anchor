# Anchor Backend Deployment Log (Week 1)

This document captures **exactly what happened** while deploying the Anchor backend, **why it was hard**, what broke, and the **final working path** (Fly.io + PowerShell). It’s written so “future us” (or a teammate/mentor) can reproduce the deployment without re-living the pain.

---

## Why we’re documenting this

Deployment issues are rarely “one bug.” They’re usually a chain of:
- platform assumptions (buildpacks vs Docker vs monorepo paths)
- tooling differences (Windows vs Linux containers)
- TypeScript + runtime expectations
- environment variables + port binding rules

Documentation turns a chaotic day into:
- a repeatable checklist
- a known-good configuration
- a faster onboarding path
- fewer “works on my machine” traps

This is also why we tackled deployment early: **deployment friction gets more expensive the more features you add.**

---

## Context: Repo structure (important)

Anchor is a monorepo.

Backend lives here:
```
/apps/backend
```

Most platforms assume your app lives at repo root unless explicitly told otherwise.

---

## What we tried first: Railway (what failed and why)

### Symptom 1 — `tsc` / `ts-node` Permission Denied
Repeated build errors like:
- `sh: 1: tsc: Permission denied`
- `sh: 1: ts-node: Permission denied`

Likely causes:
- devDependencies not available at build time
- node binaries not executable in container
- monorepo + builder mismatch

### Symptom 2 — Dockerfile path confusion
Errors like:
- `Dockerfile 'apps/backend/Dockerfile' does not exist`

Caused by:
- incorrect root directory resolution
- platform assumptions conflicting with monorepo layout

**Decision:** stop stacking complexity and switch platforms.

---

## Platform switch: Why Fly.io

Fly.io offered:
1. CLI-first deployment (less UI guesswork)
2. Clear logs and runtime behavior
3. Easier iteration from local machine

---

## Fly.io Deployment (the working path)

### Step 1 — Install Fly CLI (`flyctl`)
On Windows, we installed Fly using PowerShell.

Important note:
- Docs reference `pwsh` (PowerShell 7)
- Windows PowerShell ≠ PowerShell 7
- This caused initial confusion but was resolved

### Step 2 — Fix PATH
Added Fly to PATH:
```
C:\Users\User\.fly\bin
```

Restarted terminal and verified:
```
fly --version
```

---

### Step 3 — Run `fly launch` **inside the backend folder**
Critical for monorepos:
```
cd apps/backend
fly launch
```

Accepted defaults:
- region
- machine size
- no database yet (intentional)

Fly generated `fly.toml` and deployed.

---

## The 502 Error (and why it happened)

Deployment succeeded, but browser returned:
```
HTTP ERROR 502
```

### Root cause
App was:
- running
- but not reachable by Fly’s proxy

Logs indicated:
- app was not listening on `0.0.0.0`
- or not using the assigned `PORT`

---

## The fix: correct server binding

### Final working server code
```ts
import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Anchor backend is alive");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
```

Key rules:
- Always respect `process.env.PORT`
- Always bind to `0.0.0.0`
- Health route proves liveness

Result:
✅ Public Fly URL returns `"Anchor backend is alive"`

---

## TypeScript + Express import gotcha

### Recommended fix
Enable interop in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "esModuleInterop": true
  }
}
```

Then use:
```ts
import express from "express";
```

---

## Do you need to commit before deploying?

- **Fly CLI (`fly deploy`)**: ❌ No (uses local files)
- **GitHub CI deploys**: ✅ Yes

Best practice: commit once stable.

---

## Why we delayed Postgres / Prisma

We intentionally paused DB setup because:
- deployment was not stable yet
- DB adds many new failure vectors
- easier to debug infra before data

Now that deployment works, DB work is safe.

---

## Final outcome

✅ Backend deployed  
✅ Public URL live  
✅ Health route works  
✅ Logs accessible  
✅ Deployment no longer blocking progress  

---

## Next steps

### Deployment
- [ ] Add `/health` route
- [ ] Add secrets (JWT, DB URL)
- [ ] Verify prod builds remain stable

### Auth (Basic)
- [ ] Design User model
- [ ] Register endpoint
- [ ] Login endpoint
- [ ] JWT issuance
- [ ] Frontend auth test

---

## Lessons learned

- Monorepos require explicit paths
- Repeating errors = wrong variable
- “Deployed” ≠ “reachable”
- Logs > guessing
- Early deployment saves weeks later

---

**Anchor backend deployment is officially unblocked.**
