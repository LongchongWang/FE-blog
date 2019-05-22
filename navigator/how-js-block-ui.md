# Why Could JS Block the UI Thread And How to Avoid It?
## Background Knowledge
- JS is an one-thread programming language and use [Event Loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop) to handle concurrent(并发).
- The UI updates and interactions are handled in the [same main thread](https://taligarsiel.com/Projects/howbrowserswork1.htm), and could be (block by JS)[https://medium.com/@francesco_rizzi/javascript-main-thread-dissected-43c85fce7e23].