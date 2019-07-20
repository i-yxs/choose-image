<template>
    <div class="image-choose">
        <div class="scroll-wrap">
            <scroll-view class="scroll-view" :scroll-y="hasScroll">
                <div class="tips-text">长按图片，可拖动排序</div>
                <div class="image-back-list" :data-delete="hasDelectAction">
                    <block v-for="(item,idx) in imageList" :key="idx">
                        <div class="image-back-item"
                             :style="{
                        top:item.viewRect.top+'px',
                        left:item.viewRect.left+'px',
                        width:item.viewRect.width+'px',
                        height:item.viewRect.height+'px'
                     }"></div>
                    </block>
                </div>
                <div class="image-drag-list" :data-drag="hasDragAction" :data-delete="hasDelectAction">
                    <div class="image-drag-item" v-for="(item,idx) in imageList" :key="idx">
                        <div class="image-drag-view"
                             :class="item.class"
                             :data-idx="idx"
                             @touchstart="onTouchStart"
                             @touchmove="onTouchMove"
                             @touchend="onTouchEnd"
                             @click="onPreviewImage(item.path)">
                            <div class="image-drag-title" v-if="idx===0">首图</div>
                            <div class="image-drag-delete" @click.stop="onDelete(idx)"></div>
                        </div>
                    </div>
                    <div class="image-drag-button" v-if="hasAddButton">
                        <div class="image-drag-view" @click="onChooseImage">
                            <div class="icon"></div>
                            <div class="desc">选择图片</div>
                        </div>
                    </div>
                </div>
                <div class="image-view-list">
                    <block v-for="(item,idx) in imageList">
                        <div class="image-view-item"
                             :class="[{draging:item.hasDrag},{actioning:item.hasAction},{deleteing:item.hasDelete}]"
                             :style="{
                            top:item.viewRect.top+'px',
                            left:item.viewRect.left+'px',
                            width:item.viewRect.width+'px',
                            height:item.viewRect.height+'px',
                            transform:'translate3d('+item.touchX+'px,'+item.touchY+'px,0)'
                        }"
                             :data-animate="item.hasAnimate">
                            <!--#ifndef APP-PLUS-->
                            <div class="image-view-move"
                                 :style="{
                                backgroundImage:'url('+item.path+')',
                                transform:'scale3d('+item.scale+','+item.scale+',1)'
                            }">
                            </div>
                            <!--#endif-->
                            <!--APP端不支持用背景图片方式显示从本地选择的图片，但是用image标签显示会有性能问题，排序完后有概率出现闪烁-->
                            <!--#ifdef APP-PLUS-->
                            <image class="image-view-move" mode="aspectFill"
                                   :src="item.path"
                                   :style="{transform:'scale3d('+item.scale+','+item.scale+',1)'}"></image>
                            <!--#endif-->
                        </div>
                    </block>
                </div>
            </scroll-view>
        </div>
        <div class="fixed-button" @click="onConfirm">完成</div>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                imageList: [],
                //最大选择数量
                maxCount: 9,
                //是否可以滚动
                hasScroll: true,
                //当前是否正在进行拖拽排序操作
                hasDragAction: false,
                //当前是否正在进行删除操作
                hasDelectAction: false,
            }
        },
        computed: {
            //是否显示选择图片按钮
            hasAddButton() {
                return this.imageList.length < this.maxCount;
            },
        },
        methods: {
            //初始化图片数据
            initImageData(list) {
                list = list.map(path => {
                    let data = {
                        index: this.imageList.length,
                        //当前元素的缩放值
                        scale: 1,
                        //当前元素的坐标值
                        touchX: 0,
                        touchY: 0,
                        //当前元素的临时矩形盒子
                        tempRect: {
                            top: 0,
                            left: 0,
                            width: 0,
                            height: 0,
                        },
                        //当前元素的真实矩形盒子
                        viewRect: {
                            top: 0,
                            left: 0,
                            width: 0,
                            height: 0,
                        },
                        path: path,
                        tempPath: path,
                        hasDrag: 0,
                        hasDelete: 0,
                        hasAnimate: -1,
                        class: `item${this.increment}`
                    };
                    this.increment++;
                    this.imageList.push(data);
                    return data;
                });
                this.$nextTick(() => {
                    list.forEach((item, idx) => {
                        this.getRectBox(item);
                    });
                });
            },
            //交换两个元素的显示数据
            swopViewData(data1, data2) {
                //交换下标
                let index = data1.index;
                data1.index = data2.index;
                data2.index = index;
                //交换显示大小
                data1.scale = data2.tempRect.width / data1.viewRect.width;
                data2.scale = data1.tempRect.width / data2.viewRect.width;
                //交换显示位置
                data1.touchX = data2.tempRect.left - data1.viewRect.left;
                data1.touchY = data2.tempRect.top - data1.viewRect.top;
                data2.touchX = data1.tempRect.left - data2.viewRect.left;
                data2.touchY = data1.tempRect.top - data2.viewRect.top;
                //交换矩形盒子
                let tempRect = data1.tempRect;
                data1.tempRect = data2.tempRect;
                data2.tempRect = tempRect;

                if (data1.scale !== 1) {
                    data1.touchX = data1.touchX + data1.tempRect.width / 2 - data1.viewRect.width / 2;
                    data1.touchY = data1.touchY + data1.tempRect.height / 2 - data1.viewRect.height / 2;
                }
            },
            //应用当前排序
            useCurrentSort() {
                let list = [];
                this.imageList.forEach(item => {
                    item.scale = 1;
                    item.touchX = 0;
                    item.touchY = 0;
                    item.hasAnimate = 0;
                    item.viewRect.top = item.tempRect.top;
                    item.viewRect.left = item.tempRect.left;
                    item.viewRect.width = item.tempRect.width;
                    item.viewRect.height = item.tempRect.height;
                    list[item.index] = item;
                });
                this.imageList = list;
            },
            //获取元素的矩形盒子
            getRectBox(data) {
                uni.createSelectorQuery().select(`.${data.class}`).boundingClientRect().exec(res => {
                    if (res[0]) {
                        data.tempRect = {
                            top: res[0].top,
                            left: res[0].left,
                            width: res[0].width,
                            height: res[0].height,
                        };
                        data.viewRect = Object.assign({}, data.tempRect);
                    } else {
                        //如果获取失败，延迟到下次 DOM 更新循环之后再次获取
                        this.$nextTick(() => {
                            this.getRectBox(data);
                        })
                    }
                });
            },
            //获取滚动位置
            getScrollTop() {
                return new Promise((resolve, reject) => {
                    uni.createSelectorQuery().select('.scroll-view').scrollOffset().exec(res => {
                        resolve(res[0].scrollTop);
                    });
                })
            },
            //点击删除按钮时触发
            onDelete(idx) {
                let data = this.imageList[idx];
                let length = this.imageList.length;

                data.hasDelete = 1;
                data.hasAnimate = 0;
                this.hasDelectAction = 1;

                //如果当前元素不是最后一个，则把当前元素及其后面的元素逐一与前一个元素交换位置
                if (idx < length) {
                    for (let i = idx + 1; i < length; i++) {
                        this.imageList[i].hasAnimate = 1;
                        this.swopViewData(this.imageList[i], data);
                    }
                }
                setTimeout(() => {
                    this.hasDelectAction = 0;
                    this.imageList.splice(idx, 1);
                    this.useCurrentSort();
                }, 300);
            },
            //点击完成按钮时触发
            onConfirm() {
                this.globalData.ImagePathList = this.imageList.map(item => item.path);
                uni.navigateBack();
            },
            //预览图片
            onPreviewImage(idx) {
                if (!this.noPreviewImage) {
                    let urls = this.imageList.map(item => item.path);
                    wx.previewImage({
                        current: idx,
                        urls: urls
                    })
                }
            },
            //选择图片
            onChooseImage() {
                let count = this.maxCount - this.imageList.length;
                wx.chooseImage({
                    count: count,
                    sizeType: ['compressed'],
                    success: (res) => {
                        if (res.tempFilePaths.length > count) {
                            res.tempFilePaths = res.tempFilePaths.slice(0, count);
                        }
                        this.initImageData(res.tempFilePaths);
                    },
                });
            },
            //拖拽操作处理
            onTouchStart(e) {
                if (this.downPos === null) {
                    let idx = e.currentTarget.dataset.idx;
                    let data = this.imageList[idx];
                    //获取当前滚动位置
                    this.getScrollTop().then(res => {
                        this.scrollTop = res;
                    })
                    //长按400ms后才可以拖拽
                    this.downTimer = setTimeout(() => {
                        //清除置顶样式
                        this.imageList.forEach(item => {
                            item.hasAction = 0;
                        });
                        let clientX = e.changedTouches[0].clientX;
                        let clientY = e.changedTouches[0].clientY + this.scrollTop;
                        data.hasDrag = 1;
                        data.hasAction = 1;
                        data.hasAnimate = 1;
                        data.touchX = clientX - data.viewRect.left - data.viewRect.width / 2;
                        data.touchY = clientY - data.viewRect.top - data.viewRect.height / 2;
                        this.downPos = {
                            touchX: data.touchX,
                            touchY: data.touchY,
                            clientX: clientX,
                            clientY: clientY,
                        };
                        this.hasScroll = false;
                        this.hasDragAction = 1;
                        this.noPreviewImage = true;
                    }, 400);
                }
            },
            onTouchMove(e) {
                if (this.downPos !== null) {
                    let idx = Number(e.currentTarget.dataset.idx);
                    let data = this.imageList[idx];
                    let clientX = e.changedTouches[0].clientX;
                    let clientY = e.changedTouches[0].clientY + this.scrollTop;
                    //判断是否与其他容器相交
                    this.imageList.every((item, index) => {
                        if (index !== idx) {
                            let top = item.tempRect.top,
                                left = item.tempRect.left,
                                width = item.tempRect.width,
                                height = item.tempRect.height;

                            if (top <= clientY &&
                                left <= clientX &&
                                top + height >= clientY &&
                                left + width >= clientX) {

                                item.hasAnimate = 1;

                                this.swopViewData(item, data);

                                return false;
                            }
                        }
                        return true;
                    })
                    data.touchX = clientX - this.downPos.clientX + this.downPos.touchX;
                    data.touchY = clientY - this.downPos.clientY + this.downPos.touchY;
                    data.hasAnimate = 2;
                }
                clearTimeout(this.downTimer);
            },
            onTouchEnd(e) {
                if (this.downPos !== null) {
                    if (window) {
                        event.preventDefault();
                    }
                    let idx = e.currentTarget.dataset.idx;
                    let data = this.imageList[idx];
                    this.downPos = null;
                    this.hasDragAction = 0;

                    let other = this.imageList[data.index];
                    data.touchX = other.viewRect.left - data.viewRect.left;
                    data.touchY = other.viewRect.top - data.viewRect.top;
                    data.hasDrag = 0;
                    data.hasAnimate = 1;

                    if (data.scale !== 1) {
                        data.touchX = data.touchX + data.tempRect.width / 2 - data.viewRect.width / 2;
                        data.touchY = data.touchY + data.tempRect.height / 2 - data.viewRect.height / 2;
                    }

                    setTimeout(() => {
                        this.hasScroll = true;
                        this.useCurrentSort();
                        this.noPreviewImage = false;
                    }, 300);
                }
                clearTimeout(this.downTimer);
            },
        },
        onLoad(param) {
            uni.setNavigationBarTitle({
                title: param.title || '编辑图片'
            });

            this.downPos = null;
            this.scrollTop = 0;
            this.increment = 0;

            if (this.globalData.ImagePathList) {
                this.initImageData(this.globalData.ImagePathList);
                this.globalData.ImagePathList = null;
            }
        },
    }
