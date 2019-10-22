import AsyncStorage from '@react-native-community/async-storage';

export function getStorage(key) {
  return new Promise(resolve => {
    AsyncStorage.getItem(key, resolve);
  }).then((error, value) => {
    if (error) {
      throw error;
    }

    if (value) {
      value = JSON.parse(value);
    }

    return value;
  });
}

export function setStorage(key, value) {
  return new Promise(resolve => {
    if (value === undefined) {
      AsyncStorage.removeItem(key, resolve);
    } else {
      AsyncStorage.setItem(key, JSON.stringify(value), resolve);
    }
  }).then(error => {
    if (error) {
      throw error;
    }

    return value;
  });
}
