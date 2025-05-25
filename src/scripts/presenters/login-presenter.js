import { setUser, getUser } from '../utils/auth';

class LoginPresenter {
  constructor(view) {
    this._view = view;
  }

  async login(email, password) {
    try {
      console.log('Attempting login with:', { email });
      
      const response = await fetch('https://story-api.dicoding.dev/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseJson = await response.json();
      console.log('Login response:', responseJson);
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      // Pastikan token ada dalam response
      if (!responseJson.loginResult?.token) {
        throw new Error('Token tidak ditemukan dalam response');
      }

      // Simpan data user termasuk token
      const userData = {
        id: responseJson.loginResult.userId,
        name: responseJson.loginResult.name,
        token: responseJson.loginResult.token
      };

      console.log('Setting user data:', userData);
      setUser(userData);

      // Verifikasi data tersimpan
      const savedUser = getUser();
      console.log('Saved user data:', savedUser);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      setUser(null);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default LoginPresenter; 