lines = open('App.tsx','r').readlines()
for i, line in enumerate(lines):
    if 'showSamuraiWalk && (' in line:
        lines[i+1] = "        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9997, backgroundColor: '#0a0a10' }}>\n"
        lines[i+2] = '          <SamuraiWalkScreen\n'
        lines[i+3] = '            todaySteps={walkData.todaySteps}\n'
        lines[i+4] = '            onClose={() => setShowSamuraiWalk(false)}\n'
        lines[i+5] = '            playTapSound={playTapSound}\n'
        lines[i+6] = '          />\n'
        lines[i+7] = '        </View>\n      )}\n'
        break
open('App.tsx','w').writelines(lines)
print('Done')
