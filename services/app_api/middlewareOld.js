const _ = require('lodash');
const bcrypt = require('bcrypt');

class APPMiddleware {
  constructor(options) {
    this.action = options.action;
  }

  isLoggedin() { // eslint-disable-line
    return async (req, res, next) => {
      if (req.isAuthenticated()) {
        if (req.user.permission > 0) {
          return next();
        }
        return res.status('401').json({ code: '401', message: '權限不足' });
      } return res.status('401').json({ code: '401', message: '登入失敗' });
    };
  }

  getInfo() {
    return async (req, res) => {
      const row = await this.action.getInfo();
      const result = row.map(post => ({
        Eid: post.Eid,
        Ename: post.Ename,
        info: post.info,
        StartDate: _.split(new Date(post.Startdate * 1000).toString(), ' ', 5),
        EndDate: _.split(new Date(row[0].Enddate * 1000).toString(), ' ', 5),
        description: post.description,
        route: _.split(post.route, ''),
      }));
      return res.status('200').json(result);
    };
  }

  postUser() {
    return async (req, res) => {
      const data = {
        permission: 0,
      };
      const id = await this.action.postUser(data);
      return res.status('200').json(await this.action.getUser(id));
    };
  }

  patchUser() {
    return async (req, res) => {
      const con = await this.action.getUser(req.params.id);
      const data = {
        name: req.body.name || con.name,
        password: await bcrypt.hash(req.body.password, 10) || con.password,
        permission: 1,
      };
      await this.action.patchUser(data, req.params.id);
      return res.status('200').json(await this.action.getUser(req.params.id));
    };
  }

  getProducts() {
    return async (req, res) => {
      const rows = await this.action.getProducts();
      const ImageRow = await this.action.getImages();

      const result = rows.map(pro => ({
        Pid: pro.Pid,
        Pname: pro.Pname,
        description: pro.description,
        icon: pro.image_icon,
        image: [],
      }));

      result.map((product) => {
      product.image = ImageRow.filter(ima => ima.Pid === product.Pid).map(im => im.Ipath); // eslint-disable-line
        return product;
      });
      return res.status('200').json(result);
    };
  }

  getProduct() {
    return async (req, res) => {
      const product = await this.action.getProduct(req.params.id);
      if (product.length === 0) return res.status('404').json({ code: 404, message: 'Not Found' });

      const Image = await this.action.getImage(req.params.id);

      console.log(product);
      const results = {
        Pid: product[0].Pid,
        Pname: product[0].Pname,
        description: product[0].description,
        icon: product[0].image_icon,
        image: [],
      };
      console.log('res', results);

      results.image = Image.map(ima => ima.Ipath);

      return res.status('200').json(results);
    };
  }

  getNodes() {
    return async (req, res) => {
      const rows = await this.action.getNodes();
      console.log('rows', rows);
      const result = rows.map(n => ({
        Nid: n.Nid,
        row: n.row,
        col: n.col,
        Bid: n.Bid,
        Pid: n.Pid,
        Pname: n.Pname,
        Picon: n.image_icon,
      }));
      return res.status('200').json(result);
    };
  }

  getFeedbacks() {
    return async (req, res) => {
      const rows = await this.action.getFeedback(req.params.Pid);

      let name;
      if (req.params.Pid === '0') {
        name = 'all';
      } else {
        const P = await this.action.getProduct(req.params.Pid);
        name = P[0].Pname;
      }

      const results = rows.map(row => ({
        Fid: row.Fid,
        feedback: row.feedback,
        reply: row.reply,
        RFid: row.RFid,
        Uid: row.Uid,
        name: row.name,
        Pid: row.Pid,
        Pname: name,
      }));
      return res.status('200').json(results);
    };
  }

  postFeedback() {
    return async (req, res) => {
      const data = {
        feedback: req.body.feedback,
        Uid: req.body.Uid,
        Pid: req.body.Pid,
        reply: req.body.reply,
        RFid: req.body.RFid,
      };
      const id = await this.action.postFeedback(data);
      return res.status('200').json(await this.action.getFeedbackByID(id));
    };
  }