</script>
<style>
    page { background: #fff; user-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); height: 100%; overflow: hidden; }
    .scroll-wrap{flex:1;overflow:hidden;}
    .image-choose { height: 100%; display: flex; flex-direction: column; }
    .image-choose scroll-view {height:100%}
    .image-choose .fixed-button { text-align: center; color: #fff; line-height: 20px; padding: 14px 0; background-image: linear-gradient(135deg, #ff7a3f 0%, #ff2c67 100%); }
    .image-choose .tips-text { background: #f5f5f5; font-size: 24upx; line-height: 32upx; padding: 8upx 24upx; color: #999; text-align: center; }
    .image-choose .draw-canvas { position: absolute; left: -9999px; top: -9999px; opacity: 0; pointer-events: none; }
    .image-choose .image-drag-list { padding: 12upx; display: flex; flex-wrap: wrap; }
    .image-choose .image-drag-item,
    .image-choose .image-drag-button { padding: 12upx; width: 33.3%; box-sizing: border-box; }
    .image-choose .image-drag-item { position: relative; z-index: 2; transition: opacity .2s; }
    .image-choose .image-drag-view { position: relative; height: 148upx; overflow: hidden; }
    .image-choose .image-drag-title { position: absolute; left: 0; bottom: 0; right: 0; background: rgba(0,0,0,.6); color: #fff; font-size: 24upx; text-align: center; padding: 8upx 0; transition: transform .2s; }
    .image-choose .image-drag-delete { position: absolute; top: 10upx; right: 10upx; width: 48upx; height: 48upx; line-height: 48upx; text-align: center; box-shadow: 0 0 0 1px #fff; border-radius: 50%;transition: opacity .2s; background-color: rgba(0,0,0,.5); background-repeat: no-repeat; background-size: 24upx;background-position:center; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQBAMAAAB8P++eAAAAJFBMVEUAAAD///////////////////////////////////////////+0CY3pAAAAC3RSTlMA79AQMCDgkLCvoD8B+9AAAAEpSURBVEjH3dYtjgJREEXhSWZmB6CQCASGINCwA1gDEsc2WAJLQDWCv9ocSZFwBHl1cCSUusmr/tRNp36+bP731+Vb76uIXrW4iOhn2EV08/be3yDikmkQSRZgdM9FSAYwThkPkWQBxjnjNJIswBhm/h0nWYDHSWbIEoQ0EFJASAMhBYQ0EFJASAMhBYQ0EFJASAMhBYQ0EFJASAMhBYRUEBJQSEAhAYUEFBJQSEAhAYUENDJBJQ2kh5RI/tiUSEBIASEFNJIejmuSYk9rkmJT9Rqk6gJSdQMhBYQUEFJASAMhBYQ0EFJASAMhBYQ0EFJASAMhBYQ0EFJAyBdQSEAhAYVcATZI7kdABpL7EbBBdhk3gA2S+zHBgrxlmgG2yPXjk+2oAHn/2NwBxsPd7gTHKkMAAAAASUVORK5CYII=) }
    .image-choose .image-drag-button .icon { background-repeat: no-repeat; background-size: 100%; background-position: center; width: 60upx; height: 60upx; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAAM1BMVEUAAADc3Nzc3Nzd3d3d3d3f39/c3Nzc3Nzf39/c3Nzd3d3d3d3f39/d3d3d3d3c3Nzd3d1FafhqAAAAEHRSTlMAwL+A8CCgYECw4HAQ349QlObi/gAAAKlJREFUWMPt2FsKhDAMheFWk/Ri1ex/tQNiIQ70yQxM4fwL+N4ChwQ0a7moluznJb1KXh7rHTuBWwc3J7B0UJzA2MEIECBAgAABApwS5GMZRh2kZdjB3/vqdcl6WR3KjznkUDHg7gHuBqweYDWgeIBiQKb3HnEwnfTay+FRS+uwqnd1HZbadLcMECBAgAABAvwJKB2Uf333NdIrasGpk/q+8oolRuGAJu0DPwFCZFV4aXcAAAAASUVORK5CYII=) }
    .image-choose .image-drag-button .desc{font-size:24upx;color:#ccc;margin-top:4upx}
    .image-choose .image-drag-button .image-drag-view { display: flex; flex-direction:column;align-items: center; justify-content: center; background: #f5f5f5; }
    .image-choose .image-view-list,
    .image-choose .image-back-list { position: absolute; left: 0; top: 0; right: 0; bottom: 0; pointer-events: none; }
    .image-choose .image-view-item,
    .image-choose .image-back-item { position: absolute; }
    .image-choose .image-view-list { z-index: 1; }
    .image-choose .image-back-list { z-index: 0; }
    .image-choose .image-back-item { background: #f5f5f5; }
    .image-choose .image-view-move { width: 100%; height: 100%; background-position: 50%; background-size: cover; transition: transform .2s ease-in-out; will-change: transform; }
    .image-choose .image-drag-item:nth-child(1) { width: 100%; }
    .image-choose .image-drag-item:nth-child(1) .image-drag-view { height: 480upx; }
    .image-choose .image-drag-list[data-drag='1'] .image-drag-title { transform: translateY(100%) }
    .image-choose .image-drag-list[data-drag='1'] .image-drag-delete { opacity: 0; }
    .image-choose .image-drag-list[data-delete='1'] { pointer-events: none; }
    .image-choose .image-drag-list[data-delete='1'] .image-drag-item:nth-last-child(2) { display: none; }
    .image-choose .image-back-list[data-delete='1'] .image-back-item:last-child { display: none; }
    /*拖拽动画*/
    .image-choose .image-view-item.draging { opacity: .6; }
    .image-choose .image-view-item.actioning { z-index: 1; }
    .image-choose .image-view-item.deleteing { opacity: 0; }
    .image-choose .image-view-item[data-animate='0'] .image-view-move { transition: initial; }
    /*默认动画*/
    .image-choose .image-view-item[data-animate='1'] { transition: all .2s; }
    /*拖拽时的平滑过渡动画*/
    .image-choose .image-view-item[data-animate='2'] { transition: all .06s linear; }
</style>
