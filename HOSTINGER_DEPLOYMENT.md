# Hostinger Node.js / LiteSpeed Production Deployment Guide

This project is fully configured for Hostinger Cloud / Shared Node.js Web App hosting running **LiteSpeed Web Server (`lsnode.js`)**.

---

## ⚡ Quick Packaging Command

Whenever you want to generate fresh, production-ready deployment packages:
```bash
npm run package
```
This single command automatically:
1. Runs `next build --webpack` locally to compile the production `.next` bundle.
2. Prunes dev and compiler caches (`.next/cache`, `.next/dev`).
3. Embeds `server.js` and pre-compiled `.next` in both root and `nodejs/` mirror structure.
4. Packages the updated WordPress plugin (`locable-directory.zip`).
5. Copies packages to `public/` and directly to your **Desktop** (`~/Desktop/nextjs-project.zip` & `~/Desktop/locable-directory.zip`).

---

## ⚙️ Hostinger hPanel Configuration (Verified & Working)

In **Hostinger hPanel $\rightarrow$ Websites $\rightarrow$ Node.js Application**:

### 1. Build Configuration
* **Framework preset**: `Other`
* **Node version**: `22.x` (or `20.x`)
* **Root directory**: `./`

### 2. Build and Output Settings
* **Build command**: `None` *(Crucial: Do not put `npm run build` here; the ZIP already contains the pre-compiled `.next` bundle, avoiding server RAM and timeout issues).*
* **Package manager**: `npm`
* **Output directory**: *(Leave EMPTY)*
* **Entry file**: `server.js`

### 3. Environment Variables
Add the following in the Environment Variables section:
* `NODE_ENV` = `production`
* `NEXT_PUBLIC_WORDPRESS_API_URL` = `https://admin.sandiegobusinesscircle.com`
* `WORDPRESS_API_URL` = `https://admin.sandiegobusinesscircle.com`

---

## 🔧 Architecture & Root-Cause Prevention

1. **Root `server.js`**:
   LiteSpeed (`lsnode.js`) requires a Node.js startup script (`server.js`). Next.js's CLI (`next start`) does not work without `server.js`. Our `server.js` handles production initialization, binds to `process.env.PORT`, and gracefully forwards requests to Next.js.
2. **Pre-Built `.next`**:
   Hostinger starts `server.js` directly without compiling. Excluding `.next` causes `Error: Could not find a production build in the '.next' directory`. `npm run package` ensures the pre-compiled `.next` directory is always bundled.
3. **Dual Structure (`root` + `nodejs/`)**:
   Hostinger's `hbuilds` runner runs applications from `/hbuilds/current/nodejs/`. The packager places runtime files at both the archive root AND inside `nodejs/`, preventing any symlink or working-directory mismatches.
