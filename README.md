# Webpack 性能优化 （一）

`Webpack` 是前端利器，它一出现便惊艳四座，如果你还不了解它，建议你阅读这篇 [Webpack 入门指迷](http://segmentfault.com/a/1190000002551952) 。
`Webpack` 也是 OneAPM 前端技术栈中很重要的一部分，我们用它 *****　，接下来的日子里将通过一些列的文章，分享我们在使用 Webpack 过程中的经验。

## 本地时钟的例子

要实现的功能很简单，就是在页面上用中文显示当前时间，需要用到 `moment` 这个库。

## 实现

新建一个 `entry.js` 作为入口文件，当然你也可以用 `app.js` 这样的名字，只是大部分的 webpack 的示例都是用的是 `entry.js`。

```js
var moment = require('moment');
document.write(moment().locale('zh-cn').format('LLLL'));
```

新建一个页面 `index.html`, 引用 `bundle.js` 

```html
<body>
<h5>当前时间:</h5>
<script src="dist/bundle.js"></script>
</body>
```

新建一个　package.json 文件，并加上 moment 的依赖

```
  "devDependencies": {
    "moment": "^2.10.3"
  }
```

是的，接下来的工作就交给 `webpack` 来完成。

## 00. 最简单的方式

在命令行执行 `webpack`

```
webpack --entry ./entry.js --output-path dist --output-file bundle.js
```

输出结果:

```
Hash: bf9007fb1e0cb30e3ef7
Version: webpack 1.10.0
Time: 650ms
    Asset    Size  Chunks             Chunk Names
bundle.js  378 kB       0  [emitted]  null
   [0] ./entry.js 125 bytes {0} [built]
    + 86 hidden modules
```

耗时：650ms

## 01. 输出详细信息

在命令行执行

```
#!/usr/bin/env bash
webpack --entry ./entry.js --output-path dist --output-file bundle.js \
--colors \
--profile \
--display-modules
```

其中参数的含义分别是：

- `--colors` 彩色输出
- `--profile` 输出性能
- `--display-modules` 默认隐藏


## 02.alias

`alias` 是 webpack 的一个功能，它的作用是为 user request 指定一个其它的路径

```
  resolve: {
    alias: {
        moment: "moment/min/moment-with-locales.min.js"
    }
  }
```

待打包的脚本中的 `require('moment');`, 被替换成了 `require('moment/min/moment-with-locales.min.js');`

```
Hash: cdea65709b783ee0741a
Version: webpack 1.10.0
Time: 320ms
    Asset    Size  Chunks             Chunk Names
bundle.js  148 kB       0  [emitted]  main
   [0] ./entry.js 125 bytes {0} [built]
       factory:11ms building:9ms = 20ms
   [1] ../~/moment/min/moment-with-locales.min.js 146 kB {0} [built] [1 warning]
       [0] 20ms -> factory:8ms building:263ms = 291ms
   [2] (webpack)/buildin/module.js 251 bytes {0} [built]
       [0] 20ms -> [1] 271ms -> factory:3ms building:1ms = 295ms

WARNING in ../~/moment/min/moment-with-locales.min.js
Module not found: Error: Cannot resolve 'file' or 'directory' ./locale in /home/yan/webstorm/webpack_performance/node_modules/moment/min
 @ ../~/moment/min/moment-with-locales.min.js 1:2731-2753
```

耗时：320ms

## 03 `alias` + `noParse`

`noParse` 是 `webpack` 的另一个功能，如果你 **确定一个模块中没有新的依赖** 就可以配置这项

```
  resolve: {
    alias: {
        moment: "moment/min/moment-with-locales.min.js"
    }
  },
  module: {
    noParse: [/moment-with-locales/]
  }
```

```
Hash: 907880ed7638b4ed70b9
Version: webpack 1.10.0
Time: 76ms
    Asset    Size  Chunks             Chunk Names
bundle.js  147 kB       0  [emitted]  main
   [0] ./entry.js 125 bytes {0} [built]
       factory:13ms building:13ms = 26ms
   [1] ../~/moment/min/moment-with-locales.min.js 146 kB {0} [built]
       [0] 26ms -> factory:13ms building:5ms = 44ms
```

耗时: 76ms

## 04 `externals`

`webpack`是如此的强大，用其打包的脚本可以运行在多种环境下，Web 环境只是默认的一种。

```
  externals: {
    moment: "var moment"
  }
```

```
Hash: 50f92af8097a14fd5d08
Version: webpack 1.10.0
Time: 49ms
    Asset     Size  Chunks             Chunk Names
bundle.js  1.62 kB       0  [emitted]  main
   [0] ./entry.js 125 bytes {0} [built]
       factory:15ms building:10ms = 25ms
    + 1 hidden modules
``` 

耗时: 49ms