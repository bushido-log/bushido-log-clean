#!/usr/bin/env python3
# -*- coding: utf-8 -*-
with open('App.tsx','r',encoding='utf-8') as f:
    c = f.read()

# Fix 1: Remove the duplicate "← 道場に戻る" inside renderInnerWorldTab
# (the top nav bar already has one)
old_back = """        <Pressable
          onPress={() => { playTapSound(); setTab('consult'); setShowStartScreen(true); }}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
        >
          <Text style={{ color: '#888', fontSize: 16 }}>\u2190 \u9053\u5834\u306b\u623b\u308b</Text>
        </Pressable>

        <View style={{ alignItems: 'center', marginBottom: 32 }}>"""

new_back = """        <View style={{ alignItems: 'center', marginBottom: 32, marginTop: 10 }}>"""

if old_back in c:
    c = c.replace(old_back, new_back)
    print('1/2 Removed duplicate back button OK')
else:
    print('1/2 SKIP')

# Fix 2: Make the inner world scrollable and add padding
old_iw = "    return (\n      <View style={{ flex: 1, padding: 24 }}>"
new_iw = "    return (\n      <ScrollView style={{ flex: 1, padding: 20 }} contentContainerStyle={{ paddingBottom: 40 }}>"

old_iw_end = """        </Pressable>
      </View>
    );
  };

  const renderAlarmTab"""

new_iw_end = """        </Pressable>
      </ScrollView>
    );
  };

  const renderAlarmTab"""

if old_iw in c:
    c = c.replace(old_iw, new_iw)
    print('2a ScrollView wrapper OK')
else:
    print('2a SKIP')

if old_iw_end in c:
    c = c.replace(old_iw_end, new_iw_end)
    print('2b ScrollView close OK')
else:
    print('2b SKIP')

with open('App.tsx','w',encoding='utf-8') as f:
    f.write(c)

print('=== Layout fix done ===')
