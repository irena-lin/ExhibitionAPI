const Middleware = require('./middleware');
const Action = require('./action');

class AuthIndex {
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

    // user < id -> Uid > OK
    // 取得會員列表（含管理員）
    this.app.get('/user',
      auth, middleware.isLoggedin(), middleware.getUsers());
    // 取得個別會員資訊
    this.app.get('/user/:id',
      auth, middleware.isLoggedin(), middleware.getUser());
    // 新增會員
    this.app.post('/user',
      auth, middleware.isLoggedin(), middleware.postUser());
    // 更改會員
    this.app.patch('/user/:id',
      auth, middleware.isLoggedin(), middleware.patchUser());
    // 刪除會員
    this.app.delete('/user/:id',
      auth, middleware.isLoggedin(), middleware.deleteUser());

    // product < id -> Pid > OK
    this.app.get('/product',
      auth, middleware.isLoggedin(), middleware.getProducts());
    this.app.get('/product/:id',
      auth, middleware.isLoggedin(), middleware.getProduct());
    this.app.post('/image',
      auth, middleware.isLoggedin(), middleware.postImage());
    this.app.post('/product',
      auth, middleware.isLoggedin(), middleware.postProduct());
    this.app.patch('/product/:id',
      auth, middleware.isLoggedin(), middleware.patchProduct());
    this.app.delete('/product/:id',
      auth, middleware.isLoggedin(), middleware.deleteProduct());

    // info < id -> Eid > post patch delete not yet
    this.app.get('/', middleware.getInfos());
    this.app.get('/info/:id',
      auth, middleware.isLoggedin(), middleware.getInfo());
    this.app.post('/info',
      auth, middleware.isLoggedin(), middleware.postInfo());
    this.app.patch('/info/:id',
      auth, middleware.isLoggedin(), middleware.patchInfo());
    this.app.delete('/info/:id',
      auth, middleware.isLoggedin(), middleware.deleteInfo());

    // beacon < id -> Bid > OK
    this.app.get('/beacon',
      auth, middleware.isLoggedin(), middleware.getBeacons());
    this.app.get('/beacon/:id',
      auth, middleware.isLoggedin(), middleware.getBeacon());
    this.app.post('/beacon',
      auth, middleware.isLoggedin(), middleware.postBeacon());
    this.app.patch('/beacon/:id',
      auth, middleware.isLoggedin(), middleware.patchBeacon());
    this.app.delete('/beacon/:id',
      auth, middleware.isLoggedin(), middleware.deleteBeacon());

    // node < id -> Nid > OK
    this.app.get('/node',
      auth, middleware.isLoggedin(), middleware.getNodes());
    this.app.get('/node/:id',
      auth, middleware.isLoggedin(), middleware.getNode());
    this.app.post('/node',
      auth, middleware.isLoggedin(), middleware.postNode());
    this.app.patch('/node/:id',
      auth, middleware.isLoggedin(), middleware.patchNode());
    this.app.delete('/node/:id',
      auth, middleware.isLoggedin(), middleware.deleteNode());

    // feedback < id -> Fid > post patch delete not yet
    this.app.get('/feedback/product/:Pid',
      auth, middleware.isLoggedin(), middleware.getFeedbacksByPid());
    this.app.get('/feedback',
      auth, middleware.isLoggedin(), middleware.getFeedbacks());
    // 回應個數統計
    this.app.get('/feedback/Num',
      auth, middleware.isLoggedin(), middleware.getFeedbackNum());
    this.app.get('/feedback/:id',
      auth, middleware.isLoggedin(), middleware.getFeedback());
    // 意見回覆
    this.app.post('/feedback/:id',
      auth, middleware.isLoggedin(), middleware.postFeedback());
    // 修改回覆
    this.app.patch('/feedback/:id',
      auth, middleware.isLoggedin(), middleware.patchFeedback());
    // 刪除留言（留言控管）
    this.app.delete('/feedback/:id',
      auth, middleware.isLoggedin(), middleware.deleteFeedback());

    // analysis
    // 所有的路徑資訊
    this.app.get('/path',
      auth, middleware.isLoggedin(), middleware.getPaths());
    // 今日累積人數
    this.app.get('/path/recent',
      auth, middleware.isLoggedin(), middleware.getPathRecent());
    // 每日人數累計 OK
    this.app.get('/path/UserNum',
      auth, middleware.isLoggedin(), middleware.getPathsUserNum());
    // 單一路徑資訊
    this.app.get('/path/:id',
      auth, middleware.isLoggedin(), middleware.getPath());
    // // 常用路徑統計
    // this.app.get('/path/PathNum',
    //   auth, middleware.isLoggedin(), middleware.getPathPathNum());


    this.app.get('/wantted',
      auth, middleware.isLoggedin(), middleware.getWantteds());
    // 路線規劃統計 OK
    this.app.get('/wantted/Num',
      auth, middleware.isLoggedin(), middleware.getWanttedNum());
    this.app.get('/wantted/:id',
      auth, middleware.isLoggedin(), middleware.getWantted());
    this.app.post('/wantted',
      auth, middleware.isLoggedin(), middleware.getWantteds());
    this.app.patch('/wantted/:id',
      auth, middleware.isLoggedin(), middleware.getWantteds());
    this.app.delete('/wantted/:id',
      auth, middleware.isLoggedin(), middleware.getWantteds());
  }
}

module.exports = AuthIndex;
