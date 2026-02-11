#!/usr/bin/env python3
f=open('App.tsx','r'); c=f.read(); f.close()
n=c.count('top: SCREEN_H * 0.38')
c=c.replace('top: SCREEN_H * 0.38','top: SCREEN_H * 0.48')
f=open('App.tsx','w'); f.write(c); f.close()
print(f'Replaced {n} locations')
