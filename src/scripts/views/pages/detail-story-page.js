export default class DetailStoryPage {
  constructor() {
    this._story = null;
    this._map = null;
    this._marker = null;
  }

  async render() {
    return `
      <a href="#mainContent" class="skip-link">Skip to content</a>
      <div class="detail-container">
        <article class="detail-card">
          <div id="storyContent" role="main" id="mainContent">
            <div class="loading-spinner">
              <div class="spinner"></div>
            </div>
          </div>
        </article>
      </div>
    `;
  }

  _renderStory() {
    if (!this._story) {
      return '<div class="not-found">Story not found</div>';
    }

    return `
      <img src="${this._story.photoUrl}" class="detail-image" alt="Story photo by ${this._story.name}">
      <div class="detail-content">
        <h1 class="detail-title">${this._story.name}</h1>
        <p class="detail-description">${this._story.description}</p>
        ${this._story.lat && this._story.lon ? `
          <section class="detail-location" aria-labelledby="locationTitle">
            <h2 id="locationTitle" class="location-title">Location</h2>
            <div id="detailMap" class="detail-map" role="application" aria-label="Story location map"></div>
            <p class="location-coords">Latitude: ${this._story.lat}</p>
            <p class="location-coords">Longitude: ${this._story.lon}</p>
          </section>
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

      // Add layer control
      const layerControl = document.createElement('div');
      layerControl.className = 'maplibregl-ctrl maplibregl-ctrl-group map-layer-control';
      layerControl.innerHTML = `
        <button class="layer-control-button" title="Change Map Style">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12,2L2,7L12,12L22,7L12,2M2,17L12,22L22,17V12L12,17L2,12V17Z"/>
          </svg>
        </button>
        <div class="layer-options" style="display: none;">
          <button class="layer-option active" data-style="streets">Streets</button>
          <button class="layer-option" data-style="satellite">Satellite</button>
          <button class="layer-option" data-style="terrain">Terrain</button>
          <button class="layer-option" data-style="dark">Dark</button>
        </div>
      `;

      // Add layer control to map
      const navControl = document.querySelector('.maplibregl-ctrl-group');
      navControl.parentNode.insertBefore(layerControl, navControl.nextSibling);

      // Add layer control styles
      const style = document.createElement('style');
      style.textContent = `
        .map-layer-control {
          position: relative;
          background: white;
          border-radius: 4px;
          box-shadow: 0 0 10px 2px rgba(0,0,0,.1);
          margin-top: 10px;
        }
        .layer-control-button {
          width: 30px;
          height: 30px;
          padding: 3px;
          border: none;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          color: #404040;
        }
        .layer-control-button:hover {
          background: #f0f0f0;
        }
        .layer-options {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 5px;
          background: white;
          padding: 8px;
          border-radius: 4px;
          box-shadow: 0 0 10px 2px rgba(0,0,0,.1);
          min-width: 120px;
          z-index: 2;
        }
        .layer-options.show {
          display: block;
        }
        .layer-option {
          display: block;
          width: 100%;
          padding: 4px 8px;
          border: 1px solid #ddd;
          border-radius: 3px;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 12px;
          text-align: center;
          margin-bottom: 3px;
        }
        .layer-option:last-child {
          margin-bottom: 0;
        }
        .layer-option:hover {
          background: #f0f0f0;
        }
        .layer-option.active {
          background: #4a90e2;
          color: white;
          border-color: #4a90e2;
        }
      `;
      document.head.appendChild(style);

      // Add click handlers for layer control
      const layerButton = layerControl.querySelector('.layer-control-button');
      const layerOptions = layerControl.querySelector('.layer-options');
      
      layerButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        layerOptions.style.display = layerOptions.style.display === 'none' ? 'block' : 'none';
      });

      // Close layer options when clicking outside
      document.addEventListener('click', (e) => {
        if (!layerControl.contains(e.target)) {
          layerOptions.style.display = 'none';
        }
      });

      // Add click handlers for layer options
      const options = layerControl.querySelectorAll('.layer-option');
      options.forEach(option => {
        option.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Remove active class from all options
          options.forEach(opt => opt.classList.remove('active'));
          // Add active class to clicked option
          option.classList.add('active');

          // Change map style based on selection
          const style = option.dataset.style;
          switch(style) {
            case 'streets':
              this._map.setStyle('https://api.maptiler.com/maps/streets/style.json?key=X5FvjDiGuHxAtiw6WFj7');
              break;
            case 'satellite':
              this._map.setStyle('https://api.maptiler.com/maps/hybrid/style.json?key=X5FvjDiGuHxAtiw6WFj7');
              break;
            case 'terrain':
              this._map.setStyle('https://api.maptiler.com/maps/topo/style.json?key=X5FvjDiGuHxAtiw6WFj7');
              break;
            case 'dark':
              this._map.setStyle('https://api.maptiler.com/maps/basic-dark/style.json?key=X5FvjDiGuHxAtiw6WFj7');
              break;
          }
          
          // Hide options after selection
          layerOptions.style.display = 'none';
        });
      });

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