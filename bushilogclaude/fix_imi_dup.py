#!/usr/bin/env python3
with open('App.tsx','r',encoding='utf-8') as f:
    c = f.read()

# Remove the second duplicate block
old = """
  // ===== IMINASHI (Anti-cheat Yokai) =====
  const [isIminashiActive, setIsIminashiActive] = useState(false);
  const [iminashiMessage, setIminashiMessage] = useState('');
  const lastUserInputRef = useRef('');
  const actionStartTimeRef = useRef(Date.now());
  // ===== Inner World"""

new = """
  // ===== Inner World"""

count = c.count("// ===== IMINASHI (Anti-cheat Yokai) =====")
print(f'Found {count} IMINASHI blocks')

if count == 2 and old in c:
    c = c.replace(old, new, 1)  # remove second occurrence
    # Actually need to find the SECOND one. Let's be smarter:
    # Find first occurrence position
    first = c.find("// ===== IMINASHI (Anti-cheat Yokai) =====")
    second = c.find("// ===== IMINASHI (Anti-cheat Yokai) =====", first + 1)
    if second > 0:
        # Remove from second occurrence to "// ===== Inner World"
        end = c.find("  // ===== Inner World", second)
        if end > second:
            c = c[:second] + c[end:]
            print('Removed duplicate IMINASHI block OK')
    
    with open('App.tsx','w',encoding='utf-8') as f:
        f.write(c)
elif count == 1:
    print('Only 1 block, no fix needed')
else:
    print('Unexpected state')
