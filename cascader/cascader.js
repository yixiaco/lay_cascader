/**
 * 仿element-ui，级联选择器
 * 已实现单选，多选，无关联选择
 * 其他功能：组件禁用、节点禁用、自定义属性、自定义空面板，自定义无选择时的提示、多选标签折叠、回显等操作。
 * author: yixiaco
 */
layui.define(["jquery"], function (exports) {
  var $ = layui.jquery;

  /**
   * 级联各项节点对象
   * @param data        原始对象信息
   * @param cascader    级联对象
   * @param level       层级
   * @param parentNode 父节点对象
   * @constructor
   */
  function Node(data, cascader, level, parentNode) {
    this.data = data;
    this.cascader = cascader;
    this.config = cascader.config;
    this.props = cascader.props;
    this.level = level;
    this.parentNode = parentNode;
    this.icons = cascader.icons;
    this._checked = 0;
  }

  Node.prototype = {
    constructor: Node,
    /** 该节点是否被选中 0:未选中，1：选中，2：不定*/
    get checked() {
      return this._checked;
    },
    /**
     * 复选框的值，此处不会自动同步父节点的状态，需要自行处理
     * @param checked 0:未选中，1：选中，2：不定
     */
    set checked(checked) {
      if (this._checked === checked) {
        return;
      }
      this._checked = checked;
      var value = this.value;
      var cascader = this.cascader;
      var checkStrictly = this.props.checkStrictly;
      var leaf = this.leaf;
      var index = cascader.data.checkedValue.indexOf(value);
      var length = cascader.data.checkedValue.length;
      var $checkbox;
      if (checked) {
        if (checkStrictly || leaf) {
          if (length === 0) {
            cascader._setClear();
          }
          cascader.data.checkedValue.push(value);
          cascader.data.checkedNodePaths.push(this);
        }
        if (this.$checked) {
          $checkbox = this.$checked.find('.el-checkbox__input');
          if (checked === 1) {
            $checkbox.removeClass('is-indeterminate');
            $checkbox.addClass('is-checked');
          } else if (checked === 2) {
            $checkbox.removeClass('is-checked');
            $checkbox.addClass('is-indeterminate');
          }
        }
      } else {
        if (checkStrictly || leaf) {
          cascader.data.checkedValue.splice(index, 1);
          cascader.data.checkedNodePaths.splice(index, 1);
        }
        if (this.$checked) {
          $checkbox = this.$checked.find('.el-checkbox__input');
          $checkbox.removeClass('is-checked');
          $checkbox.removeClass('is-indeterminate');
        }
      }
      // 填充路径
      cascader._fillingPath(cascader.data.checkedNodePaths);
      if (length !== cascader.data.checkedValue.length) {
        cascader.change(cascader.data.checkedValue, cascader.data.checkedNodePaths);
      }
    },
    /** 子节点 */
    childrenNode: undefined,
    /** 当前节点的显示文本 */
    get label() {
      return this.data[this.props.label];
    },
    /** 当前节点的值 */
    get value() {
      return this.data[this.props.value];
    },
    /** 是否禁用 */
    get disabled() {
      return this.data[this.props.disabled];
    },
    /** 子节点数据 */
    get children() {
      return this.data[this.props.children];
    },
    /** 叶子节点 */
    get leaf() {
      var leaf = this.data[this.props.leaf];
      if (typeof leaf === 'boolean') {
        return leaf;
      }
      // 如果children不为空,则判断是否是子节点
      if (this.children) {
        return this.children.length <= 0;
      }
      return true;
    },
    /** 当前单选值 */
    get currentValue() {
      return this.cascader.data.value;
    },
    /** 当前复选框值 */
    get currentCheckedValue() {
      return this.cascader.data.checkedValue;
    },
    /** 路径 */
    get path() {
      var parentNode = this.parentNode;
      if (parentNode) {
        return [].concat(parentNode.path, [this]);
      } else {
        return [this];
      }
    },
    /** 输入框的tag标签 */
    get $tag() {
      var cascader = this.cascader;
      var checkStrictly = this.props.checkStrictly;
      var showAllLevels = this.config.showAllLevels;
      var path = this.path;
      var separator = this.config.separator;

      var label;
      if (showAllLevels) {
        label = path.map(function (node) {
          return node.label;
        }).join(separator);
      } else {
        label = path[path.length - 1].label;
      }
      var $tag = cascader.get$tag(label, true);
      var self = this;
      $tag.find('i').click(function (event) {
        event.stopPropagation();
        self.checked = 0;
        if (!checkStrictly) {
          // 向上传递
          self._syncTransferParent();
        }
        cascader.removeTag(self.value, self);
      });
      return $tag;
    },
    /**
     * 初始化
     */
    init: function () {
      var multiple = this.props.multiple;
      var checkStrictly = this.props.checkStrictly;
      var fromIcon = this.icons.from;
      var rightIcon = this.icons.right;
      var icon = '';
      if (!this.leaf) {
        icon = rightIcon;
      }
      this.$li = $('<li role="menuitem" id="cascader-menu" tabindex="-1" class="el-cascader-node" aria-haspopup="true" aria-owns="cascader-menu"><span class="el-cascader-node__label">' + this.label + '</span><i class="' + fromIcon + ' ' + icon + '"></i></li>');
      // 节点渲染
      if (!multiple && !checkStrictly) {
        this._renderRadio();
      } else if (!multiple && checkStrictly) {
        this._renderRadioCheckStrictly();
      } else if (multiple && !checkStrictly) {
        this._renderMultiple();
      } else if (multiple && checkStrictly) {
        this._renderMultipleCheckStrictly();
      }
    },
    /**
     * 绑定到菜单中
     * @param $list li节点
     */
    bind: function ($list) {
      this.init();
      $list.append(this.$li);
    },
    /**
     * 单选&&关联
     * @private
     */
    _renderRadio: function () {
      var $li = this.$li;
      var value = this.value;
      var currentValue = this.currentValue;
      var fromIcon = this.icons.from;
      var okIcon = this.icons.ok;
      var level = this.level;
      var childrenNode = this.childrenNode;
      var leaf = this.leaf;
      var self = this;
      var cascader = this.cascader;
      if (value === currentValue) {
        $li.addClass('is-active');
        $li.prepend('<i class="' + fromIcon + ' ' + okIcon + ' el-cascader-node__prefix"></i>');
      }

      // 是否禁用
      if (this.disabled) {
        $li.addClass('is-disabled');
        return;
      }

      // 触发下一个节点
      this._liClick(function (event) {
        event.stopPropagation();
        $li.siblings().removeClass('is-active');
        $li.siblings().find('.' + okIcon).remove();
        $li.addClass('is-active');
        if (leaf) {
          self.currentValue = value;
          $li.prepend('<i class="' + fromIcon + ' ' + okIcon + ' el-cascader-node__prefix"></i>');
          // 关闭面板
          cascader.blur(event);
        }
        // 添加下级菜单
        cascader._appendMenu(childrenNode, level + 1, self);
      });
    },
    /**
     * 单选&&非关联
     * @private
     */
    _renderRadioCheckStrictly: function () {
      var $li = this.$li;
      var value = this.value;
      var level = this.level;
      var childrenNode = this.childrenNode;
      var leaf = this.leaf;
      var self = this;
      var cascader = this.cascader;
      var activeNode = cascader.data.activeNode;

      $li.addClass('is-selectable');
      // 任意一级单选
      var $radio = $('<label role="radio" tabindex="0" class="el-radio"><span class="el-radio__input"><span class="el-radio__inner"></span><input type="radio" aria-hidden="true" tabindex="-1" class="el-radio__original" value="' + value + '"></span><span class="el-radio__label"><span></span></span></label>');
      this.$radio = $radio;
      $li.prepend($radio);

      // 触发下一个节点
      this._liClick(function (event) {
        event.stopPropagation();
        if (!leaf) {
          $li.siblings().removeClass('in-active-path');
          $li.addClass('in-active-path');
        }
        // 添加下级菜单
        cascader._appendMenu(childrenNode, level + 1, self);
      });

      if (this.disabled) {
        $radio.addClass('is-disabled');
        $radio.find('.el-radio__input').addClass('is-disabled');
        return;
      }
      // 选中事件
      $radio.click(function (event) {
        event.preventDefault();
        self.transferParent(function (node) {
          var $li = node.$li;
          $li.siblings().find('.el-radio__input').removeClass('is-checked');
          $li.find('.el-radio__input').removeClass('is-checked');
          $li.siblings().removeClass('in-active-path');
          $li.siblings().removeClass('is-active');
          $li.siblings().removeClass('in-checked-path');
          $li.addClass('in-active-path');
          $li.addClass('is-active');
          $li.addClass('in-checked-path');
        }, true);
        $radio.find('.el-radio__input').addClass('is-checked');
        self.currentValue = value;
        // 重新加载一下下级菜单
        cascader._appendMenu(childrenNode, level + 1, self);
      });
      if (self.currentValue && activeNode.path.some(function (node) {
        return node.value === value;
      })) {
        if (self.currentValue === value) {
          $radio.find('.el-radio__input').addClass('is-checked');
        }
        $li.addClass('is-active');
        $li.addClass('in-checked-path');
      }
    },
    /**
     * 向上传递
     * @param callback 执行方法，如果返回false，则中断执行
     * @param advance 是否先执行一次
     * @param self  自身
     */
    transferParent: function (callback, advance, self) {
      if (!self) {
        self = this;
      }
      if (this !== self || advance) {
        var goOn = callback && callback(this);
        if (goOn === false) {
          return;
        }
      }
      this.parentNode && this.parentNode.transferParent(callback, advance, self);
    },
    /**
     * 向下传递
     * @param callback 执行的方法，如果返回false，则中断执行
     * @param advance 是否先执行一次
     * @param self  自身
     */
    transferChildren: function (callback, advance, self) {
      if (!self) {
        self = this;
      }
      if (this !== self || advance) {
        var goOn = callback && callback(this);
        if (goOn === false) {
          return;
        }
      }
      var children = this.getChildren();
      if (children && children.length > 0) {
        for (var index in children) {
          children[index].transferChildren(callback, advance, self);
        }
      }
    },
    /**
     * 设置级联值
     * @param value
     */
    set currentValue(value) {
      var cascader = this.cascader;
      if (cascader.data.value !== value) {
        cascader.data.value = value;
        cascader.data.activeNode = this;
        // 填充路径
        cascader._fillingPath(cascader.data.activeNode.path);
        cascader.change(cascader.data.value, cascader.data.activeNode);
        cascader._setClear();
      }
    },
    /**
     * 多选&&关联
     * @private
     */
    _renderMultiple: function () {
      var $li = this.$li;
      var level = this.level;
      var childrenNode = this.childrenNode;
      var leaf = this.leaf;
      var self = this;
      var cascader = this.cascader;
      var checked = this.checked;


      $li.addClass('el-cascader-node');

      // 多选框
      var $checked = $('<label class="el-checkbox"><span class="el-checkbox__input"><span class="el-checkbox__inner"></span><input type="checkbox" aria-hidden="false" class="el-checkbox__original" value=""></span></label>');
      this.$checked = $checked;
      $li.prepend($checked);

      // 渲染
      if (checked === 1) {
        this.$checked.find('.el-checkbox__input').addClass('is-checked');
      } else if (checked === 2) {
        this.$checked.find('.el-checkbox__input').addClass('is-indeterminate');
      }

      if (this.disabled) {
        $li.addClass('is-disabled');
        $checked.addClass('is-disabled');
        $checked.find('.el-checkbox__input').addClass('is-disabled');
        return;
      }

      // 触发下一个节点
      this._liClick(function (event) {
        event.stopPropagation();
        if (!leaf) {
          $li.siblings().removeClass('in-active-path');
          $li.addClass('in-active-path');
        }
        // 添加下级菜单
        cascader._appendMenu(childrenNode, level + 1, self);
      });

      // 选中事件
      $checked.click(function (event) {
        event.preventDefault();

        if (leaf) {
          self.checked = self.checked === 0 ? 1 : 0;
        } else {
          self.checked = self.checkedValue(self, self.checked === 0);
          // 向下传递
          self.transferChildren(function (node) {
            if (node.disabled) {
              return false;
            }
            node.checked = self.checkedValue(node, self.checked !== 0);
          });
        }
        // 向上传递
        self._syncTransferParent();
      });
    },
    /**
     * 检查子节点，给父节点赋值选中样式
     * @param node
     * @param checked
     * @returns {number|number}
     */
    checkedValue: function (node, checked) {
      if (node.leaf) {
        return checked ? 1 : 0;
      } else {
        var isDisabled = false;
        var isChecked = checked;
        // 向下传递
        node.transferChildren(function (child) {
          if (child.disabled) {
            isDisabled = true;
            return false;
          }
          if (child.checked === 0) {
            isChecked = true;
          }
        });
        if (isDisabled && isChecked) {
          // 有禁用，有未选->不定
          return 2;
        } else if (isChecked) {
          // 节点不定或者未选中->选中
          return 1;
        } else {
          return 0;
        }
      }
    },
    /**
     * 多选&&非关联
     * @private
     */
    _renderMultipleCheckStrictly: function () {
      var $li = this.$li;
      var level = this.level;
      var childrenNode = this.childrenNode;
      var leaf = this.leaf;
      var self = this;
      var cascader = this.cascader;
      var checked = this.checked;

      $li.addClass('el-cascader-node is-selectable');

      // 多选框
      var $checked = $('<label class="el-checkbox"><span class="el-checkbox__input"><span class="el-checkbox__inner"></span><input type="checkbox" aria-hidden="false" class="el-checkbox__original" value=""></span></label>');
      this.$checked = $checked;
      $li.prepend($checked);

      // 渲染
      if (checked === 1) {
        $li.addClass('in-checked-path');
        this.$checked.find('.el-checkbox__input').addClass('is-checked');
      }

      // 触发下一个节点
      this._liClick(function (event) {
        event.stopPropagation();
        if (!leaf) {
          $li.siblings().removeClass('in-active-path');
          $li.addClass('in-active-path');
        }
        // 添加下级菜单
        cascader._appendMenu(childrenNode, level + 1, self);
      });

      if (this.disabled) {
        $checked.addClass('is-disabled');
        $checked.find('.el-checkbox__input').addClass('is-disabled');
        return;
      }
      // 选中事件
      $checked.click(function (event) {
        event.preventDefault();
        self.checked = self.checked === 0 ? 1 : 0;
        if (self.checked === 1) {
          $li.addClass('in-checked-path');
        } else {
          $li.removeClass('in-checked-path');
        }
      });
    },
    /**
     * 关联的复选框父节点同步状态
     * @private
     */
    _syncTransferParent: function () {
      var self = this;
      // 向上传递
      self.transferParent(function (node) {
        var checked;
        var map = node.childrenNode.map(function (child) {
          return child.checked;
        });
        if (map.indexOf(2) !== -1 || (map.indexOf(0) !== -1 && map.indexOf(1) !== -1)) {
          // 有不定就是不定，有选中和未选中也是不定
          checked = 2;
        } else if (map.indexOf(1) !== -1) {
          // 有选中，并且没有了未选中和不定
          checked = 1;
        } else {
          // 只剩下未选中
          checked = 0;
        }
        node.checked = checked;
      });
    },
    /**
     * 点击li事件
     * @param fun
     * @private
     */
    _liClick: function (fun) {
      var leaf = this.leaf;
      var $li = this.$li;
      if (this.props.expandTrigger === "click" || leaf) {
        $li.click(fun);
      } else if (this.props.expandTrigger === "hover") {
        $li.mouseenter(fun);
      }
    },
    setChildren: function (children) {
      this.childrenNode = children;
    },
    getChildren: function () {
      return this.childrenNode;
    }
  };

  function Cascader(config) {
    this.config = $.extend(true, {
      elem: '',             //绑定元素
      value: null,          //预设值
      options: [],          //可选项数据源，键名可通过 Props 属性配置
      empty: '暂无数据',	  //无匹配选项时的内容
      placeholder: '请选择',//输入框占位文本
      disabled: false,      //是否禁用
      clearable: false,     //是否支持清空选项
      showAllLevels: true,  //输入框中是否显示选中值的完整路径
      collapseTags: false,  //多选模式下是否折叠Tag
      minCollapseTagsNumber: 1, //最小折叠标签数
      separator: ' / ',     //选项分隔符
      filterable: false,    //是否可搜索选项
      filterMethod: function (node, keyword) {
      }, //自定义搜索逻辑，第一个参数是节点node，第二个参数是搜索关键词keyword，通过返回布尔值表示是否命中
      debounce: 300,        //搜索关键词输入的去抖延迟，毫秒
      beforeFilter: function (value) {
      },//筛选之前的钩子，参数为输入的值，若返回 false,则停止筛选
      // popperClass: '',      //	自定义浮层类名	string
      extendClass: false,     //继承class样式
      extendStyle: false,     //继承style样式
      props: {
        expandTrigger: 'click', //次级菜单的展开方式	string	click / hover	'click'
        multiple: false,	      //是否多选	boolean	-	false
        checkStrictly: false, 	//是否严格的遵守父子节点不互相关联	boolean	-	false
        // lazy: false,	        //是否动态加载子节点，需与 lazyLoad 方法结合使用	boolean	-	false
        // lazyLoad: function (node, resolve) {
        // },	//加载动态数据的方法，仅在 lazy 为 true 时有效	function(node, resolve)，node为当前点击的节点，resolve为数据加载完成的回调(必须调用)
        value: 'value',	        //指定选项的值为选项对象的某个属性值	string	—	'value'
        label: 'label',	        //指定选项标签为选项对象的某个属性值	string	—	'label'
        children: 'children',	  //指定选项的子选项为选项对象的某个属性值	string	—	'children'
        disabled: 'disabled',   //指定选项的禁用为选项对象的某个属性值	string	—	'disabled'
        leaf: 'leaf'	          //指定选项的叶子节点的标志位为选项对象的某个属性值	string	—	'leaf'
      }
    }, config);
    this.data = {
      value: null,
      checkedValue: [],
      checkedNodePaths: [],
      nodes: [],
      activeNode: null
    };
    this.showPanel = false;
    this._init();
  }

  Cascader.prototype = {
    constructor: Cascader,
    get props(){
      return this.config.props;
    },
    icons: {
      from: 'layui-icon',
      down: 'layui-icon-down',
      close: 'layui-icon-close',
      right: 'layui-icon-right',
      ok: 'layui-icon-ok'
    },
    // 初始化
    _init: function () {
      if (!this.config.elem) {
        throw "缺少elem节点选择器";
      }
      // 初始化输入框
      this._initInput();
      // 初始化节点
      this.data.nodes = this.initNodes(this.config.options, 0, null);
      if (this.config.value) {
        this.setValue(this.config.value);
      }
      // 初始化面板
      this._initPanel();
      var self = this;
      // 监听滚动条
      $(window).scroll(function () {
        self._resetXY();
      });
      // 监听窗口
      $(window).resize(function () {
        self._resetXY();
      });
      // 点击事件，展开面板
      this.$div.click(function (event) {
        if (self.config.disabled) {
          return;
        }
        // 阻止事件冒泡
        event.stopPropagation();
        var show = self.showPanel;
        if (!show) {
          self.focus(event);
        } else {
          self.blur(event);
        }
      });
    },
    // 面板定位
    _resetXY: function () {
      var $div = this.$div;
      var offset = $div.offset();
      var $panel = this.$panel;
      if ($panel) {
        var windowHeight = $(window).height();
        var panelHeight = $panel.height();
        var divHeight = $div.height();
        var boundingClientRect = $div[0].getBoundingClientRect();

        var bottomHeight = windowHeight - (boundingClientRect.top + divHeight);
        if (bottomHeight < panelHeight && boundingClientRect.top > panelHeight + 20) {
          $panel.attr('x-placement', 'top-start')
          // 向上
          $panel.css({
            top: offset.top - 20 - panelHeight + 'px',
            left: offset.left + 'px'
          });
        } else {
          $panel.attr('x-placement', 'bottom-start')
          // 向下
          $panel.css({
            top: offset.top + divHeight + 'px',
            left: offset.left + 'px'
          });
        }
      }
    },
    get $menus() {
      return this.$panel && this.$panel.find('.el-cascader-panel .el-cascader-menu');
    },
    // 初始化输入框
    _initInput: function () {
      var $e = $(this.config.elem);
      var self = this;
      // 当绑定的元素带有value属性，并且对象未设置值时，设置一个初始值
      if (this.config.value === null && $e.attr('value')) {
        this.config.value = $e.attr('value');
      }
      var placeholder = this.config.placeholder;
      var fromIcon = this.icons.from;
      var downIcon = this.icons.down;
      var multiple = this.props.multiple;
      var extendClass = this.config.extendClass;
      var extendStyle = this.config.extendStyle;

      this.$div = $('<div class="el-cascader"></div>');
      if (extendStyle) {
        var style = $e.attr('style');
        if (style) {
          this.$div.attr('style', style);
        }
      }
      if (extendClass) {
        var className = $e.attr('class');
        if (className) {
          className.split(' ').forEach(function (name) {
            self.$div.addClass(name);
          });
        }
      }
      this.$input = $('<div class="el-input el-input--suffix">' +
        '<input type="text" readonly="readonly" autocomplete="off" placeholder="' + placeholder + '" class="el-input__inner">' +
        '<span class="el-input__suffix">' +
        '<span class="el-input__suffix-inner">' +
        '<i class="el-icon-arrow-down ' + fromIcon + ' ' + downIcon + '" style="font-size: 12px"></i>' +
        '</span></span>' +
        '</div>')
      this.$div.append(this.$input);
      if (multiple) {
        this.$tags = $('<div class="el-cascader__tags"><!----></div>');
        this.$div.append(this.$tags);
      }
      $e.replaceWith(this.$div);
      this.$icon = this.$div.find('i');
      this.disabled(this.config.disabled);
    },
    // 初始化面板(panel(1))
    _initPanel: function () {
      this.$panel = $('<div class="el-popper el-cascader__dropdown" style="position: absolute; z-index: 2056;display: none;" x-placement="bottom-start"><div class="el-cascader-panel"></div><div class="popper__arrow" style="left: 35px;"></div></div>');
      this.$panel.appendTo('body');
      this._appendMenu(this.data.nodes, 0);
      this.$panel.click(function (event) {
        // 阻止事件冒泡
        event.stopPropagation();
      });
    },
    /**
     * 添加菜单(panel(1)->menu(n))
     * @param nodes 当前层级数据
     * @param level
     * @param parentNode
     * @private
     */
    _appendMenu: function (nodes, level, parentNode) {
      var $div = $('<div class="el-scrollbar el-cascader-menu" role="menu" id="cascader-menu"><div class="el-cascader-menu__wrap el-scrollbar__wrap" style="margin-bottom: -17px; margin-right: -17px;"><ul class="el-scrollbar__view el-cascader-menu__list"></ul></div></div>');
      // 除了上一层的所有菜单全部移除
      this.$panel.find('.el-cascader-panel .el-cascader-menu:gt(' + (level - 1) + ')').remove();
      if (parentNode && parentNode.leaf) {
        return;
      }
      // 重新添加菜单
      this.$panel.find('.el-cascader-panel').append($div);
      // 渲染细项
      this._appendLi($div, nodes);
      // 渲染滚动条
      this._initScrollbar($div);
    },
    /**
     *  添加细项(panel(1)->menu(n)->li(n))
     * @param $menu 当前菜单对象
     * @param nodes  当前层级数据
     * @private
     */
    _appendLi: function ($menu, nodes) {
      var $list = $menu.find('.el-cascader-menu__list');
      if (!nodes || nodes.length === 0) {
        var isEmpty = this.config.empty;
        $list.append('<div class="el-cascader-menu__empty-text">' + isEmpty + '</div>');
        return;
      }
      $.each(nodes, function (index, node) {
        node.bind($list);
      });
    },
    /**
     * 初始化节点数据
     * @param data 原始数据
     * @param level 层级
     * @param parentNode  父级节点
     * @returns {*[]}
     */
    initNodes: function (data, level, parentNode) {
      var nodes = [];
      for (var key in data) {
        var datum = data[key];
        var node = new Node(datum, this, level, parentNode);
        nodes.push(node);
        if (datum.children && datum.children.length > 0) {
          node.setChildren(this.initNodes(datum.children, level + 1, node))
        }
      }
      return nodes;
    },
    /**
     * 设置值
     * @param value
     */
    setValue: function (value) {
      if (!value) {
        return;
      }
      // 清空值
      this.clearCheckedNodes();
      var nodes = this.getNodes(this.data.nodes);
      var checkStrictly = this.props.checkStrictly;
      var multiple = this.props.multiple;
      if (multiple) {
        nodes.forEach(function (node) {
          var leaf = node.leaf;
          if (value.indexOf(node.value) !== -1) {
            if (checkStrictly || leaf) {
              node.checked = 1;
              if (!checkStrictly) {
                node._syncTransferParent();
              }
            }
          }
        });
      } else {
        var filter = nodes.filter(function (node) {
          var leaf = node.leaf;
          if (checkStrictly || leaf) {
            if (node.value == value) {
              return true;
            }
          }
          return false;
        });
        if (filter.length > 0) {
          var node = filter[0];
          this.data.value = node.value;
          this.data.activeNode = node;
          this._fillingPath(node.path);
          this.change(this.data.value, this.data.activeNode);
          this._setClear();
        }
      }
    },
    /**
     * 递归获取扁平的节点
     * @param nodes
     * @param container
     * @returns {*[]}
     */
    getNodes: function (nodes, container) {
      if (!container) {
        container = [];
      }
      if (!nodes) {
        nodes = this.data.nodes;
      }
      var self = this;
      nodes.forEach(function (node) {
        container.push(node);
        var children = node.getChildren();
        if (children) {
          self.getNodes(children, container);
        }
      });
      return container;
    },
    // 初始化滚动条
    _initScrollbar: function ($menu) {
      var $div = $('<div class="el-scrollbar__bar is-onhoriztal"><div class="el-scrollbar__thumb" style="transform: translateX(0%);"></div></div><div class="el-scrollbar__bar is-vertical"><div class="el-scrollbar__thumb" style="transform: translateY(0%);"></div></div>');
      $menu.append($div);
      var vertical = $($div[1]).find('.el-scrollbar__thumb');
      var onhoriztal = $($div[0]).find('.el-scrollbar__thumb');
      var scrollbar = $menu.find('.el-scrollbar__wrap');
      var $panel = this.$panel;
      var $lis = $menu.find('li');
      var hScale = ($panel.height() - 6) / ($lis.height() * $lis.length);
      var wScale = $panel.width() / $lis.width();

      // 滚动条监听事件
      function _scrollbarEvent($scroll) {
        if (hScale < 1) {
          vertical.css('height', hScale * 100 + '%');
          vertical.css('transform', 'translateY(' + $scroll.scrollTop() / $menu.height() * 100 + '%)');
        }
        if (wScale < 1) {
          onhoriztal.css('width', wScale * 100 + '%');
          onhoriztal.css('transform', 'translateY(' + $scroll.scrollLeft() / $menu.width() * 100 + '%)');
        }
      }

      // 拖动事件
      vertical.mousedown(function (event) {
        event.stopImmediatePropagation();
        event.stopPropagation();
        // 禁止文本选择事件
        var selectstart = function () {
          return false;
        };
        $(document).bind("selectstart", selectstart);
        var y = event.clientY;
        var scrollTop = scrollbar.scrollTop();
        // 移动事件
        var mousemove = function (event) {
          event.stopImmediatePropagation();
          var number = scrollTop + (event.clientY - y) / hScale;
          scrollbar.scrollTop(number);
        };
        $(document).bind('mousemove', mousemove);
        // 鼠标松开事件
        $(document).one('mouseup', function (event) {
          event.stopPropagation();
          event.stopImmediatePropagation();
          $(document).off('mousemove', mousemove);
          $(document).off('selectstart', selectstart);
        });
      });
      // 监听滚动条事件
      scrollbar.scroll(function () {
        _scrollbarEvent($(this));
      });

      // 初始化滚动条
      _scrollbarEvent(scrollbar);
    },
    // 填充路径
    _fillingPath: function (path) {
      var multiple = this.props.multiple;
      var showAllLevels = this.config.showAllLevels;
      var separator = this.config.separator;
      var collapseTags = this.config.collapseTags;
      var $inputRow = this.$input.find('input');
      var self = this;
      if (!multiple) {
        if (showAllLevels) {
          $inputRow.val(path.map(function (node) {
            return node.label;
          }).join(separator));
        } else {
          $inputRow.val(path[path.length - 1].label);
        }
      } else {
        // 复选框
        this.$tags.empty();
        // 清除高度
        $inputRow.css('height', '');
        var checkedNodePaths = this.data.checkedNodePaths;
        var minCollapseTagsNumber = Math.max(this.config.minCollapseTagsNumber, 1);
        if (checkedNodePaths.length > 0) {
          var paths = checkedNodePaths;
          if (collapseTags) {
            // 折叠tags
            paths = checkedNodePaths.slice(0, Math.min(checkedNodePaths.length, minCollapseTagsNumber));
          }
          paths.forEach(function (node) {
            self.$tags.append(node.$tag);
          });
          if (collapseTags) {
            if (checkedNodePaths.length > minCollapseTagsNumber) {
              self.$tags.append(self.get$tag('+ ' + (checkedNodePaths.length - minCollapseTagsNumber), false));
            }
          }
        }
        var tagHeight = self.$tags.height();
        var inputHeight = $inputRow.height();
        if (tagHeight > inputHeight) {
          $inputRow.css('height', tagHeight + 4 + 'px');
        }
        // 重新定位
        this._resetXY();
        if (checkedNodePaths.length > 0) {
          $inputRow.removeAttr('placeholder');
        } else {
          $inputRow.attr('placeholder', this.config.placeholder);
        }
      }
    },
    /**
     * 获取复选框标签对象
     * @param label
     * @param showCloseIcon 是否显示关闭的icon
     * @returns {jQuery|HTMLElement|*}
     */
    get$tag: function (label, showCloseIcon) {
      var fromIcon = this.icons.from;
      var closeIcon = this.icons.close;
      var icon = showCloseIcon ? '<i class="el-tag__close el-icon-close ' + fromIcon + ' ' + closeIcon + '"></i>' : '';
      return $('<span class="el-tag el-tag--info el-tag--small el-tag--light"><span>' + label + '</span>' + icon + '</span>');
    },
    // 设置可清理
    _setClear: function () {
      if (this.config.clearable) {
        var self = this;

        function enter() {
          self.$icon.removeClass(self.icons.down);
          self.$icon.addClass(self.icons.close);
        }

        function out() {
          self.$icon.removeClass(self.icons.close);
          self.$icon.addClass(self.icons.down);
        }

        self.$div.mouseenter(function () {
          enter();
        });
        self.$div.mouseleave(function () {
          out();
        });
        self.$icon.one('click', function (event) {
          event.stopPropagation();
          self.blur(event);
          self.clearCheckedNodes();
          out();
          self.$icon.off('mouseenter');
          self.$div.off('mouseenter');
          self.$div.off('mouseleave');
        });
      }
    },
    // 禁用
    disabled: function (isDisabled) {
      this.config.disabled = !!isDisabled;
      this.$input.attr('disabled', this.config.disabled ? 'disabled' : '');
      if (this.config.disabled) {
        this.$div.addClass('is-disabled');
        this.$div.find('.el-input--suffix').addClass('is-disabled');
      } else {
        this.$div.removeClass('is-disabled');
        this.$div.find('.el-input--suffix').removeClass('is-disabled');
      }
    },
    /**
     * 当选中节点变化时触发  选中节点的值
     * @param value 值
     * @param node  节点
     */
    change: function (value, node) {
    },
    /**
     * 当失去焦点时触发  (event: Event)
     * @param event
     */
    blur: function (event) {
      this.showPanel = false;
      this.$div.find('.layui-icon-down').removeClass('is-reverse');
      this.$panel.slideUp(100);
      this.visibleChange(false);
      // 聚焦颜色
      this.$input.removeClass('is-focus');
    },
    /**
     * 当获得焦点时触发  (event: Event)
     * @param event
     */
    focus: function (event) {
      this.showPanel = true;
      var self = this;
      // 点击背景关闭面板
      $(document).one('click', function () {
        self.blur(event);
      });
      // 重新定位面板
      this._resetXY();
      // 箭头icon翻转
      this.$div.find('.layui-icon-down').addClass('is-reverse');
      this.$panel.slideDown(200);
      this.visibleChange(true);
      // 聚焦颜色
      this.$input.addClass('is-focus');
    },
    /**
     * 下拉框出现/隐藏时触发
     * @param visible 出现则为 true，隐藏则为 false
     */
    visibleChange: function (visible) {
    },
    /**
     * 在多选模式下，移除Tag时触发  移除的Tag对应的节点的值
     * @param tagValue 节点的值
     * @param node 节点对象
     */
    removeTag: function (tagValue, node) {
    },
    /**
     * 获取选中的节点值
     * @returns {null|[]}
     */
    getCheckedValues: function () {
      if (this.props.multiple) {
        return this.data.checkedValue;
      } else {
        return this.data.value;
      }
    },
    /**
     * 获取选中的节点
     * @returns {null|[]}
     */
    getCheckedNodes: function () {
      if (this.props.multiple) {
        return this.data.checkedNodePaths;
      } else {
        return this.data.activeNode;
      }
    },
    /**
     * 清空选中的节点
     */
    clearCheckedNodes: function () {
      this.data.value = null;
      this.data.activeNode = null;
      this.data.checkedValue = [];
      this.data.checkedNodePaths = [];
      var multiple = this.props.multiple;
      var $menus = this.$menus;
      if ($menus) {
        this._fillingPath([]);
        if (multiple) {
          this.change(this.data.checkedValue, []);
        } else {
          this.change(this.data.value, []);
        }
        var $lis = $($menus[$menus.length - 1]).find('li');
        $lis.find('.' + this.icons.ok).remove();

        // 移除选中样式
        this.$panel.find('.is-active').removeClass('is-active');
        // 单选样式
        this.$panel.find('.is-checked').removeClass('is-checked');
        // 移除所有选中颜色
        this.$panel.find('.in-checked-path').removeClass('in-checked-path');
        // 移除最后一级粗体
        $lis.removeClass('in-active-path');
        // 移除复选框样式
        var nodes = this.getNodes();
        nodes.forEach(function (node) {
          node.checked = 0;
        });
      }
    }
  };

  var thisCas = function () {
    var self = this;
    return {
      /**
       * 当节点变更时，执行回调
       * @param callback  function(value,node){}
       */
      change: function (callback) {
        self.change = callback;
      },
      /**
       * 禁用组件
       * @param disabled true/false
       */
      disabled: function (disabled) {
        self.disabled.call(self, disabled);
      },
      /**
       * 收起面板
       */
      blur: function () {
        self.blur.call(self);
      },
      /**
       * 展开面板
       */
      focus: function () {
        self.focus.call(self);
      },
      /**
       * 获取选中的节点，如需获取路径，使用node.path获取,将获取各级节点的node对象
       * @returns {[]|*}
       */
      getCheckedNodes: function () {
        return self.getCheckedNodes.call(self);
      },
      /**
       * 获取选中的值
       * @returns {[]|*}
       */
      getCheckedValues: function () {
        return self.getCheckedValues.call(self);
      },
      /**
       * 清空选中的节点
       */
      clearCheckedNodes: function () {
        self.clearCheckedNodes.call(self);
      }
    };
  };

  exports('layCascader', function (option) {
    var ins = new Cascader(option);
    return thisCas.call(ins);
  });
});
