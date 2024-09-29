/**
 * SKIMP-FR-017.js
 * @ 설정
 * 2021.05.24
 */
var pageInit = function(){
	$('#version').html(M.info.app().app.version);

	pageEvent();
	usrInfo();
};

var pageEvent = function(){

	// 근무지역 설정
	$(document).on('click', '#btnWorkArea', function() {
		MPage.html({
			url : "SKIMP-FR-024.html",
		})
	});

	//간편로그인 설정
	$(document).on('click', '#btnEasyLogin', function(){
		MPage.html({
			url : "SKIMP-FR-017-2.html",
		})
	});

	//로그아웃
	$(document).on('click', '#btnLogout', function(){
		MPopup.confirm({
			message : "로그아웃 하시겠습니까?",
			callback : function(idx){
				if(idx == 0){
					if (M.navigator.device().os == 'Android' || M.navigator.device().os == 'android') {
						M.execute('exWNMDMLogout');
						logOut();
					} else if (M.navigator.device().os == 'iOS' || M.navigator.device().os == 'ios') {
					    var callback = 'SSMCallback';
					    M.execute('exWNSSMLogout', callback);
					}
				}
			},
		})
	});
	
	//알림함 이동
	$(document).on('click', '#alertMenu', function(){
		MPage.html({
			url : "SKIMP-FR-018.html",
		})
	});
	
	//1:1 문의 이동
	$(document).on('click', '#btnQna', function(){
		MPage.html({
			url : "SKIMP-FR-022.html",
		})
	});
	
	// 문의내역 확인 이동
	$(document).on('click', '#btnQnaList', function() {
		MPage.html({
			url : "SKIMP-FR-023.html",
		})
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

		if(thisId != "btnSetting"){
			MPage.html({
				url : thisPageUrl,
				animation : "NONE",
			})
		}
	});

};

var SSMCallback = function(rst){
	if (rst.successCode == '5') {
		logOut();
	} else {
		MPopup.confirm({
			message : "SSM 로그아웃이 정상적으로 실행되지 않았습니다. 재시도 하시겠습니까?",
			buttons : ["재시도, 취소"],
			callback : function(idx){
				if(idx == 0){
				    var callback = 'SSMCallback';
				    M.execute('exWNSSMLogout', callback);
				}
			},
		})
	}
}

var logOut = function(){
	MNet.httpSend({
		path : "skimp/common/api/SKIMP-0003",
		sendData : {
			token : MData.storage('encData').token,
		},
		callback : function(rst, setting){
			console.log(rst);
//			MPage.html({
//				url : "SKIMP-FR-003.html",
//				action : "CLEAR_TOP",
//			})
			M.sys.exit();
		},
		errCallback : function(errCd, errMsg){
			console.log(errCd, errMsg);
		}
	});
};

var usrInfo = function() {
	$('#usrNm').html(MData.storage('uinfo').name);
	$('#usrInfo').html(MData.storage('uinfo').division + "/" + MData.storage('uinfo').empNo);
};

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