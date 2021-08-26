# lay_cascader
layui cascader 仿element-ui级联选择器

**演示页面**：https://yixiaco.github.io/lay_cascader/

## Attributes

| 参数                  | 说明                                                         | 类型                    | 可选值     | 默认值     |
| :-------------------- | :----------------------------------------------------------- | :---------------------- | :--------- | :--------- |
| elem                  | 绑定元素                                                     | String/jqueryObject/DOM | -          | -          |
| value                 | 预设值                                                       | Object/Array            | -          | null       |
| options               | 可选项数据源，键名可通过 props 属性配置                      | Array                   | -          | []         |
| empty                 | 无匹配选项时的内容                                           | String                  | -          | '暂无数据' |
| placeholder           | 输入框占位文本                                               | String                  | -          | '请选择'   |
| disabled              | 是否禁用                                                     | Boolean                 | true/false | false      |
| clearable             | 是否支持清空选项                                             | Boolean                 | true/false | false      |
| showAllLevels         | 输入框中是否显示选中值的完整路径                             | Boolean                 | true/false | true       |
| collapseTags          | 多选模式下是否折叠Tag                                        | Boolean                 | true/false | false      |
| minCollapseTagsNumber | 最小折叠标签数                                               | Number                  | -          | 1          |
| separator             | 选项分隔符                                                   | String                  | -          | ' / '      |
| filterable            | 是否可搜索选项                                               | Boolean                 | true/false | false      |
| filterMethod          | 自定义搜索逻辑，第一个参数是节点node，第二个参数是搜索关键词keyword，通过返回布尔值表示是否命中 | Function                | -          | -          |
| debounce              | 搜索关键词输入的去抖延迟，毫秒                               | Number                  | -          | 300        |
| beforeFilter          | 筛选之前的钩子，参数为输入的值，若返回 false,则停止筛选      | Function                | -          | -          |
| extendClass           | 继承class样式                                                | Boolean                 | true/false | false      |
| extendStyle           | 继承style样式                                                | Boolean                 | true/false | false      |

## Props

| 参数          | 说明                                             | 类型    | 可选值        | 默认值     |
| :------------ | :----------------------------------------------- | :------ | :------------ | :--------- |
| expandTrigger | 次级菜单的展开方式                               | String  | click / hover | 'click'    |
| multiple      | 是否多选                                         | Boolean | true / false  | false      |
| checkStrictly | 是否严格的遵守父子节点不互相关联                 | Boolean | true / false  | false      |
| value         | 指定选项的值为选项对象的某个属性值               | String  | -             | 'value'    |
| label         | 指定选项标签为选项对象的某个属性值               | String  | -             | 'label'    |
| children      | 指定选项的子选项为选项对象的某个属性值           | String  | -             | 'children' |
| disabled      | 指定选项的禁用为选项对象的某个属性值             | String  | -             | 'disabled' |
| leaf          | 指定选项的叶子节点的标志位为选项对象的某个属性值 | String  | -             | 'leaf'     |

## Event

| 方法名            | 说明                                                         | 参数                                                        |
| :---------------- | :----------------------------------------------------------- | :---------------------------------------------------------- |
| change            | 当节点变更时，执行回调 <br>多选时，参数是一个数组，且可能会出现多次回调 | 单选：function(value,Node){} <br>多选：function(values,Nodes){} |
| disabled          | 禁用组件                                                     | boolean                                                     |
| blur              | 收起面板                                                     | -                                                           |
| focus             | 展开面板                                                     | -                                                           |
| getCheckedNodes   | 获取选中的节点，如需获取路径，使用node.path获取,将获取各级节点的node对象 | -                                                           |
| getCheckedValues  | 获取选中的值                                                 | -                                                           |
| clearCheckedNodes | 清空选中的节点                                               | -                                                           |
