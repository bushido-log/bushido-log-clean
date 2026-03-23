import React, { useState, useEffect } from 'react';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { LanguageProvider } from './src/context/LanguageContext';
import IrieSplashScreen from './src/screens/IrieSplashScreen';
import IrieHomeScreen from './src/screens/IrieHomeScreen';
import PatwaTutorScreen from './src/screens/PatwaTutorScreen';
import QuizScreen from './src/screens/QuizScreen';
import CultureScreen from './src/screens/CultureScreen';
import JamaicaGuideScreen from './src/screens/JamaicaGuideScreen';
import SettingsScreen from './src/screens/SettingsScreen';

type Screen = 'splash' | 'home' | 'patwa' | 'culture' | 'jamaica' | 'quiz' | 'settings';

const RC_API_KEY_IOS = 'appl_gsGtbNRejccHkDtvJysPiHHMLtU';

function AppInner() {
  const [screen, setScreen] = useState<Screen>('splash');
  if (screen === 'splash') return <IrieSplashScreen onFinish={() => setScreen('home')} />;
  if (screen === 'patwa') return <PatwaTutorScreen onBack={() => setScreen('home')} />;
  if (screen === 'quiz') return <QuizScreen onBack={() => setScreen('home')} />;
  if (screen === 'culture') return <CultureScreen onBack={() => setScreen('home')} />;
  if (screen === 'jamaica') return <JamaicaGuideScreen onBack={() => setScreen('home')} />;
  if (screen === 'settings') return <SettingsScreen onBack={() => setScreen('home')} />;
  return <IrieHomeScreen onNavigate={(s) => setScreen(s as Screen)} />;
}

export default function App() {
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    Purchases.configure({ apiKey: RC_API_KEY_IOS });
  }, []);
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
