# lay_cascader
[![码云Gitee](https://gitee.com/yixiacoco/lay_cascader/badge/star.svg?theme=blue)](https://gitee.com/yixiacoco/lay_cascader)
[![GitHub](https://img.shields.io/github/stars/yixiaco/lay_cascader.svg?style=social&label=Stars)](https://github.com/yixiaco/lay_cascader)
[![License](https://img.shields.io/badge/License-BSD3Clause-blue.svg)](https://gitee.com/yixiacoco/lay_cascader/blob/main/LICENSE)

> layui cascader 仿element-ui级联选择器

**演示页面**：https://yixiaco.github.io/lay_cascader/

**gitee**：https://gitee.com/yixiacoco/lay_cascader

**github**： https://github.com/yixiaco/lay_cascader

## Attributes

| 参数                  | 说明                                                         | 类型                    | 可选值       | 默认值     |
| :-------------------- | :----------------------------------------------------------- | :---------------------- | :----------- | :--------- |
| elem                  | 绑定元素                                                     | String/jqueryObject/DOM | -            | -          |
| value                 | 预设值                                                       | Object/Array            | -            | null       |
| props                 | 配置选项，具体见下表                                         | Object                  | -            | -          |
| options               | 可选项数据源，键名可通过 props 属性配置                      | Array                   | -            | []         |
| empty                 | 无匹配选项时的内容                                           | String                  | -            | '暂无数据' |
| placeholder           | 输入框占位文本                                               | String                  | -            | '请选择'   |
| disabled              | 是否禁用                                                     | Boolean                 | true / false | false      |
| clearable             | 是否支持清空选项                                             | Boolean                 | true / false | false      |
| showAllLevels         | 输入框中是否显示选中值的完整路径                             | Boolean                 | true / false | true       |
| collapseTags          | 多选模式下是否折叠Tag                                        | Boolean                 | true / false | false      |
| minCollapseTagsNumber | 最小折叠标签数                                               | Number                  | -            | 1          |
| separator             | 选项分隔符                                                   | String                  | -            | ' / '      |
| filterable            | 是否可搜索选项                                               | Boolean                 | true / false | false      |
| filterMethod          | 自定义搜索逻辑，第一个参数是节点node，第二个参数是搜索关键词keyword，通过返回布尔值表示是否命中 | Function                | -            | -          |
| debounce              | 搜索关键词输入的去抖延迟，毫秒                               | Number                  | -            | 300        |
| beforeFilter          | 筛选之前的钩子，参数为输入的值，若返回 false,则停止筛选      | Function                | -            | -          |
| popperClass           | 自定义浮层类名                                               | String                  | -            | ''         |
| extendClass           | 继承class样式                                                | Boolean                 | true / false | false      |
| extendStyle           | 继承style样式                                                | Boolean                 | true / false | false      |
| disabledFixed         | 固定禁用项，使禁用项不被清理删除，禁用项只能通过函数添加或初始值添加,默认禁用项不可被函数或初始值添加 | Boolean                 | true / false | false      |
| maxSize               | 多选选中的最大数量，0表示不限制                              | Number                  | >=0          | 0          |

## Props

| 参数          | 说明                                                         | 类型                                                         | 可选值        | 默认值     |
| :------------ | :----------------------------------------------------------- | :----------------------------------------------------------- | :------------ | :--------- |
| strictMode    | 严格模式,设置value严格按照层级结构.获取的value和Node也将按照层级结构返回.<br/> 例如： <br/>多选:<br/>[['zhinan','shejiyuanze','yizhi']] <br/>单选:<br/>['zhinan','shejiyuanze','yizhi'] | Boolean                                                      | true / false  | false      |
| expandTrigger | 次级菜单的展开方式                                           | String                                                       | click / hover | 'click'    |
| multiple      | 是否多选                                                     | Boolean                                                      | true / false  | false      |
| checkStrictly | 是否严格的遵守父子节点不互相关联                             | Boolean                                                      | true / false  | false      |
| lazy          | 是否动态加载子节点，需与 lazyLoad 方法结合使用               | Boolean                                                      | true / false  | false      |
| lazyLoad      | 加载动态数据的方法，仅在 lazy 为 true 时有效                 | Function(node, resolve)，node为当前点击的节点，resolve为数据加载完成的回调(必须调用) | -             | -          |
| value         | 指定选项的值为选项对象的某个属性值                           | String                                                       | -             | 'value'    |
| label         | 指定选项标签为选项对象的某个属性值                           | String                                                       | -             | 'label'    |
| children      | 指定选项的子选项为选项对象的某个属性值                       | String                                                       | -             | 'children' |
| disabled      | 指定选项的禁用为选项对象的某个属性值                         | String                                                       | -             | 'disabled' |
| leaf          | 指定选项的叶子节点的标志位为选项对象的某个属性值             | String                                                       | -             | 'leaf'     |

## Event

| 方法名            | 说明                                                         | 参数                                                         |
| :---------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| setOptions        | 设置当前选项                                                 | Array                                                        |
| setValue          | 覆盖当前值.单选时传对象，多选时传数组                        | 非严格模式下。<br>单选：options中的value值<br/>多选：options中的value值组成的数组<br/> 例如：<br/>layCascader.setValue('yizhi') <br/>layCascader.setValue(['yizhi','table']) |
| changeEvent       | 当节点变更时，执行回调 多选时，参数是一个数组                | 单选：function(value,Node){} 多选：function(values,Nodes){}  |
| openEvent         | 当面板打开时，执行回调                                       | function(){}                                                 |
| closeEvent        | 当面板关闭时，执行回调                                       | function(){}                                                 |
| destroyEvent      | 当面板销毁时，执行回调                                       | function(){}                                                 |
| disabled          | 禁用组件                                                     | Boolean                                                      |
| open              | 展开面板                                                     | -                                                            |
| close             | 收起面板                                                     | -                                                            |
| destroy           | 销毁组件。销毁组件后不允许再次调用对象方法，但可以使用构造方法重新初始化组件。 |                                                              |
| getCheckedNodes   | 获取选中的节点，如需获取路径，使用node.path获取,将获取各级节点的node对象。严格模式下返回包含父级的层级结构 | -                                                            |
| getCheckedValues  | 获取选中的值.严格模式下返回包含父级的层级结构                | -                                                            |
| clearCheckedNodes | 清空选中的节点                                               | Boolean: 是否强制删除固定的禁用项，默认不会清空禁用项        |
| expandNode        | 展开面板到节点所在的层级                                     | value: 节点值，只能传单个值，不允许传数组                    |
| getConfig         | 获取当前配置副本                                             | -                                                            |
| setConfig         | 设置配置参数                                                 | Object，参考Attributes                                       |
| getData           | 获取数据对象副本                                             | -                                                            |
