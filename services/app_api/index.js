const Action = require('./action');
const Middleware = require('./middleware');

class APPServices {
  constructor(options) {
    this.db = options.db;

    this.action = new Action({ db: this.db });

    this.app = options.app;

    const middleware = new Middleware({ action: this.action });

    this.app.get('/app/user', middleware.register1());
    this.app.post('/app/login/:Uid', middleware.login());
    this.app.post('/app/user/:Uid', middleware.register());

    this.app.get('/app/productName', middleware.getProductName());
    this.app.get('/app/productList', middleware.getProductList());
    this.app.get('/app/product/:id', middleware.getProduct());

    this.app.get('/app/feedback/:Pid', middleware.getFeedback());
    this.app.post('/app/feedback/:Uid/:Pid', middleware.postFeedback());
    // 好像不太好，不過偷個懶（android 不想寫PATCH, DELETE）
    // PATCH => get到就用PATCH，沒有用POST
    // DELETE => ＮＵＬＬ* 2 ，直接 delete 掉

    this.app.get('/image/:filename', middleware.getimage());

    this.app.get('/app/node', middleware.getNode());

    this.app.get('/app/wantted/:Uid', middleware.getWantted());
    this.app.post('/app/wantted/:Uid', middleware.postWantted());
    this.app.get('/app/suggest', middleware.getSuggest());
    this.app.get('/app/path/:Uid', middleware.getPathUniqe());
    this.app.get('/app/:Uid/:Pid', middleware.getPath());
  }
}
module.exports = APPServices;
