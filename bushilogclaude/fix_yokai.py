#!/usr/bin/env python3
import os, shutil

dst = "assets/yokai"

# Fix known issues
fixes = {
    # atodeyaru - has "yokai_atodeyaru.png .png" 
    "yokai_atodeyaru.png .png": "yokai_atodeyaru.png",
    # atamadekkachi - typo "tyokai"
    "tyokai_atamadekkachi.png\uff08.png": "yokai_atamadekkachi.png",
    # moumuri - "Mou Muri.png" and "Mou Muri 2.png"
    "Mou Muri.png": "yokai_moumuri.png",
    "Mou Muri 2.png": "loseyokai_moumuri.png",
}

for old, new in fixes.items():
    old_path = os.path.join(dst, old)
    new_path = os.path.join(dst, new)
    if os.path.exists(old_path):
        shutil.move(old_path, new_path)
        print(f"  Fixed: {old} -> {new}")
    else:
        print(f"  Not found: {old}")

# Check what's still missing
print("\n=== Recheck ===")
yokai_names = ['mikkabozu', 'hyakume', 'deebu', 'atodeyaru', 'scroll', 
               'tetsuya', 'nidoneel', 'hikakuzou', 'peeping', 'mottemiteya', 
               'moumuri', 'atamadekkachi']

result_files = os.listdir(dst)
for name in yokai_names:
    missing = []
    if f"yokai_{name}.png" not in result_files: missing.append("png")
    if f"yokai_{name}.mp4" not in result_files: missing.append("mp4")
    if f"loseyokai_{name}.png" not in result_files: missing.append("lose_png")
    if f"loseyokai_{name}.mp4" not in result_files: missing.append("lose_mp4")
    
    mark = "\u2705" if not missing else "\u274c"
    print(f"  {mark} {name}" + (f" MISSING: {', '.join(missing)}" if missing else " OK"))
