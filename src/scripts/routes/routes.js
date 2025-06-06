import HomePage from '../views/pages/home-page';
import LoginPage from '../views/pages/login-page';
import AddStoryPage from '../views/pages/add-story-page';
import DetailStoryPage from '../views/pages/detail-story-page';
import LoginPresenter from '../presenters/login-presenter';
import HomePresenter from '../presenters/home-presenter';
import DetailStoryPresenter from '../presenters/detail-story-presenter';

const loginPage = new LoginPage();
const loginPresenter = new LoginPresenter(loginPage);
loginPage.setPresenter(loginPresenter);

const homePage = new HomePage();
const homePresenter = new HomePresenter(homePage);
homePage.setPresenter(homePresenter);

const detailStoryPage = new DetailStoryPage();
const detailStoryPresenter = new DetailStoryPresenter(detailStoryPage);
detailStoryPage.setPresenter(detailStoryPresenter);

const routes = {
  '/': homePage,
  '/login': loginPage,
  '/stories/add': new AddStoryPage(),
  '/stories/:id': detailStoryPage,
  '/404': {
    render: () => '<h2>Page Not Found</h2>',
    afterRender: () => {},
  },
};

export default routes;
