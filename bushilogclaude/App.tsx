import React, { useState } from 'react';
import IrieSplashScreen from './src/screens/IrieSplashScreen';
import IrieHomeScreen from './src/screens/IrieHomeScreen';
import PatwaTutorScreen from './src/screens/PatwaTutorScreen';
import QuizScreen from './src/screens/QuizScreen';
import CultureScreen from './src/screens/CultureScreen';
import JamaicaGuideScreen from './src/screens/JamaicaGuideScreen';

type Screen = 'splash' | 'home' | 'patwa' | 'culture' | 'jamaica' | 'quiz';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  if (screen === 'splash') return <IrieSplashScreen onFinish={() => setScreen('home')} />;
  if (screen === 'patwa') return <PatwaTutorScreen onBack={() => setScreen('home')} />;
  if (screen === 'quiz') return <QuizScreen onBack={() => setScreen('home')} />;
  if (screen === 'culture') return <CultureScreen onBack={() => setScreen('home')} />;
  if (screen === 'jamaica') return <JamaicaGuideScreen onBack={() => setScreen('home')} />;
  return <IrieHomeScreen onNavigate={(s) => setScreen(s as Screen)} />;
}
