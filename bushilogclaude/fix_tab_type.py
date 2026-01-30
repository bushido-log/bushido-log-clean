with open("App.tsx", "r") as f:
    content = f.read()

old1 = """const [tab, setTab] = useState<'consult' | 'goal' | 'review' | 'settings' | 'browser' | 'gratitude' | 'focus'>('consult');"""

new1 = """const [tab, setTab] = useState<'consult' | 'goal' | 'review' | 'settings' | 'browser' | 'gratitude' | 'focus' | 'alarm'>('consult');"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")