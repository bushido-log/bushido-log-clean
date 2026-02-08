#!/usr/bin/env python3
import os, shutil, glob

src = os.path.expanduser("~/Desktop/bushilog yokai png")
dst = "assets/yokai"
os.makedirs(dst, exist_ok=True)

# Get all files
files = os.listdir(src)
copied = 0
errors = []

for f in sorted(files):
    full = os.path.join(src, f)
    if not os.path.isfile(full):
        continue
    
    # Fix name: remove extra spaces and double extensions
    clean = f
    # Fix "yokai_deebu.png .png" -> "yokai_deebu.png"
    # Fix "yokai_atodeyaru.png  .png" -> "yokai_atodeyaru.png"
    # Fix "loseyokai_deebu.png.mp4" -> "loseyokai_deebu.mp4"
    # Fix "loseyokai_peeping mp4.mp4" -> "loseyokai_peeping.mp4"
    # Fix "loseyokai_hikakuzou.png.mp4" -> "loseyokai_hikakuzou.mp4"
    
    # Remove spaces before extensions
    clean = clean.replace(' .png', '.png')
    clean = clean.replace(' .mp4', '.mp4')
    clean = clean.replace('  .png', '.png')
    
    # Fix double extensions
    if clean.endswith('.png.mp4'):
        clean = clean.replace('.png.mp4', '.mp4')
    if clean.endswith('.png.png'):
        clean = clean.replace('.png.png', '.png')
    
    # Fix "peeping mp4.mp4"
    clean = clean.replace(' mp4.mp4', '.mp4')
    
    dest_path = os.path.join(dst, clean)
    shutil.copy2(full, dest_path)
    copied += 1
    print(f"  {clean}")

print(f"\nCopied {copied} files to {dst}/")

# Check what we have
print("\n=== Summary ===")
yokai_names = ['mikkabozu', 'hyakume', 'deebu', 'atodeyaru', 'scroll', 
               'tetsuya', 'nidoneel', 'hikakuzou', 'peeping', 'mottemiteya', 
               'moumuri', 'atamadekkachi']

result_files = os.listdir(dst)
for name in yokai_names:
    png = f"yokai_{name}.png" in result_files
    mp4 = f"yokai_{name}.mp4" in result_files
    lpng = f"loseyokai_{name}.png" in result_files
    lmp4 = f"loseyokai_{name}.mp4" in result_files
    status = ""
    if png: status += "img "
    if mp4: status += "vid "
    if lpng: status += "lose_img "
    if lmp4: status += "lose_vid "
    missing = []
    if not png: missing.append("png")
    if not mp4: missing.append("mp4")
    if not lpng: missing.append("lose_png")
    if not lmp4: missing.append("lose_mp4")
    
    mark = "\u2705" if not missing else "\u274c"
    print(f"  {mark} {name}: {status}" + (f"MISSING: {', '.join(missing)}" if missing else "OK"))
