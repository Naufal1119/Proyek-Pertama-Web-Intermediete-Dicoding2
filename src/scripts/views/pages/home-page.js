import '../../../styles/pages/home.css';

export default class HomePage {
  constructor() {
    this._presenter = null;
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
        <div class="stories-container">
          <div id="map" class="map"></div>
          <div id="storiesList" class="stories-list"></div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    const storiesList = document.getElementById('storiesList');
    const addStoryBtn = document.getElementById('addStoryBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    let map = null;
    let markers = [];

    // Add event listeners for buttons
    addStoryBtn.addEventListener('click', () => {
      window.location.hash = '#/stories/add';
    });

    logoutBtn.addEventListener('click', async () => {
      try {
        await this._presenter.logout();
        window.location.hash = '#/login';
      } catch (error) {
        console.error('Error logging out:', error);
        alert('Failed to logout');
      }
    });

    const _initializeMap = () => {
      if (map) return;

      map = new maplibregl.Map({
        container: 'map',
        style: 'https://api.maptiler.com/maps/streets/style.json?key=X5FvjDiGuHxAtiw6WFj7',
        center: [106.8456, -6.2088], // Default to Jakarta
        zoom: 12
      });

      map.on('load', () => {
        // Add navigation control
        map.addControl(new maplibregl.NavigationControl());

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
                map.setStyle('https://api.maptiler.com/maps/streets/style.json?key=X5FvjDiGuHxAtiw6WFj7');
                break;
              case 'satellite':
                map.setStyle('https://api.maptiler.com/maps/hybrid/style.json?key=X5FvjDiGuHxAtiw6WFj7');
                break;
              case 'terrain':
                map.setStyle('https://api.maptiler.com/maps/topo/style.json?key=X5FvjDiGuHxAtiw6WFj7');
                break;
              case 'dark':
                map.setStyle('https://api.maptiler.com/maps/basic-dark/style.json?key=X5FvjDiGuHxAtiw6WFj7');
                break;
            }
            
            // Hide options after selection
            layerOptions.style.display = 'none';
          });
        });
      });
    };

    const _addMarkersToMap = (stories) => {
      // Clear existing markers
      markers.forEach(marker => marker.remove());
      markers = [];

      // Add new markers
      stories.forEach(story => {
        if (story.lat && story.lon) {
          const popup = new maplibregl.Popup({ offset: 25 })
            .setHTML(`
              <div class="story-popup">
                <img src="${story.photoUrl}" alt="${story.name}" style="width: 100%; max-width: 200px; border-radius: 4px; margin-bottom: 8px;">
                <h3 style="margin: 0 0 8px 0;">${story.name}</h3>
                <p style="margin: 0 0 8px 0;">${story.description}</p>
                <small style="color: #666;">Lat: ${story.lat.toFixed(6)}<br>Lng: ${story.lon.toFixed(6)}</small>
              </div>
            `);

          const marker = new maplibregl.Marker()
            .setLngLat([story.lon, story.lat])
            .setPopup(popup)
            .addTo(map);

          markers.push(marker);
        }
      });

      // Fit map to show all markers
      if (markers.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        markers.forEach(marker => bounds.extend(marker.getLngLat()));
        map.fitBounds(bounds, { padding: 50 });
      }
    };

    // Initialize map
    _initializeMap();

    // Get and display stories
    try {
      const stories = await this._presenter.getStories();
      _addMarkersToMap(stories);
      
      // Render stories list
      storiesList.innerHTML = stories.map(story => `
        <div class="story-card">
          <img src="${story.photoUrl}" alt="${story.name}" class="story-image">
          <div class="story-content">
            <h3>${story.name}</h3>
            <p>${story.description}</p>
            <div class="story-meta">
              ${story.lat && story.lon ? 
                `<span><i class="fa fa-map-marker"></i> ${story.lat.toFixed(6)}, ${story.lon.toFixed(6)}</span>` :
                `<span><i class="fa fa-map-marker"></i> Location not available</span>`
              }
            </div>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error loading stories:', error);
      storiesList.innerHTML = '<p class="error-message">Failed to load stories. Please try again later.</p>';
    }
  }

  setPresenter(presenter) {
    this._presenter = presenter;
  }
} 