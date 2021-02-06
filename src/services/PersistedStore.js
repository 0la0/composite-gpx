export default class PersistedStore {
  storeObject(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  getObjectFromStorage(key) {
    const value = window.localStorage.getItem(key);
    if (!value) {
      return {};
    }
    return JSON.parse(value);
  }
}