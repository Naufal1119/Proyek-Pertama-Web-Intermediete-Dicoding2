const USER_KEY = 'user';

export const initAuthListener = (callback) => {
  // Simulasi auth state change dengan event listener
  window.addEventListener('storage', (event) => {
    if (event.key === USER_KEY) {
      const user = event.newValue ? JSON.parse(event.newValue) : null;
      callback(user);
    }
  });

  // Trigger initial callback
  const user = getUser();
  callback(user);
};

export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  const user = getUser();
  return !!user && !!user.token;
};

export const setUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
  // Trigger storage event untuk notifikasi perubahan
  window.dispatchEvent(new StorageEvent('storage', {
    key: USER_KEY,
    newValue: user ? JSON.stringify(user) : null
  }));
}; 