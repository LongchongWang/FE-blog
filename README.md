# FE-blog

This blog contains 

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

If it is hard to understand, see how ECMAscript evaluates the argument(s) of functions:
```javascript
function fun(arr) {
  arr.push(1);
  arr = [2];
}
let tar = [];
fun(tar);
console.log(tar); // [1]
```
The strategy used by ECMAscript is [call-by-sharing](https://en.wikipedia.org/wiki/Evaluation_strategy#Call_by_sharing)(also referred to as call-by-object or call-by-object-sharing), which evaluates the reference of an object and passes its copy to functions. What if the arguments are primitive values? ECMAscript also evaluates their values and passes over copies of those values. Except ECMAscript, call-by-sharing is also used by Python, Java, Ruby, Scheme, AppleScript and many others.

But people in community used to say ECMAscript and Java uses [call-by-value](https://en.wikipedia.org/wiki/Evaluation_strategy#Call_by_value) strategy. Well, strict call-by-value strategy means deep copies of arguments will be evaluated and passed when they are non-primitive, and this is what happens in C and C++ when pass structures to a function. Therefore, there will be big performance issues when non-primitive values are the main data carriers for function arguments. Obviously, this strategy is more safe because we don't need to worry about modifying an origin object unconsciously by pass it to functions.

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
function asyncMathPow(a, b) {
  return async function() {
    return Math.pow(a, b);
  }
}
// thunk has been created
const thunk = asyncMathPow(importantNumA, importantNumB);
// now thunk is ready to passed by
async function consoleMathPow(thk) {
  thk().then(value => console.log(value));
}
consoleMathPow(thunk);
```

We create a thunk to restore a calculation or a request for data or anything else, and we are able to pass and apply this thunk whenever and wherever we need.