// src/storage/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '../constants/keys'

// 保存
export const saveData = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('save error', e)
  }
}

// 取得
export const loadData = async (key: string) => {
  try {
    const data = await AsyncStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('load error', e)
    return null
  }
}

// 削除
export const removeData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key)
  } catch (e) {
    console.error('remove error', e)
  }
}

// 全削除（デバッグ用）
export const clearAll = async () => {
  await AsyncStorage.clear()
}