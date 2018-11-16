# FE-blog

When I started my Front-End developer career (from animal nutritionist), I was 27 years old. I knew nearly nothing about programming, let alone confusing terminology, design pattern and algorithm. Now I have enough knowledge to find a FE-developer job. But it's still far far away to go. My plan is simple: **conquer terminology one by one, conquer design pattern one by one, conquer algorithm one by one, no rash and no worry**. Let's do this together.
- [FE-blog](#fe-blog)
  - [ECMAScript Standard Features](#ecmascript-standard-features)
    - [Number](#number)
    - [String](#string)
    - [Array](#array)
    - [Function](#function)
    - [Plain Object](#plain-object)
  - [Computer Programming Terminology](#computer-programming-terminology)
    - [Evaluation Strategy](#evaluation-strategy)
    - [Thunk](#thunk)


## ECMAScript Standard Features
### Number
### String
### Array
### Function
### Plain Object

## Computer Programming Terminology
### Evaluation Strategy
> ### [Wikipedia](https://en.wikipedia.org/wiki/Evaluation_strategy)
> Evaluation strategies are used by programming languages to determine when to evaluate the argument(s) of a function call (for function, also read: operation, method, or relation) and what kind of value to pass to the function. 

If it is hard to understand by the definition above, see how ECMAscript evaluates the argument(s) of functions as example:
```javascript
function fun(arr) {
  arr.push(1);
  arr = [2];
}
let tar = [];
fun(tar);
console.log(tar); // [1]
```
The strategy used by ECMAscript is [call-by-sharing](https://en.wikipedia.org/wiki/Evaluation_strategy#Call_by_sharing)(also referred to as call-by-object or call-by-object-sharing), which evaluates the reference of an object and passes its copy to functions. Therefore, function could have access to origin object by that reference copy, but this accessibility will lost after reassign the argument's reference. What if the arguments are primitive values? ECMAscript also evaluates their values and passes over copies of those values. Except ECMAscript, call-by-sharing is also used by Python, Java, Ruby, Scheme, AppleScript and many others.

But people in community used to say ECMAscript and Java uses [call-by-value](https://en.wikipedia.org/wiki/Evaluation_strategy#Call_by_value) strategy. Well, strict call-by-value strategy means that deep copies of arguments will be evaluated and passed when they are non-primitive, and this is what happens in C and C++ when pass structures to a function. Therefore, there will be serious performance issues when non-primitive values are the main data carriers for function arguments. Obviously, this strategy is more safe because we don't need to worry about modifying an origin object unconsciously by pass it to functions.

Another similar strategy is [call-by-reference](https://en.wikipedia.org/wiki/Evaluation_strategy#Call_by_reference), which pass the variable's reference (not copy of value) to function. This typically means that the function can modify (i.e. assign to) the variable used as argument — something that will be seen by (or impacted on) its caller. Call-by-reference can therefore be used to provide an additional channel of communication between the called function and the calling function.

Strategies call-by-sharing, call-by-value and call-by-reference are all strict evaluation, which always evaluate arguments to a function before the function is applied. On contrary, in non-strict evaluation arguments to a function are not evaluated unless they are actually used in the evaluation of the function body. For instance, [call-by-name](https://en.wikipedia.org/wiki/Evaluation_strategy#Call_by_name) is a lazy strategy in which arguments are substituted into the function body and left to be evaluated wherever they appear in the function. If a function's argument is never used in the function body, they won't be evaluated neither. However, when the function argument is used, call-by-name is often slower, requiring a mechanism such as a **thunk**. 

### Thunk
> ### [Wikipedia](https://en.wikipedia.org/wiki/Thunk)
> In computer programming, a thunk is a subroutine used to inject an additional calculation into another subroutine. Thunks are primarily used to delay a calculation until its result is needed, or to insert operations at the beginning or end of the other subroutine. 

Thunk have a variety of applications in compiler code generation, modular programming and functional programming. See how and why to create a thunk in js:
```javascript
// image we have two important and big numbers
// we need to calculate the power one on the other asynchronously
const importantNumA = 2, importantNumB = 3;
// thunk creator
function asyncMathPow() {
  return async function() {
    return Math.pow(importantNumA, importantNumB);
  }
}
// thunk has been created
const thunk = asyncMathPow();
// now thunk is ready to passed by
async function consoleMathPow(thk) {
  thk().then(value => console.log(value));
}
consoleMathPow(thunk);
```

We create a thunk to restore a calculation or a request for data or anything else, and we are able to pass and apply this thunk whenever and wherever we need.
