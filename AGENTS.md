<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Hostinger Production Deployment Rules

1. **Never exclude `.next` from production ZIP archives**:
   Hostinger runs LiteSpeed Node.js (`lsnode.js`) without compiling `next build` on the server. The production package must include the pre-compiled `.next` folder (`BUILD_ID`, `server/`, `static/`, manifests) with internal `cache/` and `dev/` pruned.
2. **Always preserve `server.js` at project root**:
   Hostinger's LiteSpeed runner requires a root entry file `server.js` that listens on `process.env.PORT` and boots Next.js in production mode.
3. **Use the automated packaging tool**:
   Always run `npm run package` (or `python3 scripts/package-hostinger.py`) to generate production ZIP archives. It automatically compiles `.next`, packages both root and `nodejs/` mirror files, and syncs to Desktop.
4. **Hostinger hPanel Verified Settings**:
   - Framework preset: `Other`
   - Node version: `22.x` (or `20.x`)
   - Root directory: `./`
   - Build command: `None`
   - Entry file: `server.js`
