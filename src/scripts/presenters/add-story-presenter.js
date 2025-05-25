import StoryModel from '../models/story-model';

class AddStoryPresenter {
  constructor(view) {
    this._view = view;
    this._storyModel = new StoryModel();
  }

  async addStory(data) {
    try {
      return await this._storyModel.addStory(data);
    } catch (error) {
      throw error;
    }
  }
}

export default AddStoryPresenter; 