  patchFeedback() {
    return async (req, res) => {
      const rows = await this.action.getFeedbackID(req.params.Uid, req.params.Pid);
      if (rows.length === 0) return res.status('404').json({ code: 404, message: 'Not Found' });
      const row = await this.action.patchFeedback(req.body.feedback, req.params.Uid, req.params.Pid); // eslint-disable-line
      return res.status('200').json(row);
    };
  }

  deleteFeedback() {
    return async (req, res) => {
      const num = await this.action.deleteFeedback(req.params.Fid);
      if (num.length === 0) return res.status('404').json({ code: 404, message: 'Not Found' });
      return res.status('200').json({ message: 'delete feedback OK!' });
    };
  }

  getWantteds() {
    return async (req, res) => {
      const rows = await this.action.getWantteds(req.params.Uid);
      const results = rows.map(post => ({
        Wid: post.Wid,
        path: _.split(post.path, ''),
        Uid: post.Uid,
      }));
      return res.status('200').json(results);
    };
  }

  postWantted() {
    return async (req, res) => {
      const data = {
        path: req.body.path,
        Uid: req.body.Uid,
      };
      const id = await this.action.postWantted(data);
      const result = await this.action.getWantted(id);
      return res.status('200').json({
        Wid: result.Wid,
        path: _.split(result.path, ''),
        Uid: result.Uid,
      });
    };
  }

  patchWantted() {
    return async (req, res) => {
      const results = await this.action.getWantted(req.params.Wid);
      if (results.length === 0) return res.status('404').json({ code: 404, message: 'Not Found' });
      const data = {
        path: req.params.path || results[0].path,
      };
      await this.action.patchWantted(data, req.params.Wid);
      const result = await this.action.getWantted(req.params.Wid);
      return res.status('200').json({
        Wid: result.Wid,
        path: _.split(result.path, ''),
        Uid: result.Uid,
      });
    };
  }

  deleteWantted() {
    return async (req, res) => {
      const num = await this.action.deleteWantted(req.params.Wid);
      if (num === 0) return res.status('404').json({ code: 404, message: 'Not Found' });
      return res.status('200').json({ message: 'delete wantted ok!' });
    };
  }

  getPath() {
    return async (req, res) => {
      // 先判斷有沒有，沒有舊的建新的
      // 如果有但不同天，一樣建新的
      // 重複 Nid 不用重複紀錄
      // 最後給的結果 { message:已更新, product:{XXX},  }
      const row = await this.action.getPathByUid(req.params.Uid); // Uid

      const now = _.split(new Date().toISOString(), 'T', 1);
      const D = _.split(now[0], '-');
      const date = D[0] + D[1] + D[2];

      let data = {};
      let result = {};
      if (row.length === 0 || date !== row[row.length - 1].date) {
        data = {
          Uid: req.params.Uid,
          path: req.params.Nid, // node_id
          time: Math.floor(new Date().valueOf() / 1000),
          date,
        };
        const id = await this.action.postPath(data);
        const rows = await this.action.getPath(id);
        result = {
          path_id: rows[0].path_id,
          Uid: rows[0].Uid,
          path: _.split(rows[0].path, ''),
          time: rows[0].time,
          date: rows[0].date,
        };
      } else {
        if (((row[row.length - 1].path) % 10) === Number(req.params.Nid)) {
          return res.status('200').json({ message: '重複 Nid！' });
        }
        data = {
          path: Number(row[row.length - 1].path + req.params.Nid), // node_id
        };
        await this.action.patchPath(row[row.length - 1].path_id, data);
        const rows = await this.action.getPath(row[row.length - 1].path_id);
        result = {
          path_id: rows[0].path_id,
          Uid: rows[0].Uid,
          path: _.split(rows[0].path, ''),
          time: rows[0].time,
          date: rows[0].date,
        };
      }
      console.log('path', data);
      console.log('reault', result);
      return res.status('200').json(result);
    };
  }
}

module.exports = APPMiddleware;
