import CONFIG from "../config";

export default class RegisterPresenter {
  constructor(view) {
    this._view = view;
  }

  async register(userData) {
    const { name, email, password } = userData;

    // Basic validation based on documentation
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required.');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    try {
      const response = await fetch(`${CONFIG.BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle API errors
        throw new Error(responseData.message || 'Registration failed');
      }
      
      if (responseData.error) {
           throw new Error(responseData.message);
      }

      // Handle successful registration
      alert('User Registered Successfully! Please login.');
      window.location.hash = '#/login';

      return responseData; // Or true, depending on what you need
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.message);
      throw error;
    }
  }
} 