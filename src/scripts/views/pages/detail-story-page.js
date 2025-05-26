export default class DetailStoryPage {
  constructor() {
    this._story = null;
    this._map = null;
    this._marker = null;
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
            <div id="detailMap" class="detail-map"></div>
            <p class="location-coords">Latitude: ${this._story.lat}</p>
            <p class="location-coords">Longitude: ${this._story.lon}</p>
          </div>
        ` : ''}
        <p class="detail-date">Posted on ${new Date(this._story.createdAt).toLocaleDateString()}</p>
      </div>
    `;
  }

  _initializeMap() {
    if (!this._story.lat || !this._story.lon) return;

    this._map = new maplibregl.Map({
      container: 'detailMap',
      style: 'https://api.maptiler.com/maps/streets/style.json?key=X5FvjDiGuHxAtiw6WFj7',
      center: [this._story.lon, this._story.lat],
      zoom: 12
    });

    this._map.on('load', () => {
      // Add navigation control
      this._map.addControl(new maplibregl.NavigationControl());

      // Add marker at story location
      this._marker = new maplibregl.Marker()
        .setLngLat([this._story.lon, this._story.lat])
        .addTo(this._map);

      // Add popup to marker
      const popup = new maplibregl.Popup({ offset: 25 })
        .setLngLat([this._story.lon, this._story.lat])
        .setHTML(`<strong>Story Location</strong><br>Lat: ${this._story.lat}<br>Lng: ${this._story.lon}`)
        .addTo(this._map);

      // Bind popup to marker
      this._marker.setPopup(popup);
    });
  }

  async afterRender() {
    try {
      const url = window.location.hash.split('/');
      const storyId = url[url.length - 1];
      
      this._story = await this._presenter.getStoryById(storyId);
      const storyContent = document.getElementById('storyContent');
      storyContent.innerHTML = this._renderStory();

      // Initialize map after story content is rendered
      if (this._story.lat && this._story.lon) {
        this._initializeMap();
      }
    } catch (error) {
      console.error('Error loading story:', error);
      alert('Failed to load story details');
    }
  }

  setPresenter(presenter) {
    this._presenter = presenter;
  }
} 