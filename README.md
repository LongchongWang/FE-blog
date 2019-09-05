# FE-blog

When I started my Front-End developer career (from animal nutritionist), I was 27 years old. I knew nearly nothing about programming, let alone confusing terminology, design pattern and algorithm. Now I have enough knowledge to find a FE-developer job. But it's still far far away to go. My plan is simple: **conquer terminology one by one, conquer design pattern one by one, conquer algorithm one by one, no rash and no worry**. Let's do this together.
- [FE-blog](#FE-blog)
  - [ECMAScript Standard Features](#ECMAScript-Standard-Features)
    - [Number](#Number)
      - [Why is it called a floating point number?](#Why-is-it-called-a-floating-point-number)
      - [How numbers are encoded in JavaScript](#How-numbers-are-encoded-in-JavaScript)
      - [What's the range of the exponent part](#Whats-the-range-of-the-exponent-part)
      - [JS如何存0.1](#JS%E5%A6%82%E4%BD%95%E5%AD%9801)
      - [JS数字运算的舍入误差](#JS%E6%95%B0%E5%AD%97%E8%BF%90%E7%AE%97%E7%9A%84%E8%88%8D%E5%85%A5%E8%AF%AF%E5%B7%AE)
      - [如何解决舍入误差](#%E5%A6%82%E4%BD%95%E8%A7%A3%E5%86%B3%E8%88%8D%E5%85%A5%E8%AF%AF%E5%B7%AE)
      - [大数危机](#%E5%A4%A7%E6%95%B0%E5%8D%B1%E6%9C%BA)
      - [双精度可以表示的最大的整数和最小的整数分别是多少？](#%E5%8F%8C%E7%B2%BE%E5%BA%A6%E5%8F%AF%E4%BB%A5%E8%A1%A8%E7%A4%BA%E7%9A%84%E6%9C%80%E5%A4%A7%E7%9A%84%E6%95%B4%E6%95%B0%E5%92%8C%E6%9C%80%E5%B0%8F%E7%9A%84%E6%95%B4%E6%95%B0%E5%88%86%E5%88%AB%E6%98%AF%E5%A4%9A%E5%B0%91)
    - [String](#String)
    - [Array](#Array)
    - [Function](#Function)
    - [Plain Object](#Plain-Object)
  - [Computer Programming Terminology](#Computer-Programming-Terminology)
    - [Evaluation Strategy](#Evaluation-Strategy)
    - [Thunk](#Thunk)
  - [Tools to Make Life Easier](#Tools-to-Make-Life-Easier)
    - [JSON Schema](#JSON-Schema)


## ECMAScript Standard Features
### Number
#### Why is it called a floating point number?
The term **floating point** is derived from the fact that there is no fixed number of digits before and after the decimal point; that is, the decimal point can float.
#### How numbers are encoded in JavaScript
JavaScript numbers are all floating point, stored according to the [IEEE 754](https://en.wikipedia.org/wiki/IEEE_754) standard. That standard has several formats. JavaScript uses binary64 or double precision(*双精度*). As the former name indicates, numbers are stored in a binary format, in 64 bits. These bits are allotted as follows: The fraction(*尾数*) occupies bits 0 to 51, the exponent(*指数*) occupies bits 52 to 62, the sign occupies bit 63.


|  sign    |exponent       |fraction|
|:--------:|:-------------:|:------:|
| 1bit     |  11bit        | 52 bit |
| 63       |  62 - 52      | 0 - 51 |


The components work as follows: If the sign bit is 0, the number is positive, otherwise negative. Roughly, the fraction contains the digits of a number, while the exponent indicates where the point is.
```
// binary notation
Number n = (sign) * (fraction) * (2^(exponent - 1023))
```
#### What's the range of the exponent part
指数部分一共有11个bit位存储，可以表示从0到2047一共2048个数。其中，0 和 2047有特殊含义，其他2046个数值减去1023得到最终的指数值。例如：


|binary|value|exponent|
|-----:|----:|-------:|
|000 0000 0001 | 1    | -1022|
|111 1111 1110 | 2046 | 1023 |
|011 1111 1111 | 1023 | 0    |


> 如果value(binary) = 0，则根据fraction部分确定其含义：
> - value(fraction) = 0，表示0
> - value(fraction) > 0，表示subnormal数字(第53位是0，且exponent = -1022)

> 如果value(binary) = 2047，则根据fraction部分确定其含义：
> - value(fraction) = 0，表示无穷大
> - value(fraction) > 0，表示NaN

#### JS如何存0.1
我们可以用toString(2)来输出二进制数字。如下：
```
const a = 0.1;
console.log(a.toString(2));
// "0.0001100110011001100110011001100110011001100110011001101"
// 用科学记数法表示就是 1 * 1.00110011001100110011001100110011001100110011001101 * 2^-4
// sign = 0
// value(exponent) = -4
// value(fraction) = 1100 1100 1100 1100 1100 1100 1100 1100 1100 1100 1100 1100 1101
```
但其实，上述fraction表示的真实值是`0.100000000000000005551`，那为什么我们输出a的时候打印出来的仍然是0.1呢？因为53位的二进制对应的10进制精度是16（`2^53=9007199254740992`，共16位）。所以，默认运算结果都是转化成了16位精度的十进制。所以，0.1就表示成为了`0.1000000000000000`。
可以通过调用Number.prototype.toPrecision(n)并复制n不同的数值（0-100）展示不同的精度表示。例如：
```
console.log(a.toPrecision(16))
// 0.1000000000000000
console.log(a.toPrecision(21))
// 0.100000000000000005551
```
#### JS数字运算的舍入误差
除了少量的小数（比如0.5， 0.25， 0.125等等以及他们的组合）可以被准确的存储外，其他小数（如0.1）必须四舍五入至53位精度，53位之外的二进制被四舍五入了，因此造成了误差。数学运算其实就是存储在内存中的二进制进行运算后，再保存至53位精度的结果。
#### 如何解决舍入误差
误差不是运算产生的，而是输入值本身和存储中间值产生的。所以，解决舍入误差的关键在于消除中间值的误差。普通数学运算对于安全整数是完备的、准确的，因此大概的思路是先把原始运算值转成整数运算，然后
再对整数的计算结果进行最终的回形计算。

- 第一步：浮点数变形为整数
- 第二步：整数运算
- 第三部：回形运算结果

> 简单的乘法转型整数有bug。例如：`1.005 * 1000 = 1004.9999999999999`，而我们期望是`1005`。所以，必须配合使用Math.round()或toPrecision()。

> `toFixed`也有bug，例如`1.005.toFixed(2) = 1.00`，而我们期望是`1.01`。造成这个bug的原因是1.005存在内存里的值其实是`1.00499999999999989`。因此如果要修改值得精度
> 也需要配合toPrecision()。

#### 大数危机
在淘宝早期的订单系统中把订单号当作数字处理，后来随意订单号暴增，已经超过了
9007199254740992，最终的解法是把订单号改成字符串处理。现在 TC39 已经有一个 Stage 3 的提案[proposal bigint](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)，大数问题有问彻底解决。

双精度浮点型数字能表示最大的安全数字范围是：`-2^53 + 1 ~ 2^53 - 1`，超出范围的数字因为精度的限制会逐步丧失最后一位精度。比如：
```
Math.pow(2, 53) === Math.pow(2, 53) + 1
Math.pow(2, 53) + 2 - (Math.pow(2, 53) + 1) === 2
Math.pow(2, 53) + 3 === Math.pow(2, 53) + 4 === Math.pow(2, 53) + 5
```
(2^53, 2^54) 之间的数会两个选一个，只能精确表示偶数
(2^54, 2^55) 之间的数会两个选一个，只能精确表示4的倍数
(2^55, 2^56) 之间的数会两个选一个，只能精确表示8的倍数
.
.
.
#### 双精度可以表示的最大的整数和最小的整数分别是多少？
根据exponent的取值范围(-1022, 1023)，可以粗略地得出结论：JS可以表示的最大取值范围是二进制表示法 2^1024 ~ ^1024。但并不是


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

## Tools to Make Life Easier
### JSON Schema
**JSON Schema** is written in JSON to describe and validate the structure or format of other JSON data. 
- Learn **JSON Schema** [here](http://json-schema.org/understanding-json-schema/index.html)
- Test **JSON Schema** [here](https://jsonschema.net/)

Below is a JSON Schema example which include mostly used rules.
```json
{
  "$schema": "https://json-schema.org/draft-07/json-schema-release-notes.html",
  "$id": "https://www.myproject.com/schemas/activity.json",
  "definitions": {
    "address": {
      "$id": "#address",
      "type": "object",
      "properties": {
        "street_address": { "type": "string" },
        "city":           { "type": "string" },
        "state":          { "type": "string" }
      },
      "required": ["street_address", "city", "state"]
    },
    "person": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "children": {
          "type": "array",
          "items": { "$ref": "#/definitions/person" },
          "default": []
        },
        "billing_address": { "$ref": "#address" },
        "shipping_address": {
          "allOf": [
            { "$ref": "#/definitions/address" },
            { 
              "properties": { 
                "type": { "enum": [ "residential", "business" ] } 
              },
              "required": ["type"]
            }
          ]
        }
      }
    }
  },

  "type": "object",

  "properties": {
    "activity": {
      "type": "object",
      "properties": {
        "activityId": {
          "type": "number",
          "minimum": 0,
          "maximum": 100,
          "exclusiveMinimum": true,
          "exclusiveMaximum": false,
          "multipleOf": 1
        },
        "activityTitle": {
          "type": "string",
          "minLength": 2,
          "maxLength": 30,
          "pattern": "^activity{0-9}*_test&"
        },
        "activityImg": {
          "type": "string",
          "format": "email"
        },
        "hasStart": {
          "type": "boolean"
        }
      },
      "propertyNames": {
        "pattern": "^[A-Za-z_][A-Za-z0-9_]*$"
      },
      "additionalProperties": { "type": "string" },
      "required": ["activityId", "activityTitle"]
    },
    "invitee": {
      "type": "array",
      "items": { "$ref": "#/definitions/person" }
    }
  }
}
```
