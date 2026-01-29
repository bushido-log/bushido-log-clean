with open("App.tsx", "r") as f:
    content = f.read()

# タイマースタイルを追加
old1 = """  focusQText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },"""

new1 = """  focusQText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  focusTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  focusTimerBox: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  focusTimerBreak: {
    backgroundColor: '#2DD4BF',
  },
  focusTimerText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  focusTimerControl: {
    fontSize: 24,
  },
  focusSessionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    padding: 8,
    paddingHorizontal: 12,
  },
  focusSessionsText: {
    color: '#D4AF37',
    fontSize: 12,
  },
  focusEndText: {
    color: '#ef4444',
    fontSize: 12,
  },"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")