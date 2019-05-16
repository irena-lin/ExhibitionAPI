const _ = require('lodash');
const bcrypt = require('bcrypt');
const fs = require('fs');
const util = require('util');

const ReadFile = util.promisify(fs.readFile);

class APPMiddleware {
  constructor(options) {
    this.action = options.action;
  }

  login() {
    return async (req, res) => {
      const rows = await this.action.getUser(req.params.Uid);
      console.log(rows);
      console.log(req.body.name, req.body.password);

      if (rows[0].name === null) {
        console.log('403');
        return res.status('403').json({ message: '尚未註冊' });
      }
      const passwordValid = await bcrypt.compare(req.body.password, rows[0].password);
      if (rows[0].name === req.body.name && passwordValid) {
        console.log('200');
        return res.status('200').json({ message: '登入成功' });
      }
      console.log('401');
      return res.status('401').json({ message: '登入失敗' });
    };
  }

  register1() {
    return async (req, res) => {
      const data = {
        name: null,
        password: null,
        permission: 0,
      };
      const id = await this.action.postUser(data);
      const a = await this.action.getUser(id);
      return res.status('200').json(a[0]);
    };
  }

  register() {
    return async (req, res) => {
      const con = await this.action.getUser(req.params.Uid);
      const data = {
        name: req.body.name || con.name,
        password: await bcrypt.hash(req.body.password, 10) || con.password,
        permission: 1,
      };
      await this.action.patchUser(data, req.params.Uid);
      const a = await this.action.getUser(req.params.Uid);
      return res.status('200').json(a[0]);
    };
  }

  getimage() { // eslint-disable-line
    return async (req, res) => {
      const path = `./image/${req.params.filename}`;
      ReadFile(path)
        .then((test) => {
          console.log(test);
          return res.status('200').send(test);
        })
        .catch(err => res.status('404').json({ message: err }));
    };
  }

  getProductName() {
    return async (req, res) => {
      const row = await this.action.getProductName();
      const data = row.map(p => ({ Pid: p.Pid, Pname: p.Pname, icon: p.image_icon }));
      return res.status('200').json({ ProductName: data });
    };
  }

  getProductList() {
    return async (req, res) => {
      const row = await this.action.getProductList();
      const data = row.map(p => ({
        Pid: p.Pid,
        Pname: p.Pname,
        icon: p.image_icon,
        description: p.description,
      }));
      return res.status('200').json({ productList: data });
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


  getNode() {
    return async (req, res) => {
      const node = await this.action.getNodes();
      const results = node.map(p => ({
        Nid: p.Nid,
        Pid: p.Pid,
        Pname: p.Pname,
      }));
      console.log(results);
      return res.status('200').json({ node: results });
    };
  }


  getFeedback() {
    return async (req, res) => {
      const rows = await this.action.getFeedback(req.params.Pid);

      const results = rows.map(row => ({
        Fid: row.Fid,
        feedback: row.feedback,
        reply: row.reply,
        RFid: row.RFid,
        Uid: row.Uid,
        name: row.name,
      }));
      return res.status('200').json({ feedback: results });
    };
  }

  postFeedback() {
    return async (req, res) => {
      console.log(req.params.Uid, req.params.Pid, req.body.feedback);
      const result = await this.action.getFeedbackID(req.params.Uid, req.params.Pid);
      console.log(result);
      let action;
      if (!req.body.feedback) {
        action = 'delete';
        await this.action.deleteFeedbackID(req.params.Uid, req.params.Pid);
      } else if (result.length === 0) {
        const data = {
          feedback: req.body.feedback,
          Uid: req.params.Uid,
          Pid: req.params.Pid,
          reply: 0,
          RFid: 0,
        };
        action = 'post';
        await this.action.postFeedback(data);
      } else {
        action = 'patch';
        await this.action.patchFeedback(req.body.feedback, req.params.Uid, req.params.Pid);
      }
      console.log(action);
      const a = await this.action.getFeedbackID(req.params.Uid, req.params.Pid);
      return res.status('200').json(a[0]);
    };
  }

  getWantted() {
    return async (req, res) => {
      const wantted = await this.action.getWantteds(req.params.Uid);
      if (wantted.length === 0) return res.status('404').json({ path: [] });
      const path = _.split(wantted[wantted.length - 1].path, '');
      return res.status('200').json({ path });
    };
  }

  postWantted() {
    return async (req, res) => {
      const id = await this.action.postWantted({
        Uid: req.params.Uid,
        path: req.body.path,
      });
      console.log(_.split((await this.action.getWantted(id))[0].path, ''));
      return res.status('200').json({ path: _.split((await this.action.getWantted(id))[0].path, '') });
    };
  }

  getSuggest() {
    return async (req, res) => {
      const path = await this.action.getSuggest();
      const suggest = _.uniq(_.split(path[0].route, ''));
      return res.status('200').json({ path: suggest });
    };
  }

  getPathUniqe() {
    return async (req, res) => {
      const id = await this.action.getPathByUid(req.params.Uid);
      if (id.length === 0) return res.status('404').json({ message: 'Not Found' });
      const row = await this.action.getPath(id[id.length - 1].path_id);
      const path = _.uniq(_.split(row[0].path, ''));
      return res.status('200').json({ path });
    };
  }

  getPath() {
    return async (req, res) => {
      // 先判斷有沒有，沒有舊的建新的
      // 如果有但不同天，一樣建新的
      // 重複 Nid 不用重複紀錄
      // 最後給的結果 { message:已更新, product:{XXX},  }

      const now = _.split(new Date().toISOString(), 'T', 1);
      const D = _.split(now[0], '-');
      const date = D[0] + D[1] + D[2];

      const row = await this.action.getPathByUidDate(req.params.Uid, date); // Uid

      console.log(row);
      console.log(req.params.Pid);
      console.log(typeof req.params.Pid);
      let data = {};
      let result = {};
      if (row.length === 0) {
        console.log('post');
        data = {
          Uid: req.params.Uid,
          path: Number(req.params.Pid), // node_id
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
        if (((row[row.length - 1].path) % 10) === Number(req.params.Pid)) {
          console.log('重複');
          return res.status('200').json({ message: '重複 Nid！' });
        }
        if (row[row.length - 1].path === null) {
          console.log('patch', row[row.length - 1].path);
          console.log('path null');
          data = {
            path_id: row[row.length - 1].path_id,
            Uid: row[row.length - 1].Uid,
            path: Number(req.params.Pid), // node_id
            time: row[row.length - 1].time,
            date: row[row.length - 1].date,
          };
        } else {
          console.log('patch', row[row.length - 1].path);
          data = {
            path_id: row[row.length - 1].path_id,
            Uid: row[row.length - 1].Uid,
            path: Number(row[row.length - 1].path + req.params.Pid), // node_id
            time: row[row.length - 1].time,
            date: row[row.length - 1].date,
          };
        }
        console.log(data);
        console.log(row[row.length - 1].path_id);
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
      return res.status('200').json({ path: result.path });
    };
  }
}

module.exports = APPMiddleware;
