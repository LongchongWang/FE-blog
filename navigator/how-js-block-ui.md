# Why Could JS Block the UI Thread And How to Avoid It?
## Background Knowledge
- JS is an one-thread programming language and use [Event Loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop) to handle concurrent(并发).
- The UI updates and interactions are handled in the [same main thread](https://taligarsiel.com/Projects/howbrowserswork1.htm), and could be (block by JS)[https://medium.com/@francesco_rizzi/javascript-main-thread-dissected-43c85fce7e23].
- The solution to this blocking could be [Web Workers](http://jessecravens.com/blog/2011/12/11/hack-82-web-wokers-basics-of-the-web-browsers-ui-thread).
