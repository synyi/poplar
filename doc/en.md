# Reference API 

⚠️: We are building next version of Poplar-annotator, which has a more friendly API, and more features, eg. multiple instance, which does not support now \(~~and maybe less bug~~\).

If you are interested in that, you can pay attention to branch [v1](https://github.com/synyi/poplar/tree/v1).

## HTML

### Root Element

Poplar-annotator can bind to any HTML Element.

We recommend to bind it on a `div`.

#### Example

```html
<div id="example"></div>
```

## JS

### Create

For using Poplar-annotator，we need to create an Annotator object, and we also need a DataManager(Usually JsonDataManager) to provide data for it：

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

#### json data

Follow the following format：

![JSON format](http://www.pic68.com/uploads/2018/08/1(7).png)

### Events

#### textSelected

After the user select some text on the svg, a `textSelected` event will be emitted.

This event has 1 param，we call it `selectionInfo`, and it has following fields：

| param       | meaning               |
| ---------- | ------------------ |
| startIndex | start index of the selection, in the whole content |
| endIndex   | end index of the selection, in the whole content |

They stands for the user selected `[startIndex, endIndex)` in the whole content.

A common usage is capture the event, ask the user which category of label he want's to add, and add the label (You'll see how to do it later).

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

After the user selected two Labels, this event will be emitted.

This event has two params, we'll call them `first` and `second`：

| param   | meaning                 |
| ------ | -------------------- |
| first  | the first clicked Label |
| second | the second clicked Label |

They stand for the user clicked `first` and `second`。

A common usage is capture the event, ask the user which category of connection he want's to add, and add the connection (You'll see how to do it later).

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

We can use `AddLabelAction` and `AddConnectionAction` to add label&connections.

Use like this.

##### Example

```typescript
AddLabelAction.emit(annotator.store.dataManager.labelCategories[0],
          selectionInfo.startIndex, selectionInfo.endIndex);
AddConnectionAction.emit(annotator.store.dataManager.connectionCategories[0],
          fromLabel, toLabel);
```

### Query the content

`annotator.store.dataManager` is a Repository for all kinds of content，can be used to query everything.


#### Example

```typescript
let data = [];
for(let id in annotator.store.dataManager.labels) {
    data.push({id:id,annotator.store.dataManager.labels[id].text});
}
```

### Serialization

`annotator.store.dataManager` has an attribute `json`, we can get a json object directly from it.

`annotator.store.dataManager.json` can be used to reconstruct the `Annotator`, as the first param of `new JsonDatamanager`.