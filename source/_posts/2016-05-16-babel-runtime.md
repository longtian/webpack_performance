---
title: 合并 Babel 助手方法
date: 2016-05-16 17:51:35
tags:
---

`Babel` 在转换一个文件的时候会加上一些助手方法，这些助手方法会完成诸如创建类，检查类构造函数调用等功能。
其实就是用 `ES5` 来实现 `ES6` 相关特性的代码。

这些代码如果每个文件生成的时候都带上，必然会增加项目打包结果的整体大小。
因此 `Babel` 项目单独抽出了一个模块叫做 `babel-runtime`。用于存放公共助手方法。

<!-- more -->

[具体的介绍可以看这个链接](https://github.com/thejameskyle/babel-handbook/blob/master/translations/zh-Hans/user-handbook.md#babel-runtime)

## 启用前后的差别

**引入 `BabelRuntime` 前**

2,915,331 bytes

**引入 `BabelRuntime` 后**

2,992,866 bytes

减少了 77 KB

## 开启 Gzip 后，效果就不那么明显了

**引入 `babel-runtime` 前，`Gzip` 压缩结果**

808,753 bytes

**引入 `babel-runtime` 后，`Gzip` 压缩结果**

803,013 bytes

只减少了 5 kb，可见 `Gzip` 在压缩字符串的时候还是很给力的。

## 其它技术细节

除了合并 Babel 助手方法， `babel-runtime` 还有其他两个作用

- 使用 `generator/sync` 的时候自动加载 `babel-runtime/regenerator` 依赖
- 使用 `Promise` 和 `Object.assign` 的时候自动加载 `babel-runtime/core-js`

[原文](http://babeljs.io/docs/plugins/transform-runtime/#technical-details)
