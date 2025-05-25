// CSS imports
import '../styles/styles.css';
import '../styles/pages/home.css';
import '../styles/pages/login.css';
import '../styles/pages/register.css';
import '../styles/pages/add-story.css';
import '../styles/pages/detail-story.css';

import App from './views/pages/app';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
