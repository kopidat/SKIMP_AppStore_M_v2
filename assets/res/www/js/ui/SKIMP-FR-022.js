/**
  * SKIMP-FR-022.js
 * @ 1:1 문의
 * 2022.02.09
 */

var qnaTypeList = [];
var categoryList = [];
var appList = [];
var appIdxParam = MData.param('appIdx');

var pageInit = function(){
	pageEvent();

	// 문의 분류 조회
	qnaTypeListSearch();

	// 카테고리 목록 조회
	categoryListSearch();
};

var pageEvent = function(){

	// 리스트박스 이벤트
	$(document).on('click', '.btn-select', function(e) {
		var targetList = '';
		var popTitle = '';
		if($('.btn-select').index(this) == 0) {
			targetList = qnaTypeList;
			popTitle = "문의 분류";
		} else if($('.btn-select').index(this) == 1) {
			targetList = categoryList;
			popTitle = "카테고리";
		} else if($('.btn-select').index(this) == 2) {
			targetList = appList;
			popTitle = "앱명";
		}

		var selectList = $('.btn-select').index(this);

		if(targetList.length > 0) {
			MPopup.listSingle({
				title : popTitle,
				list : targetList,
				selected : $(e.target).attr('data-selectedIdx'),
			}, function(btnIdx, rowInfo, setting){
	
				if(btnIdx == 1){
					$(e.target).text(rowInfo.title).val(rowInfo.value).attr('data-selectedIdx', rowInfo.index);
	
					if(selectList == 0) {
						if(rowInfo.value == "1" || rowInfo.value == "2") {
							$('#appSection').removeClass('none');
							appListSearch();
						} else {
							$('#appSection').addClass('none');
							$('#appInfo').val('');
							qnaValidate();
						}
					} else if(selectList == 1) {
						// 앱 목록 조회
						appListSearch();
					}
				}
			});
		}
	});

	// text keyup
	$(document).on('keyup', '#qnaSubject, #qnaContent', function(e){
		qnaValidate();
	});

	// 문의하기
	$(document).on('click', "#btnQnaReg", function() {
		regQna();
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

// 문의 분류 조회
var qnaTypeListSearch = function() {
	MNet.httpSend({
		path: "skimp/common/api/SKIMP-0021",
		sendData: {
			cdGrpId: "Q0001"
		},
		callback: function(rst) {

			qnaTypeList = getListPopArr(rst.sysCdList, "cd_nm", "cd_id");
			qnaTypeList.unshift({"title" : "선택", "value" : ""});

			$('#qnaType').text(qnaTypeList[0].title).val(qnaTypeList[0].value).attr('data-selectedIdx', 0);

			// setTimeout(function (){
			// 	!$('.full_loding').hasClass('none') ? $('.full_loding').addClass('none') : ''
			// }, 400);

		},
		errCallback: function(errCd, errMsg) {
		}
	})
}

//카테고리 목록 조회
var categoryListSearch = function(){
	MNet.httpSend({
		path : "skimp/common/api/SKIMP-0016",
		sendData : {
		},
		callback : function(rst, setting){
			
			categoryList = getListPopArr(rst.categoryList, "catg_nm", "catg_cd");
			categoryList.unshift({"title" : "전체", "value" : ""});

			$('#category').text(categoryList[0].title).val(categoryList[0].value).attr('data-selectedIdx', 0);

			appListSearch();
		},
		errCallback : function(errCd, errMsg){
		}
	});
}

// 앱목록 조회
var appListSearch = function() {
	//os ios : 2, aos : 1
	var deviceOS = MNavigator.device("ios") ? "2" : "1";
	var catType = $('.btn-select').eq(1).val();

	MNet.httpSend({
		path : "skimp/common/api/SKIMP-0005",
		sendData : {
			userId: MData.storage('encData').userId,
			platIdx : deviceOS,
			catgCd : catType,
		},
		
		callback : function(rst, setting){
			
			appList = getListPopArr(rst.appInfoList, "app_nm", "app_idx");

			if(appList.length > 0) {
				$('#appInfo').text(appList[0].title).val(appList[0].value).attr('data-selectedIdx', 0);
			} else {
				$('#appInfo').text('선택').val('').attr('data-selectedIdx', 0);
			}

			// 앱 > 1:1문의
			if(appIdxParam != null && appIdxParam != undefined && appIdxParam != '' && appIdxParam != "null" && appIdxParam != "undefined") {
				fromAppInfo();
			}

			qnaValidate();
			
			setTimeout(function (){
				!$('.full_loding').hasClass('none') ? $('.full_loding').addClass('none') : ''
			}, 400);
		},
		errCallback : function(errCd, errMsg){
			$('.full_loding').addClass('none');
		}
	});
}

// 문의하기
var regQna = function() {

	var qnaType= $('#qnaType').val();
	var appIdx = $('#appInfo').val();
	var qnaTitle= $('#qnaSubject').val();
	var qnaContent= $('#qnaContent').val();
	var askUserId= MData.storage('encData').userId;
	var regFlag = qnaValidate();

	if(regFlag == "Y") {
		if(appIdx == null || appIdx == undefined || appIdx == "") {
			appIdx = "";
		}
		MNet.httpSend({
			path: "skimp/common/api/SKIMP-0022",
			sendData: {
				qnaType: qnaType
				, appIdx: appIdx
				, qnaTitle: qnaTitle
				, qnaContent: qnaContent
				, askUserId: askUserId
			},
			callback: function(rst){
				var qnaIdx = rst.qnaIdx;
				var status = rst.status;

				if(status == "1000") {
					sendMail(qnaIdx);
				} else if(status == "9000") {
					MPopup.alert("문의 실패");

					setTimeout(function (){
						!$('.full_loding').hasClass('none') ? $('.full_loding').addClass('none') : ''
					}, 400);
				}
			},
			errCallback: function(errCd, errMsg) {
				MPopup.alert("문의 실패");
				$('.full_loding').addClass('none');
			}
		});
	}
}

// 메일 발송
var sendMail = function(qnaIdx) {

	var qnaType= $('#qnaType').val();
	var appIdx = $('#appInfo').val();
	var askUserId= MData.storage('encData').userId;

	if(qnaIdx != null && qnaIdx != undefined && qnaIdx != '') {
		MNet.httpSend({
			path: "skimp/common/api/SKIMP-0024",
			sendData: {
				qnaType: qnaType
				, cdGrpId: "Q0001"
				, appIdx: appIdx
				, userId: askUserId
				, qnaIdx: qnaIdx
				, mailType: "qna"
			},
			callback: function(rst){
				var status = rst.status;
				var message = "";
				
				if(status == "1000") {
					message = "문의완료";
				} else {
					message = "문의는 성공하였으나, 담당자에게 메일발송이 실패하였습니다.";
				}

				M.pop.alert({
					title: '알림',
					message: message,
					buttons: ['확인'],
					callback: function() {
						MPage.back();
					}
				 });

				// setTimeout(function (){
				// 	!$('.full_loding').hasClass('none') ? $('.full_loding').addClass('none') : ''
				// }, 400);

			},
			errCallback: function(errCd, errMsg) {
				M.pop.alert({
					title: '알림',
					message: "문의는 성공하였으나, 담당자에게 메일발송이 실패하였습니다.",
					buttons: ['확인'],
					callback: function() {
						MPage.back();
					}
				});
				// MPage.back();
				$('.full_loding').addClass('none');
			}
		});
	} else {
		MPopup.alert("문의가 정상적으로 이루어지지 않았습니다.");
		setTimeout(function (){
			!$('.full_loding').hasClass('none') ? $('.full_loding').addClass('none') : ''
		}, 400);
	}
}

// 문의사항 체크
var qnaValidate = function() {

	var qnaType = $('#qnaType').val();
	var appInfo = $('#appInfo').val();
	var btnUseFlag = "N";
	var regFlag = "N";

	if(qnaType != null && qnaType != '' && qnaType != undefined) {
		if(qnaType == "1" || qnaType == "2") {
			if(appInfo != null && appInfo != undefined && appInfo != "") {
				btnUseFlag = "Y"
			} else {
				btnUseFlag = "N"
			}
		} else {
			btnUseFlag = "Y"
		}
	}

	if(!StringUtil.isEmpty($('#qnaSubject').val()) && !StringUtil.isEmpty($('#qnaContent').val()) && btnUseFlag == "Y") {
		$('#btnQnaReg').removeAttr('disabled');
		regFlag = "Y"
	}else{
		$('#btnQnaReg').attr('disabled', true);
		regFlag = "N"
	}

	return regFlag;
}

// 앱 상세 > 1:1문의
var fromAppInfo = function() {

		for(var i = 0; i < qnaTypeList.length; i++) {
			if(qnaTypeList[i].value == "2") {
				$('#qnaType').text(qnaTypeList[i].title).val(qnaTypeList[i].value).attr('data-selectedIdx', i);
				break;
			}
		}

		for(var j = 0; j < appList.length; j++) {
			if(appList[j].value == appIdxParam) {
				$('#appInfo').text(appList[j].title).val(appList[j].value).attr('data-selectedIdx', j);
				break;
			}
		}

		$('#appSection').removeClass('none');
		appIdxParam = '';
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