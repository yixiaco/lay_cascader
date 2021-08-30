# lay_cascader
layui cascader 仿element-ui级联选择器

**演示页面**：https://yixiaco.github.io/lay_cascader/

## props

| 参数          | 说明                                             | 类型    | 可选值        | 默认值     |
| :------------ | :----------------------------------------------- | :------ | :------------ | :--------- |
| extendClass   | 继承class样式                                    | boolean | -             | false      |
| extendStyle   | 继承style样式                                    | boolean | -             | false      |
| expandTrigger | 次级菜单的展开方式                               | string  | click / hover | 'click'    |
| multiple      | 是否多选                                         | boolean | -             | false      |
| checkStrictly | 是否严格的遵守父子节点不互相关联                 | boolean | -             | false      |
| value         | 指定选项的值为选项对象的某个属性值               | string  | -             | 'value'    |
| label         | 指定选项标签为选项对象的某个属性值               | string  | -             | 'label'    |
| children      | 指定选项的子选项为选项对象的某个属性值           | string  | -             | 'children' |
| disabled      | 指定选项的禁用为选项对象的某个属性值             | string  | -             | 'disabled' |
| leaf          | 指定选项的叶子节点的标志位为选项对象的某个属性值 | string  | -             | 'leaf'     |

## options

| 参数                  | 说明                                    | 类型         | 可选值 | 默认值     |
| :-------------------- | :-------------------------------------- | :----------- | :----- | :--------- |
| elem                  | 绑定元素                                | string/dom   | -      | -          |
| value                 | 预设值                                  | Object/Array | -      | null       |
| data                  | 可选项数据源，键名可通过 props 属性配置 | Array        | -      | []         |
| empty                 | 无匹配选项时的内容                      | string       | -      | '暂无数据' |
| placeholder           | 输入框占位文本                          | string       | -      | '请选择'   |
| disabled              | 是否禁用                                | boolean      | -      | false      |
| clearable             | 是否支持清空选项                        | boolean      | -      | false      |
| showAllLevels         | 输入框中是否显示选中值的完整路径        | boolean      | -      | true       |
| collapseTags          | 多选模式下是否折叠Tag                   | boolean      | -      | false      |
| minCollapseTagsNumber | 最小折叠标签数                          | Number       | -      | 1          |
| separator             | 选项分隔符                              | string       | -      | ' / '      |

## Event

| 方法名            | 说明                                                         | 参数                                                         |
| :---------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| setValue          | 覆盖当前值.单选时传对象，多选时传数组                        | 单选：Object/String/Number<br>多选：Array                    |
| change            | 当节点变更时，执行回调 <br>多选时，参数是一个数组，且可能会出现多次回调 | 单选：function(value,Node){} <br>多选：function(values,Nodes){} |
| disabled          | 禁用组件                                                     | boolean                                                      |
| blur              | 收起面板                                                     | -                                                            |
| focus             | 展开面板                                                     | -                                                            |
| getCheckedNodes   | 获取选中的节点，如需获取路径，使用node.path获取,将获取各级节点的node对象 | -                                                            |
| getCheckedValues  | 获取选中的值                                                 | -                                                            |
| clearCheckedNodes | 清空选中的节点                                               | -                                                            |
