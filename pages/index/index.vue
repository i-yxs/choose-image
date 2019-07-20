<template>
	<view class="content">
        <div class="image-list">
            <image :src="item" mode="aspectFill" v-for="item in imageList"></image>
        </div>
        <div class="image-buton" @click="onSelectImage">选择图片</div>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				imageList: []
			}
		},
		onLoad() {

        },
        onShow() {
            if (this.globalData.ImagePathList) {
                this.imageList = this.globalData.ImagePathList;
                this.globalData.ImagePathList = null;
            }
        },
		methods: {
            onSelectImage() {
                this.globalData.ImagePathList = this.imageList;
                uni.navigateTo({
                    url: '/pages/choose-image/index'
                });
            },
		}
	}
</script>

<style>
    .image-list{display:flex;align-items:center;flex-wrap:wrap;}
    .image-list image{width:200upx;height:200upx;background:#f5f5f5;border:solid 10upx #fff;}
    .image-buton{background:#ff6a00;padding:20upx;text-align:center;color:#fff;margin-top:20upx;}
</style>
