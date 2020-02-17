# 实现说明（译）
> 译者注：本文是刊登在[React官网](https://react-legacy.netlify.com/contributing/implementation-notes.html)上面的一篇React实现说明。关于React的实现，我自己也尝试过用自己的语言写一遍，但始终无法像这篇文章解释的简洁、透彻。因此，我决定将这篇说明翻译成中文，并辅以我个人的理解，相信认真读完你一定会有所收获。鉴于译者的水平有限，难免会有解释错误的地方，请大佬们不吝赐教。


本文是[stack reconciler](https://react-legacy.netlify.com/contributing/codebase-overview.html#stack-reconciler)（栈协调引擎）实现注解的集合。
> 译者注：**stack reconciler**的翻译我斟酌了很久，最终选用了『**栈协调引擎**』。据我了解，React在创建之初（2013年）对标的就是当时的AngularJs，它引以为豪的特点是数据可以自动更新到UI层（AngularJs的指令并不是全自动的），因此给自己命名为**React**(ive)。
> 如果没有自动更新，当我的数据变化的时候，UI层反映的还是老数据，此时就产生了数据和UI的**矛盾**。React内负责解决这个矛盾的算法，就是**协调**(Reconcile)，协调后UI就和数据保持一致了，也就实现了自动更新。
> 
> 据此可以看出，协调引擎是react的核心。react目前实现了两种协调算法，一种是本文要讲的**stack reconciler**，还有一种是**fiber reconciler**，前者用于React16（不包括）之前的版本，后者用于React16。
>
> 之所以叫做 **栈** 协调引擎，是因为整个协调的过程是以一个函数栈的形式完成的，下面会详细讲。
> 
> 

本文是技术文章，需要读者深刻理解React的公共API以及React如何拆分成了的core（核心）、renderers（渲染引擎）和reconciler（协调引擎）。如果你对React的源码还不是很熟悉，请先阅读[源码概述](https://react-legacy.netlify.com/contributing/codebase-overview.html);

此外，读者还需要了解[React component、React component实例 以及 elements 之间的区别](https://react-legacy.netlify.com/blog/2015/12/18/react-components-elements-and-instances.html)。

> 译者注：不要跳过上面提到的两篇文章，他们对理解本文至关重要。

今天，**stack reconciler**赋能了所有React代码，它就在[`src/renderers/shared/stack/reconciler`](https://github.com/facebook/react/tree/master/src/renderers/shared/stack)，并且同时被用于 `React DOM` 和 `React Native`。

### 视频：从零开始写React

[Paul O'Shannessy](https://twitter.com/zpao)有一场关于[从零开始写React](https://www.youtube.com/watch?v=_MAD4Oly9yg)的演讲，这场演讲是本文的灵感来源。

无论是文本还是他的演讲都是对源码的简化，如果你能同时了解这两种简化，你将对源码有更深刻的理解。

### 概览

**协调引擎**本身没有一个公共API。`React DOM` 和 `React Native` 这样的渲染引擎，能够高效地根据用户编写 `React Components` 更新UI，其基础便是**协调引擎**。

### 挂载是一个递归过程

让我们假设第一次你要挂载一个组件：

```js
ReactDOM.render(<App />, rootEl);
```

ReactDOM 会把 `<App />` 传给协调引擎。 请记住：`<App />` 是一个 React 元素(**element**), 也就是, 要被渲染**内容**的描述。你可以把它理解为一个普通对象：

```js
console.log(<App />);
// { type: App, props: {} }
```
> 译者注：`App` 是一个 React 组件（React Component），是我们手写出来的类。`<App />` 是一个元素(element)，也是内容描述，是由 `App`、`props`、和可能存在的`children`（本例没有），通过React.createElement 计算出来的。注意区分，非常重要！
> 
> 从我们手写的 React 组件计算出对应的 element 这个过程是 `React.createElement` 完成的，跟协调引擎没有关系。从 element 到UI层才是协调引擎做的工作。
> 
> 简单来表示就是，element ------- 协调引擎 ------ 渲染引擎 -----> UI。
> 
> 这一点理解透了非常重要，我给大家写两个例子，方便大家理解和记忆：
> 
> `<App />` === `React.createElement(App, null)`，他们所表示的都是一个对象 ==> `{ type: App, props: {} }`
> 
> `<div id="demo">123</div>` === `React.createElement("div", { id: "demo" }, "123")` ，他们所表示的也都是一个对象 ==> `{ type: "div", props: { id: "demo", children: "123" } }`
>
> Tips：上面从JSX到React.createElement的转化是在我们（用比如 Babel）编译的时候完成的。在以 webpack + babel 为代表的前端工程化时代到来之前，前端开发写 React 都是直接调用的 React 包提供的 createElement 方法。


协调引擎拿到 **element** 以后，它会检查这个 **element** 对象里 type 的值 `App` 是类还是函数。
如果 `App` 是一个函数，协调引擎会调用 `App(props)` 来得到**渲染后的元素**。
如果 `App` 是一个类，协调引擎会用 `new App(props)` 实例化一个 `App`，然后调用 `componentWillMount` 生命周期函数，之后会调用 `render()` 方法得到**渲染后的元素**。

无论是类还是函数，协调引擎都会计算出这个 **`App` elment** 将会渲染成什么element。

整个过程是递归的。 `App` 可能渲染出了一个 `<Greeting />`， `Greeting` 又可能渲染出了 `<Button />`， 等等。协调引擎会像这样『一层一层的向下解析』用户定义的组件，直到算出每个组件渲染的内容。
> 译者注：这一段非常关键，希望大家好好理解一下，我换个说法。
>
> 在项目中，我们一般最终要渲染的组件只是 `<App />`。那为什么这个 `<App />` 可以承载我们整个前端应用呢？我们知道 `<App />` 代表的只是一个 element 对象 `{ type: App, props: {} }`，`ReactDom.mount` 方法把这个对象传给协调引擎，让协调引擎帮助我们把UI渲染出来。协调引擎一看，这个 `type` 是 `App`（假如它是一个函数），协调引擎就执行 `App(props)`，执行结果是 `<Greeting />`，`<Greeting />` 代表了另一个 `element` 对象 `{ type: Greeting, props: {} }`。协调引擎一看，这个结果里的 `type` 是 `Greeting`（假如它是一个类），协调引擎就执行 `new Greeting({})`，然后让这个组件实例走它的声明周期 `componentWillMount`，然后调用这个组价实例的 `render()` 方法，这时候协调引擎拿到了这个 `render()` 的执行结果 `<Button />`。如此循环往复，直到找到最终要渲染的 dom 元素，比如是一个div 为止，本文正文接下来就会讲何时终止。
>

你可以把这个过程想想成下面这段伪代码:

```js
function isClass(type) {
  // React.Component subclasses have this flag
  return (
    Boolean(type.prototype) &&
    Boolean(type.prototype.isReactComponent)
  );
}

// This function takes a React element (e.g. <App />)
// and returns a DOM or Native node representing the mounted tree.
function mount(element) {
  var type = element.type;
  var props = element.props;

  // We will determine the rendered element
  // by either running the type as function
  // or creating an instance and calling render().
  var renderedElement;
  if (isClass(type)) {
    // Component class
    var publicInstance = new type(props);
    // Set the props
    publicInstance.props = props;
    // Call the lifecycle if necessary
    if (publicInstance.componentWillMount) {
      publicInstance.componentWillMount();
    }
    // Get the rendered element by calling render()
    renderedElement = publicInstance.render();
  } else {
    // Component function
    renderedElement = type(props);
  }

  // This process is recursive because a component may
  // return an element with a type of another component.
  return mount(renderedElement);

  // Note: this implementation is incomplete and recurses infinitely!
  // It only handles elements like <App /> or <Button />.
  // It doesn't handle elements like <div /> or <p /> yet.
}

var rootEl = document.getElementById('root');
var node = mount(<App />);
rootEl.appendChild(node);
```

>**注意：**
>
>这是一段伪代码. 它跟真实的实现相差甚远. 并且会引起调用栈溢出，因为我们还没有讨论何时终止递归。

我们来重新梳理一下上面例子中的几条关键思想：

* React 元素是包含组件的type（如：`App`）和props的普通对象。
* 用户定义的组件（如：`App`）可能是类也可能是函数，但是他们都会『渲染』出**元素**，即**element**。
* 『挂载』(`Mounting`)是一个递归的过程，这个过程会根据顶层的**React 元素**（如：`<App />`）创建出一个 DOM 或 Native 元素树。

### 挂载宿主元素

这个挂载过程如果不能在屏幕上渲染出内容，是没有任何用处的。

除了用户定义的（『合成』，composite）组件以外，React 元素也可以代表平台（『宿主』, host）组件。例如，`Button` 可能在它的render函数里返回一个 `<div />`。

如果元素的 `type` 属性值是一个字符串, 我们就把它当成宿主元素:


```js
console.log(<div />);
// { type: 'div', props: {} }
```

宿主元素不是用户定义的。

当协调引擎处理到了一个宿主元素，它会让渲染引擎来接管以完成挂载。比如，React DOM将会创建一个DOM节点。

如果这个宿主元素有后代，无论这些后代是否是宿主的(例如 `<div><hr /></div>`)、或者是合成的(例如 `<div><Button /></div>`)、或者是两者都有，协调引擎都会按照上面提到的算法继续递归式地挂载这些后代。

子组件产生的 DOM 节点会被挂在(append)父 DOM 节点上，这样层层递归，完整的 DOM 结构就组装完成了。


>**注意：**
>
> 协调引擎本身并不跟 DOM 关联。最终的挂载结果（有时在源码中称作`mount image`）完全取决于渲染引擎，它有可能是一个DOM 节点（React DOM作为渲染引擎），或是一个字符串（React DOM Server作为渲染引擎），或者是一个native端的视图（React Native渲染引擎）。

如果我们想增强上面的代码以能够处理宿主元素，它可能会是下面这样：

```js
function isClass(type) {
  // React.Component subclasses have this flag
  return (
    Boolean(type.prototype) &&
    Boolean(type.prototype.isReactComponent)
  );
}

// This function only handles elements with a composite type.
// For example, it handles <App /> and <Button />, but not a <div />.
function mountComposite(element) {
  var type = element.type;
  var props = element.props;

  var renderedElement;
  if (isClass(type)) {
    // Component class
    var publicInstance = new type(props);
    // Set the props
    publicInstance.props = props;
    // Call the lifecycle if necessary
    if (publicInstance.componentWillMount) {
      publicInstance.componentWillMount();
    }
    renderedElement = publicInstance.render();
  } else if (typeof type === 'function') {
    // Component function
    renderedElement = type(props);
  }

  // This is recursive but we'll eventually reach the bottom of recursion when
  // the element is host (e.g. <div />) rather than composite (e.g. <App />):
  return mount(renderedElement);
}

// This function only handles elements with a host type.
// For example, it handles <div /> and <p /> but not an <App />.
function mountHost(element) {
  var type = element.type;
  var props = element.props;
  var children = props.children || [];
  if (!Array.isArray(children)) {
    children = [children];
  }
  children = children.filter(Boolean);

  // This block of code shouldn't be in the reconciler.
  // Different renderers might initialize nodes differently.
  // For example, React Native would create iOS or Android views.
  var node = document.createElement(type);
  Object.keys(props).forEach(propName => {
    if (propName !== 'children') {
      node.setAttribute(propName, props[propName]);
    }
  });

  // Mount the children
  children.forEach(childElement => {
    // Children may be host (e.g. <div />) or composite (e.g. <Button />).
    // We will also mount them recursively:
    var childNode = mount(childElement);

    // This line of code is also renderer-specific.
    // It would be different depending on the renderer:
    node.appendChild(childNode);
  });

  // Return the DOM node as mount result.
  // This is where the recursion ends.
  return node;
}

function mount(element) {
  var type = element.type;
  if (typeof type === 'function') {
    // User-defined components
    return mountComposite(element);
  } else if (typeof type === 'string') {
    // Platform-specific components
    return mountHost(element);
  }
}

var rootEl = document.getElementById('root');
var node = mount(<App />);
rootEl.appendChild(node);
```

上面的代码可以实现挂载，但是这距离真正的**协调引擎**还差的远。因为上面的代码缺少了最关键的部分：更新。


### 引入内部实例

React的关键特征是你可以重新渲染（re-render）所有东西，并且还不会重新创建dom或者重置状态(state);

```js
ReactDOM.render(<App />, rootEl);
// Should reuse the existing DOM:
ReactDOM.render(<App />, rootEl);
```

然而，我们的上面的实现只知道如何挂载初始树。它不能实现在初始树的基础上更新，因为它没有保存一些必要的信息，比如：合成组件的实例（`publicInstance`），以及 DOM 节点和合成组件的对应关系。

React 的**栈协调引擎**解决更新问题的方案是：把 `mount()` 函数放在一个 class 中，并成为这个 class 的一个方法（method）。这个方案有一些缺陷，我们正在往相反的方向[重构协调引擎](https://reactjs.org/docs/codebase-overview.html#fiber-reconciler)。但先抛开这些，下面就是**栈协调引擎**的具体实现方案。

我们将创建两个类 `DOMComponent` 和 `CompositeComponent`，而不再用 `mountHost` 和 `mountComposite` 方法。

这两个类的 constructor 都接收 `element` 参数，也都有一个 `mount()` 方法，该方法返回挂载的节点。我们用一个工厂函数代替原来最外层（top-level）的 `mount()` 函数。该工厂函数会实例化对应的类。

```js
function instantiateComponent(element) {
  var type = element.type;
  if (typeof type === 'function') {
    // User-defined components
    return new CompositeComponent(element);
  } else if (typeof type === 'string') {
    // Platform-specific components
    return new DOMComponent(element);
  }  
}
```

首先，让我们看看 `CompositeComponent` 的实现：

```js
class CompositeComponent {
  constructor(element) {
    this.currentElement = element;
    this.renderedComponent = null;
    this.publicInstance = null;
  }

  getPublicInstance() {
    // For composite components, expose the class instance.
    return this.publicInstance;
  }

  mount() {
    var element = this.currentElement;
    var type = element.type;
    var props = element.props;

    var publicInstance;
    var renderedElement;
    if (isClass(type)) {
      // Component class
      publicInstance = new type(props);
      // Set the props
      publicInstance.props = props;
      // Call the lifecycle if necessary
      if (publicInstance.componentWillMount) {
        publicInstance.componentWillMount();
      }
      renderedElement = publicInstance.render();
    } else if (typeof type === 'function') {
      // Component function
      publicInstance = null;
      renderedElement = type(props);
    }

    // Save the public instance
    this.publicInstance = publicInstance;

    // Instantiate the child internal instance according to the element.
    // It would be a DOMComponent for <div /> or <p />,
    // and a CompositeComponent for <App /> or <Button />:
    var renderedComponent = instantiateComponent(renderedElement);
    this.renderedComponent = renderedComponent;

    // Mount the rendered output
    return renderedComponent.mount();
  }
}
```

这跟我们先前实现的 `mountComposite()` 方法没有太大区别，但是现在我们保存了一些信息，比如：`this.currentElement`, `this.renderedComponent`，和 `this.publicInstance`，这些信息在更新组件的过程中会用到。

注意：一个 `CompositeComponent` 的实例跟一个用户提供的 `element.type` 的实例是不同的。`CompositeComponent` 是我们协调引擎的实现细节，永远不会暴露给用户。那些用户定义的类保存在 `element.type` 里，它们（用户定义的类）的实例化过程是在 `CompositeComponent` 的 `mount` 方法里完成的.

为了避免混淆，我们称 `CompositeComponent` 和 `DOMComponent` 的实例为『内部实例』。它们存在的意义是让我们能够持久地保存一些信息在它们身上。只有渲染引擎和协调引擎知道他们的存在。

相反地，我们称用户自己定义的类的实例为『公共实例』。这个公共实例就是你在你自己定义的组件里的 `render()` 和其他方法里的 `this`。


> 译者注：
> 
> 这里首次出现了『内部实例』的概念，理解清楚这个概念很重要。
> 实例大家都懂，就是一个类的实例化后的对象。
> 而『内部』则是相对于协调引擎来说的，协调引擎内部声明的类，就叫做的『内部类』，或者『私有类』，协调引擎和渲染引擎以外的地方用不到它们；而我们研发写的 React 组件，就是『公共类』或『公共组件』，可以理解为相对于协调引擎的『外部类』。由于源码中是用 internal 指代前者，用 public 指代后者，所有本文统一用『内部』来翻译 internal，用『公共』来翻译 public。所以，他们的实例就是『内部实例』和『公共实例』。

我们也把上面的 `mountHost()` 函数重构成了 `DOMComponent` 类的 `mount()` 方法，它们也很相似：

```js
class DOMComponent {
  constructor(element) {
    this.currentElement = element;
    this.renderedChildren = [];
    this.node = null;
  }

  getPublicInstance() {
    // For DOM components, only expose the DOM node.
    return this.node;
  }

  mount() {
    var element = this.currentElement;
    var type = element.type;
    var props = element.props;
    var children = props.children || [];
    if (!Array.isArray(children)) {
      children = [children];
    }

    // Create and save the node
    var node = document.createElement(type);
    this.node = node;

    // Set the attributes
    Object.keys(props).forEach(propName => {
      if (propName !== 'children') {
        node.setAttribute(propName, props[propName]);
      }
    });

    // Create and save the contained children.
    // Each of them can be a DOMComponent or a CompositeComponent,
    // depending on whether the element type is a string or a function.
    var renderedChildren = children.map(instantiateComponent);
    this.renderedChildren = renderedChildren;

    // Collect DOM nodes they return on mount
    var childNodes = renderedChildren.map(child => child.mount());
    childNodes.forEach(childNode => node.appendChild(childNode));

    // Return the DOM node as mount result
    return node;
  }
}
```

重构 `mountHost()` 之后最大的不同是：我们把 `this.node` 和 `this.renderedChildren` 存了起来。当我们将来要实施非破坏性更新的时候会用到。

重构完以后，无论是 `CompositeComponent` 或是 `HostComponent` 的实例，都有一个属性指向它的子代内部实例。为了更直观地看到，我们假设有一个函数组件 `<App>` 渲染了一个类组件 `<Button>`，而 `Button` 类又会渲染一个 `<div>`，这时这些内部实例组成的**内部实例树**看起来就是下面这样：

```js
[object CompositeComponent] {
  currentElement: <App />,
  publicInstance: null,
  renderedComponent: [object CompositeComponent] {
    currentElement: <Button />,
    publicInstance: [object Button],
    renderedComponent: [object DOMComponent] {
      currentElement: <div />,
      node: [object HTMLDivElement],
      renderedChildren: []
    }
  }
}
```

在DOM中你将只能看到`<div>`。但是**内部实例树**里既包含了合成内部实例（上例中的`[object CompositeComponent]`），也包含了宿主内部实例（上例中的`[object DOMComponent]`）。

合成内部实例需要保存下面这些信息：

* 实例化时的参数 element，保存在 `this.currentElement` 里。
* 如果 element.type 是一个类的话，保存这个类的实例（公共实例），保存在 `this.publicInstance` 里。
* 唯一的后代内部实例，可能是 `DOMComponent` 或 `CompositeComponent` 的实例（内部实例），保存在 `this.renderedComponent`。


宿主内部实例需要保存下面这些信息：

* 实例化时的参数 element，保存在 `this.currentElement` 里。
* 当前 element 渲染出来的 node，保存在 `this.node` 里。
* 所有的后代内部实例，每个后代都可能是 `DOMComponent` 或 `CompositeComponent` 的实例（内部实例），保存在 `this.renderedChildren` 里。

如果你很难想象出来一个复杂应用的内部实例树是什么样的，可以借助[React DevTools](https://github.com/facebook/react-devtools) 这个工具，因为它把宿主内部类标记成了灰色，而把合成内部类高亮成了紫色。

 <img src="https://reactjs.org/static/implementation-notes-tree-d96fec10d250eace9756f09543bf5d58-a6f54.png" alt="React DevTools tree" />

为了完成上面的重构，我们还需要一个类似与 `ReactDOM.render()` 的函数，能够把一颗完整的树挂载到一个容器节点（container node）上。这个函数也应该像 `ReactDOM.render()` 一样返回一个公共实例。

```js
function mountTree(element, containerNode) {
  // Create the top-level internal instance
  var rootComponent = instantiateComponent(element);

  // Mount the top-level component into the container
  var node = rootComponent.mount();
  containerNode.appendChild(node);

  // Return the public instance it provides
  var publicInstance = rootComponent.getPublicInstance();
  return publicInstance;
}

var rootEl = document.getElementById('root');
mountTree(<App />, rootEl);
```

### 卸载

现在我们的内部实例保存了他们的后代以及 node 信息，我们可以实施**卸载**了。对于一个 `CompositeComponent` 来说，卸载的动作就是调用了一个生命周期函数，并往后代递归。

```js
class CompositeComponent {

  // ...

  unmount() {
    // Call the lifecycle hook if necessary
    var publicInstance = this.publicInstance;
    if (publicInstance) {
      if (publicInstance.componentWillUnmount) {
        publicInstance.componentWillUnmount();
      }
    }

    // Unmount the single rendered component
    var renderedComponent = this.renderedComponent;
    renderedComponent.unmount();
  }
}
```

For `DOMComponent`, unmounting tells each child to unmount:
对于一个 `DOMComponent` 组件来说，卸载的动作就是告诉它的每一个子代进行卸载。

```js
class DOMComponent {

  // ...

  unmount() {
    // Unmount all the children
    var renderedChildren = this.renderedChildren;
    renderedChildren.forEach(child => child.unmount());
  }
}
```

在真实的场景中，卸载 `DOMComponent` 的同时也要解绑事件和清一些缓存，但是我们现在省略了这些细节。

现在，我们能够添加一个名为 `unmountTree(containerNode)` 的外层函数，跟`ReactDOM.unmountComponentAtNode()` 类似。

```js
function unmountTree(containerNode) {
  // Read the internal instance from a DOM node:
  // (This doesn't work yet, we will need to change mountTree() to store it.)
  var node = containerNode.firstChild;
  var rootComponent = node._internalInstance;

  // Unmount the tree and clear the container
  rootComponent.unmount();
  containerNode.innerHTML = '';
}
```

要让上面的代码生效，我们需要从一个 DOM 节点上读取它的根内部实例节点。我们下面就修改 `mountTree()` 这个函数，给挂载的 DOM 节点加上 `_internalInstance` 属性。我们也同时会在  `mountTree()` 里判断该 DOM 节点上是否已经有后代了，如果有，就把后代删除，这样我们就能在一个 DOM 节点上多次调用 `mountTree()`了。

```js
function mountTree(element, containerNode) {
  // Destroy any existing tree
  if (containerNode.firstChild) {
    unmountTree(containerNode);
  }

  // Create the top-level internal instance
  var rootComponent = instantiateComponent(element);

  // Mount the top-level component into the container
  var node = rootComponent.mount();
  containerNode.appendChild(node);

  // Save a reference to the internal instance
  node._internalInstance = rootComponent;

  // Return the public instance it provides
  var publicInstance = rootComponent.getPublicInstance();
  return publicInstance;
}
```

现在，执行 `unmountTree()` 或者重复执行 `mountTree()`, 就会移除原有的树，并调用组件的 `componentWillUnmount()` 生命周期函数.

### 更新

在前面一节中，我们实现了卸载。但是如果每次属性的修改都会导致整棵树的卸载再挂载的话，React 就没有什么用了。协调引擎的目的就是复用现有的实例，只有这样才能保持住DOM以及组件的state。

```js
var rootEl = document.getElementById('root');

mountTree(<App />, rootEl);
// Should reuse the existing DOM:
mountTree(<App />, rootEl);
```

我们下面给我们的内部实例扩展一个方法。即除了 `mount()` 和 `unmount()`以外，`DOMComponent` 和 `CompositeComponent` 都会实现一个新的方法 `receive(nextElement)`:

```js
class CompositeComponent {
  // ...

  receive(nextElement) {
    // ...
  }
}

class DOMComponent {
  // ...

  receive(nextElement) {
    // ...
  }
}
```

这个方法的任务就是让组件（及其后代）跟传入的 `nextElement` 保持一致。

这部分就是常说的『虚拟DOM Diff』，事实上它做的就是递归遍历我们的内部实例树，并且让每个内部实例都得到更新。

### 更新合成组件

当一个合成组件接收到了新的 element 的时候，我们执行 `componentWillUpdate()` 生命周期函数。

然后我们用新的 props 重新渲染组件，并且得到新的 `rendered element`。
> 译者注：
> 
> 这里出现的 `rendered element` 就是公共组件的实例执行 `render` 函数或者函数组件执行的结果。

```js
class CompositeComponent {

  // ...

  receive(nextElement) {
    var prevProps = this.currentElement.props;
    var publicInstance = this.publicInstance;
    var prevRenderedComponent = this.renderedComponent;
    var prevRenderedElement = prevRenderedComponent.currentElement;

    // Update *own* element
    this.currentElement = nextElement;
    var type = nextElement.type;
    var nextProps = nextElement.props;

    // Figure out what the next render() output is
    var nextRenderedElement;
    if (isClass(type)) {
      // Component class
      // Call the lifecycle if necessary
      if (publicInstance.componentWillUpdate) {
        publicInstance.componentWillUpdate(nextProps);
      }
      // Update the props
      publicInstance.props = nextProps;
      // Re-render
      nextRenderedElement = publicInstance.render();
    } else if (typeof type === 'function') {
      // Component function
      nextRenderedElement = type(nextProps);
    }

    // ...
```
接下来，我们看一下 `rendered element` 的 `type` 值。如果 `type` 值跟上次渲染的时候一样，那该 `type` 值所代表的组件就能在原来的基础上更新了。

比如，一个组件的 `render` 函数上一次返回的结果是 `<Button color="red" />`，下一次返回的结果是 `<Button color="blue" />`，那我们只需要拿下一次的结果，让这个组件对应的内部实例执行 `receive()` 就行了。

```js
    // ...

    // If the rendered element type has not changed,
    // reuse the existing component instance and exit.
    if (prevRenderedElement.type === nextRenderedElement.type) {
      prevRenderedComponent.receive(nextRenderedElement);
      return;
    }

    // ...
```

但是，如果下一次的 `rendered element` 跟上一次的 `type` 值不同，我们就不能在原有的内部实例基础上更新了，因为一个 `<button>` 不能变成一个 `<input>`。

相反的，我们要卸载原有的内部实例，并且根据 `rendered element` 的 `type` 值挂载一个新的内部实例。例如，当一个组件一开始渲染的是 `<button />`，然后又渲染成了 `<input />`。

```js
    // ...

    // If we reached this point, we need to unmount the previously
    // mounted component, mount the new one, and swap their nodes.

    // Find the old node because it will need to be replaced
    var prevNode = prevRenderedComponent.getHostNode();

    // Unmount the old child and mount a new child
    prevRenderedComponent.unmount();
    var nextRenderedComponent = instantiateComponent(nextRenderedElement);
    var nextNode = nextRenderedComponent.mount();

    // Replace the reference to the child
    this.renderedComponent = nextRenderedComponent;

    // Replace the old node with the new one
    // Note: this is renderer-specific code and
    // ideally should live outside of CompositeComponent:
    prevNode.parentNode.replaceChild(nextNode, prevNode);
  }
}
```

总结一下，当一个合成组件接收到了新的 element，要么它会告诉自己渲染出来的内部实例更新，要么就卸载这个内部实例，并在同样的位置挂载一个新的。

除了接收到新的 element 之外，还有另外一种情形是需要一个组件重新挂载的，那就是这个 element 的 `key` 值发生了改变。作为一个介绍文档，本文已经够复杂了，在这里就不讨论 `key` 值的处理了。

请注意，我们需要给内部实例添加一个叫做 `getHostNode()` 的新方法，这样才能在更新的过程中定位宿主节点并或替换它们。对于两个内部类来说，这点实现起来都很简单：

```js
class CompositeComponent {
  // ...

  getHostNode() {
    // Ask the rendered component to provide it.
    // This will recursively drill down any composites.
    return this.renderedComponent.getHostNode();
  }
}

class DOMComponent {
  // ...

  getHostNode() {
    return this.node;
  }  
}
```

### 更新宿主组件

宿主组件（比如 `DOMComponent`）的更新实现跟合成组件是不同的。当它们收到一个新的 element 的时候，它们需要更新宿主环境的视图。对于 React DOM 来说，这意味着它们需要更新 DOM attributes：

```js
class DOMComponent {
  // ...

  receive(nextElement) {
    var node = this.node;
    var prevElement = this.currentElement;
    var prevProps = prevElement.props;
    var nextProps = nextElement.props;    
    this.currentElement = nextElement;

    // Remove old attributes.
    Object.keys(prevProps).forEach(propName => {
      if (propName !== 'children' && !nextProps.hasOwnProperty(propName)) {
        node.removeAttribute(propName);
      }
    });
    // Set next attributes.
    Object.keys(nextProps).forEach(propName => {
      if (propName !== 'children') {
        node.setAttribute(propName, nextProps[propName]);
      }
    });

    // ...
```

然后，宿主组件需要更新它们的后代。不像合成组件只有一个后代，宿主组件可能有多个。

在这个简化版的例子中，我们遍历这个后代内部实例的数组，并根据 `type` 值是否变化来决定是更新还是替换它们。真实的协调引擎也处理了 element 的 `key` 值，并且处理了在插入和删除的时候的移位，但是本文不考虑这些逻辑。

我们把后代的 DOM 操作都收集起来，最后批量执行。

```js
    // ...

    // These are arrays of React elements:
    var prevChildren = prevProps.children || [];
    if (!Array.isArray(prevChildren)) {
      prevChildren = [prevChildren];
    }
    var nextChildren = nextProps.children || [];
    if (!Array.isArray(nextChildren)) {
      nextChildren = [nextChildren];
    }
    // These are arrays of internal instances:
    var prevRenderedChildren = this.renderedChildren;
    var nextRenderedChildren = [];

    // As we iterate over children, we will add operations to the array.
    var operationQueue = [];

    // Note: the section below is extremely simplified!
    // It doesn't handle reorders, children with holes, or keys.
    // It only exists to illustrate the overall flow, not the specifics.

    for (var i = 0; i < nextChildren.length; i++) {
      // Try to get an existing internal instance for this child
      var prevChild = prevRenderedChildren[i];

      // If there is no internal instance under this index,
      // a child has been appended to the end. Create a new
      // internal instance, mount it, and use its node.
      if (!prevChild) {
        var nextChild = instantiateComponent(nextChildren[i]);
        var node = nextChild.mount();

        // Record that we need to append a node
        operationQueue.push({type: 'ADD', node});
        nextRenderedChildren.push(nextChild);
        continue;
      }

      // We can only update the instance if its element's type matches.
      // For example, <Button size="small" /> can be updated to
      // <Button size="large" /> but not to an <App />.
      var canUpdate = prevChildren[i].type === nextChildren[i].type;

      // If we can't update an existing instance, we have to unmount it
      // and mount a new one instead of it.
      if (!canUpdate) {
        var prevNode = prevChild.node;
        prevChild.unmount();

        var nextChild = instantiateComponent(nextChildren[i]);
        var nextNode = nextChild.mount();

        // Record that we need to swap the nodes
        operationQueue.push({type: 'REPLACE', prevNode, nextNode});
        nextRenderedChildren.push(nextChild);
        continue;
      }

      // If we can update an existing internal instance,
      // just let it receive the next element and handle its own update.
      prevChild.receive(nextChildren[i]);
      nextRenderedChildren.push(prevChild);
    }

    // Finally, unmount any children that don't exist:
    for (var j = nextChildren.length; j < prevChildren.length; j++) {
     var prevChild = prevRenderedChildren[j];
     var node = prevChild.node;
     prevChild.unmount();

     // Record that we need to remove the node
     operationQueue.push({type: 'REMOVE', node});
    }

    // Point the list of rendered children to the updated version.
    this.renderedChildren = nextRenderedChildren;

    // ...
```

最后一步是执行所有的 DOM 操作。再声明一次，真实的协调引擎代码比下面的更复杂，因为它还处理了 DOM 移位的逻辑。

```js
    // ...

    // Process the operation queue.
    while (operationQueue.length > 0) {
      var operation = operationQueue.shift();
      switch (operation.type) {
      case 'ADD':
        this.node.appendChild(operation.node);
        break;
      case 'REPLACE':
        this.node.replaceChild(operation.nextNode, operation.prevNode);
        break;
      case 'REMOVE':
        this.node.removeChild(operation.node);
        break;
      }
    }
  }
}
```

这就是更新宿主组件的全部实现了。

### 最外层更新

现在内部类 `CompositeComponent` 和 `DOMComponent` 都实现了 `receive(nextElement)` 方法，我们就可以修改最外层的 `mountTree()` 函数去使用它了，当然前提是 element 的 `type` 值得跟上次是一样的：

```js
function mountTree(element, containerNode) {
  // Check for an existing tree
  if (containerNode.firstChild) {
    var prevNode = containerNode.firstChild;
    var prevRootComponent = prevNode._internalInstance;
    var prevElement = prevRootComponent.currentElement;

    // If we can, reuse the existing root component
    if (prevElement.type === element.type) {
      prevRootComponent.receive(element);
      return;
    }

    // Otherwise, unmount the existing tree
    unmountTree(containerNode);
  }

  // ...

}
```

现在传入同一个 `type` 值调用 `mountTree()` 两次就不会摧毁原来的DOM树了。

```js
var rootEl = document.getElementById('root');

mountTree(<App />, rootEl);
// Reuses the existing DOM:
mountTree(<App />, rootEl);
```

这基本上就是 React 的工作原理了。


### 我们遗漏了什么

这篇文章是真实代码的简化版，我们没有涉及下面这些重要的点：

* 组件可以渲染 `null`，协调引擎会处理数组里和渲染结果里的空值。

* 协调引擎会读取 element 的 `key` 值，并通过 `key` 值设定内部实例和 element 的对应关系。真实 React 实现中的很大一部分复杂度都跟此相关。

* 除了合成内部类和宿主内部类以外，还有针对文本组件和空组件的内部类。它们分别代表文本节点和 `null` 渲染出来的『空槽』。

* 渲染引擎是通过[注入](https://reactjs.org/docs/codebase-overview.html#dynamic-injection)的方式把内部宿主类传给的协调引擎。例如，DOM 渲染引擎告诉协调引擎用 `ReactDOMComponent` 作为内部宿主类.

* 更新一组后代的逻辑被抽象成了一个叫做 `ReactMultiChild` 的 mixin，这个 mixin 同时被 React DOM 和 React Native 的宿主内部类使用。

* 协调引擎同样实现了合成组件的 `setState()` 方法。并且，在事件回调函数里执行的多次更新会被放在一个批处理中只更新一次。

* 渲染引擎同样处理了合成组件和宿主节点 refs 的绑定和解绑。

* DOM挂载完成后的生命周期函数如 `componentDidMount()` 和 `componentDidUpdate()`，会被收集到一个『回调队列』中批量处理。

* React 把当前更新的信息放在了一个叫做 "transaction" 的内部对象上。Transactions 很适合追踪类似生命周期函数队列、包含报警信息的 DOM 以及任何对于一个更新来说是全局的信息。Transactions 同样保证了 React 在更新的『善后工作』。比如，React DOM 提供的 transaction 类会在更新后恢复一个 input 框的 selection 状态。

### 源码传送门

* [`ReactMount`](https://github.com/facebook/react/blob/83381c1673d14cd16cf747e34c945291e5518a86/src/renderers/dom/client/ReactMount.js) 就是本文中 `mountTree()` 和 `unmountTree()` 所在的位置。它负责挂载或卸载最顶层的组件。 [`ReactNativeMount`](https://github.com/facebook/react/blob/83381c1673d14cd16cf747e34c945291e5518a86/src/renderers/native/ReactNativeMount.js) 是 React Native 的版本。

* [`ReactDOMComponent`](https://github.com/facebook/react/blob/83381c1673d14cd16cf747e34c945291e5518a86/src/renderers/dom/shared/ReactDOMComponent.js) 就是本文中的 `DOMComponent`。它是 React DOM 渲染引擎的宿主类。[`ReactNativeBaseComponent`](https://github.com/facebook/react/blob/83381c1673d14cd16cf747e34c945291e5518a86/src/renderers/native/ReactNativeBaseComponent.js) 是 React Native 的版本.

* [`ReactCompositeComponent`](https://github.com/facebook/react/blob/83381c1673d14cd16cf747e34c945291e5518a86/src/renderers/shared/stack/reconciler/ReactCompositeComponent.js) 就是本文的 `CompositeComponent`。它负责调用用户定义的组件，并维持这些组件的状态。

* [`instantiateReactComponent`](https://github.com/facebook/react/blob/83381c1673d14cd16cf747e34c945291e5518a86/src/renderers/shared/stack/reconciler/instantiateReactComponent.js) 包含为一个 element 选择正确的内部实例类的功能。它就是本文的 `instantiateComponent()`。

* [`ReactReconciler`](https://github.com/facebook/react/blob/83381c1673d14cd16cf747e34c945291e5518a86/src/renderers/shared/stack/reconciler/ReactReconciler.js) 包含了 `mountComponent()`，`receiveComponent()`，和 `unmountComponent()` 方法。它的功能是调用内部实例的实现，也会包含一些所有内部实例实现所共用的代码。

* [`ReactChildReconciler`](https://github.com/facebook/react/blob/83381c1673d14cd16cf747e34c945291e5518a86/src/renderers/shared/stack/reconciler/ReactChildReconciler.js) 实现了根据后代 element 的 `key` 值挂载、更新和卸载逻辑。

* [`ReactMultiChild`](https://github.com/facebook/react/blob/83381c1673d14cd16cf747e34c945291e5518a86/src/renderers/shared/stack/reconciler/ReactMultiChild.js) 实现了后代的插入、删除和移位的操作队列的处理，它是独立与渲染引擎的。

* 由于历史原因，在 React 的源码里 `mount()`，`receive()`，`unmount()` 这些方法其实叫做 `mountComponent()`，`receiveComponent()` 和 `unmountComponent()`。

* 内部实例的属性都以下划线开头，如 `_currentElement`。它们在源码中被看做是只读的公共字段。

### 未来的方向

堆协调引擎有一些固有的缺陷，比如它是同步的，并且不能够打断或切成不同的 chunks。一个[新的 Fiber reconciler](/react/contributing/codebase-overview.html#fiber-reconciler)正在开发中，它有着[完全不同的架构](https://github.com/acdlite/react-fiber-architecture)。将来，我们打算用它来代替堆协调引擎。
