/**
 * Simple file-based key-value store using expo-file-system/legacy.
 * Works in Expo Go without any native build.
 */
import * as FileSystem from "expo-file-system/legacy";

function filePath(key: string): string {
  return `${FileSystem.documentDirectory}bandcheck_${key}.json`;
}

export async function storageGet<T>(key: string): Promise<T | null> {
  try {
    const path = filePath(key);
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return null;
    const raw = await FileSystem.readAsStringAsync(path, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function storageSet<T>(key: string, value: T): Promise<void> {
  await FileSystem.writeAsStringAsync(filePath(key), JSON.stringify(value), {
    encoding: FileSystem.EncodingType.UTF8,
  });
}

export async function storageDelete(key: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(filePath(key), { idempotent: true });
  } catch {}
}
