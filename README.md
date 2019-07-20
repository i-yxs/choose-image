# choose-image
===========================
uniapp流畅拖拽动画的图像选择插件<br>

使用方法：
---------------------------
1、复制到pages目录下的choose-image文件夹到你的项目pages下
2、在pages.json中加入以下配置
```javascript
{
    "path": "pages/choose-image/index",
        "style": {
        "app-plus": {
            "bounce": "none"
        },
        "disableScroll": true
    }
}
```
3、在main.js文件里设置全局对象
`url参数传递的内容大小有限制，所以使用全局对象传递`
```javascript

Vue.prototype = Object.assign(Vue.prototype, {
    globalData: {},
});

```
4、在需要选择图片的页面中的onShow生命周期中加入下面的代码
```javascript

//this.imageList为你的图片列表，[图片路径(String),....]
if (this.globalData.ImagePathList) {
    this.imageList = this.globalData.ImagePathList;
    this.globalData.ImagePathList = null;
}

```
5、选择图片按钮事件中加入下面的代码
```javascript

this.globalData.ImagePathList = this.imageList;
uni.navigateTo({
    url: '/pages/choose-image/index'
});

```
