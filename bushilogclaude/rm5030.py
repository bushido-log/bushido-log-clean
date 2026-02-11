#!/usr/bin/env python3
APP_PATH = "App.tsx"
lines = open(APP_PATH,'r').readlines()
# Line 5030 = index 5029
if 'speakSamurai' in lines[5029]:
    lines[5029] = ''
    print("OK")
open(APP_PATH,'w').writelines(lines)
