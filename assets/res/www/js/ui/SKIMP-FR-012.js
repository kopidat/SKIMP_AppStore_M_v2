/**
 * SKIMP-FR-012.js
 * @ 앱 상세
 * 2021.05.24
 */

var appNo = MData.param('appNo');
var platIdx = MData.param('platIdx');
var packageNm = MData.param('packageNm');
var downUrl = MData.param('downUrl');
var appNm = MData.param('appNm');
var appIdx = MData.param('appIdx');
var sort = MData.param('sort');
var schemeNm = MData.param('scheme');
var thisAppVer = MData.param('appVer');
var previewList = [];

var pageInit = function(){
	pageEvent();

	appDetailSearch();
};

var pageEvent = function(){

	//앱설치 버튼
	$(document).on('click', '.btn-download, .btn-update', function(e){
		var thisInstallUrl = downUrl;
		var thisAppName = appNm;
		var thisAppIdx = appIdx;
		var thisPkgNm = packageNm;
		var pkgNm = thisPkgNm.split('.').join('_');

		//다운로드 버튼은 다운로드 카운트 추가 후 앱 설치
		if( $(e.target).attr('class') == "btn-download" ) {
    		//ios 의 경우 타 앱의 버전을 가지고 올 수 없어서 조회된 앱정보의 버전을 storage 에 저장해두고 현재버전으로 사용
    		MData.storage(pkgNm, thisAppVer);
			downloadCntCheck(thisAppIdx, thisInstallUrl, thisAppName);
		}else{
			MData.storage(pkgNm, thisAppVer);

			var loadingPercent = 0;
			
			if(MNavigator.device("ios")){
				M.apps.browser("itms-services://?action=download-manifest&url="+thisInstallUrl,"UTF-8");
				MData.storage('iosDownload', loadingPercent);

                var iosDownload = StringUtil.isEmpty(MData.storage('iosDownload')) ? 0 : Number(MData.storage('iosDownload'));

				$('#btnCancel').removeClass('none');
                $('.modal-bg').removeClass('none');
                $('#loding-bar-color').css('width', '0%');

                startLoading(iosDownload);
			}else{
				var option = {
					indicator: false,
					timeout: 30000,
					onprogress: function (total, current, remaining, percentage) {
						loadingPercent = current/total*100;
						if(loadingPercent < 100) {
							$('.modal-bg').removeClass('none');
							$('#loding-bar-color').css('width', loadingPercent+'%');
						} else {
							$('.modal-bg').addClass('none');
							appDetailSearch();
						}
					}
				};
				M.apps.downloadAndInstall(thisInstallUrl, thisAppName, option);
			}
		}
	});
	
	//앱 열기 버튼
	$(document).on('click', '.btn-installed', function(e){
		if(MNavigator.device("ios")){
			M.apps.open(schemeNm);
		}else{
			M.apps.open(packageNm);
		}
	});

	// 아코디언 이벤트
	$(document).on('click', '.aco-title', function(){
		if($(this).next().css('display') != 'none'){
			$(this).next().slideUp();
			$(this).parent().removeClass('aco-on');
		}else {
			$('.notice-list > dl > dd').slideUp();
			$(this).next().slideDown();
			$(this).parent().addClass('aco-on');
		}
		return false;
	});

	// 1:1 문의 버튼 이벤트
	$(document).on('click', '#appQna', function() {
		MPage.html({
			url : "SKIMP-FR-022.html",
			animation : "NONE",
			param: {
				appIdx: appNo
			}
		})
	});

	// 이미지 이벤트
	$(document).on('click', '#previewImg button', function() {

		var selectImgIdx = $('#previewImg button').index(this);
		
		if(previewList.length > 0) {
			MPage.html({
				url : "SKIMP-FR-112.html",
				animation : "NONE",
				param: {
					selectImgIdx: selectImgIdx,
					previewList: previewList
				}
			});
		}
	});

	// 로딩바 닫기 버튼
	$(document).on('click', '#btnCancel', function() {
		stopLoading();
	});

	//footer 페이지 이동
	$(document).on('click', '#btnFooter button', function(){
		var thisId = $(this).attr('id');
		var thisPageUrl = "";

		if(thisId == "btnGroup"){
			thisPageUrl = "SKIMP-FR-007.html";
		}else if(thisId == "btnMyapp"){
			thisPageUrl = "SKIMP-FR-013.html";
		}else if(thisId == "btnNotice"){
			thisPageUrl = "SKIMP-FR-015.html";
		}else if(thisId == "btnSetting"){
			thisPageUrl = "SKIMP-FR-017.html";
		}

		MPage.html({
			url : thisPageUrl,
			animation : "NONE",
		})
	});
};


