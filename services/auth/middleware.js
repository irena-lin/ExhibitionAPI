
const util = require('util');
const fs = require('fs');
const dauria = require('dauria');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const writeFile = util.promisify(fs.writeFile);
const readdir = util.promisify(fs.readdir);

class AuthMiddleWare {
  constructor(options) {
    this.action = options.action;
  }

  isLoggedin() { // eslint-disable-line
    return async (req, res, next) => {
      if (req.isAuthenticated()) {
        if (req.user.permission > 1) {
          return next();
        }
        return res.status('401').json({ code: '401', message: '權限不足' });
      } return res.status('401').json({ code: '401', message: '登入失敗' });
    };
  }

  // user
  getUsers() {
    return async (req, res) => {
      const row = await this.action.getUsers();
      const results = row.map(post => ({
        Uid: post.Uid,
        name: post.name,
        permission: post.permission,
      }));
      return res.status('200').json(results);
    };
  }

  getUser() {
    return async (req, res) => {
      const row = await this.action.getUser(req.params.id);
      if (row.length === 0) return res.status('404').json({ code: 404, message: 'Not Found' });
      const result = {
        Uid: row[0].Uid,
        name: row[0].name,
        permission: row[0].permission,
      };
      return res.status('200').json(result);
    };
  }

  postUser() {
    return async (req, res) => {
      const data = {
        name: req.body.name,
        password: await bcrypt.hash(req.body.password, 10),
        permission: req.body.permission,
      };
      const id = await this.action.postUser(data).catch((err) => {
        if (err.errno === 1364) return res.status('500').json({ code: 500, message: '請完整填完表格' });
        if (err.errno === 1062) return res.status('500').json({ code: 500, message: 'User name duplicated!' });
        return err;
      });
      const row = await this.action.getUser(id);
      const result = {
        Uid: row[0].Uid,
        name: row[0].name,
        permission: row[0].permission,
      };
      return res.status('200').json(result);
    };
  }

  patchUser() {
    return async (req, res) => {
      const row = await this.action.getUser(req.params.id)
        .catch((err) => {
          if (err.code === 1062) return res.status('500').json({ code: 500, message: 'User name duplication!' });
          return err;
        });
      if (row.length === 0) res.status('404').json({ code: 404, message: 'Not Found' });
      const data = {
        name: req.body.name || row.name,
        password: await bcrypt.hash(req.body.password, 10) || row.password,
        permission: req.body.permission || row.permission,
      };
      await this.action.patchUser(data, req.params.id);
      const rows = await this.action.getUser(req.params.id);
      const result = {
        Uid: rows[0].Uid,
        name: rows[0].name,
        permission: rows[0].permission,
      };
      return res.status('200').json(result);
    };
  }

  deleteUser() {
    return async (req, res) => {
      const num = await this.action.deleteUser(req.params.id);
      if (num === 0) return res.status('404').json({ code: 404, message: 'Not Found' });
      return res.status('200').json({ message: 'delete user Ok!' });
    };
  }

