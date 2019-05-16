
class APPAction {
  constructor(options) {
    this.db = options.db;
  }

  // Info
  async getInfo() {
    return this.db('Info').select().where('visit', 1);
  }

  // User
  async getUser(id) {
    return this.db('user').select().where('Uid', id);
  }

  async postUser(data) {
    return this.db('user').insert(data).returning('Uid');
  }

  async patchUser(data, id) {
    return this.db('user').update(data).where('Uid', id);
  }

  // Product
  async getProducts() {
    return this.db('product').select();
  }

  async getImages() {
    return this.db('image').select('Pid', 'Ipath');
  }

  async getProductName() {
    return this.db('product').select('Pid', 'Pname', 'image_icon');
  }

  async getProductList() {
    return this.db('product').select('Pid', 'Pname', 'image_icon', 'description');
  }

  async getProduct(id) {
    return this.db('product').select().where('Pid', id);
  }

  async getImage(id) {
    return this.db('image').select('Ipath').where('Pid', id);
  }

  // node
  async getNodes() {
    return this.db('node')
      .join('product', 'node.Pid', '=', 'product.Pid')
      .select('node.Nid', 'node.row', 'node.col', 'node.Bid', 'product.Pid', 'product.Pname', 'product.image_icon');
  }

  // feedback
  async getFeedback(Pid) {
    return this.db('feedback')
      .join('user', 'feedback.Uid', '=', 'user.Uid')
      .select('feedback.Fid', 'feedback.feedback', 'feedback.Uid', 'user.Uid', 'user.name', 'feedback.Pid')
      .where('feedback.Pid', Pid);
  }

  async getFeedbackByID(Fid) {
    return this.db('feedback').select().where('Fid', Fid);
  }

  async getFeedbackID(Uid, Pid) {
    return this.db('feedback').select().where('Pid', Pid).andWhere('Uid', Uid);
  }

  async postFeedback(data) {
    return this.db('feedback')
      .insert(data).returning('Fid');
  }

  async patchFeedback(feedback, Uid, Pid) {
    return this.db('feedback').update({ feedback })
      .where('Uid', Uid)
      .andWhere('Pid', Pid);
  }

  async deleteFeedback(Fid) {
    return this.db('feedback').del().where('Fid', Fid);
  }

  async deleteFeedbackID(Uid, Pid) {
    return this.db('feedback').del().where('Pid', Pid).andWhere('Uid', Uid);
  }

  // wantted
  async getWantteds(Uid) {
    return this.db('wantted').select().where('Uid', Uid);
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

  async getSuggest() {
    return this.db('info').select('route');
  }

  // path
  async getPathByUid(Uid) {
    return this.db('path').select().where('Uid', Uid);
  }

  async getPathByUidDate(Uid, date) {
    return this.db('path').select().where('Uid', Uid).where('date', date);
  }

  async getPath(pathid) {
    return this.db('path').select().where('path_id', pathid);
  }

  async postPath(data) {
    return this.db('path').insert(data).returning('path_id');
  }

  async patchPath(pathId, data) {
    return this.db('path').update(data).where('path_id', pathId);
  }
}

module.exports = APPAction;
