export default class AddStoryPage {
  constructor() {
    this._form = null;
  }

  async render() {
    return `
      <div class="add-story-container">
        <div class="add-story-card">
          <h2 class="add-story-title">Add New Story</h2>
          <form id="addStoryForm" class="add-story-form">
            <div class="form-group">
              <label for="description" class="form-label">Description</label>
              <textarea class="form-input form-textarea" id="description" required></textarea>
            </div>
            <div class="form-group">
              <label for="photo" class="form-label">Photo</label>
              <input type="file" class="form-input file-input" id="photo" accept="image/*" required>
            </div>
            <div class="location-checkbox">
              <input type="checkbox" id="useLocation" class="form-input">
              <label for="useLocation" class="checkbox-label">Use my location</label>
            </div>
            <div id="locationInputs" class="location-inputs hidden">
              <div class="form-group">
                <label for="lat" class="form-label">Latitude</label>
                <input type="number" class="form-input" id="lat" step="any">
              </div>
              <div class="form-group">
                <label for="lon" class="form-label">Longitude</label>
                <input type="number" class="form-input" id="lon" step="any">
              </div>
            </div>
            <button type="submit" class="submit-button">Add Story</button>
          </form>
        </div>
      </div>
    `;
  }

  async afterRender() {
    this._form = document.getElementById('addStoryForm');
    const useLocationCheckbox = document.getElementById('useLocation');
    const locationInputs = document.getElementById('locationInputs');

    useLocationCheckbox.addEventListener('change', () => {
      locationInputs.classList.toggle('hidden', !useLocationCheckbox.checked);
      if (useLocationCheckbox.checked) {
        this._getCurrentLocation();
      }
    });

    this._form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = {
        description: document.getElementById('description').value,
        photo: document.getElementById('photo').files[0],
      };

      if (useLocationCheckbox.checked) {
        formData.lat = parseFloat(document.getElementById('lat').value);
        formData.lon = parseFloat(document.getElementById('lon').value);
      }

      try {
        const response = await this._presenter.addStory(formData);
        if (response) {
          window.location.hash = '#/';
        }
      } catch (error) {
        alert(error.message);
      }
    });
  }

  async _getCurrentLocation() {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      document.getElementById('lat').value = position.coords.latitude;
      document.getElementById('lon').value = position.coords.longitude;
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Failed to get your location');
    }
  }

  setPresenter(presenter) {
    this._presenter = presenter;
  }
} 