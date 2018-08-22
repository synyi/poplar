# Reference API 

⚠️: 我们正在开发下一版本的Poplar-annotator，它将会有更友好的API和更多的功能，例如这一版本暂不支持的同一页面上的多个Poplar-annotator实例（~~也许也会有更少的bug~~）。

若您对此感兴趣，请关注 branch [v1](https://github.com/synyi/poplar/tree/v1).

## HTML

### Root Element

Poplar-annotator可以绑定到任何一个空HTML元素上。

我们推荐绑定到`div`元素上。

#### Example

```html
<div id="example"></div>
```

## JS

### 创建

为了使用Poplar-annotator，我们需要在JS中创建Annotator对象，同时也需要一个DataManager为其提供数据：

```typescript
import {Annotator,JsonDataManager} from 'poplar-annotator'
/**
  * Create a JsonDataManager object
  * @param json A json stand for the data
  */
let dataManager = new JsonDataManager(json);
/**
  * Create an Annotator object
  * @param data          the datamanager we just created
  * @param htmlElement   the html element to bind to
  */
new Annotator(datamanager: DataManager, htmlElement: HTMLElement)
```

#### json数据

格式如下：

![JSON格式](http://www.pic68.com/uploads/2018/08/1(7).png)

### Events

#### textSelected

在用户在页面上选取了一段文本后，会触发`textSelected`事件。

这个event会带一个参数，我们将其称为`selectionInfo`, 它有两个成员：

| 成员       | 意义               |
| ---------- | ------------------ |
| startIndex | 选取部分的开始坐标 |
| endIndex   | 选取部分的结束坐标 |

它们代表用户选取了在原文本中的`[startIndex, endIndex)`部分。

可以拦截此事件，并向用户询问要添加的标注所属的类型，然后添加标注（如何添加见后）。

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('textSelected', (selectionInfo) => {
    // log the text user selected
    console.log(originString.slice(selectionInfo.startIndex, selectionInfo.endIndex));
});
```

#### labelsConnected

在用户先后点击了两个Label后会触发这个事件。

这个event会带两个参数，我们将其分别称为`first`和`second`：

| 参数   | 意义                 |
| ------ | -------------------- |
| first  | 第一个点击的标注 |
| second | 第二个点击的标注 |

他们代表了用户先后点击了`first`和`second`两个标注。

可以拦截此事件，并向用户询问要添加的连接所属的类型，然后添加连接（如何添加见后）。

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('labelsConnected', (first, second) => {
    // log the labels user selected
    console.log(first,second);
});
```
### Actions

我们可以使用 `AddLabelAction` 和 `AddConnectionAction` 来添加 label&connections.

像下面的例子那样使用：

##### Example

```typescript
AddLabelAction.emit(annotator.store.dataManager.labelCategories[0],
          selectionInfo.startIndex, selectionInfo.endIndex);
AddConnectionAction.emit(annotator.store.dataManager.connectionCategories[0],
          fromLabel, toLabel);
```


### 查询内部状态

`annotator.store`是各种对象的Repository，可以用来查询各种对象的内容：

#### Example

```typescript
let data = [];
for(let id in annotator.store.dataManager.labels) {
    data.push({id:id,annotator.store.dataManager.labels[id].text});
}
```

### 序列化

`annotator.store.dataManager`有`json`属性，直接取值即可得到json对象。

`annotator.store.dataManager`对象序列化得到的json可以用作`new JsonDataSource`的第一个参数，来重建Annotator对象。