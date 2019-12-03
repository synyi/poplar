# Reference API 

## HTML

### Root Element

Poplar-annotator可以绑定到任何一个空HTML元素上。

我们推荐绑定到`div`元素上。

将会在这个`div`中创建一个`svg`，所有元素的渲染都在这个`svg`中进行。

#### Example

```html
<div id="example"></div>
```

## CSS

目前支持设置:
- 整个元素的宽度（一般都需要设置这个，这是指定你要渲染出的`svg`元素的宽度的唯一方法）
```css
#example > svg {
    width: 500px;
}
```
- 字体
```css
/* 内容 */
.poplar-annotation-content {
    font-family: "PingFang SC", serif;
    font-size: 20px;
}
/* Label */
.poplar-annotation-label {
    font-family: "PingFang SC", serif;
    font-size: 14px;
}
/* Connection */
.poplar-annotation-connection {
    font-family: "PingFang SC", serif;
    font-size: 12px;
}
```
这些和字体有关的样式将会被放入`svg`元素中（便于控制导出.svg后文字的样式）。

注意此处的各个类名可以在config中设置。

值得一提的是，对于Connection的Line，为了防止其遮挡Label、其他Connection的文字等，并没有将其放入Connection所在的`g`元素内。

这些line都会被添加类名`${Connection的类名}-line`，如默认的`.poplar-annotation-connection-line`

- hover时的样式

  鼠标放置在Label/Connection上时，会给这个元素添加`hover`类（Connection对应的Line也会添加）。

  另外鼠标放置在Label上时：

  - 对Connection中from为这一Label的，会添加`hover-from`类（Connection对应的Line也会添加）
  - 对Connection中to为这一Label的，会添加`hover-to`类（Connection对应的Line也会添加）

  可以通过为这些类设置css样式来达成一些动画效果：

```css
.poplar-annotation-connection-line.hover-from {
    stroke: red;
}

.poplar-annotation-connection-line.hover-to {
    stroke: blue;
}

.poplar-annotation-connection-line.hover {
    stroke: yellow;
}
```

## JS

### 创建

为了使用Poplar-annotation，我们需要在JS中创建Annotator对象：

```typescript
import {Annotator} from 'poplar-annotation'
/**
  * 构造Annotator对象
  * @param data          数据，可以为JSON格式或纯文本
  * @param htmlElement   要放置内容的html元素
  * @param config        配置对象
  */
new Annotator(data;: string, htmlElement;: HTMLElement, config?: Object;)
```

### 移除

要移除Annotator实例，只需调用Annotator对象的`remove()`方法即可。

#### Example

```typescript
annotator.remove();
```

#### data

在data为JSON时，格式如下：

```json
{
  "content": "文本内容",
  "labelCategories": [
    {
      "id": Label类型Id,
      "text": Label文字,
      "color": Label颜色,
      "borderColor": Label边框颜色
    },
    {
      "id": Label类型Id,
      "text": Label文字,
      "color": Label颜色,
      "borderColor": Label边框颜色
    },
    ...
  ],
  "labels": [
    {
      "id": LabelId,
      "categoryId": Label类型,
      "startIndex": Label开始位置（包含）,
      "endIndex": Label结束位置（不包含）
    },
    {
      "id": LabelId,
      "categoryId": Label类型,
      "startIndex": Label开始位置（包含）,
      "endIndex": Label结束位置（不包含）
    },
    ...
  ],
  "connectionCategories": [
    {
      "id": Connection类型Id,
      "text": Connection文字
    },
    ...
  ],
  "connections": [
    {
      "id": ConnectionId,
      "categoryId": Connection类型,
      "fromId": Connection开始的Label的id,
      "toId": Connection结束的Label的id
    }
  ]
}
```



构造后，对应元素内应该就会显示出对应的SVG图片。

#### config

`config`字典是一个`object`，其中可配置的值如下：

