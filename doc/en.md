# Reference API 

## HTML

### Root Element

Poplar-annotator can bind to any HTML Element.

We recommend to bind it on a `div`.

A `svg` element will be created in this `div`, all elements will be rendered in this `svg`.

#### Example

```html
<div id="example"></div>
```

## CSS

Now we support set things in css:

- whole element width (in most cases, you need to set this, it's the only way to set the `svg` element's width you rendered )
```css
#example > svg {
    width: 500px;
}
```
- fonts
```css
/* content */
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
all these styles will be "grabbed" into the `svg` element (which make it easier to control the exported .svg's style).

The class names here can be setted in confg.

For lines of Connections，to prevent it from blocking Labels or text of other Connections, we won't put it in the `g` element of the connection.

These lines (and the half unconnected line) will have class name: `${Connection's class name}-line`, the default one is `.poplar-annotation-connection-line`

When using this to add style to these lines, notice that this selector is also used inside the library, so please pay attention to the priority of the selector.

```css
/* when the root is #example, this is necessary */
#example .poplar-annotation-connection-line {
    stroke: green; /* effective */
}
```

```css
/* a singlee .poplar-annotation-connection-line takes no effect */
.poplar-annotation-connection-line {
    stroke: red; /* won't be effective */
}
```

- styles on hover

  When mouse is over a Label/Connection, a `hover` class will be added to it (Connection's Line will be added too).

  When mouse is over a Label:

  - for Connections which "from" is this Label, will add `hover-from` class to it (Connection's Line will be added too)
  - for Connections which "to" is this Label, will add `hover-to` class to it (Connection's Line will be added too)

  Some css can be applyed to these classes：

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

### Create

For using Poplar-annotation，we need to creat an Annotator object：

```typescript
import {Annotator} from 'poplar-annotation'
/**
  * Create an Annotator object
  * @param data          can be JSON or string
  * @param htmlElement   the html element to bind to
  * @param config        config object
  */
new Annotator(data;: string, htmlElement;: HTMLElement, config?: Object;)
```

### Remove

For removing an Annotator instance, just call Annotator object's `remove()` method。

#### Example

```typescript
annotator.remove();
```

#### data

When data is a JSON object，follow the following format：

```
{
  "content": "text content",
  "labelCategories": [
    {
      "id": Label category's Id,
      "text": Label's text,
      "color": Label's color,
      "borderColor": Label's border color
    },
    {
      "id": Label category's Id,
      "text": Label's text,
      "color": Label's color,
      "borderColor": Label's border color
    },
    ...
  ],
  "labels": [
    {
      "id": LabelId,
      "categoryId": Label's category,
      "startIndex": Label's startIndex(inclusive),
      "endIndex": Label's endIndex(exclusive)
    },
    {
      "id": LabelId,
      "categoryId": Label's category,
      "startIndex": Label's startIndex(inclusive),
      "endIndex": Label's endIndex(exclusive)
    },
    ...
  ],
  "connectionCategories": [
    {
      "id": Connection category Id,
      "text": Connection text
    },
    ...
  ],
  "connections": [
    {
      "id": ConnectionId,
      "categoryId": Connection catrgory,
      "fromId": Connection from Label's id,
      "toId": Connection to Label's id
    }
  ]
}
```



#### config

`config` is an `object` which contains following fields：

| 配置项                    | 说明                                                         | 默认值                           | 类型                                                         |
| ------------------------- | ------------------------------------------------------------ | -------------------------------- | ------------------------------------------------------------ |
| contentClasses            | class name list for content                                  | ['poplar-annotation-content']    | `Array<string>`                                              |
| labelClasses              | class name list for labels                                   | ['poplar-annotation-label']      | `Array<string>`                                              |
| connectionClasses         | class name list for connections                              | ['poplar-annotation-connection'] | `Array<string>`                                              |
| labelPadding              | label's padding                                              | 2                                | `number`                                                     |
| lineHeight                | content's line-height（css's `line-height` doesn't affect to`tspan`） | 1.5                              | `number`                                                     |
| topContextMargin          | Line's top context's `margin`                                | 3                                | `number`                                                     |
| bracketWidth              | Label's bracket's width                                      | 8                                | `number`                                                     |
| allowMultipleLabel        | allow multiple labels in the same place                      | "differentCategory"              | `"notAllowed" | "differentCategory" | "allowed"`（`differentCategory`means  allowed to add when the Labels' category is different） |
| labelWidthCalcMethod      | the method of computing label's width                        | "max"                            | `"max" | "label"`                                            |
| allowMultipleConnection   | allow multiple connections connect two same labels           | "differentCategory"              | `"notAllowed" | "differentCategory" | "allowed"`             |
| connectionWidthCalcMethod | the method of computing connction's width                    | "line"                           | `"text" | "line"`                                            |
| labelOpacity              | label's opacity                                              | 90                               | `number`                                                     |
| defaultLabelColor         | Label's color when not setted                                | "#ff9d61"                        | `string`                                                     |
| selectingAreaStrip        | strip these when selected                                    | /[\n ]/                          | `Regex`                                                      |
| unconnectedLineStyle      | the connection line's style when not fully connected         | "curve"                          | `"none" | "straight" | "curve"`                              |
| contentEditable           | whether the content is editable                              | true                             | `boolean`                                                    |

### Events

#### textSelected

After the user select some text on the svg, a `textSelected` event will be emitted.

This event has 2 params，we call them `startIndex` and `endIndex`：

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
annotator.on('textSelected', (startIndex: number, endIndex: number) => {
    // log the text user selected
    console.log(originString.slice(startIndex, endIndex));
});
```

#### labelClicked

After the user clicked a Label, this event will be emitted.

This event has 2 params，say `id`, `event`：

| param | meaning                     |
| ----- | --------------------------- |
| id    | the clicked connection's id |
| event | click event                 |

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('labelClicked', (id: number, event: MouseEvent) => {
    console.log(id, event);
});
```

#### labelRightClicked

After the user right clicked a Label, this event will be emitted.

This event has 2 params，say `id`, `event`：

| param | meaning                     |
| ----- | --------------------------- |
| id    | the clicked connection's id |
| event | click event                 |

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('labelRightClicked', (id: number, event: MouseEvent) => {
    console.log(id, event);
});
```

You may capture the event and let the user to modify the `label`.

#### labelDoubleClicked

Same as click and right cilick, after the user double clicked a Label, this event will be emitted.

This event has 2 params，say `id`, `event`：

| param | meaning                     |
| ----- | --------------------------- |
| id    | the clicked connection's id |
| event | click event                 |

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('labelDoubleClicked', (id: number, event: MouseEvent) => {
    console.log(id, event);
});
```

You may capture the event and let the user to modify the `label`.

#### twoLabelsClicked

After the user selecte two Labels, this event will be emitted.

This event has two params, we'll call them `first` and `second`：

| param   | meaning                 |
| ------ | -------------------- |
| first  | the first clicked Label's id |
| second | the second clicked Label's id |

They stand for the user clicked `first` and `second`。

A common usage is capture the event, ask the user which category of connectiong he want's to add, and add the connection (You'll see how to do it later).

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('twoLabelsClicked', (first: number, second: number) => {
    // log the ids user selected
    console.log(first,second);
});
```

#### connectionClicked

After the user clicked a connection, this event will be emitted.

This event has 2 params，say `id`, `event`：

| param | meaning                              |
| ----- | ------------------------------------ |
| id    | the clicked connection's id          |
| event | x coordinate of the mouse when click |

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('connectionClicked', (id: number, event: MouseEvent) => {
    console.log(id, event);
});
```

You may capture the event and let the user to modify the`connection`.

#### connectionRightClicked

After the user right clicked a connection, this event will be emitted.

This event has 2 params，say `id`, `event`：

| param | meaning                              |
| ----- | ------------------------------------ |
| id    | the clicked connection's id          |
| event | x coordinate of the mouse when click |

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('connectionRightClicked', (id: number, event: MouseEvent) => {
    console.log(id, event);
});
```

You may capture the event and let the user to modify the`connection`.

#### connectionDoubleClicked

Same as click and right cilick, after the user double clicked a connection, this event will be emitted.

This event has 2 params，say `id`, `event`：

| param | meaning                              |
| ----- | ------------------------------------ |
| id    | the clicked connection's id          |
| event | x coordinate of the mouse when click |

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('connectionDoubleClicked', (id: number, event: MouseEvent) => {
    console.log(id, event);
});
```

You may capture the event and let the user to modify the`connection`.

#### contentInput

Text input.

After the user try to input something, this event will be emitted.

This event has 2 params，say `position`, `value`：

| 参数     | 意义                                                         |
| -------- | ------------------------------------------------------------ |
| position | caret's position when input (the cursor is before the`position`-th character ) |
| value    | input content                                                |

#### contentDelete

Text delete.

After the user try to delete something, this event will be emitted.

This event has 2 params，say `position`, `length`：

| 参数     | 意义                                                         |
| -------- | ------------------------------------------------------------ |
| position | caret's position when input (the cursor is before the`position`-th character ) |
| length   | delete length                                                |

### Actions

We can use `applyAction` method to send an `Action` to the `Annotator` object, so we can modify the content of it.

`Action` are C~~R~~UD (we'll cover R later) operations on Labels and Connections and the `splice` operation to content:

| Action                     | what is it                     | param                               |
| -------------------------- | ------------------------ | ---------------------------------- |
| `Action.Label.Create`      | create a Label           | (categoryId, startIndex, endIndex) |
| `Action.Label.Update`      | change category for a label | (labelId, categoryId)              |
| `Action.Label.Delete`      | delete a Label                | (labelId)                          |
| `Action.Connection.Create` | create Connection           | (categoryId, fromId, toId)         |
| `Action.Connection.Update` | change category for a Connection | (connectionId, categoryId)         |
| `Action.Connection.Delete` | delete a Connection           | (connectionId)                     |
| `Action.Content.Splice` | the content to be splice | (startIndex, removeLength, insert) |

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('textSelected', (startIndex: number, endIndex: number) => {
    // get the categoryId user want to add in some way
    let userChoosedCategoryId = getUserChoosedCategoryId();
    annotator.applyAction(Action.Label.Create(userChoosedCategoryId, startIndex, endIndex));
});
```

### Query the content

`annotator.store` has Repository for all kinds of content，can be used to query everything：

| `annotator.store`'s member |
| --------------------------- |
| `content`                   |
| `labelCategoryRepo`         |
| `labelRepo`                 |
| `connectionCategoryRepo`    |
| `connectionRepo`            |

`…Repo` are all `Repository` type，this type can be used like `Map<number,Entity>` object (i.e. use `get(id)` to get the entity，and iterate though by using `for-of`).

⚠️：Tough there is `add()` and `set()` on a `Repository`, and call them do have the corresponding effect, but these are for internal use, we suggest not to add sth. into `Repository` without an `Action`!

You can use these object as the data source for a mvvm framework like Vue、Angular and React, for let a user to select a `labelCategory` or `connnectionCategory`.

#### Example

```typescript
let data = [];
for(let [id, entity] of annotator.store.labelCategoryRepo) {
    data.push({id: id, value: entity.text});
}
```

### Serialization

All `Repository` and `annotator.store` has an attribute `json`, we can get a json object directly from it.

All `Entity` can be serialized by using `JSON.stringify()`。

`annotator.store.json` can be used to reconstruct the `Annotator`, as the first param of `new Annotator`.

### Image exporting

Now we support exporting to .svg files, just call `annotator.export()`to get the content of the svg file, and the use sth like `FileReader` to write it into a file which user can download.
