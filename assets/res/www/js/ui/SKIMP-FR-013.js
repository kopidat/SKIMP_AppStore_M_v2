/**
 * SKIMP-FR-013.js
 * @ 업데이트
 * 2021.05.24
 */
var categoryList = [];


var pageInit = function(evt){
	pageEvent();

	workLocation();
	categoryListSearch(evt);
};

var pageEvent = function(){
	//검색버튼 이벤트
	$(document).on('click', '#srchTxt', function(){
		appListSearch();
	});

	// 근무지역 클릭 이벤트
	$(document).on('click', ".location-wrap", function() {
		$("#selectLocation").hasClass('none') ? $('#selectLocation').removeClass('none') : $('#selectLocation').addClass('none');
	});

	// 근무지역 변경 이벤트
	$(document).on('change', "[name='wrk-location']:radio", function() {
		$('#selectLocation').addClass('none');
		workLocationMod();
	});
	
	//리스트 새로고침
	$(document).on('click', '.btn-refresh', function(evt){
//		categoryListSearch(evt);
		//앱 목록 조회
		appListSearch();
	});

	
	//앱 상세 이동
	$(document).on('click', 'ul li div', function(){
		MPage.html({
			url : 'SKIMP-FR-014.html',
			param : {
				appNo : $(this).attr('data-appNo'),
				platIdx : $(this).attr('data-plat_idx'),
				packageNm : $(this).attr('data-package_nm'),
				downUrl : $(this).siblings('button').attr('data-install-url'),
				appNm : $(this).siblings('button').attr('data-appNm'),
				appIdx : $(this).siblings('button').attr('data-appIdx'),
				sort : $(this).siblings('button').attr('data-sort'),
				scheme :  $(this).siblings('button').attr('data-scheme'),
				appVer : $(this).siblings('button').attr('data-appVer'),
			}
		});
	});
	
	
	//앱설치 버튼
	$(document).on('click', '.btn-download, .btn-update', function(e){
		var thisInstallUrl = $(this).attr('data-install-Url');
		var thisAppName = $(this).attr('data-appNm');
		var thisAppIdx = $(this).attr('data-appIdx');
		var thisAppVer = $(this).attr('data-appVer');
		var thisPkgNm = $(this).attr('data-pkgNm');
		var thisScheme = $(this).attr('data-scheme');
		var pkgNm = thisPkgNm.split('.').join('_');

		//다운로드 버튼은 다운로드 카운트 추가 후 앱 설치
		if( $(e.target).attr('class') == "btn-download" ) {
			MData.storage(pkgNm, thisAppVer);
			downloadCntCheck(thisAppIdx, thisInstallUrl, thisAppName, thisScheme);
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

                startLoading(thisScheme, iosDownload);
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
							appListSearch();
						}
					}
				};
				M.apps.downloadAndInstall(thisInstallUrl, thisAppName, option);
			}
		}
	});

	//앱 열기 버튼
	$(document).on('click', '.btn-installed', function(e){
		var packageNm = $(this).data('packagenm');
		var schemeNm = $(this).data('scheme')+'://';
		
		if(MNavigator.device("ios")){
			M.apps.open(schemeNm);
		}else{
			M.apps.open(packageNm);
		}
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

		if(thisId != "btnMyapp"){
			MPage.html({
				url : thisPageUrl,
				animation : "NONE",
			})
		}
	});

};


//카테고리 목록 조회
var categoryListSearch = function(evt){
	MNet.httpSend({
		path : "skimp/common/api/SKIMP-0016",
		sendData : {
			
		},
		callback : function(rst, setting){
			$('#appList').html("");

			categoryList = getListPopArr(rst.categoryList, "catg_nm", "catg_cd");
			categoryList.unshift({"title" : "전체", "value" : ""});

			var categoryHtml = '';
			rst.categoryList.forEach((item, idx) => {
				categoryHtml += '<h3 data-cate-cd="'+item.catg_cd+'">'+item.catg_nm+'</h3>'
				categoryHtml += '<ul>'
				categoryHtml += '</ul>'
			});
			$('#appList').append(categoryHtml);
			
			//카테고리 숨기기
			$('#appList h3').addClass('none')

			appListSearch(evt);
		},
		errCallback : function(errCd, errMsg){
			console.log(errCd, errMsg);
		}
	});
}