| 配置项                    | 说明                                        | 默认值                           | 类型                                                         |
| ------------------------- | ------------------------------------------- | -------------------------------- | ------------------------------------------------------------ |
| contentClasses            | 为内容添加的类名列表                        | ['poplar-annotation-content']    | `Array<string>`                                              |
| labelClasses              | 为Label添加的类名列表                       | ['poplar-annotation-label']      | `Array<string>`                                              |
| connectionClasses         | 为Connection添加的类名列表                  | ['poplar-annotation-connection'] | `Array<string>`                                              |
| labelPadding              | Label内部的padding                          | 2                                | `number`                                                     |
| lineHeight                | 内容行高（css的`line-height`对`tspan`无效） | 1.5                              | `number`                                                     |
| topContextMargin          | Line顶部渲染内容的`margin`                  | 3                                | `number`                                                     |
| bracketWidth              | Label大括号的宽度                           | 8                                | `number`                                                     |
| allowMultipleLabel        | 是否允许同一位置的多个Label                 | "differentCategory"              | "notAllowed" | "differentCategory" | "allowed"（`differentCategory`指只要两个Label的category不同即允许添加） |
| labelWidthCalcMethod      | 计算label的碰撞箱时使用的方案               | "max"                            | "max" | "label"                                            |
| allowMultipleConnection   | 是否允许连接同两个Label的多个Connection     | "differentCategory"              | "notAllowed" | "differentCategory" | "allowed"             |
| connectionWidthCalcMethod | 计算connection的碰撞箱时使用的方案          | "line"                           | "text" | "line"                                            |
| labelOpacity              | label的透明度                               | 90                               | `number`                                                     |
| defaultLabelColor         | 在Label颜色未设置时Label的颜色              | "#ff9d61"                        | `string`                                                     |
| selectingAreaStrip        | 选择文字时在两头要strip掉的文字             | /[\n ]/                          | `Regex`                                                      |
| unconnectedLineStyle      | 点击一个Label时显示的连接线                 | "curve"                          | "none" | "straight" | "curve"                              |
| contentEditable           | 内容是否可编辑                              | true                             | `boolean`                                                    |

### Events

#### textSelected

在用户在页面上选取了一段文本后，会触发`textSelected`事件。

这个event会带两个参数，我们将其分别称为`startIndex`和`endIndex`：

| 参数       | 意义               |
| ---------- | ------------------ |
| startIndex | 选取部分的开始坐标 |
| endIndex   | 选取部分的结束坐标 |

它们代表用户选取了在原文本中的`[startIndex, endIndex)`部分。

可以拦截此事件，并向用户询问要添加的标注所属的类型，然后添加标注（如何添加见后）。

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('textSelected', (startIndex: number, endIndex: number) => {
    // 输出用户选取的那些字
    console.log(originString.slice(startIndex, endIndex));
});
```

#### labelClicked

在用户左键点击了一个Label后会触发这个事件。

这个event会带两个参数，为被点击的标注的ID和点击事件本身：

| 参数  | 意义             |
| ----- | ---------------- |
| id    | 被点击的标注的id |
| event | 点击事件         |

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('labelClicked', (id: number, event: MouseEvent) => {
    // 输出用户点击的label的ID
    console.log(id);
});
```

在下面的`twoLabelsClicked`事件不能满足需求时，可使用这一事件定制添加连接的逻辑。

#### labelRightClicked

在用户右键点击了一个Label后会触发这个事件。

这个event会带两个参数，为被点击的标注的ID和被点击事件本身：

| 参数  | 意义             |
| ----- | ---------------- |
| id    | 被点击的标注的id |
| event | 点击事件         |

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('labelRightClicked', (id: number,x: number,y: number) => {
    // 输出用户点击的label的ID, 被点击时鼠标的 X,Y 值
    console.log(id,x,y);
});
```

可以使用这一事件来让用户对`Label`进行修改。

#### labelDoubleClicked

在用户双击了一个Label后会触发这个事件。

与左键点击和右键点击类似，这个event会带两个参数，为被点击的标注的ID和被点击事件本身：

| 参数  | 意义             |
| ----- | ---------------- |
| id    | 被点击的标注的id |
| event | 点击事件         |

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('labelDoubleClicked', (id: number,x: number,y: number) => {
    // 输出用户双击的label的ID, 被点击时鼠标的 X,Y 值
    console.log(id,x,y);
});
```

可以使用这一事件来让用户对`Label`进行修改。

#### twoLabelsClicked

在用户先后左键点击了两个Label后会触发这个事件。

这个event会带两个参数，我们将其分别称为`first`和`second`：

| 参数   | 意义                 |
| ------ | -------------------- |
| first  | 第一个点击的标注的id |
| second | 第二个点击的标注的id |

他们代表了用户先后点击了id为`first`和`second`的两个标注。

可以拦截此事件，并向用户询问要添加的连接所属的类型，然后添加连接（如何添加见后）。

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('twoLabelsClicked', (first: number, second: number) => {
    // 输出用户选取的两个label的ID
    console.log(first,second);
});
```

#### connectionClicked

在用户右键点击了一个连接的文字部分后会触发这个事件。

这个event会带两个参数，为被点击的连接的ID和点击事件本身：

| 参数  | 意义             |
| ----- | ---------------- |
| id    | 被点击的连接的id |
| event | 点击事件         |

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('connectionClicked', (id: number, event: MouseEvent) => {
    // 输出用户点击的Connection的ID, 点击鼠标的event
    console.log(id, event);
});
```

