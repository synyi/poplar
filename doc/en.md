# Reference API 

## HTML

### Root Element

Poplar-annotator can bind to any HTML Element.

We recommend to bind it on a `div`.

#### Example

```html
<div id="example"></div>
```

## CSS

Now we support set the style of the content, you can use the following css:

```css
svg > text tspan {
	font-size: 20px;
}
```

You can add your own selector before `svg`.

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
new Annotator(data: string, htmlElement: HTMLElement, config?: Object)
```

### Remove

For removing an Annotator instance, just call Annotator object's `remove()` method。

#### Example

```typescript
annotator.remove();
```

#### data

When data is a JSON object，follow the following format：

![JSON format](http://www.pic68.com/uploads/2018/08/1(7).png)

When data is a string，it has the same effect as a JSON which `content` is the content of the string, other things are all `[]`.

All SBC-cased blank character `\u3000` and multiple continuous blank character in `content` will be replaced by a single blank character.

The coordinate of `Label` is calculated by the result after replacement.

After construct, the svg will be displayed in the html element.

#### config

`config` is an `object` which contains following fields：

| config item       | what it means                                            | default value |
| ------------ | ------------------------------------------------ | ------ |
| maxLineWidth | will wrap the line after word count exceed this number  | 80     |

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



#### labelRightClicked

After the user right clicked a Label, this event will be emitted.

This event has 3 params，say `id`, `x`, and `y`：

| param | meaning                              |
| ----- | ------------------------------------ |
| id    | the clicked connection's id          |
| x     | x coordinate of the mouse when click |
| y     | y coordinate of the mouse when click |

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('labelRightClicked', (id: number,x: number,y: number) => {
    console.log(id,x,y);
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

#### connectionRightClicked

After the user right clicked a connection, this event will be emitted.

This event has 3 params，say `id`, `x`, and `y`：

| param | meaning                              |
| ----- | ------------------------------------ |
| id    | the clicked connection's id          |
| x     | x coordinate of the mouse when click |
| y     | y coordinate of the mouse when click |

##### Example

```typescript
let originString = 'hello world';
let annotator = new Annotator(originString, document.getElementById('test'));
annotator.on('connectionRightClicked', (id: number,x: number,y: number) => {
    console.log(id,x,y);
});
```

You may capture the event and let the user to modify the`connection`.

### Actions

We can use `applyAction` method to send an `Action` to the `Annotator` object, so we can modify the content of it.

`Action` are C~~R~~UD (we'll cover R later) operations on Labels and Connections:

| Action                     | what is it                     | param                               |
| -------------------------- | ------------------------ | ---------------------------------- |
| `Action.Label.Create`      | create a Label           | (categoryId, startIndex, endIndex) |
| `Action.Label.Update`      | change category for a label | (labelId,categoryId)               |
| `Action.Label.Delete`      | delete a Label                | (labelId)                          |
| `Action.Connection.Create` | create Connection           | (categoryId, startIndex, endIndex) |
| `Action.Connection.Update` | change category for a Connection | (connectionId,categoryId)          |
| `Action.Connection.Delete` | delete a Connection           | (connectionId)                     |

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