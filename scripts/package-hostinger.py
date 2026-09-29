#!/usr/bin/env python3
"""
Hostinger Production Deployment Packager
----------------------------------------
Builds Next.js locally and packages production-ready ZIP archives
for Hostinger LiteSpeed (lsnode.js) with zero-deployment errors:
1. Compiles optimized production build (BUILD_ID, server, static, manifests).
2. Prunes dev & cache artifacts (.next/cache, .next/dev).
3. Packages root server.js + pre-built .next + nodejs/ mirror structure.
4. Packages the updated WordPress plugin.
5. Copies all archives to public/ and Desktop for instant deployment.
"""

import os
import sys
import shutil
import zipfile
import subprocess

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESKTOP_DIR = os.path.expanduser("~/Desktop")
LOCAL_WP_PLUGIN_DIR = "/Users/divyanshu/Local Sites/gmb/app/public/wp-content/plugins/locable-directory"

os.chdir(PROJECT_DIR)

print("=" * 60)
print("🚀 HOSTINGER PRODUCTION DEPLOYMENT PACKAGER")
print("=" * 60)

# Step 1: Run production build locally
print("\n[1/5] Building Next.js production bundle locally...")
build_cmd = ["npm", "run", "build"]
res = subprocess.run(build_cmd)
if res.returncode != 0:
    print("❌ Build failed! Aborting packaging.")
    sys.exit(1)

build_id_path = os.path.join(PROJECT_DIR, ".next", "BUILD_ID")
if not os.path.exists(build_id_path):
    print("❌ Fatal: .next/BUILD_ID not found after build!")
    sys.exit(1)

with open(build_id_path, "r") as f:
    build_id = f.read().strip()
print(f"✅ Production build successful! Build ID: {build_id}")

# Step 2: Package WordPress Plugin
print("\n[2/5] Packaging Locable Directory WordPress Plugin...")
plugin_src = os.path.join(PROJECT_DIR, "wordpress-plugin", "locable-directory.php")
plugin_targets = [
    os.path.join(PROJECT_DIR, "public", "locable-directory.zip"),
    os.path.join(PROJECT_DIR, "public", "directory-helper.zip"),
    os.path.join(PROJECT_DIR, "wordpress-plugin", "locable-directory.zip"),
]
if os.path.exists(DESKTOP_DIR):
    plugin_targets.append(os.path.join(DESKTOP_DIR, "locable-directory.zip"))

for pz in plugin_targets:
    with zipfile.ZipFile(pz, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(plugin_src, "locable-directory/locable-directory.php")
    print(f"  -> Created: {pz}")

# Sync directly to LocalWP if directory exists
if os.path.exists(LOCAL_WP_PLUGIN_DIR):
    shutil.copy2(plugin_src, os.path.join(LOCAL_WP_PLUGIN_DIR, "locable-directory.php"))
    print(f"  -> Synced to LocalWP: {LOCAL_WP_PLUGIN_DIR}")

# Step 3: Collect files for Next.js production ZIP
print("\n[3/5] Collecting Next.js runtime files and pre-built .next...")
exclude_dirs = {"node_modules", ".git", ".idea", ".vscode", "__pycache__"}
exclude_files = {".DS_Store", "nextjs-project.zip", "locable-directory.zip", "directory-helper.zip"}

root_files = []
for root, dirs, files in os.walk(PROJECT_DIR):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    rel_root = os.path.relpath(root, PROJECT_DIR)
    parts = rel_root.split(os.sep)

    # Exclude internal build/dev caches
    if ".next" in parts:
        if "cache" in parts or "dev" in parts:
            continue

    for f in files:
        if f in exclude_files or f.endswith(".zip"):
            continue
        full_path = os.path.join(root, f)
        rel_path = os.path.relpath(full_path, PROJECT_DIR)
        root_files.append((full_path, rel_path))

# Step 4: Write Next.js ZIP archives (with root + nodejs/ mirror)
print("\n[4/5] Packaging Next.js production archive (with dual-structure)...")
next_targets = [
    os.path.join(PROJECT_DIR, "nextjs-project.zip"),
    os.path.join(PROJECT_DIR, "public", "nextjs-project.zip"),
]
if os.path.exists(DESKTOP_DIR):
    next_targets.append(os.path.join(DESKTOP_DIR, "nextjs-project.zip"))

for target in next_targets:
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as zf:
        for full_path, rel_path in root_files:
            # 1. Write file to archive root
            zf.write(full_path, rel_path)

            # 2. Also write runtime files into nodejs/ mirror for Hostinger hbuilds runner
            is_runtime = (
                rel_path.startswith(".next") or
                rel_path.startswith("public") or
                rel_path in {
                    "server.js", "package.json", "package-lock.json",
                    "next.config.mjs", ".env.production", ".env.local"
                }
            )
            if is_runtime:
                zf.write(full_path, os.path.join("nodejs", rel_path))

    size_mb = os.path.getsize(target) / (1024 * 1024)
    print(f"  -> Created: {target} ({size_mb:.2f} MB)")

# Step 5: Summary
print("\n[5/5] Deployment Package Complete!")
print("=" * 60)
print("Hostinger Settings Confirmed Working:")
print("  - Framework Preset : Other")
print("  - Node Version     : 22.x (or 20.x)")
print("  - Root Directory   : ./")
print("  - Build Command    : None (pre-compiled .next is in zip)")
print("  - Output Directory : (Empty)")
print("  - Entry File       : server.js")
print("=" * 60)
