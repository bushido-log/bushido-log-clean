"""相談画面デザイン変更"""
s = open('App.tsx').read()

# Replace consultation select JSX
old = """    if (consultMode === 'select') {
      return (
        <ImageBackground source={CONSULT_BG} style={styles.consultSelectBg} resizeMode="cover">
          <View style={styles.consultSelectContainer}>
            {/* タイトル */}
            <View style={styles.consultTitleBox}>
              <Text style={styles.consultTitle}>サムライ相談所</Text>
              <Text style={styles.consultSubtitle}>〜欲望を一刀両断〜</Text>
            </View>
            
            <Pressable
              style={styles.consultSelectButton}
              onPress={() => { playEnterSound(); setConsultMode('text'); setIsSummoned(true); }}
            >
              <Text style={styles.consultSelectButtonText}>君の欲望を話してみろ</Text>
            </Pressable>
            
            <Pressable
              style={styles.consultSelectButton}
              onPress={() => { playEnterSound(); setConsultMode('visualize'); }}
            >
              <Text style={styles.consultSelectButtonText}>君の欲望を見せてみろ</Text>
            </Pressable>
          </View>
        </ImageBackground>
      );
    }"""

new = """    if (consultMode === 'select') {
      return (
        <ImageBackground source={CONSULT_BG} style={styles.consultSelectBg} resizeMode="cover">
          <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 30, paddingTop: 80 }}>
            {/* Logo */}
            <Text style={{ fontSize: 28, color: '#888', marginBottom: 8 }}>{'⚔️'}</Text>
            <Text style={{ color: '#1a1a1a', fontSize: 28, fontWeight: '900', letterSpacing: 4, marginBottom: 4 }}>{'BUSHIDO LOG'}</Text>
            <Text style={{ color: '#555', fontSize: 12, letterSpacing: 2, marginBottom: 50, fontStyle: 'italic' }}>{'Discipline. Desire. Control.'}</Text>
            
            <Pressable
              style={{ backgroundColor: '#2ECC40', borderRadius: 28, paddingVertical: 28, paddingHorizontal: 24, width: '85%', alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6 }}
              onPress={() => { playEnterSound(); setConsultMode('text'); setIsSummoned(true); }}
            >
              <Text style={{ color: '#1a1a1a', fontSize: 22, fontWeight: '900', textAlign: 'center', lineHeight: 32 }}>{'サムライキング\\nに相談する'}</Text>
            </Pressable>
            <Text style={{ color: '#1a1a1a', fontSize: 13, fontWeight: '900', letterSpacing: 2, marginBottom: 30 }}>{'SAMURAI KING CHAT'}</Text>
            
            <Pressable
              style={{ backgroundColor: '#2ECC40', borderRadius: 28, paddingVertical: 28, paddingHorizontal: 24, width: '85%', alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6 }}
              onPress={() => { playEnterSound(); setConsultMode('visualize'); }}
            >
              <Text style={{ color: '#1a1a1a', fontSize: 22, fontWeight: '900', textAlign: 'center', lineHeight: 32 }}>{'サムライキングに\\n欲望を見せろ'}</Text>
            </Pressable>
            <Text style={{ color: '#1a1a1a', fontSize: 13, fontWeight: '900', letterSpacing: 2 }}>{'FACE YOUR DESIRE'}</Text>
          </View>
        </ImageBackground>
      );
    }"""

if old in s:
    s = s.replace(old, new, 1)
    print('[OK] 相談画面デザイン変更')
else:
    print('[SKIP] 相談画面が見つからない')

open('App.tsx', 'w').write(s)
print('Done')
