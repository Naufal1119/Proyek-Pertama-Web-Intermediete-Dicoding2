import { getLocation } from '../../utils/location';
import { takePicture } from '../../utils/camera';
import '../../../styles/pages/add-story.css';

export default class AddStoryPage {
  constructor() {
    this._presenter = null;
  }

  async render() {
    return `
      <div class="add-story-container">
        <h2>Add New Story</h2>
        <form id="addStoryForm">
          <div class="form-group">
            <label for="description">Description:</label>
            <textarea id="description" name="description" required></textarea>
          </div>
          
          <div class="form-group">
            <label for="photo">Photo:</label>
            <div class="photo-input">
              <input type="file" id="photo" name="photo" accept="image/*" capture="environment" required>
              <button type="button" id="cameraButton" class="camera-button">
                <i class="fa fa-camera"></i> Take Photo
              </button>
            </div>
            <div id="photoPreview" class="photo-preview"></div>
          </div>

          <div class="form-group">
            <label for="location">Location:</label>
            <div id="map" class="map"></div>
            <button type="button" id="getLocationButton" class="location-button">
              <i class="fa fa-map-marker"></i> Get Current Location
            </button>
            <input type="hidden" id="latitude" name="latitude">
            <input type="hidden" id="longitude" name="longitude">
          </div>

          <button type="submit" class="submit-button">Add Story</button>
        </form>
      </div>
    `;
  }

  async afterRender() {
    const form = document.getElementById('addStoryForm');
    const cameraButton = document.getElementById('cameraButton');
    const getLocationButton = document.getElementById('getLocationButton');
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photoPreview');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');

    let map = null;
    let marker = null;

    const _initializeMap = () => {
      if (map) return;

      map = new maplibregl.Map({
        container: 'map',
        style: 'https://api.maptiler.com/maps/streets/style.json?key=YOUR_MAPTILER_KEY',
        center: [106.8456, -6.2088], // Default to Jakarta
        zoom: 12
      });

      map.on('load', () => {
        map.addControl(new maplibregl.NavigationControl());
      });
    };

    const _updateMapLocation = (lat, lng) => {
      if (!map) return;

      const newLocation = [lng, lat];
      map.flyTo({
        center: newLocation,
        zoom: 15
      });

      if (marker) {
        marker.setLngLat(newLocation);
      } else {
        marker = new maplibregl.Marker()
          .setLngLat(newLocation)
          .addTo(map);
      }
    };

    // Initialize map
    _initializeMap();

    // Handle camera button click
    cameraButton.addEventListener('click', async () => {
      try {
        const photo = await takePicture();
        if (photo) {
          const img = document.createElement('img');
          img.src = photo;
          img.style.maxWidth = '100%';
          photoPreview.innerHTML = '';
          photoPreview.appendChild(img);
          
          // Convert base64 to File object
          const response = await fetch(photo);
          const blob = await response.blob();
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
          
          // Create a new FileList-like object
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          photoInput.files = dataTransfer.files;
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        alert('Failed to take picture. Please try again.');
      }
    });

    // Handle get location button click
    getLocationButton.addEventListener('click', async () => {
      try {
        const position = await getLocation();
        const { latitude, longitude } = position.coords;
        
        latitudeInput.value = latitude;
        longitudeInput.value = longitude;
        
        _updateMapLocation(latitude, longitude);
      } catch (error) {
        console.error('Error getting location:', error);
        alert('Failed to get location. Please try again.');
      }
    });

    // Handle form submission
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const formData = new FormData(form);
      const data = {
        description: formData.get('description'),
        photo: formData.get('photo'),
        lat: parseFloat(formData.get('latitude')),
        lon: parseFloat(formData.get('longitude'))
      };

      try {
        await this._presenter.addStory(data);
        window.location.hash = '#/';
      } catch (error) {
        console.error('Error adding story:', error);
        alert('Failed to add story. Please try again.');
      }
    });
  }

  setPresenter(presenter) {
    this._presenter = presenter;
  }
} 