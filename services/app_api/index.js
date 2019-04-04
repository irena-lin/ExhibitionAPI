const Action = require('./action');
const Middleware = require('./middleware');

class APPServices {
  constructor(options) {
    this.db = options.db;
    this.passport = options.passport;

    this.action = new Action({ db: this.db });

    this.app = options.app;

    const middleware = new Middleware({ action: this.action });

    const auth = this.passport.authenticate('jwt', {
      session: false,
      failWithError: true,
    });

    this.app.get('/info', middleware.getInfo());

    this.app.post('/app/user', middleware.postUser());
    this.app.patch('/app/user/:id',
      auth, middleware.isLoggedin(), middleware.patchUser());

    this.app.get('/app/product', middleware.getProducts());
    this.app.get('/app/product/:id', middleware.getProduct());

    this.app.get('/app/node', middleware.getNodes());

    this.app.get('/app/feedback/:Pid', middleware.getFeedbacks());
    this.app.post('/app/feedback',
      auth, middleware.isLoggedin(), middleware.postFeedback());
    this.app.patch('/app/feedback/:Uid/:Pid',
      auth, middleware.isLoggedin(), middleware.patchFeedback());
    this.app.delete('/app/feedback/:Fid',
      auth, middleware.isLoggedin(), middleware.deleteFeedback());

    this.app.get('/app/wantted/:Uid',
      auth, middleware.isLoggedin(), middleware.getWantteds());
    this.app.post('/app/wantted',
      auth, middleware.isLoggedin(), middleware.postWantted());
    this.app.patch('/app/wantted/:Wid',
      auth, middleware.isLoggedin(), middleware.patchWantted());
    this.app.delete('/app/wantted/:Wid',
      auth, middleware.isLoggedin(), middleware.deleteWantted());

    this.app.get('/:Nid/:Uid', middleware.getPath());
  }
}

module.exports = APPServices;
