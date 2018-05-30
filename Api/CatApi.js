var instance;
var BaseApi = require('./BaseApi')

init();

function init () {
  /*继承隐性属性（也就是原型prototype）*/
  CatApi.prototype             = Object.create(BaseApi.prototype);
  CatApi.prototype.constructor = CatApi;

  CatApi.prototype.add    = add;
  CatApi.prototype.remove = remove;
  CatApi.prototype.update = update;
  CatApi.prototype.read   = read;

  if (!instance)
    instance = new CatApi();

  return instance;
}

function CatApi () {
  this._model_name = 'cat';
  /*继承显性属性（也就是原型prototype）*/
  BaseApi.call(this);

  this.config = {
    title : {
      max_length : 10,
    },
  };

  this.default_list = [
    {
      id    : 1,
      title : '默认',
    },
  ];

  this.default_max_id = this.default_list.length;

  /*加载初始数据，要么是localStorage中已有的数据，要么是默认数据，
  也就是this.default_list和this.default_max_id*/
  this.load_data();

  this.reverse_direction = true;
}

function add (row) {
  if (!row.title)
    return;

  var max_length = this.config.title.max_length;

  if (row.title.length > max_length)
    throw `title should not greater than ${max_length}`;

  return this.$add(row);
}

function remove (id) {
  if (id == 1)
    return;

  return this.$remove(id);
}

function update (id, new_row) {
  return this.$update(id, new_row);
}

function read () {
  return this.$read();
}

module.exports = instance;
