import { Audio } from 'expo-av';
import { MASTER_VOLUME } from '../data/constants';
import {
  STARTUP_SOUND, TAP_SOUND, CONFIRM_SOUND, RITUAL_SOUND,
  CHECK_SOUND, CORRECT_SOUND, WRONG_SOUND, LEVELUP_SOUND,
  EXP_SOUND, EVOLUTION_SOUND, WIN_SOUND, FAIL_SOUND,
  ATTACK_SOUND, ENTER_SOUND, FOCUS_START_SOUND,
} from '../data/assets';

export async function playSound(source: any) {
  try {
    const { sound } = await Audio.Sound.createAsync(source);
    await sound.setVolumeAsync(MASTER_VOLUME);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (e) {
    console.log('sound error', e);
  }
}

export async function playPressSound() { await playSound(STARTUP_SOUND); }
export async function playTapSound() { await playSound(TAP_SOUND); }
export async function playConfirmSound() { await playSound(CONFIRM_SOUND); }
export async function playRitualSound() { await playSound(RITUAL_SOUND); }
export async function playCheckSound() { await playSound(CHECK_SOUND); }
export async function playCorrectSound() { await playSound(CORRECT_SOUND); }
export async function playWrongSound() { await playSound(WRONG_SOUND); }
export async function playLevelupSound() { await playSound(LEVELUP_SOUND); }
export async function playExpSound() { await playSound(EXP_SOUND); }
export async function playEvolutionSound() { await playSound(EVOLUTION_SOUND); }
export async function playWinSound() { await playSound(WIN_SOUND); }
export async function playFailSound() { await playSound(FAIL_SOUND); }
export async function playAttackSound() { await playSound(ATTACK_SOUND); }

export async function playEnterSound() {
  try {
    const { sound } = await Audio.Sound.createAsync(ENTER_SOUND);
    await sound.setVolumeAsync(0.15);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
    });
  } catch (e) {
    console.log('enter sound error', e);
  }
}

export async function playFocusStartSound() { await playSound(FOCUS_START_SOUND); }
