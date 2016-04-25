# Webpack 关键指标监控

## 前言

`吃自己的狗食` 是一个很有趣的文化。意思大致就是鼓励 IT 企业要使用自己的产品。比如淘宝每次发布新的版本前都会在
公司内部做一个测试。通过 `吃自己的狗食` 可以及早的发现程序中的问题。

### 背景介绍

CloudInsight 是 OneAPM 在 2016 年初正式发布的一款性能监控的产品。它的前端采用了 React 来编写。
并使用 Webpack 来打包。每次前端发版的时候必须在程序员的电脑上 check out 最新代码，然后运行一些列的脚本。
在经历了两次加班到九点以后，我们觉得很有必要把打包的过程自动化。

## 数据采集

无论是 Webpack, Grunt 还是 Gulp, 它们都有一个很显著的特点，就是极易于扩展。对这样的工具来说，开发插件的简易程度
有的时候直接决定了这套工具能获得多么广泛的生态系统。

因此，要取得 Webpack 打包过程中的指标可以优先考虑使用插件的方式。

## 编写 Webpack 插件

Webpack 官网上有一篇详细的文章指导开发者如何编写 Webpack 插件

http://webpack.github.io/docs/how-to-write-a-plugin.html

摘录 HelloWorld 插件的代码如下：

```js
function HelloWorldPlugin(options) {
  // Setup the plugin instance with options...
}

HelloWorldPlugin.prototype.apply = function(compiler) {
  compiler.plugin('done', function() {
    console.log('Hello World!');
  });
};

module.exports = HelloWorldPlugin;
```

只需要实现 apply 方法即可。在 apply 方法中可以监听 Webpack 的各种事件。


|事件名|描述|
|------|-----|
|done| 完成 |

### 选择时间点

Compiler 有点像一个 EventEmitter。打包完成的时候会触发一个 done 事件，我们只要监听这个事件就可以。

```js
compiler.plugin('done', function (compilation) {

});
```

回调的第一个参数是 compilation ，包含了这次打包几乎所有的信息。

例如要获得打包过程中的所有警告的个数：

```js
compilation.toJson().warnings.length
```

这样我们就得到了一个指标：

```txt
webpack.warnings.count
```

那么哪些是我们需要重点关注的指标呢

## 定义指标

| 指标  | 介绍 |
|------|------|
|webpack.asset.kb_size|单个输出文件的大小|
|webpack.assets.count|输出文件的个数|
|webpack.assets.sum.kb_size|输出文件的合计大小|
|webpack.chunks.count|分块总计|
|webpack.errors.count|错误个数|
|webpack.warnings.count|警告个数|
|webpack.modules.count|模块个数|
|webpack.time.ms|构建时间|

## 标签系统

`avg:webpack.asset.kb_size {name=main.js}`

`avg:webpack.asset.kb_size`

|-------|-------|
|builder|打包的机器|
|env    |环境     |

## 数据展现

## 自定义参数

## 生成报表

## 处理 stats.js