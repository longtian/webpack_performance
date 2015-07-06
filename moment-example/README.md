# Webpack 性能优化 （一）

## 前言

Webpack 是 OneAPM 前端技术栈中很重要的一部分，它非常好用，如果你还不了解它，建议你阅读这篇 [Webpack 入门指迷](http://segmentfault.com/a/1190000002551952) 
，在 OneAPM 我们用它打包前端的很多静态资源，在接下来的日子里，我们将通过一些列的文章和业界分享我们在使用 Webpack 过程中关于性能方面的经验。

### 必要的准备

- 需要你有一定的 Node.js 基础
- 电脑上装有 webpack 的最新版本 

### 例子：本地时钟

要实现的功能很简单，就是在页面上用中文显示当前时间，需要用到 [`moment`](http://momentjs.com/) 这个库，这个库封装了很多和日期相关的函数，而且自带了国际化的支持。

### 新建一个 Node.js 项目

使用 `npm init` 初始化你的项目，然后通过 `npm install moment -D` 加上 `moment` 的开发者依赖。

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

此时的文件目录看起来是这样的

```text
index.html
package.json
entry.js
node_modules/moment/**
```

到目前为止 `bundle.js` 这个文件还不存在，不过别着急，接下来的工作就交给 `webpack` 来完成。

```text
index.html  ------------------------+               
package.json                        |               
                                    +--> <Clock App>
entry.js    --------+               |               
                    +-->bundle.js+--+               
node_modules/moment-+                                                                                                      
```       

Webpack 会把 `entry.js` 和 `moment` 模块一起打包成一个 bundle.js 文件。怎么样，是不是已经听到 Clock App 滴答作响了！

### 使用 webpack 打包代码

在命令行执行：

```
webpack --entry ./entry.js --output-path dist --output-file bundle.js
```

你会看到类似下面的输出结果:

```
Hash: bf9007fb1e0cb30e3ef7
Version: webpack 1.10.0
Time: 650ms
    Asset    Size  Chunks             Chunk Names
bundle.js  378 kB       0  [emitted]  null
   [0] ./entry.js 125 bytes {0} [built]
    + 86 hidden modules
```

可以看到，耗时 650ms，这么慢着实让人意外，一定要想办法提高速度；另一方面，最后一行的 `+ 86 hidden modules` 非常让人怀疑：明明是一个简单的 Clock App，怎么会有这么多的依赖。

## 如何快速定位 Webpack 速度慢的原因

再一次，在命令行输入：

```
webpack --entry ./entry.js --output-path dist --output-file bundle.js \
--profile \
--colors \
--display-modules
```

不过这次新增加了三个参数，这三个参数的含义分别是：

- `--profile` 输出性能数据，可以看到每一步的耗时
- `--colors` 输出结果带彩色，比如：会用红色显示耗时较长的步骤
- `--display-modules` 默认情况下 `node_modules` 下的模块会被隐藏，加上这个参数可以显示这些被隐藏的模块

这次命令行的结果已经很有参考价值，可以帮助我们定位耗时比较长的步骤

```
Hash: bf9007fb1e0cb30e3ef7
Version: webpack 1.10.0
Time: 650ms
    Asset    Size  Chunks             Chunk Names
bundle.js  378 kB       0  [emitted]  null
   [0] ./entry.js 125 bytes {0} [built]
       factory:11ms building:8ms = 19ms
   [1] ../~/moment/moment.js 102 kB {0} [built]
       [0] 19ms -> factory:7ms building:141ms = 167ms
   [2] (webpack)/buildin/module.js 251 bytes {0} [built]
       [0] 19ms -> [1] 148ms -> factory:132ms building:159ms = 458ms
   [3] ../~/moment/locale ^\.\/.*$ 2.01 kB {0} [optional] [built]
       [0] 19ms -> [1] 148ms -> factory:6ms building:10ms dependencies:113ms = 296ms
   [4] ../~/moment/locale/af.js 2.57 kB {0} [optional] [built]
       [0] 19ms -> [1] 148ms -> [3] 16ms -> factory:52ms building:65ms dependencies:138ms = 438ms
                  ..... 广告分割线，Node.js 工程师简历请发 nodejs@oneapm.com ......
   [85] ../~/moment/locale/zh-cn.js 4.31 kB {0} [optional] [built]
        [0] 22ms -> [1] 162ms -> [3] 18ms -> factory:125ms building:145ms dependencies:22ms = 494ms
   [86] ../~/moment/locale/zh-tw.js 3.07 kB {0} [optional] [built]
        [0] 22ms -> [1] 162ms -> [3] 18ms -> factory:126ms building:146ms dependencies:21ms = 495ms
```

从命令行的结果里可以看到从 Request[4] 到 Request[86] 都是在解析 moment.js 附带的大量本地化文件。所以我们遇到的速度慢的问题其实是由 `moment` 引起的。

> 如果你想知道为什么 webpack 会加载这么多的模块，可以参考这篇文章 [ Why Enormous Locales During Webpack MomentJS](https://github.com/wyvernnot/webpack_performance/tree/master/moment-example/WHY_LOCALES.md)

我们再来看看 `entry.js` 代码的第一行,标准的 `CommonJS` 写法:

```
var moment = require('moment');
```

也就是说，Require 的是 `moment` 的源码。实际上，通过 NPM 安装 `moment` 的时候会同时安装 `moment` 的源码和压缩后的代码，利用这点，通过试验证明下面这种写法也是可行的：

```
var moment = require('moment/min/moment-with-locales.min.js');
```

只不过这样改，可读性会有所下降。并且，如果同样的问题出现在第三方模块中的时候，修改别人代码就不那么方便了。下面来看看用 `webpack` 怎么解决这个问题。

### 在 Webpack 中使用别名

别名（`resolve.alias`） 是 `webpack` 的一个功能，它的作用是把用户的一个依赖请求重定向到另一个路径，例如通过修改 `webpack` 配置文件，加入：

```
  resolve: {
    alias: {
        moment: "moment/min/moment-with-locales.min.js"
    }
  }
```

这样待打包的脚本中的 `require('moment');` 其实就等价于 `require('moment/min/moment-with-locales.min.js');` 。通过别名的使用在本例中可以减少几乎一半的时间

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

### 在 Webpack 中忽略对已知文件的解析

`module.noParse` 是 `webpack` 的另一个很有用的功能，如果你 **确定一个模块中没有新的依赖** 就可以配置这项

```
  module: {
    noParse: [/moment-with-locales/]
  }
```

这样修改，再结合前面重命名的例子，当 `webpack` 遇到 `moment` 依赖的时候，首先重定向到 `moment-with-locales`，不会再去解析 m

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

时间进一步被压缩到 76ms

### 在 Webpack 中使用公用 CDN

`webpack` 是如此的强大，用其打包的脚本可以运行在多种环境下，Web 环境只是默认的一种。

另一方面，CDN 服务。配置

```
  externals: {
    moment: "var moment"
  }
```

当然了代码里需要加上一行
```
<script src="//apps.bdimg.com/libs/moment/2.8.3/moment-with-locales.min.js"></script>
```

这次结果是
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