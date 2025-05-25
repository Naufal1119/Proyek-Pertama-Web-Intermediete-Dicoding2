import CONFIG from '../config';

class StoryModel {
  constructor() {
    this._baseUrl = CONFIG.BASE_URL;
  }

  async getAllStories(page = 1, size = 10, location = 0) {
    try {
      const response = await fetch(`${this._baseUrl}/stories?page=${page}&size=${size}&location=${location}`, {
        headers: {
          'Authorization': `Bearer ${this._getToken()}`,
        },
      });
      const responseJson = await response.json();
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }
      return responseJson.listStory;
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  }

  async getStoryById(id) {
    try {
      const response = await fetch(`${this._baseUrl}/stories/${id}`, {
        headers: {
          'Authorization': `Bearer ${this._getToken()}`,
        },
      });
      const responseJson = await response.json();
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }
      return responseJson.story;
    } catch (error) {
      console.error('Error fetching story detail:', error);
      throw error;
    }
  }

  async addStory(data) {
    try {
      const formData = new FormData();
      formData.append('description', data.description);
      formData.append('photo', data.photo);
      if (data.lat) formData.append('lat', data.lat);
      if (data.lon) formData.append('lon', data.lon);

      const response = await fetch(`${this._baseUrl}/stories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._getToken()}`,
        },
        body: formData,
      });
      const responseJson = await response.json();
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }
      return responseJson;
    } catch (error) {
      console.error('Error adding story:', error);
      throw error;
    }
  }

  _getToken() {
    return localStorage.getItem('token');
  }
}

export default StoryModel; 