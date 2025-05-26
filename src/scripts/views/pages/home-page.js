export default class HomePage {
  constructor() {
    this._stories = [];
    this._map = null;
    this._markers = [];
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
        <div id="storiesMap" class="stories-map"></div>
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
          <div class="story-meta">
            <p class="story-date">
              <i class="fa fa-calendar"></i> ${new Date(story.createdAt).toLocaleDateString()}
            </p>
            ${story.lat && story.lon ? `
              <p class="story-location">
                <i class="fa fa-map-marker"></i> Location: ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}
              </p>
            ` : ''}
          </div>
          <a href="#/stories/${story.id}" class="read-more-button">Read More</a>
        </div>
      </div>
    `).join('');
  }

  _initializeMap() {
    // Remove existing map if any
    if (this._map) {
      this._map.remove();
      this._map = null;
    }

    // Clear existing markers
    this._markers = [];

    // Default to Jakarta if no stories with location
    const defaultCenter = [106.8456, -6.2088];
    let center = defaultCenter;
    let zoom = 12;

    // If we have stories with location, center the map on the first one
    const storiesWithLocation = this._stories.filter(story => story.lat && story.lon);
    if (storiesWithLocation.length > 0) {
      center = [storiesWithLocation[0].lon, storiesWithLocation[0].lat];
      // If we have multiple stories, zoom out to show all
      if (storiesWithLocation.length > 1) {
        zoom = 10;
      }
    }

    this._map = new maplibregl.Map({
      container: 'storiesMap',
      style: 'https://api.maptiler.com/maps/streets/style.json?key=X5FvjDiGuHxAtiw6WFj7',
      center: center,
      zoom: zoom
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

      // Add markers for all stories with location
      this._markers = storiesWithLocation.map(story => {
        const marker = new maplibregl.Marker()
          .setLngLat([story.lon, story.lat])
          .addTo(this._map);

        // Add popup to marker
        const popup = new maplibregl.Popup({ offset: 25 })
          .setLngLat([story.lon, story.lat])
          .setHTML(`
            <div class="map-popup">
              <h6>${story.name}</h6>
              <p>${story.description.substring(0, 100)}${story.description.length > 100 ? '...' : ''}</p>
              <a href="#/stories/${story.id}" class="map-popup-link">View Story</a>
            </div>
          `);

        // Bind popup to marker
        marker.setPopup(popup);
        return marker;
      });

      // If we have multiple stories, fit bounds to show all markers
      if (this._markers.length > 1) {
        const bounds = new maplibregl.LngLatBounds();
        this._markers.forEach(marker => {
          bounds.extend(marker.getLngLat());
        });
        this._map.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
      }
    });
  }

  async afterRender() {
    try {
      this._stories = await this._presenter.getStories();
      
      // Wait for the next tick to ensure DOM is rendered
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const storiesContainer = document.getElementById('storiesContainer');
      if (storiesContainer) {
        storiesContainer.innerHTML = this._renderStories();
      }

      // Initialize map after stories are loaded
      this._initializeMap();

      const addStoryBtn = document.getElementById('addStoryBtn');
      const logoutBtn = document.getElementById('logoutBtn');

      if (addStoryBtn) {
        addStoryBtn.addEventListener('click', () => {
          window.location.hash = '#/stories/add';
        });
      }

      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          try {
            await this._presenter.logout();
            window.location.hash = '#/login';
          } catch (error) {
            console.error('Error logging out:', error);
            alert('Failed to logout');
          }
        });
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      alert('Failed to load stories');
    }
  }

  setPresenter(presenter) {
    this._presenter = presenter;
  }
} 