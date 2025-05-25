import StoryModel from '../models/story-model';

class DetailStoryPresenter {
  constructor(view) {
    this._view = view;
    this._storyModel = new StoryModel();
  }

  async getStoryById(id) {
    try {
      return await this._storyModel.getStoryById(id);
    } catch (error) {
      throw error;
    }
  }
}

export default DetailStoryPresenter; 