可以使用这一事件来让用户对`connection`进行修改。

#### connectionRightClicked

在用户右键点击了一个连接的文字部分后会触发这个事件。

这个event会带两个参数，为被点击的连接的ID和点击事件本身：

| 参数  | 意义             |
| ----- | ---------------- |
| id    | 被点击的连接的id |
| event | 点击事件         |

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('connectionRightClicked', (id: number, event: MouseEvent) => {
    // 输出用户点击的Connection的ID, 点击鼠标的event
    console.log(id, event);
});
```

可以使用这一事件来让用户对`connection`进行修改。

#### connectionDoubleClicked

在用户双击了一个连接的文字部分后会触发这个事件。

与左键点击和右键点击类似，这个event会带两个参数，为被点击的连接的ID和点击事件本身：

| 参数  | 意义             |
| ----- | ---------------- |
| id    | 被点击的连接的id |
| event | 点击事件         |

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('connectionDoubleClicked', (id: number, event: MouseEvent) => {
    // 输出用户点击的Connection的ID, 点击鼠标的event
    console.log(id, event);
});
```

可以使用这一事件来让用户对`connection`进行修改。

#### contentInput

文字输入。

在用户输入了内容时触发这个事件。

这个event会带两个参数，为输入时光标的位置和输入的内容：

| 参数     | 意义                                             |
| -------- | ------------------------------------------------ |
| position | 输入时光标的位置（光标在第`position`个字符之前） |
| value    | 输入的内容                                       |

#### contentDelete

文字删除。

在用户试图删除内容时触发这个事件。

这个event会带两个参数，为删除时光标的位置和要删除的内容长度：

| 参数     | 意义                                             |
| -------- | ------------------------------------------------ |
| position | 删除时光标的位置（光标在第`position`个字符之前） |
| length   | 要删除的内容长度                                 |

### Actions

可以通过`applyAction`方法向`Annotator`对象发送`Action`来改变其中的内容。

`Action`主要指对标注（Label）和连接（Connection）的C~~R~~UD操作（R的操作看下面）以及对内容的`splice`操作，如下：

| Action                     | 说明                     | 参数                               |
| -------------------------- | ------------------------ | ---------------------------------- |
| `Action.Label.Create`      | 创建Label                | (categoryId, startIndex, endIndex) |
| `Action.Label.Update`      | 修改Label的category      | (labelId,categoryId)               |
| `Action.Label.Delete`      | 删除Label                | (labelId)                          |
| `Action.Connection.Create` | 创建Connection           | (categoryId, startIndex, endIndex) |
| `Action.Connection.Update` | 修改Connection的category | (connectionId,categoryId)          |
| `Action.Connection.Delete` | 删除Connection           | (connectionId)                     |
| `Action.Content.Splice`    | splice内容               | (startIndex, removeLength, insert) |

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('textSelected', (startIndex: number, endIndex: number) => {
    // 先通过某种方式获取用户想要添加的categoryId
    let userChoosedCategoryId = getUserChoosedCategoryId();
    annotator.applyAction(Action.Label.Create(userChoosedCategoryId, startIndex, endIndex));
});
```

### 查询内部状态

`annotator.store`里有各种对象的Repository，可以用来查询各种对象的内容：

| `annotator.store`的成员变量 |
| --------------------------- |
| `content`                   |
| `labelCategoryRepo`         |
| `labelRepo`                 |
| `connectionCategoryRepo`    |
| `connectionRepo`            |

其中`…Repo`都是`Repository`类型，这一类型可以通过与ES6中（以ID为键，对象内容`Entity`为值的）`Map`对象相似的方式使用（即使用`get(id)`方式取对象的信息，也可使用`for-of`遍历）。

⚠️：虽然`Repository`上确实有`add`和`set`方法，而且调用它们确实会有相应的效果，但这些方法仅供内部使用，不建议绕开`Action`向`Repository`直接添加内容！

这一功能的常见作用是为Vue、Angular、React等MVVM框架提供让用户选择`labelCategory`、`connnectionCategory`的控件的数据源。

#### Example

```typescript
let data = [];
for(let [id, entity] of annotator.store.labelCategoryRepo) {
    data.push({id: id, value: entity.text});
}
```

### 序列化

所有`Repository`和`annotator.store`都有`json`属性，直接取值即可得到json对象。

而所有`Entity`都可以使用`JSON.stringify()`序列化。

`annotator.store`对象序列化得到的json可以用作`new Annotator`的第一个参数，来重建Annotator对象。

### 图片导出

目前支持导出到svg文件，只需调用`annotator.export()`来获取到svg文件的内容，然后使用`FileReader`等方式写入文件即可。
