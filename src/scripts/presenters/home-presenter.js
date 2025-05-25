import StoryModel from '../models/story-model';
import { setUser } from '../utils/auth';

class HomePresenter {
  constructor(view) {
    this._view = view;
    this._storyModel = new StoryModel();
  }

  async getStories() {
    try {
      return await this._storyModel.getStories();
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      setUser(null);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default HomePresenter; 