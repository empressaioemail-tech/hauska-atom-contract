# Publish `@hauska/atom-contract` to npm

**Canonical path for the `hauska-sdk` account (Windows Hello / passkey 2FA).**  
Verified for **1.3.0** (2026-05-28) and **1.4.0** (2026-06-21).

Do **not** use granular access tokens or `npm publish` directly on this machine. They fail with `401` / `404` because:

- The account uses **`auth-type=web`** (passkey / Windows Hello), not TOTP.
- An expired `//registry.npmjs.org/:_authToken=` in `~/.npmrc` breaks `npm whoami` until removed.
- npm **staged publishing** defers 2FA to a browser + PIN approve step — the path that actually works.

Recovery codes (`npm_recovery_codes.txt`) are for **logging into npmjs.com** in a browser only. They are **not** passed to `npm publish --otp`.

---

## Before you publish

1. Bump `version` in `package.json` and add a `CHANGELOG.md` entry.
2. Run checks locally (or let `prepublishOnly` run them):

   ```powershell
   cd P:\hauska-atom-contract
   .\npm-hauska.ps1 run prepublishOnly
   ```

3. Commit and tag on git if this release is tied to a merge (optional but recommended).

---

## Publish (two steps)

All commands from `P:\hauska-atom-contract`. TLS requires `npm-hauska.ps1` (`NODE_OPTIONS=--use-system-ca`).

### Step 1 — stage

```powershell
cd P:\hauska-atom-contract
.\publish-1.5.0.ps1
```

(For 1.4.0 and earlier, use `.\publish-1.4.0.ps1`.)

This script:

1. Backs up and removes a stale `_authToken` from `~/.npmrc` (if present).
2. Runs `npm login --auth-type=web` (browser — sign in as **hauska-sdk**).
3. Runs `npm stage publish` (runs lint, test, build via `prepublishOnly`).
4. Prints the **stage id** (UUID).

Example output:

```text
+ @hauska/atom-contract@1.4.0 (staged with id 74b600c6-587f-41d1-a9ea-0ee796999ba2)
```

### Step 2 — approve (Windows PIN / passkey)

Copy the stage id **without angle brackets**:

```powershell
.\publish-approve-1.4.0.ps1 -StageId 74b600c6-587f-41d1-a9ea-0ee796999ba2
```

- Press ENTER when npm prints the auth URL (or open the URL in a browser).
- Complete Windows Hello / passkey when prompted.
- Expect: `Staged package ... approved and published successfully.`

### Verify

```powershell
.\npm-hauska.ps1 view @hauska/atom-contract version
```

---

## Manual equivalent (no helper scripts)

```powershell
cd P:\hauska-atom-contract
$env:NODE_OPTIONS = "--use-system-ca"

# If whoami fails with 401, remove expired _authToken from ~/.npmrc first.

npm login --auth-type=web --registry=https://registry.npmjs.org/
npm stage publish
npm stage list @hauska/atom-contract
npm stage approve <stage-id>    # browser + Windows PIN
npm view @hauska/atom-contract version
```

---

## What does NOT work here

| Approach | Result on this account |
|---|---|
| `npm publish` + granular token + `NODE_AUTH_TOKEN` | `401` on `whoami`, `404` on publish |
| Copying masked token prefix from npm tokens table (`npm_xxxx......yyyy`) | `401` — not the full token |
| `npm publish --otp <code>` | No TOTP app on this account (passkey only) |

Granular tokens may work in CI with bypass-2FA, but **operator publishes from this Windows machine use staged publishing**.

---

## Publish log

| Version | Date | Stage id | Notes |
|---|---|---|---|
| 1.3.0 | 2026-05-28 | `9d74b4a9-db6a-4f87-82a7-81d70b5648d8` | First staged publish; `publish-approve-1.3.0.ps1` |
| 1.4.0 | 2026-06-21 | `74b600c6-587f-41d1-a9ea-0ee796999ba2` | Read-contract subpath; `publish-1.4.0.ps1` + `publish-approve-1.4.0.ps1` |
| 1.5.0 | 2026-06-21 | operator-assisted | Conformance + export + widthed subpaths; stale stage rejected, re-staged at shasum `1422fb5d…` |

---

## Scripts in this repo

| Script | Purpose |
|---|---|
| `npm-hauska.ps1` | npm wrapper with Windows trust store for TLS |
| `publish-1.5.0.ps1` | Stage flow step 1 for 1.5.0 (login + `stage publish`) |
| `publish-1.4.0.ps1` | Stage flow step 1 for 1.4.0 (historical) |
| `publish-approve-1.4.0.ps1` | Stage flow step 2 (`stage approve`) — reusable for any version |
| `publish-approve-1.3.0.ps1` | Historical; same approve pattern as 1.3.0 |

For the next version bump: copy `publish-1.4.0.ps1` to `publish-X.Y.Z.ps1` or generalize the filename; `publish-approve-1.4.0.ps1` already accepts any `-StageId`.

---

## Security

- Do not commit tokens, recovery codes, or auth URLs from `npm stage approve`.
- After accidental recovery-code use, regenerate at https://www.npmjs.com/settings/hauska-sdk/tfa
