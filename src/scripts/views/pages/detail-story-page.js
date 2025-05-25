export default class DetailStoryPage {
  constructor() {
    this._story = null;
  }

  async render() {
    return `
      <div class="detail-container">
        <div class="detail-card">
          <div id="storyContent">
            <div class="loading-spinner">
              <div class="spinner"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderStory() {
    if (!this._story) {
      return '<div class="not-found">Story not found</div>';
    }

    return `
      <img src="${this._story.photoUrl}" class="detail-image" alt="${this._story.description}">
      <div class="detail-content">
        <h5 class="detail-title">${this._story.name}</h5>
        <p class="detail-description">${this._story.description}</p>
        ${this._story.lat && this._story.lon ? `
          <div class="detail-location">
            <h6 class="location-title">Location</h6>
            <p class="location-coords">Latitude: ${this._story.lat}</p>
            <p class="location-coords">Longitude: ${this._story.lon}</p>
          </div>
        ` : ''}
        <p class="detail-date">Posted on ${new Date(this._story.createdAt).toLocaleDateString()}</p>
      </div>
    `;
  }

  async afterRender() {
    try {
      const url = window.location.hash.split('/');
      const storyId = url[url.length - 1];
      
      this._story = await this._presenter.getStoryById(storyId);
      const storyContent = document.getElementById('storyContent');
      storyContent.innerHTML = this._renderStory();
    } catch (error) {
      console.error('Error loading story:', error);
      alert('Failed to load story details');
    }
  }

  setPresenter(presenter) {
    this._presenter = presenter;
  }
} 