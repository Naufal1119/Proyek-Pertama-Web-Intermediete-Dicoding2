export default class RegisterPage {
  constructor() {
    this._form = null;
  }

  async render() {
    return `
      <div class="register-container">
        <div class="register-card">
          <h2 class="register-title">Register</h2>
          <form id="registerForm" class="register-form">
            <div class="form-group">
              <label for="name" class="form-label">Name</label>
              <input type="text" class="form-input" id="name" required>
            </div>
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input type="email" class="form-input" id="email" required>
            </div>
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input type="password" class="form-input" id="password" required minlength="8">
            </div>
            <button type="submit" class="register-button">Register</button>
          </form>
          <p class="login-link">
            Already have an account? <a href="#/login">Login here</a>
          </p>
        </div>
      </div>
    `;
  }

  async afterRender() {
    this._form = document.getElementById('registerForm');
    this._form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
      };
      
      try {
        const response = await this._presenter.register(formData);
        if (response) {
          window.location.hash = '#/login';
        }
      } catch (error) {
        alert(error.message);
      }
    });
  }

  setPresenter(presenter) {
    this._presenter = presenter;
  }
} 