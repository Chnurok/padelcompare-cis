import "expo-sqlite/localStorage/install";

export const storage = {
  getItem(key: string) {
    return localStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    localStorage.setItem(key, value);
  }
};
