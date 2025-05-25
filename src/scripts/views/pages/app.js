import routes from '../../routes/routes';
import { parseActiveUrlWithCombiner } from '../../routes/url-parser';
import { initAuthListener, isAuthenticated } from '../../utils/auth';

class App {
  constructor({ content, drawerButton, navigationDrawer }) {
    this._content = content;
    this._drawerButton = drawerButton;
    this._navigationDrawer = navigationDrawer;

    this._initialAppShell();
    this._initAuthListener();
  }

  _initialAppShell() {
    if (this._drawerButton) {
      this._drawerButton.addEventListener('click', (event) => {
        this._navigationDrawer.classList.toggle('open');
        event.stopPropagation();
      });
    }

    if (this._navigationDrawer) {
      this._navigationDrawer.addEventListener('click', (event) => {
        event.stopPropagation();
      });

      document.addEventListener('click', () => {
        this._navigationDrawer.classList.remove('open');
      });
    }
  }

  _initAuthListener() {
    initAuthListener((user) => {
      if (user) {
        // User is signed in
        if (window.location.hash === '#/login' || window.location.hash === '#/register') {
          window.location.hash = '#/';
        }
      } else {
        // User is signed out
        if (window.location.hash !== '#/login' && window.location.hash !== '#/register') {
          window.location.hash = '#/login';
        }
      }
    });
  }

  async renderPage() {
    const url = parseActiveUrlWithCombiner();
    const page = routes[url] || routes['/404'];
    
    // Cek autentikasi untuk halaman yang membutuhkan login
    if (url !== '/login' && url !== '/register' && !isAuthenticated()) {
      window.location.hash = '#/login';
      return;
    }
    
    try {
      this._content.innerHTML = await page.render();
      await page.afterRender();
    } catch (error) {
      console.error('Error rendering page:', error);
      this._content.innerHTML = '<h2>Error loading page</h2>';
    }
  }
}

export default App;
