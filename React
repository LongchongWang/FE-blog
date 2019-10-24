## React源码解读（一）：v15.6.2中的设计策略

### 一、现在都快2020年了，为什么还要研读React15.6.2?

#### 1. React15本身是个很优秀的前端项目
React v15.6.2发布于2017年9月26日，v16.0.0发布于2017年9月25日。没错儿，只差一天。固然，React16要比React15有[很大优势](https://reactjs.org/blog/2017/09/26/react-v16.0.html)，但React15也是facebook前端团队从2013年开创React项目以来前端智慧的集大成者，并帮助React走向神坛，本身很值得花时间学习。

#### 2. 看懂React15后再去看React16会收获的更多
从源码的角度，React16相对于React15来说，重写了React核心的reconciler部分（好吧，这几乎等于[重写了React](https://code.facebook.com/posts/1716776591680069/react-16-a-look-inside-an-api-compatible-rewrite-of-our-frontend-ui-library/)）。为什么要重写？React16解决了React15的哪些痛点？相信读了React15以后，我们再去读React16的实现，将会理解的更加深刻和透彻。

#### 3. React15还应用于很多前端项目
我刚接手的两个项目就是基于React15开发的（好吧，我承认，这是我选择先读React15的主要原因）。



### 二、为什么要先了解React v15.6.2源码（以下简称：React源码）中的设计策略？
在回答这个问题之前，我想先跟你聊聊克里斯托弗·诺兰执导的电影《记忆碎片》。在你不知道诺兰的叙事策略之前，有多少人能在第一遍看完电影后就对整个故事的发生顺序有了清晰的了解？如果我告诉你：全片共用了 45 段“记忆碎片”，23 段彩色画面时间顺序为倒叙，22 段黑白片段时间顺序为顺叙，在影片中将“碎片”排列为：45，1，44，2，43，3，42，4，41，5，40，….. 21，24，22，23，故事的开头与结尾在电影前两个片段已经表明，电影的结尾处却是中间部分。好了，现在让你再去看一次电影，你是不是有豁然开朗的感觉。

**设计策略至于React源码，就相当于叙事策略之于《记忆碎片》。**

希望你读了本篇文章以后再去读React源码，也能有豁然开朗的感觉。




### 三、React源码中有哪些设计策略对我阅读源码有帮助？

#### 1. Haste模块系统
**Haste**是Facebook公司内部使用的自研模块系统。Haste跟CommonJs类似，需要使用`require()`来引入模块。但是，Haste有两点需要特别关注的地方：
1. 所有模块名是全局唯一的。
2. require()的参数只传模块名，而不是相对或绝对路径。

我们以入口文件`React.js`为例：
```javascript
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule React
 */

'use strict';

var ReactBaseClasses = require('ReactBaseClasses');
var ReactChildren = require('ReactChildren');
var ReactDOMFactories = require('ReactDOMFactories');
var ReactElement = require('ReactElement');
var ReactPropTypes = require('ReactPropTypes');
var ReactVersion = require('ReactVersion');

var createReactClass = require('createClass');
var onlyChild = require('onlyChild');

// 此处省略若干行...

var React = {
  // 此处省略若干行...

  Component: ReactBaseClasses.Component,
  PureComponent: ReactBaseClasses.PureComponent,
  
  // 此处省略若干行...
};

// 此处省略若干行...

module.exports = React;
```
其中，React.js的文件路径是`src/React.js`，而模块`ReactBaseClasses`的文件路径是`src/isomorphic/modern/class/ReactBaseClasses.js`。而源码中，只需调用`require('ReactBaseClasses')`而非`require('./isomorphic/modern/class/ReactBaseClasses.js')`即可引入该模块。

> Haste的原理是什么？
> 如果你看过一点点源码，你会发现所有的模块头部都会有相似的注释，包括版权信息以及`@providesModule XXX`。所有这些模块最终都会打包进一个lib文件夹里，并且require调用的模块名前都会加上`./`字符。

`src/React.js`打包后的路径是`build/packages/react/lib`，内容如下：

```javascript
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

var _assign = require('object-assign');

var ReactBaseClasses = require('./ReactBaseClasses');
var ReactChildren = require('./ReactChildren');
var ReactDOMFactories = require('./ReactDOMFactories');
var ReactElement = require('./ReactElement');
var ReactPropTypes = require('./ReactPropTypes');
var ReactVersion = require('./ReactVersion');

var createReactClass = require('./createClass');
var onlyChild = require('./onlyChild');


// 此处省略若干行...

var React = {
  // 此处省略若干行...

  Component: ReactBaseClasses.Component,
  PureComponent: ReactBaseClasses.PureComponent,
  
  // 此处省略若干行...
};

// 此处省略若干行...

module.exports = React;
```

**Tips：源码中require一个模块，只需全局搜模块名即可找到对应文件。**



#### 2. Injection逻辑注入
我们先看一个完整的模块（`src/renderers/shared/stack/reconciler/ReactEmptyComponent.js`）代码：
```javascript
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ReactEmptyComponent
 */

'use strict';

var emptyComponentFactory;

var ReactEmptyComponentInjection = {
  injectEmptyComponentFactory: function(factory) {
    emptyComponentFactory = factory;
  },
};

var ReactEmptyComponent = {
  create: function(instantiate) {
    return emptyComponentFactory(instantiate);
  },
};

ReactEmptyComponent.injection = ReactEmptyComponentInjection;

module.exports = ReactEmptyComponent;

```
React源码中经常会出现这种诡异的写法：初始化为`undefined`或者`null`的变量，看不到哪里赋值，就直接用了。只能看到模块内部有一个`injection`方法，但这个injection方法在哪里调用也很不直观。我发现存在这样写法的模块都用以下三个共同点：
1. 模块所在的路径中必定有`share`层级，`share`在React源码中的定位是共享的代码。对，聪明的你肯定猜到了就是ReactDom、ReactNative、ReactService等共享的代码。
2. 模块导出都是一个对象，且对象里都有`injection`属性，属性值是一个`***Injection`方法或是多个`***Injection`方法组成的对象（见问题二答案代码）。
3. 模块导出的对象里还有一个核心功能的属性（本例中就是`create`属性）,是公开给其他模块调用的。


**由此可见，这样的模块在多端有统一的应用场景，但是又有不同的实现逻辑。**

那么问题是：这样的模块有哪些？这些injection方法是在什么时候被调用的呢？我通过简单又直接的源码来回答这两个问题。


**问题一、这样的模块有哪些？**
**答案：`src/renderers/dom/shared/ReactInjection.js`**
```javascript
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ReactInjection
 */

'use strict';

var DOMProperty = require('DOMProperty');
var EventPluginHub = require('EventPluginHub');
var EventPluginUtils = require('EventPluginUtils');
var ReactComponentEnvironment = require('ReactComponentEnvironment');
var ReactEmptyComponent = require('ReactEmptyComponent');
var ReactBrowserEventEmitter = require('ReactBrowserEventEmitter');
var ReactHostComponent = require('ReactHostComponent');
var ReactUpdates = require('ReactUpdates');

var ReactInjection = {
  Component: ReactComponentEnvironment.injection,
  DOMProperty: DOMProperty.injection,
  EmptyComponent: ReactEmptyComponent.injection,
  EventPluginHub: EventPluginHub.injection,
  EventPluginUtils: EventPluginUtils.injection,
  EventEmitter: ReactBrowserEventEmitter.injection,
  HostComponent: ReactHostComponent.injection,
  Updates: ReactUpdates.injection,
};

module.exports = ReactInjection;

```
从上述代码中可以看出，除了`ReactEmptyComponent`模块以外，还有`DOMProperty`、`EventPluginHub`、`EventPluginUtils`、`ReactComponentEnvironment`、`ReactBrowserEventEmitter`、`ReactHostComponent`、`ReactUpdates`共8个模块。


**问题二、这些injection方法是在什么时候被调用的呢？**
**答案：对于`ReactDom`来说，调用这些注入函数是在`src/renderers/dom/shared/ReactDefaultInjection.js`，对于`ReactNative`来说是`src/renderers/native/ReactNativeDefaultInjection.js`。** 我们就看看`ReactDom`的代码吧：
```javascript
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ReactDefaultInjection
 */

'use strict';

var ARIADOMPropertyConfig = require('ARIADOMPropertyConfig');
var BeforeInputEventPlugin = require('BeforeInputEventPlugin');
var ChangeEventPlugin = require('ChangeEventPlugin');
var DefaultEventPluginOrder = require('DefaultEventPluginOrder');
var EnterLeaveEventPlugin = require('EnterLeaveEventPlugin');
var HTMLDOMPropertyConfig = require('HTMLDOMPropertyConfig');
var ReactComponentBrowserEnvironment = require('ReactComponentBrowserEnvironment');
var ReactDOMComponent = require('ReactDOMComponent');
var ReactDOMComponentTree = require('ReactDOMComponentTree');
var ReactDOMEmptyComponent = require('ReactDOMEmptyComponent');
var ReactDOMTreeTraversal = require('ReactDOMTreeTraversal');
var ReactDOMTextComponent = require('ReactDOMTextComponent');
var ReactDefaultBatchingStrategy = require('ReactDefaultBatchingStrategy');
var ReactEventListener = require('ReactEventListener');
var ReactInjection = require('ReactInjection');
var ReactReconcileTransaction = require('ReactReconcileTransaction');
var SVGDOMPropertyConfig = require('SVGDOMPropertyConfig');
var SelectEventPlugin = require('SelectEventPlugin');
var SimpleEventPlugin = require('SimpleEventPlugin');

var alreadyInjected = false;

function inject() {
  // 此处省略若干行...

  ReactInjection.EventEmitter.injectReactEventListener(ReactEventListener);

  /**
   * Inject modules for resolving DOM hierarchy and plugin ordering.
   */
  ReactInjection.EventPluginHub.injectEventPluginOrder(DefaultEventPluginOrder);
  ReactInjection.EventPluginUtils.injectComponentTree(ReactDOMComponentTree);
  ReactInjection.EventPluginUtils.injectTreeTraversal(ReactDOMTreeTraversal);

  /**
   * Some important event plugins included by default (without having to require
   * them).
   */
  ReactInjection.EventPluginHub.injectEventPluginsByName({
    SimpleEventPlugin: SimpleEventPlugin,
    EnterLeaveEventPlugin: EnterLeaveEventPlugin,
    ChangeEventPlugin: ChangeEventPlugin,
    SelectEventPlugin: SelectEventPlugin,
    BeforeInputEventPlugin: BeforeInputEventPlugin,
  });

  ReactInjection.HostComponent.injectGenericComponentClass(ReactDOMComponent);

  ReactInjection.HostComponent.injectTextComponentClass(ReactDOMTextComponent);

  ReactInjection.DOMProperty.injectDOMPropertyConfig(ARIADOMPropertyConfig);
  ReactInjection.DOMProperty.injectDOMPropertyConfig(HTMLDOMPropertyConfig);
  ReactInjection.DOMProperty.injectDOMPropertyConfig(SVGDOMPropertyConfig);

  ReactInjection.EmptyComponent.injectEmptyComponentFactory(function(
    instantiate,
  ) {
    return new ReactDOMEmptyComponent(instantiate);
  });

  ReactInjection.Updates.injectReconcileTransaction(ReactReconcileTransaction);
  ReactInjection.Updates.injectBatchingStrategy(ReactDefaultBatchingStrategy);

  ReactInjection.Component.injectEnvironment(ReactComponentBrowserEnvironment);
}

module.exports = {
  inject: inject,
};

```

可以看到，所有注入的逻辑也在这个文件里了。该模块导出了一个`{ inject: inject }`对象，这里的`inject`方法则完成了所有的注入逻辑的动作。


**问题三、最终的inject方法是在哪里被调用的呢？**
**答案：`src/renderers/dom/ReactDOM.js`**
```javascript
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ReactDOM
 */

/* globals __REACT_DEVTOOLS_GLOBAL_HOOK__*/

'use strict';

var ReactDefaultInjection = require('ReactDefaultInjection');
var ReactMount = require('ReactMount');
// 此处省略若干行...
ReactDefaultInjection.inject();

// 这是个ReactDom模块定义的地方，该文件只是一个index入口文件。
var ReactDOM = {
  render: ReactMount.render,
  // 此处省略若干行...
};

// 此处省略若干行...

module.exports = ReactDOM;

```
原来，注入逻辑函数`inject`就在`ReactDOM`模块里调用了。也就是说，我们在`import ReactDom from 'react-dom'`，初始化ReactDom时，执行了注入逻辑。

**Tips: 当你找不到注入的逻辑时，就打开 `ReactDefaultInjection.js` 文件看看吧。**



#### 3. PooledClass对象池
PooledClass（对象池，杜撰的翻译，如果有更好或更权威的，欢迎打脸），顾名思义，就是给一个类创建一个池子用于存放实例化的对象。每当用完一个对象以后，就放回池子里；每当需要实例化一个对象的时候，先看看池子里是否有对象，如果有就复用，没有再通过new创建。

这样做的目的是为了复用同类对象，从而减少垃圾回收的压力，节约内存。

*Talk is cheap, show me the code.*
```javascript
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule PooledClass
 */

'use strict';

// 此处省略若干行...

var oneArgumentPooler = function(copyFieldsFrom) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, copyFieldsFrom);
    return instance;
  } else {
    return new Klass(copyFieldsFrom);
  }
};

// 此处省略若干行...

var standardReleaser = function(instance) {
  var Klass = this;
  
  instance.destructor();
  if (Klass.instancePool.length < Klass.poolSize) {
    Klass.instancePool.push(instance);
  }
};

var DEFAULT_POOL_SIZE = 10;
var DEFAULT_POOLER = oneArgumentPooler;

var addPoolingTo = function(CopyConstructor, pooler) {
  var NewKlass = CopyConstructor;
  NewKlass.instancePool = [];
  NewKlass.getPooled = pooler || DEFAULT_POOLER;
  if (!NewKlass.poolSize) {
    NewKlass.poolSize = DEFAULT_POOL_SIZE;
  }
  NewKlass.release = standardReleaser;
  return NewKlass;
};

var PooledClass = {
  addPoolingTo: addPoolingTo
};

module.exports = PooledClass;

```
`PooledClass`主要对外提供了addPoolingTo方法，通过调用`addPoolingTo(CopyConstructor)`，可以给构造函数`CopyConstructor`添加三个属性：
1. `instancePool`，类型：`array`；作用：对象池子。
    *用于存储回收后的对象。*
2. `getPooled`，类型：`function`；作用：创建或复用对象。
    *如果池子里有对象，则获取池子里的一个对象，并通过 `this.call` 初始化。否则通过 `new` 关键字创建。*
3. `release`，类型：`function`；作用：回收。
    *调用实例对象的 `destructor` 方法重置自己（因此想要使用 `PooledClass.addPoolingTo` 的构造函数的原型必须要有 `destructor` 方法），然后，如果对象池子还没满(默认10个就满了)，就把重置后的对象放回池子。*

> 对象池比较有名的应用场景是[合成事件](https://reactjs.org/docs/events.html#event-pooling)，之所以有名，是因为`PooledClass`后的合成事件有坑（请自行搜索`nullify`，我也会在合成事件的文章里详细阐述）。

**Tips: `XXX.getPooled()` 可以理解为 `new XXX()`。**

#### 4. Transaction事务管理
事务管理是众多React源码解析的文章中被介绍最多的知识点之一。所谓『事务』，就是一系列动作的有序集合。

如果你接触过数据库，那么你对事务一定也不陌生（如果没接触过，就忽略这一段吧）：当要进行一系列数据库读写操作来完成一个业务功能的时候，需要先启动一个事务，当执行完所有读写操作以后再进行提交。

其实React『事务管理』的思想很简单，我们来看一个程序猿和一个产品妹子的对话：
> 妹子：要做个事情A，做A之前需要先做准备工作S，做完A后又要做收尾工作E
> 程序猿：不就是按照`S-A-E`整套流程做一遍嘛，简单。专业点说，这一系列操作就叫做一个事务（得意中...）。
> 妹子：但是我有可能想要在做A之前，要做S1、S2、S3，做完A之后的收尾工作有E1、E2、E3，并且S和E是成对儿存在的。
> 程序猿：好吧，可能也没那么简单。不过这也不难，我依次执行`S1-S2-S3-A-E1-E2-E3`就好了。这一长串操作也是一个事务。
> 妹子：但是S1其实也是个复杂的过程，用你的话来说，也是一个事务。它的主要工作是SA1，但是要在SA1之前执行SS1，SA1之后执行SE1。
> 程序猿：（内心戏：WTF！难道还要事务嵌套事务吗？）明白了，执行A这个事务的整体流程就是`SS1-SA1-SE1-S2-S3-A-E1-E2-E3`，也就是事务嵌套，我需要设计一个好的方案来管理这些事务，待我回去研究一下再给你答复吧。
> 
> 程序猿回到工位立马打开了React源码，半个小时后，他自信地找产品妹子去了。

React是怎么实现这样的事务管理来解决上面的问题的呢？React源码的注释写的很清晰，我也加入了自己的翻译。
```javascript
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule Transaction
 */

'use strict';

/**
 * `Transaction` creates a black box that is able to wrap any method such that
 * `Transaction`创造了一个用于包裹任何函数的黑盒子，
 * certain invariants are maintained before and after the method is invoked
 * 这个黑盒子的作用是：在这个函数实行前后对一些【不变量】进行维护
 * (Even if an exception is thrown while invoking the wrapped method). Whoever
 * （哪怕被包裹的函数在执行的过程中抛出了异常）。无论谁
 * instantiates a transaction can provide enforcers of the invariants at
 * 实例化了一个`transaction`，他都能够定义 在特定时机 对这些【不变量】的操作。
 * creation time. The `Transaction` class itself will supply one additional
 * 这个`Transaction`类本身也为你提供了一个额外的【不变量】
 * automatic invariant for you - the invariant that any transaction instance
 * - 即任何`transaction`实例在执行的过程中
 * should not be run while it is already being run. You would typically create a
 * 不能被再次启动执行的【定律（不变量）】。通常，你会创建一个
 * single instance of a `Transaction` for reuse multiple times, that potentially
 * `Transaction`类的实例，并重复利用它。这个实例很可能
 * is used to wrap several different methods. Wrappers are extremely simple -
 * 被用于包裹多个不同的函数。包裹者的工作非常的简单 - 
 * they only require implementing two methods.
 * 他们只需提供两个方法即可。
 * 
 * <pre>
 *                       wrappers (injected at creation time)
 *                                      +        +
 *                                      |        |
 *                    +-----------------|--------|--------------+
 *                    |                 v        |              |
 *                    |      +---------------+   |              |
 *                    |   +--|    wrapper1   |---|----+         |
 *                    |   |  +---------------+   v    |         |
 *                    |   |          +-------------+  |         |
 *                    |   |     +----|   wrapper2  |--------+   |
 *                    |   |     |    +-------------+  |     |   |
 *                    |   |     |                     |     |   |
 *                    |   v     v                     v     v   | wrapper
 *                    | +---+ +---+   +---------+   +---+ +---+ | invariants
 * perform(anyMethod) | |   | |   |   |         |   |   | |   | | maintained
 * +----------------->|-|---|-|---|-->|anyMethod|---|---|-|---|-|-------->
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | +---+ +---+   +---------+   +---+ +---+ |
 *                    |  initialize                    close    |
 *                    +-----------------------------------------+
 * </pre>
 *
 * Use cases:
 * 使用场景：
 * - Preserving the input selection ranges before/after reconciliation.
 *   Restoring selection even in the event of an unexpected error.
 *   在调和（reconciliation）先/后，预存输入框的选择范围。
 *   哪怕当出现了不可预知的错误时进行恢复选择的操作。
 * - Deactivating events while rearranging the DOM, preventing blurs/focuses,
 *   while guaranteeing that afterwards, the event system is reactivated.
 *   在处理dom的时候使事件系统失效，阻止失焦/聚焦，
 *   同时保证在处理dom完成后，重新激活事件系统
 * - Flushing a queue of collected DOM mutations to the main UI thread after a
 *   reconciliation takes place in a worker thread.
 *   当发生在worker线程的调和动作完成后，将一系列DOM改动冲入主UI线程
 * - Invoking any collected `componentDidUpdate` callbacks after rendering new
 *   content.
 *   渲染新内容后调用所有相关的`componentDidUpdate`
 * - (Future use case): Wrapping particular flushes of the `ReactWorker` queue
 *   to preserve the `scrollTop` (an automatic scroll aware DOM).
 *   （未来应用场景）：包裹特定的`ReactWorker`队列冲洗操作，来预存`scrollTop`。
 * - (Future use case): Layout calculations before and after DOM updates.
 *   （未来应用场景）：DOM更新前后的布局计算。
 *
 * Transactional plugin API:
 * - A module that has an `initialize` method that returns any precomputation.
 * - and a `close` method that accepts the precomputation. `close` is invoked
 *   when the wrapped process is completed, or has failed.
 *
 * @param {Array<TransactionalWrapper>} transactionWrapper Wrapper modules
 * that implement `initialize` and `close`.
 * @return {Transaction} Single transaction for reuse in thread.
 *
 * @class Transaction
 */
var TransactionImpl = {
  getTransactionWrappers: null,

  initializeAll: function() {
    // 此处省略若干行...
  },

  perform: function() {
    // 此处省略若干行...
  },

  closeAll: function() {
    // 此处省略若干行...
  },
  // 此处省略若干行...
};

module.exports = TransactionImpl;

```
`Transaction.js`定义了一个接口(并不是一个构造函数或者类)，这个接口包含四个重要的方法：
1. `getTransactionWrappers`，实现类必须重写，作用：获取wrappers，每个wrapper都是一个对象，需要包含一个initialize方法和一个close方法。
2. `initializeAll`，无需重写，作用：依次调用所有wrappers的initialize方法。
3. `perform`，无需重写，作用：1. 调用`initializeAll`，2. 执行被包裹的目标函数，3. 调用`closeAll`。
4. `closeAll`，无需重写，作用：依次调用所有wrappers的close方法。


那么React是怎么用这个接口的呢？我们以`ReactReconcileTranaction.js`为例：
```javascript
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ReactReconcileTransaction
 */

'use strict';

var PooledClass = require('PooledClass');
var ReactBrowserEventEmitter = require('ReactBrowserEventEmitter');
var ReactInputSelection = require('ReactInputSelection');
var Transaction = require('Transaction');

// 此处省略若干行...

var SELECTION_RESTORATION = {
  initialize: ReactInputSelection.getSelectionInformation,
  close: ReactInputSelection.restoreSelection,
};

var EVENT_SUPPRESSION = {
  initialize: function() {
    var currentlyEnabled = ReactBrowserEventEmitter.isEnabled();
    ReactBrowserEventEmitter.setEnabled(false);
    return currentlyEnabled;
  },
  close: function(previouslyEnabled) {
    ReactBrowserEventEmitter.setEnabled(previouslyEnabled);
  },
};

var ON_DOM_READY_QUEUEING = {
  initialize: function() {
    // 此处省略若干行...
  },
  close: function() {
    // 此处省略若干行...
  },
};

var TRANSACTION_WRAPPERS = [
  SELECTION_RESTORATION,
  EVENT_SUPPRESSION,
  ON_DOM_READY_QUEUEING,
];

function ReactReconcileTransaction(useCreateElement) {
  this.reinitializeTransaction();
}

var Mixin = {
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  },
  destructor: function() {
    CallbackQueue.release(this.reactMountReady);
    this.reactMountReady = null;
  },
  // 此处省略若干行...
};

Object.assign(ReactReconcileTransaction.prototype, Transaction, Mixin);

PooledClass.addPoolingTo(ReactReconcileTransaction);

module.exports = ReactReconcileTransaction;

```
上述代码导出的`ReactReconcileTranaction`类就是实现了`TransactionImpl`接口的一个事务管理器。可以看到，通过Mixin里的`getTransactionWrappers`方法重写接口里的`getTransactionWrappers`，完成了`SELECTION_RESTORATION`, `EVENT_SUPPRESSION`, `ON_DOM_READY_QUEUEING`三个`wrappers`的注入。我们可以不用理会具体每个wrapper都做了什么，只需明白每个wrapper必须提供`initialize`和`close`方法即可。

代码里的`PooledClass.addPoolingTo`和`destructor`还记得他们的作用吗？

**Tips: `XXxTransaction.perform(method, a, b, ...)` 可以理解为 `method(a, b, ...)`。**

#### 5. Try-Finally异常处理大法
作为一个成熟的库，React内部会处理非常多的异常，异常处理的方式直接关系到使用者debug的效率。

大部分情况下，如果出现异常，React v15.6.2直接会把异常抛出，程序挂掉。但是在少数场景，异常抛出并不立即让程序挂掉。

比如上节我们提到的事务处理中的异常处理就是这种情况，如果我们通过一个事务管理器的`perform`执行的函数抛出了异常，这个事务管理器依然可以正常的运行`closeAll`方法。我们知道通过`try-finally`就可以做到。但是如果try代码块里出现了异常，finally代码块里很可能也会出现异常，React究竟会优先抛出哪个异常呢？我们来看`TransactionImpl.perform`的代码：
```javascript
// TransactionImpl.perform源码
function(method, scope, a, b, c, d, e, f): G {
  var errorThrown;
  var ret;
  try {
    // Catching errors makes debugging more difficult, so we start with
    // errorThrown set to true before setting it to false after calling
    // close -- if it's still set to true in the finally block, it means
    // one of these calls threw.
    errorThrown = true;
    this.initializeAll(0);
    ret = method.call(scope, a, b, c, d, e, f);
    errorThrown = false;
  } finally {
    try {
      if (errorThrown) {
        // If `method` throws, prefer to show that stack trace over any thrown
        // by invoking `closeAll`.
        try {
          this.closeAll(0);
        } catch (err) {}
      } else {
        // Since `method` didn't throw, we don't want to silence the exception
        // here.
        this.closeAll(0);
      }
    } finally {
      this._isInTransaction = false;
    }
  }
  return ret;
}
```
可以看到，第一个try代码块里将变量`errorThrown`赋值为`true`，并且执行了`this.initializeAll(0)`和`ret = method.call(scope, a, b, c, d, e, f)`。如果这两步操作中抛出了异常，那么`errorThrown`就会一直是`true`，从而在finally的代码块里就会catch`this.closeAll(0)`产生的异常，这样就会抛出第一个try代码块里产生的异常。


**Tips：读源码的初期，建议忽略具体的异常处理（泪奔中...）。**


### 四、写在最后
这是我自己读React源码系列的第一篇文章，相信认真读完的大佬们对React v15.6.2中使用的设(qi)计(ji)策(yin)略(qiao)有了大概的了解，这对于我们深入React的具体逻辑有很大帮助。