//앱 상세조회
var appDetailSearch = function(){
	var deviceOS = MNavigator.device("ios") ? "2" : "1";

	MNet.httpSend({
        path : "skimp/common/api/SKIMP-0006",
        sendData : {
        	pakgId: packageNm,
        	platIdx : deviceOS,
        },
        callback : function(rst, setting){

			var previewInfo = rst.previewImageInfo;
			var appIconInfo = rst.appIconImageInfo;
            var appInfo = rst.appInfo;

			var appVer = "버전" + appInfo.app_ver + "<span>" + appInfo.bin_size + "MB</span>"
            var appDesc = "-";
			var updateDesc = "-";

			if(appInfo.app_desc != null && appInfo.app_desc != undefined && appInfo.app_desc != '') {
				appDesc = appInfo.app_desc.replace(/\r\n/g, '<br>');
			}

			if(appInfo.update_desc != null && appInfo.update_desc != undefined && appInfo.update_desc != '') {
				updateDesc = appInfo.update_desc.replace(/\r\n/g, '<br>');
			}

			//#content 영역 숨기기
			$('#content > div').addClass('none');
            
            !StringUtil.isEmpty($('.app-description').find('button')) ? $('.app-description').find('button').remove() : '';
            
			//현재버전과 설치버전이 같으면 설치됨, 다르면 업데이트
			if( sort == 'installed'){
//				$('.app-description').append('<button class="btn-installed" data-sort="installed">설치됨</button>');
				$('.app-description').append('<button class="btn-installed" data-sort="installed">열기</button>');
			}else if (sort == 'update'){
				$('.app-description').append('<button class="btn-update" data-install-Url="'+downUrl+'" data-appNm="'+appNm+'" data-sort="update">업데이트</button>');
			}else if (sort == 'download'){
				$('.app-description').append('<button class="btn-download" data-install-Url="'+downUrl+'" data-appNm="'+appNm+'" data-appIdx="'+appIdx+'" data-sort="download">다운로드</button>');
			}
			
			$('#downloadCnt').text(appInfo.down_cnt);			// 다운로드 횟수
            $('#appIcon').attr('src', appIconInfo.img_path_1);	// 앱 아이콘 이미지
            $('#appNm').text(appInfo.app_nm);					// 앱 명
            $('#appVer').html(appVer);							// 앱 버전
            $('#categoryNm').text(appInfo.cate_nm);				// 카테고리 명
            $('#appDesc').html(appDesc);						// 앱 설명
			$('#updateDesc').html(updateDesc);					// 앱 업데이트 내용

            //미리보기 이미지 최대 4개까지 보여줌
            !StringUtil.isEmpty(previewInfo.img_path_1) ? $('#previewImg button').eq(0).children('img').attr('src', previewInfo.img_path_1) : $('#previewImg button').eq(0).remove();
            !StringUtil.isEmpty(previewInfo.img_path_2) ? $('#previewImg button').eq(1).children('img').attr('src', previewInfo.img_path_2) : $('#previewImg button').eq(1).remove();
            !StringUtil.isEmpty(previewInfo.img_path_3) ? $('#previewImg button').eq(2).children('img').attr('src', previewInfo.img_path_3) : $('#previewImg button').eq(2).remove();
            !StringUtil.isEmpty(previewInfo.img_path_4) ? $('#previewImg button').eq(3).children('img').attr('src', previewInfo.img_path_4) : $('#previewImg button').eq(3).remove();

			// 미리보기용 이미지 목록 생성
			!StringUtil.isEmpty(previewInfo.img_path_1) ? previewList.push(previewInfo.img_path_1) : '';
			!StringUtil.isEmpty(previewInfo.img_path_2) ? previewList.push(previewInfo.img_path_2) : '';
			!StringUtil.isEmpty(previewInfo.img_path_3) ? previewList.push(previewInfo.img_path_3) : '';
			!StringUtil.isEmpty(previewInfo.img_path_4) ? previewList.push(previewInfo.img_path_4) : '';
			
			//#content 영역 보이기
			$('#content > div').removeClass('none');
			
			setTimeout(function (){
				!$('.full_loding').hasClass('none') && !$('#content > div').hasClass('none') ? $('.full_loding').addClass('none') : ''
			}, 400);

			stopLoading();
			$('.modal-bg').addClass('none');
        },
        errCallback : function(errCd, errMsg){
			$('.full_loding').addClass('none');
			$('.modal-bg').addClass('none');
        }
    });
}


//다운로드 횟수 체크
var downloadCntCheck = function(appIdx, thisInstallUrl, thisAppName){
	MNet.httpSend({
		path : "/skimp/common/api/SKIMP-0015",
		sendData : {
			appIdx: appIdx,
		},
		callback : function(rst, setting){

			var loadingPercent = 0;

			if(MNavigator.device("ios")){
				M.apps.browser("itms-services://?action=download-manifest&url="+downUrl,"UTF-8");
				MData.storage('iosDownload', loadingPercent);

                var iosDownload = StringUtil.isEmpty(MData.storage('iosDownload')) ? 0 : Number(MData.storage('iosDownload'));

                $('#btnCancel').removeClass('none');
                $('.modal-bg').removeClass('none');
                $('#loding-bar-color').css('width', '0%');

                startLoading(iosDownload);
			}else{
				var option = {
					indicator: false,
					timeout: 30000,
					onprogress: function (total, current, remaining, percentage) {
						loadingPercent = current/total*100;
						if(loadingPercent < 100) {
							$('.modal-bg').removeClass('none');
							$('#loding-bar-color').css('width', loadingPercent+'%');
						} else {
							$('.modal-bg').addClass('none');
							appDetailSearch();
						}
					}
				};
				M.apps.downloadAndInstall(thisInstallUrl, thisAppName, option);
			}
			$('.full_loding').addClass('none');
		},
		errCallback : function(errCd, errMsg){
			$('.full_loding').addClass('none');
			$('.modal-bg').addClass('none');
		}
	});
}

const loadingBar = {
	isPause: false
	, timer: null
}

var startLoading = function(iosDownload) {
	loadingBar.isPause = false;

	var iosDownPer = iosDownload;
	
	loadingBar.timer = setInterval(function() {
		if(!loadingBar.isPause){
			if(M.apps.info(schemeNm).installed) {
				MData.removeStorage('iosDownload');
				$('#loding-bar-color').css('width', '100%');
				clearInterval(loadingBar.timer);
				appDetailSearch();
			} else {
				if(iosDownPer < 99) {
					iosDownPer += 1;
					$('#loding-bar-color').css('width', iosDownPer+'%');
				}
			}
		}
	}, 500);
}

var stopLoading = function() {
	$('.modal-bg').addClass('none');
	clearInterval(loadingBar.timer);
	loadingBar.isPause = true;
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