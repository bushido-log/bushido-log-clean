#!/usr/bin/env python3
APP_PATH = "App.tsx"
def main():
    with open(APP_PATH, "r", encoding="utf-8") as f:
        content = f.read()
    old = "top: SCREEN_H * 0.33, left: 60, right: 60, height: SCREEN_H * 0.24"
    new = "top: SCREEN_H * 0.42, left: 60, right: 60, height: SCREEN_H * 0.22"
    content = content.replace(old, new)
    print(f"[OK] Moved to 0.42")
    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.write(content)
if __name__ == "__main__":
    main()
