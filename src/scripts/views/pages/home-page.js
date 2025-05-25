export default class HomePage {
  constructor() {
    this._stories = [];
  }

  async render() {
    return `
      <div class="home-container">
        <div class="home-header">
          <h2 class="home-title">Stories</h2>
          <div class="home-actions">
            <button id="addStoryBtn" class="add-story-button">Add Story</button>
            <button id="logoutBtn" class="logout-button">Logout</button>
          </div>
        </div>
        <div id="storiesContainer" class="stories-grid">
          ${this._renderStories()}
        </div>
      </div>
    `;
  }

  _renderStories() {
    if (this._stories.length === 0) {
      return '<div class="no-stories">No stories found</div>';
    }

    return this._stories.map(story => `
      <div class="story-card">
        <img src="${story.photoUrl}" class="story-image" alt="${story.description}">
        <div class="story-content">
          <h5 class="story-title">${story.name}</h5>
          <p class="story-description">${story.description}</p>
          <a href="#/stories/${story.id}" class="read-more-button">Read More</a>
        </div>
      </div>
    `).join('');
  }

  async afterRender() {
    try {
      this._stories = await this._presenter.getStories();
      const storiesContainer = document.getElementById('storiesContainer');
      storiesContainer.innerHTML = this._renderStories();

      document.getElementById('addStoryBtn').addEventListener('click', () => {
        window.location.hash = '#/stories/add';
      });

      document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
          await this._presenter.logout();
          window.location.hash = '#/login';
        } catch (error) {
          console.error('Error logging out:', error);
          alert('Failed to logout');
        }
      });
    } catch (error) {
      console.error('Error loading stories:', error);
      alert('Failed to load stories');
    }
  }

  setPresenter(presenter) {
    this._presenter = presenter;
  }
} 