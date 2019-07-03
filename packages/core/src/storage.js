export function getStorage(key) {
  return new Promise(resolve => {
    let value = localStorage.getItem(key);

    if (value) {
      value = JSON.parse(value);
    }

    resolve(value);
  });
}

export function setStorage(key, value) {
  return new Promise(resolve => {
    if (value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }

    resolve(value);
  });
}
