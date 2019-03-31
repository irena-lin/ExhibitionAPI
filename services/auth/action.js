
class AuthAction {
  constructor(options) {
    this.db = options.db;
  }

  // User
  async getUsers() {
    return this.db('user').select();
  }

  async getUser(id) {
    return this.db('user').select().where('Uid', id);
  }

  async postUser(data) {
    return this.db('user').insert(data).returning('Uid');
  }

  async patchUser(data, id) {
    return this.db('user').update(data).where('Uid', id);
  }

  async deleteUser(id) {
    return this.db('user').del().where('Uid', id);
  }

  // Product
  async getProducts() {
    return this.db('product').select();
  }

  async getImages() {
    return this.db('image').select('Pid', 'Ipath');
  }

  async getProduct(id) {
    return this.db('product').select().where('Pid', id);
  }

  async getImage(id) {
    return this.db('image').select('Ipath').where('Pid', id);
  }

  async postProduct(data) {
    return this.db('product').insert(data).returning('Pid');
  }

  async postImage(data) {
    return this.db('image').insert(data).returning('Iid');
  }

  async patchProduct(data, id) {
    return this.db('product').update(data).where('Pid', id);
  }

  async patchIamge(data, id) {
    return this.db('image').update(data).where('Iid', id);
  }

  async deleteProduct(id) {
    return this.db('product').del().where('Pid', id);
  }

  async deleteImageByPID(id) {
    return this.db('image').del().where('Pid', id);
  }

  async deleteImage(data, id) {
    return this.db('image').del().whereIn('Ipath', data).andWhere('Pid', id);
  }

  // node
  async getNodes() {
    return this.db('node')
      .join('product', 'node.Pid', '=', 'product.Pid')
      .select('node.Nid', 'node.row', 'node.col', 'node.Bid', 'product.Pid', 'product.Pname', 'product.image_icon');
  }

  async getNode(id) {
    return this.db('node').select().where('Nid', id);
  }

  async postNode(data) {
    return this.db('node').insert(data).returning('Nid');
  }

  async patchNode(data, id) {
    return this.db('node').update(data).where('Nid', id);
  }

  async deleteNode(id) {
    return this.db('node').del().where('Nid', id);
  }

  // beacon
  async getBeacons() {
    return this.db('beacon').select();
  }

  async getBeacon(id) {
    return this.db('beacon').select().where('Bid', id);
  }

  async postBeacon(data) {
    return this.db('beacon').insert(data).returning('Bid');
  }

  async patchBeacon(data, id) {
    return this.db('beacon').update(data).where('Bid', id);
  }

  async deleteBeacon(id) {
    return this.db('beacon').del().where('Bid', id);
  }

  // feedback
  async getFeedbacks() {
    return this.db('feedback').select();
  }

  async getFeedback(Pid) {
    return this.db('feedback')
      .join('user', 'feedback.Uid', '=', 'user.Uid')
      .select('feedback.Fid', 'feedback.feedback', 'feedback.Uid', 'user.Uid', 'user.name', 'feedback.Pid')
      .where('feedback.Pid', Pid);
  }

  async getFeedbackByID(Fid) {
    return this.db('feedback').select().where('Fid', Fid);
  }

  async postFeedback(data) {
    return this.db('feedback').insert(data).returning('Fid');
  }

  async patchFeedback(feedback, Uid, Pid) {
    return this.db('feedback').update({ feedback })
      .where('Uid', Uid)
      .andWhere('Pid', Pid);
  }

  async deleteFeedback(Fid) {
    return this.db('feedback').del().where('Fid', Fid);
  }

  // wantted
  async getWantteds() {
    return this.db('wantted').select();
  }

  async getWantted(Wid) {
    return this.db('wantted').select().where('Wid', Wid);
  }

  async postWantted(data) {
    return this.db('wantted').insert(data).returning('Wid');
  }

  async patchWantted(data, Wid) {
    return this.db('wantted').update(data).where('Wid', Wid);
  }

  async deleteWantted(Wid) {
    return this.db('wantted').del().where('Wid', Wid);
  }

  // info
  async getInfos() {
    return this.db('info').select();
  }

  async getInfo(Eid) {
    return this.db('info').select().where('Eid', Eid);
  }

  async postInfo(data) {
    return this.db('info').insert(data).returning('Eid');
  }

  async patchInfo(data, Eid) {
    return this.db('info').update(data).where('Eid', Eid);
  }

  async deleteInfo(Eid) {
    return this.db('info').del().where('Eid', Eid);
  }

  // path
  async getPaths() {
    return this.db('path').select();
  }

  async getPath(pathid) {
    return this.db('path').select().where('path_id', pathid);
  }

  async getPathRecent(start) {
    return this.db('path').select().where('time', '>', start);
  }

  async getPathUserNum() {
    return this.db('path').select('date', { count: this.db.raw('COUNT(date)') }).groupBy('date');
  }

  async getWanttedNum() {
    return this.db('wantted').select('path', { count: this.db.raw('COUNT(path)') }).groupBy('path');
  }

  //   async postPath(data) {
  //     return this.db('path').insert(data).returning('path_id');
  //   }

//   async patchPath(data, pathId) {
//     return this.db('path').update(data).where('path_id', pathId);
//   }
}

module.exports = AuthAction;