  // product
  getProducts() {
    return async (req, res) => {
      const row = await this.action.getProducts();
      const ImageRow = await this.action.getImages();
      const result = row.map(post => ({
        Pid: post.Pid,
        Pname: post.Pname,
        description: post.description,
        icon: post.image_icon,
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

      const results = {
        Pid: product[0].Pid,
        Pname: product[0].Pname,
        description: product[0].description,
        icon: product[0].image_icon,
        image: [],
      };
      results.image = Image.map(ima => ima.Ipath);
      return res.status('200').json(results);
    };
  }

  postImage() { // eslint-disable-line
    return async (req, res) => {
      const file = await readdir('image');
      const path = `image/${file.length + 1}.png`;
      writeFile(path, dauria.parseDataURI(req.body.uri).buffer)
        .catch((err) => {
          throw err;
        });
      return res.status('200').json({ path });
    };
  }

  postProduct() {
    return async (req, res) => {
      const data = {
        Pname: req.body.Pname,
        description: req.body.description,
        image_icon: req.body.icon,
      };
      const id = await this.action.postProduct(data);
      const rows = await this.action.getProduct(id);
      const reg = {
        Pid: rows[0].Pid,
        Pname: rows[0].Pname,
        description: rows[0].description,
        icon: rows[0].image_icon,
        image: [],
      };
      if (req.body.image) {
        const image = req.body.image.map(post => ({ Pid: id, Ipath: post }));
        await this.action.postImage(image);

        const row = await this.action.getImage(id);
        reg.image = row.map(p => p.Ipath);
      }
      return res.status('200').json(reg);
    };
  }

  patchProduct() {
    return async (req, res) => {
      const rows = await this.action.getProduct(req.params.id);
      if (rows.length === 0) return res.status('404').json({ code: '404', message: 'Not Found' });
      const product = {
        Pname: req.body.Pname || rows[0].Pname,
        description: req.body.description || rows[0].description,
        image_icon: req.body.icon || rows[0].image_icon,
      };

      await this.action.patchProduct(product, req.params.id);
      const row = await this.action.getProduct(req.params.id);
      const reg = {
        Pid: row[0].Pid,
        Pname: row[0].Pname,
        description: row[0].description,
        icon: row[0].image_icon,
        image: [],
      };

      if (req.body.image) {
        const image = await this.action.getImage(req.params.id);
        const path = image.map(p => p.Ipath);
        const Idel = _.difference(_.compact(path), req.body.image);
        const Iadd = _.difference(req.body.image, _.compact(path));

        if (Iadd.length !== 0) {
          const add = Iadd.map(post => ({ Ipath: post, Pid: req.params.id }));
          await this.action.postImage(add);
        }
        if (Idel.length !== 0) {
          await this.action.deleteImage(Idel, req.params.id);
        }
      }
      const ro = await this.action.getImage(req.params.id);
      reg.image = ro.map(p => p.Ipath);
      return res.status('200').json(reg);
    };
  }

  deleteProduct() {
    return async (req, res) => {
      const num = await this.action.deleteProduct(req.params.id);
      if (num === 0) return res.status('404').json({ code: '404', message: 'Not Found' });
      await this.action.deleteImageByPID(req.params.id);
      return res.status('200').json({ message: 'delete product OK!' });
    };
  }

  // info
  getInfos() {
    return async (req, res) => {
      const row = await this.action.getInfos();
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

  getInfo() {
    return async (req, res) => {
      const row = await this.action.getInfo(req.params.id);
      if (row.length === 0) return res.status('404').json({ code: 404, message: 'Not Found' });
      const result = {
        Eid: row[0].Eid,
        Ename: row[0].Ename,
        info: row[0].info,
        StartDate: _.split(new Date(row[0].Startdate * 1000).toString(), ' ', 5),
        EndDate: _.split(new Date(row[0].Enddate * 1000).toString(), ' ', 5),
        description: row[0].description,
        route: _.split(row[0].route, ''),
      };
      return res.status('200').json(result);
    };
  }

  postInfo() {
    return async (req, res) => {
      const data = {
        Ename: req.body.Ename,
        info: req.body.info,
        Startdate: new Date(req.body.SrartDate).valueOf() / 1000,
        Enddate: new Date(req.body.EndDate).valueOf() / 1000,
        description: req.body.description,
        route: req.body.route,
      };
      const id = await this.action.postInfo(data);
      const row = await this.action.getInfo(id);
      const result = {
        Eid: row[0].Eid,
        Ename: row[0].Ename,
        info: row[0].info,
        StartDate: _.split(new Date(row[0].Startdate * 1000).toString(), ' ', 5),
        EndDate: _.split(new Date(row[0].Enddate * 1000).toString(), ' ', 5),
        description: row[0].description,
        route: _.split(row[0].route, ''),
      };
      return res.status('200').json(result);
    };
  }

  patchInfo() {
    return async (req, res) => {
      const rows = await this.action.getInfo(req.params.id);
      const data = {
        Ename: req.body.Ename || rows[0].Ename,
        info: req.body.info || rows[0].info,
        Startdate: new Date(req.body.SrartDate).valueOf() / 1000 || rows[0].Srartdate,
        Enddate: new Date(req.body.EndDate).valueOf() / 1000 || rows[0].Enddate,
        description: req.body.description || rows[0].description,
        route: req.body.route || rows[0].route,
      };
      await this.action.patchInfo(data, req.params.id);
      const row = await this.action.getInfo(req.params.id);
      const result = {
        Eid: row[0].Eid,
        Ename: row[0].Ename,
        info: row[0].info,
        StartDate: _.split(new Date(row[0].Startdate * 1000).toString(), ' ', 5),
        EndDate: _.split(new Date(row[0].Enddate * 1000).toString(), ' ', 5),
        description: row[0].description,
        route: _.split(row[0].route, ''),
      };
      return res.status('200').json(result);
    };
  }

  deleteInfo() {
    return async (req, res) => {
      const num = await this.action.deleteInfo(req.params.id);
      if (num === 0) return res.status('404').json({ code: 404, message: 'Not Found' });
      return res.status('200').json({ message: 'delete Info Ok!!' });
    };
  }

  // node
  getNodes() {
    return async (req, res) => {
      const rows = await this.action.getNodes();
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

  getNode() {
    return async (req, res) => {
      const row = await this.action.getNode(req.params.id);
      if (row.length === 0) return res.status('404').json({ code: 404, message: 'Not Found' });
      const result = {
        Nid: row[0].Nid,
        row: row[0].row,
        col: row[0].col,
        Bid: row[0].Bid,
        Pid: row[0].Pid,
      };
      return res.status('200').json(result);
    };
  }

  postNode() {
    return async (req, res) => {
      const data = {
        row: req.body.row,
        col: req.body.col,
        Bid: req.body.Bid,
        Pid: req.body.Pid,
      };
      const id = await this.action.postNode(data);
      return res.status('200').json(await this.action.getNode(id));
    };
  }

  patchNode() {
    return async (req, res) => {
      const rows = await this.action.getNode(req.params.id);
      if (rows.length === 0) return res.status('404').json({ code: '404', message: 'Not Found' });
      const data = {
        row: req.body.row || rows[0].row,
        col: req.body.col || rows[0].col,
        Bid: req.body.Bid || rows[0].Bid,
        Pid: req.body.Pid || rows[0].Pid,
      };
      await this.action.patchNode(data, req.params.id);
      return res.status('200').json(await this.action.getNode(req.params.id));
    };
  }

  deleteNode() {
    return async (req, res) => {
      const num = await this.action.deleteNode(req.params.id);
      if (num === 0) return res.status('404').json({ code: '404', message: 'Not Found' });
      return res.status('200').json({ message: 'delete node OK!' });
    };
  }

  // beacon
  getBeacons() {
    return async (req, res) => {
      const rows = await this.action.getBeacons();
      const results = rows.map(post => ({
        Bid: post.Bid,
        Beacon_id: post.Beacon_id,
        Bname: post.Bname,
        BUUid: post.BUUid,
        Bmajor: post.Bmajor,
        Bminor: post.Bminor,
        Btype: post.Btype,
        Burl: post.Burl,
      }));
      return res.status('200').json(results);
    };
  }

  getBeacon() {
    return async (req, res) => {
      const row = await this.action.getBeacon(req.params.id);
      if (row.length === 0) return res.status('404').json({ code: '404', message: 'Not Found' });
      return res.status('200').json({
        Bid: row[0].Bid,
        Beacon_id: row[0].Beacon_id,
        Bname: row[0].Bname,
        BUUid: row[0].BUUid,
        Bmajor: row[0].Bmajor,
        Bminor: row[0].Bminor,
        Btype: row[0].Btype,
        Burl: row[0].Burl,
      });
    };
  }

  postBeacon() {
    return async (req, res) => {
      const data = {
        Beacon_id: req.body.Beacon_id,
        Bname: req.body.Bname,
        BUUid: req.body.BUUid,
        Bmajor: req.body.Bmajor,
        Bminor: req.body.Bminor,
        Btype: req.body.Btype,
        Burl: req.body.Burl,
      };
      const id = await this.action.postBeacon(data);
      return res.status('200').json(await this.action.getBeacon(id));
    };
  }

  patchBeacon() {
    return async (req, res) => {
      const rows = await this.action.getBeacon(req.params.id);
      if (rows.length === 0) return res.status('404').json({ code: '404', message: 'Not Found' });
      const data = {
        Beacon_id: req.body.Beacon_id || rows[0].Beacon_id,
        Bname: req.body.Bname || rows[0].Bname,
        BUUid: req.body.BUUid || rows[0].BUUid,
        Bmajor: req.body.Bmajor || rows[0].Bmajor,
        Bminor: req.body.Bminor || rows[0].Bminor,
        Btype: req.body.Btype || rows[0].Btype,
        Burl: req.body.Burl || rows[0].Burl,
      };
      await this.action.patchBeacon(data, req.params.id);
      return res.status('200').json(await this.action.getBeacon(req.params.id));
    };
  }

  deleteBeacon() {
    return async (req, res) => {
      const num = await this.action.deleteBeacon(req.params.id);
      if (num === 0) return res.status('404').json({ code: '404', message: 'Not Found' });
      return res.status('200').json({ message: 'delete beacon OK!' });
    };
  }

  // wantted
  getWantteds() {
    return async (req, res) => {
      const rows = await this.action.getWantteds();
      const results = rows.map(post => ({
        Wid: post.Wid,
        path: _.split(post.path, ''),
        Uid: post.Uid,
      }));
      return res.status('200').json(results);
    };
  }

  getWantted() {
    return async (req, res) => {
      const row = await this.action.getWantted();
      if (row.length === 0) return res.status('404').json({ code: 404, message: 'Not Found' });
      const result = {
        Wid: row[0].Wid,
        path: _.split(row[0].path, ''),
        Uid: row[0].Uid,
      };
      return res.status('200').json(result);
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
      const results = await this.action.getWantted(req.params.id);
      if (results.length === 0) return res.status('404').json({ code: 404, message: 'Not Found' });
      const data = {
        path: req.params.path || results[0].path,
      };
      await this.action.patchWantted(data, req.params.id);
      const result = await this.action.getWantted(req.params.id);
      return res.status('200').json({
        Wid: result.Wid,
        path: _.split(result.path, ''),
        Uid: result.Uid,
      });
    };
  }

  deleteWantted() {
    return async (req, res) => {
      const num = await this.action.deleteWantted(req.params.id);
      if (num === 0) return res.status('404').json({ code: 404, message: 'Not Found' });
      return res.status('200').json({ message: 'delete wantted ok!' });
    };
  }

  // feedback
  getFeedbacks() {
    return async (req, res) => {
      const rows = await this.action.getFeedbacks();

      const results = rows.map(row => ({
        Fid: row.Fid,
        feedback: row.feedback,
        Uid: row.Uid,
        name: row.name,
        Pid: row.Pid,
      }));
      return res.status('200').json(results);
    };
  }

  getFeedbacksByPid() {
    return async (req, res) => {
      const rows = await this.action.getFeedback(req.params.Pid);

      let name;
      let icon;
      if (req.params.Pid === '0') {
        name = 'all';
        icon = null;
      } else {
        const P = await this.action.getProduct(req.params.Pid);
        name = P[0].Pname;
        icon = P[0].image_icon;
      }

      // 1
      const results = {
        Pid: rows.Pid,
        Pname: name,
        Picon: icon,
        Feedback: [],
      };

      results.Feedback = rows.map(row => ({
        Fid: row.Fid,
        feedback: row.feedback,
        Uid: row.Uid,
        name: row.Uid,
      }));

      // 2
      // const results = rows.map(row => ({
      //   Fid: row.Fid,
      //   feedback: row.feedback,
      //   Uid: row.Uid,
      //   name: row.name,
      //   Pid: row.Pid,
      //   Pname: name,
      //   Picon: icon,
      // }));
      return res.status('200').json(results);
    };
  }

  getFeedback() {
    return async (req, res) => {
      const row = await this.action.getFeedbackByID(req.params.id);
      if (row.length === 0) return res.status('404').json({ code: 404, message: 'Not Found' });
      let name;
      if (row[0].Pid === '0') {
        name = 'all';
      } else {
        const P = await this.action.getProduct(row[0].Pid);
        name = P[0].Pname;
      }

      const result = {
        Fid: row[0].Fid,
        feedback: row[0].feedback,
        Uid: row[0].Uid,
        Uname: row[0].name,
        Pid: row[0].Pid,
        Pname: name,
      };
      return res.status('200').json(result);
    };
  }

  postFeedback() {
    return async (req, res) => {
      const data = {
        feedback: req.body.feedback,
        Uid: req.body.Uid,
        Pid: req.body.Pid,
        reply: 1,
        RFid: req.params.id,
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

  // analysis

  getPaths() {
    return async (req, res) => {
      const row = await this.action.getPaths();
      const results = row.map(post => ({
        path_id: post.path_id,
        Uid: post.Uid,
        path: _.split(post.path, ''),
        time: post.time,
        date: post.date,
      }));
      return res.status('200').json(results);
    };
  }

  getPath() {
    return async (req, res) => {
      const row = await this.action.getPath(req.params.id);
      if (row.length === 0) return res.status('404').json({ code: 404, message: 'Not Found' });
      const result = {
        path_id: row[0].path_id,
        Uid: row[0].Uid,
        path: _.split(row[0].path, ''),
        time: row[0].time,
        date: row[0].date,
      };
      return res.status('200').json(result);
    };
  }

  getPathRecent() {
    return async (req, res) => {
      const time = new Date(new Date().toISOString().split('T')[0]).valueOf() / 1000;
      const row = await this.action.getPathRecent(time);

      const result = {
        num: row.length,
        detail: [],
      };
      if (row.length !== 0) {
        result.detail = row.map((post) => {
          const path = _.split(post.path, '');
          return {
            Uid: post.Uid,
            path,
            lastNode: path[path.length - 1],
            time: new Date(post.time).toString(),
            date: post.date,
          };
        });
      }
      return res.status('200').json(result);
    };
  }

  getPathsUserNum() {
    return async (req, res) => {
      const row = await this.action.getPathUserNum();
      return res.status('200').json(row);
    };
  }

  getFeedbackNum() {
    return async (req, res) => {
      const rows = await this.action.getFeedbacks();
      const product = await this.action.getProducts();

      const P = product.map(post => ({
        Pid: post.Pid,
        Pname: post.Pname,
        Picon: post.image_icon,
        Feedback: [],
      }));
      P[P.length] = {
        Pid: 0,
        Pname: 'all',
        Picon: null,
        Feedback: [],
      };

      P.map((post) => {
        post.Feedback = rows // eslint-disable-line
          .filter(ro => post.Pid === ro.Pid)
          .map(row => ({
            Fid: row.Fid,
            feedback: row.feedback,
            Uid: row.Uid,
            name: row.Uid,
          }));
        return post;
      });
      return res.status('200').json(P);
    };
  }

  getWanttedNum() {
    return async (req, res) => {
      const row = await this.action.getWanttedNum();
      if (row === 0) res.status('404').json({ code: 404, message: 'Not Found' });
      return res.status('200').json(row);
    };
  }

  //   getPathPathNum() {
  //     return async (req, res) => {

  //     };
  //   }
}

module.exports = AuthMiddleWare;
