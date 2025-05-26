import StoryModel from '../models/story-model';
import { setUser } from '../utils/auth';

class HomePresenter {
  constructor(view) {
    this._view = view;
    this._storyModel = new StoryModel();
  }

  async getStories() {
    try {
      const stories = await this._storyModel.getStories();
      this._view.displayStories(stories);
      this._view.initializeMapWithStories(stories);
      return stories;
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