#!/usr/bin/env python3
"""吹き出し中心にテキスト移動"""
APP_PATH = "App.tsx"

def main():
    with open(APP_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Current position
    old = "top: SCREEN_H * 0.28, left: 55, right: 55, height: SCREEN_H * 0.28"
    new = "top: SCREEN_H * 0.38, left: 60, right: 60, height: SCREEN_H * 0.22"

    n = content.count(old)
    if n == 0:
        # Try original if fixes patch didn't apply
        old = "top: SCREEN_H * 0.22, left: 50, right: 50, height: SCREEN_H * 0.32"
        new = "top: SCREEN_H * 0.38, left: 60, right: 60, height: SCREEN_H * 0.22"
        n = content.count(old)

    content = content.replace(old, new)
    print(f"[OK] Moved text to 0.38 ({n} locations)")

    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    main()
