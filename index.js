var CatUi  = require('./Ui/CatUi');
var TaskUi = require('./Ui/TaskUi');

var cat_select = document.getElementById('cat-select');

var cat_ui = new CatUi({
  on_item_click  : render_task,
  on_item_delete : remove_task_by_cat,
  on_sync        : function (changed_list) {
    render_cat_option();
  },
});

var task_ui = new TaskUi({
  /*当任务初始化的时候同时执行这个函数*/
  on_init        : render_cat_option,
  on_input_focus : show_cat_select,
  on_input_blur  : function () {},
  on_add_succeed : function (row) {
    hide_cat_select();
    cat_ui.set_active_cat_item(row.cat_id);
  },
});

/**
 * 通过分类渲染任务
 * @param Number cat_id 分类id
 * */
function render_task (cat_id) {
  task_ui.render(cat_id);
}

/**
 * 通过分类删除任务
 * @param Number cat_id 分类id
 * */
function remove_task_by_cat (cat_id) {
  task_ui._api.remove_by_cat(cat_id);
  task_ui.render(1);
}

/**
 * 显示分类选项
 * */
function show_cat_select () {
  cat_select.hidden = false;
}

/**
 * 隐藏分类选项
 * */
function hide_cat_select () {
  cat_select.hidden = true;
}

/**
 * 渲染分类选项，不然添加任务的时候没法选分类
 * */
function render_cat_option () {
  var list = cat_ui._api.read(); // 拿到分类数据

  cat_select.innerHTML = '';

  if (!list)
    return;

  // 循环数据并生成html
  list.forEach(function (row) {
    var el       = document.createElement('option');
    el.value     = row.id;
    el.innerText = row.title;
    cat_select.appendChild(el);
  });
}

cat_ui.init();
task_ui.init();