//앱 목록 조회
var appListSearch = function(evt){
	//os ios : 2, aos : 1
	var deviceOS = MNavigator.device("ios") ? "2" : "1";
	var osType = StringUtil.isEmpty(evt) ? M.navigator.device().os : evt.os;

	MNet.httpSend({
		path : "skimp/common/api/SKIMP-0005",
		sendData : {
			userId: MData.storage('encData').userId,
			platIdx : deviceOS,
			keyword : $('.input01').val(),
		},
		callback : function(rst, setting){
			var appList = rst.appInfoList;
			var appListHtml = '';
			var appsInfo = addAppStatus(appList, osType);
			var myAppCnt = 0;

			//기존에 그려진 리스트 초기화
			$('#appList li').remove();
			
			//#content 영역 숨기기
			$('#content > div').addClass('none');
			
			appsInfo.forEach((item, idx) => {
				//앱 설치여부에 따른 분기
				if(item.app_installed == true){

					//현재버전과 설치버전이 같으면 열기, 다르면 업데이트
					appListHtml += '<li>';
					appListHtml += '	<img src="'+item.icon_app_bic_url+'" alt="">';
					appListHtml += "	<div data-appNo='"+item.app_idx+"' data-plat_idx='"+item.plat_idx+"' data-package_nm='"+item.package_nm+"' class='cursor'>";
					appListHtml += '		<p class="title">'+item.app_nm+'</p>';
					appListHtml += '		<p class="txt">'+item.app_info+'</p>';
					appListHtml += '	</div>';

					// 앱 업데이트 여부에 따른 분기
					if( appVerCompare(item.app_ver, item.installed_ver) ){
//							appListHtml += '	<button class="btn-installed">설치됨</button>';
						appListHtml += '	<button class="btn-installed" data-sort="installed" data-packageNm="'+item.package_nm+'" data-scheme="'+item.url_scheme+'">열기</button>';
					}else{
						appListHtml += '	<button class="btn-update" data-install-Url="'+item.bin_url+'" data-appNm="'+item.app_nm+'" data-sort="update" data-appVer="'+item.app_ver+'" data-pkgNm="'+item.package_nm+'" data-scheme="'+item.url_scheme+'">업데이트</button>';
					}
					appListHtml += '</li>';

					//앱의 카테고리 별로 분리해서 리스트를 보여줌
					for(var i=0; i<$('#appList h3').length; i++){
						if($('#appList h3').eq(i).attr('data-cate-cd') == item.cate_cd){
							$('#appList h3').eq(i).removeClass('none');
							$('#appList h3').eq(i).next('ul').removeClass('none');
							$('#appList h3').eq(i).next('ul').append(appListHtml);
							appListHtml = '';
							
							break;
						}
					}

					myAppCnt += 1;
				}
			});
			
			//전체 업데이트 가능 앱 개수 업데이트
			$('#myAppCnt').text(StringUtil.addComma(myAppCnt));
			
			//#content 영역 보이기
			$('#content > div').not('.no-date').removeClass('none');
			
			if (myAppCnt == 0) {
				$('.no-date').removeClass('none');
			} else {
				$('.no-date').addClass('none') 
			}
			
			setTimeout(function (){
				!$('.full_loding').hasClass('none') && !$('#content > div').not('.no-date').hasClass('none') ? $('.full_loding').addClass('none') : ''
			}, 200);

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
var downloadCntCheck = function(appIdx, thisInstallUrl, thisAppName, thisScheme){
	MNet.httpSend({
		path : "/skimp/common/api/SKIMP-0015",
		sendData : {
			appIdx: appIdx,
		},
		callback : function(rst, setting){

			var loadingPercent = 0;

			if(MNavigator.device("ios")){
				M.apps.browser("itms-services://?action=download-manifest&url="+thisInstallUrl,"UTF-8");
				MData.storage('iosDownload', loadingPercent);

				var iosDownload = StringUtil.isEmpty(MData.storage('iosDownload')) ? 0 : Number(MData.storage('iosDownload'));

				$('#btnCancel').removeClass('none');
				$('.modal-bg').removeClass('none');
				$('#loding-bar-color').css('width', '0%');

				startLoading(thisScheme, iosDownload);
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
							appListSearch();
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

var startLoading = function(thisScheme, iosDownload) {
	loadingBar.isPause = false;

	var iosDownPer = iosDownload;
	
	loadingBar.timer = setInterval(function() {
		if(!loadingBar.isPause){
			if(M.apps.info(thisScheme).installed) {
				MData.removeStorage('iosDownload');
				$('#loding-bar-color').css('width', '100%');
				clearInterval(loadingBar.timer);
				appListSearch();
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

// 근무지역 조회(보안정책용도)
var workLocation = function() {
	MNet.httpSend({
		path: "skimp/common/api/SKIMP-0021",
		sendData: {
			cdGrpId: "CM001"
		},
		callback: function(rst) {

			$("#selectLocation").html("");

			var locationList = getListPopArr(rst.sysCdList, "cd_nm", "cd_id");

			var locationHtml = "<dt>근무지역</dt>";

			locationList.forEach((item, idx)=> {
				locationHtml += '<dd><label for="radio';
				locationHtml += idx;
				locationHtml += '" class="radio-box"><input type="radio" class="radio" name="wrk-location" id="radio';
				locationHtml += idx;
				locationHtml += '" value="';
				locationHtml += item.value;
				locationHtml += '"><span>';
				locationHtml += item.title;
				locationHtml += '</span></label></dd>';
			});

			$("#selectLocation").append(locationHtml);

			var positionNm = '본사';
			var positionId = 'A101';
			
			if(MData.storage('positionInfo').userId == MData.storage('encData').userId) {
				positionNm = !StringUtil.isEmpty(MData.storage('positionInfo')) ? MData.storage('positionInfo').positionNm : '본사';
				positionId = !StringUtil.isEmpty(MData.storage('positionInfo')) ? MData.storage('positionInfo').positionId : 'A101';
			}
			
			$('#workLocation').text(positionNm);
			$('input:radio[name=wrk-location]:input[value=' + positionId + ']').prop("checked", true);

			// setTimeout(function (){
			// 	!$('.full_loding').hasClass('none') ? $('.full_loding').addClass('none') : ''
			// }, 400);

		},
		errCallback: function(errCd, errMsg) {
			$('.full_loding').addClass('none');
		}
	});
}

// 근무지역 변경
var workLocationMod = function() {

	var userId = MData.storage('encData').userId;
	var positionId = $("[name='wrk-location']:checked").val();
	var hphone = MInfo.device("comm.phone");
	var osKind = MNavigator.device("ios") ? "2" : "1";
	var dvcSn = MNavigator.device("ios") ? M.execute('exWNGetSSMInfo').iosDeviceSerialNum : M.execute('exWNGetSSMInfo').mac;

	MNet.httpSend({
		path: "skimp/common/api/SKIMP-0025",
		sendData: {
			userId: userId
			, positionId: positionId
			, hphone: hphone
			, osKind: osKind
			, dvcSn: dvcSn
		},
		callback: function(rst) {

			var rstMessage = rst.message;
			var positionNm = $("[name='wrk-location']:checked").siblings('span').text();

			if(rstMessage == "ok") {
				MData.storage('positionInfo', {
					userId: userId
					, positionId : positionId
					, positionNm : positionNm
				});
				
				$('#workLocation').text(positionNm);
				M.pop.instance({
					message : "근무지가 '" + positionNm + "'(으)로 변경 되었습니다."
					, showTime : "SHORT"
				});
			} else {

				var chkCd = 'A101';

                if(MData.storage('positionInfo').userId == MData.storage('encData').userId) {
                    chkCd = !StringUtil.isEmpty(MData.storage('positionInfo')) ? MData.storage('positionInfo').positionId : 'A101';
                }

                $('input:radio[name=wrk-location]:input[value=' + chkCd + ']').prop("checked", true);

				M.pop.instance({
					message : "근무지 변경을 실패하였습니다."
					, showTime : "SHORT"
				});
			}
			
			setTimeout(function (){
				!$('.full_loding').hasClass('none') ? $('.full_loding').addClass('none') : ''
			}, 400);
			
		},
		errCallback: function(errCd, errMsg) {
			var chkCd = !StringUtil.isEmpty(MData.storage('positionInfo')) ? MData.storage('positionInfo').positionId : 'A101';
			$('input:radio[name=wrk-location]:input[value=' + chkCd + ']').prop("checked", true);
			$('.full_loding').addClass('none');
			M.pop.instance({
				message : "근무지 변경을 실패하였습니다."
				, showTime : "SHORT"
			});
		}
	});
}

var MStatus = {
		onReady : function(evt){
			pageInit(evt);
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
