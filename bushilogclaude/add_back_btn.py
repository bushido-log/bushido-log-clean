#!/usr/bin/env python3
path = 'src/components/BattleScreen.tsx'
with open(path, 'r') as f:
    lines = f.readlines()

insert = """                  <Pressable
                    onPress={() => { playTapSound(); onClose(); }}
                    style={({ pressed }) => [{ backgroundColor: '#1a1a2e', borderRadius: 10, padding: 8, alignItems: 'center', marginTop: 6, opacity: pressed ? 0.7 : 1, borderWidth: 1, borderColor: '#33333366' }]}
                  >
                    <Text style={{ color: '#666', fontSize: 12 }}>{'🏠 機能画面に戻る'}</Text>
                  </Pressable>
"""

lines.insert(432, insert)
with open(path, 'w') as f:
    f.writelines(lines)
print('✅ 機能画面に戻るボタン追加')
