window.TaskUi = TaskUi;

function TaskUi (config) {
  var default_config = {
    list_selector            : '#todo-list',
    incomplete_list_selector : '.incomplete',
    completed_list_selector  : '.completed',
    input_selector           : '#todo-input',
    form_selector            : '#todo-form',
    on_init                  : null,
    on_input_focus           : null,
    on_input_blur            : null,
    on_add_succeed           : null,
  }

  var c = this.config = Object.assign({}, default_config, config);
  this.form            = document.querySelector(c.form_selector);
  this.input           = document.querySelector(c.input_selector);
  this.list            = document.querySelector(c.list_selector);
  this.completed_list  = this.list.querySelector(c.completed_list_selector);
  this.incomplete_list = this.list.querySelector(c.incomplete_list_selector);
  /*私有，不应该直接调用，仅限此文件内部调用*/
  this._api         = new TaskApi();
  this._api.on_sync = c.on_sync;
}

TaskUi.prototype.get_form_data      = helper.get_form_data;
TaskUi.prototype.set_form_data      = helper.set_form_data;
TaskUi.prototype.render             = render;
TaskUi.prototype.init               = init;
TaskUi.prototype.detect_add         = detect_add;
TaskUi.prototype.detect_click_list  = detect_click_list;
TaskUi.prototype.detect_input_focus = detect_input_focus;
TaskUi.prototype.detect_input_blur  = detect_input_blur;
TaskUi.prototype.remove             = remove;

function init () {
  var cb = this.config.on_init;
  this.render();
  this.detect_add();
  this.detect_click_list();
  this.detect_input_focus();
  this.detect_input_blur();
  if (cb)
    cb();
}

function detect_input_focus () {
  var me = this;
  this.input.addEventListener('focus', function () {
    var cb = me.config.on_input_focus;
    if (cb)
      cb();
  });
}

function detect_input_blur () {
  var me = this;
  this.input.addEventListener('blur', function () {
    var cb = me.config.on_input_blur;
    if (cb)
      cb();
  });
}

/*监听添加事件（表单提交事件）*/
function detect_add () {
  var me = this;
  this.form.addEventListener('submit', function (e) {
    e.preventDefault();

    /*将表单中的数据转化成纯数据对象 {id: xxx, title: '吃饭', ... } */
    var row = me.get_form_data(me.form);
    var cb  = me.config.on_add_succeed;

    /*如果数据中有id，说明是更新旧数据，
    * 否则为添加新数据*/
    if (row.id) {
      /*更新一条*/
      me._api.update(row.id, row);
    } else {
      /*新增一条*/
      me._api.add(row);
    }
    /*更新界面*/
    me.render(row.cat_id);
    /*清空输入框*/
    me.input.value = '';


    if (cb)
      cb();
  });
}

/*监听任务列表点击事件*/
function detect_click_list () {
  var me = this;
  this.list.addEventListener('click', function (e) {
    var target        = e.target // 点击源
      , todo_item     = target.closest('.todo-item') // 被点击的.todo-item，没有这个元素，就拿不到id
      , id            = todo_item ? todo_item.dataset.id : null // 拿到id
      , is_remove_btn = target.classList.contains('remove') // 点击的是否为删除按钮
      , is_update_btn = target.classList.contains('update') // 点击的是否为更新按钮
      , is_checkbox   = target.classList.contains('checker')
      , row           = me._api.$find(id);
    ;

    if (is_remove_btn) {
      /*找到按钮所在的.todo-item，因为.todo-item上有当前任务的id*/
      me.remove(id);
    } else if (is_update_btn) {
      /*通过id得到相对应的那条数据对象 {id: xxx, title: '吃饭', ... }*/
      /*填充表单*/
      me.set_form_data(me.form, row);
    } else if (is_checkbox) {
      me._api.set_completed(id, target.checked);
      me.render();
    } else {
      if (!id)
        return;
    }
  });
}

function remove (id) {
  /*删数据*/
  this._api.remove(id);

  /*重新渲染*/
  this.render();
}

/*渲染任务列表*/
function render (cat_id) {
  /*先通过api拿到所有数据*/
  var todo_list = cat_id ?
                  this._api.read_by_cat(cat_id) :
                  this._api.read();

  var me     = this
    , holder = `<div class="empty-holder">暂无内容</div>`;

  /*清空上次渲染的数据*/
  this.incomplete_list.innerHTML =
    this.completed_list.innerHTML = '';

  todo_list = todo_list || [];

  /*遍历所有的任务数据，生成每一条html元素，并插入到任务列表中*/
  todo_list.forEach(function (item) {
    var el = document.createElement('div');

    el.classList.add('row', 'todo-item');
    el.dataset.id = item.id;

    el.innerHTML = `
      <div class="col checkbox">
        <input class="checker" type="checkbox" ${item.completed ? 'checked' : ''}>
      </div>
      <div class="col detail">
        <div class="title">${item.title}</div>
      </div>
      <div class="col tool-set">
        <button class="update">更新</button>
        <button class="remove">删除</button>
      </div>
    `;

    if (item.completed)
      me.completed_list.appendChild(el);
    else
      me.incomplete_list.appendChild(el);
  });

  if (!this.incomplete_list.innerHTML)
    this.incomplete_list.innerHTML = holder;
  if (!this.completed_list.innerHTML)
    this.completed_list.innerHTML = holder;
}
