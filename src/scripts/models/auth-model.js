import CONFIG from '../config';

class AuthModel {
  constructor() {
    this._baseUrl = CONFIG.BASE_URL;
  }

  async register(data) {
    try {
      const response = await fetch(`${this._baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseJson = await response.json();
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }
      return responseJson;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  }

  async login(data) {
    try {
      const response = await fetch(`${this._baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseJson = await response.json();
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }
      this._saveUserData(responseJson.loginResult);
      return responseJson.loginResult;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  _saveUserData(userData) {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('userId', userData.userId);
    localStorage.setItem('name', userData.name);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
  }

  isLoggedIn() {
    return !!this._getToken();
  }

  _getToken() {
    return localStorage.getItem('token');
  }
}

export default AuthModel; 