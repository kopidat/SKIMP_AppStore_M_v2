/**
  * SKIMP-FR-112.js
 * @ 이미지 미리보기
 * 2022.02.21
 */

var selectImgIdx = MData.param('selectImgIdx');
var previewList = MData.param('previewList');

var pageInit = function(){
	pageEvent();
	// selectImg();
	imgList();
};

var pageEvent = function(){

	// 닫기 이벤트
	$(document).on('click', '.btn-close', function() {
		MPage.back();
	});
	
};

// 이미지 Html
var imgList = function() {
	$('.swiper-wrapper').html('');

	var imgHtml = '';
	for(var i = 0; i < previewList.length; i++) {
		imgHtml += '<div class="swiper-slide"><img src="';
		imgHtml += previewList[i];
		imgHtml += '" width="100%" alt=""/></div>';
	}

	$('.swiper-wrapper').append(imgHtml);
	
	// swiper Init
	var swiper = new Swiper('.swiper-container', {
		zoom: true,
		navigation: {
		  nextEl: ".swiper-button-next",
		  prevEl: ".swiper-button-prev",
		},
		slidesPerView: 1,
		spaceBetween: 30,
		initialSlide: selectImgIdx,
	});
};


// 선택한 이미지로 이동
var selectImg = function() {
	swiper.slideTo(selectImgIdx);
}

var MStatus = {
		onReady : function(){
			pageInit();
		},

//		onBack : function(){
//
//		},

		onRestore : function(){

		},

		onHide : function(){

		},

		onDestroy : function(){

		},

		onPause : function(){

		},

		onResume : function(){
			console.log("onResume");
			fromBack = "fromBack";
			mdmInstallChk();
		}
}