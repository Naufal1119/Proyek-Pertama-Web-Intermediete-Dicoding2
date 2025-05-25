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
        <div class="add-story-card">
          <h2 class="add-story-title">Add New Story</h2>
          <form id="addStoryForm" class="add-story-form">
            <div class="form-group">
              <label for="description" class="form-label">Description:</label>
              <textarea id="description" name="description" class="form-input form-textarea" required></textarea>
            </div>
            
            <div class="form-group">
              <label class="form-label">Photo:</label>
              <div class="photo-input-container">
                <div id="cameraPreview" class="camera-preview">
                  <video id="cameraVideo" class="camera-video"></video>
                  <div class="camera-buttons">
                    <button type="button" id="captureButton" class="capture-button">Take Photo</button>
                    <button type="button" id="retakeButton" class="retake-button" style="display: none;">Retake</button>
                    <button type="button" id="closeCameraButton" class="close-button">Close</button>
                  </div>
                </div>
                <div id="photoPreview" class="photo-preview"></div>
                <div class="photo-controls">
                  <button type="button" id="cameraButton" class="camera-button">
                    <i class="fa fa-camera"></i> Open Camera
                  </button>
                  <input type="file" id="photo" name="photo" accept="image/*" class="file-input" required>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Location:</label>
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
      </div>
    `;
  }

  async afterRender() {
    const form = document.getElementById('addStoryForm');
    const cameraButton = document.getElementById('cameraButton');
    const getLocationButton = document.getElementById('getLocationButton');
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photoPreview');
    const cameraPreview = document.getElementById('cameraPreview');
    const cameraVideo = document.getElementById('cameraVideo');
    const captureButton = document.getElementById('captureButton');
    const retakeButton = document.getElementById('retakeButton');
    const closeCameraButton = document.getElementById('closeCameraButton');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');

    let stream = null;
    let map = null;
    let marker = null;

    const _initializeMap = () => {
      if (map) return;

      map = new maplibregl.Map({
        container: 'map',
        style: 'https://api.maptiler.com/maps/streets/style.json?key=X5FvjDiGuHxAtiw6WFj7',
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
        // Create marker with popup
        marker = new maplibregl.Marker()
          .setLngLat(newLocation)
          .setPopup(new maplibregl.Popup({ offset: 25 })
            .setHTML(`<strong>Location:</strong><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`))
          .addTo(map);
        
        // Show popup by default
        marker.togglePopup();
      }

      // Update hidden inputs
      latitudeInput.value = lat;
      longitudeInput.value = lng;
    };

    const _startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        cameraVideo.srcObject = stream;
        await cameraVideo.play();
        cameraPreview.style.display = 'flex';
        captureButton.style.display = 'block';
        retakeButton.style.display = 'none';
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Failed to access camera. Please make sure you have granted camera permissions.');
      }
    };

    const _stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
        stream = null;
      }
      if (cameraVideo.srcObject) {
        cameraVideo.srcObject = null;
      }
      cameraPreview.style.display = 'none';
    };

    const _capturePhoto = () => {
      const canvas = document.createElement('canvas');
      canvas.width = cameraVideo.videoWidth;
      canvas.height = cameraVideo.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);

      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/jpeg', 0.8);
      img.style.maxWidth = '100%';
      photoPreview.innerHTML = '';
      photoPreview.appendChild(img);

      // Convert base64 to File object
      canvas.toBlob((blob) => {
        const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        photoInput.files = dataTransfer.files;
      }, 'image/jpeg', 0.8);

      captureButton.style.display = 'none';
      retakeButton.style.display = 'block';
      
      // Stop camera stream after capturing photo
      _stopCamera();
    };

    // Initialize map
    _initializeMap();

    // Start camera by default
    _startCamera();

    // Handle camera button click
    cameraButton.addEventListener('click', () => {
      // Clear file input
      photoInput.value = '';
      photoPreview.innerHTML = '';
      _startCamera();
    });

    // Handle capture button click
    captureButton.addEventListener('click', _capturePhoto);

    // Handle retake button click
    retakeButton.addEventListener('click', () => {
      photoPreview.innerHTML = '';
      captureButton.style.display = 'block';
      retakeButton.style.display = 'none';
      _startCamera();
    });

    // Handle close camera button click
    closeCameraButton.addEventListener('click', () => {
      _stopCamera();
      photoPreview.innerHTML = '';
      captureButton.style.display = 'block';
      retakeButton.style.display = 'none';
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
      const description = formData.get('description').trim();
      const photo = formData.get('photo');
      const lat = parseFloat(formData.get('latitude'));
      const lon = parseFloat(formData.get('longitude'));

      // Validate description
      if (description.length < 1) {
        alert('Please enter a description (minimum 1 character)');
        return;
      }

      // Validate photo
      if (!photo || photo.size === 0) {
        alert('Please either take a photo or upload an image');
        return;
      }

      // Validate location
      if (isNaN(lat) || isNaN(lon)) {
        alert('Please get your current location');
        return;
      }

      const data = {
        description,
        photo,
        lat,
        lon
      };

      try {
        await this._presenter.addStory(data);
        window.location.hash = '#/';
      } catch (error) {
        console.error('Error adding story:', error);
        alert('Failed to add story. Please try again.');
      }
    });

    // Handle file input change
    photoInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        // Clear camera preview if exists
        _stopCamera();
        
        // Display selected image
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.style.maxWidth = '100%';
          photoPreview.innerHTML = '';
          photoPreview.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  setPresenter(presenter) {
    this._presenter = presenter;
  }
} 