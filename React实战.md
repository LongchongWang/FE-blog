# React + Redux实战技巧

作为UI层（View）的React，必须要结合类似Redux的状态管理工具进行数据层（Model）的管理。本篇列举了React + Redux的实战技巧。

- 组件中尽量不维护state，全部交给Redux。没有state的组件也被成为傻瓜组件，通过react-redux提供的connect函数包装傻瓜组件后，生成聪明组件（又叫容器组件）。聪明组件负责数据交互，傻瓜组件负责UI渲染。
- react的性能优化只能集中在视图更新过程（生成和删除无法优化）。更新过程分为virtualDom的计算以及Dom树渲染。virtualDom到真实Dom的渲染过程是react-dom负责，所以优化的空间就是要避免无谓的virtualDom计算。这时候就要用到shouldComponentUpdate去尝试阻止。connect函数生成的容器组件加入了shouldComponentUpdate优化，但只是浅比较（shallow），或者叫===比较。所以就要避免使用字面量对象、字面量数组或者匿名函数作为组件的属性，因为每次渲染该组件的父组件后，必定生成一个新的对象、字面量数组或者匿名函数，就会引起改组件的无谓渲染。
- 把文件按照功能或者逻辑阻止在一起，每个文件夹里包括actionType.js, action.js, reducer.js, component.js, index.js。其中actionType.js, action.js和reducer.js仅包含组件逻辑。整个文件夹通过index.js统一导出action.js（供其他组件调用）、reducer.js（供store.js调用生成store）和component.js。