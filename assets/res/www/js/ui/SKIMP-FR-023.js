/**
  * SKIMP-FR-023.js
 * @ 문의내역 확인
 * 2022.02.10
 */

var currentPageNum = '1';
var totalPageCnt = 0;
var qnaTypeList = [];
var categoryList = [];
var appList = [];

var pageInit = function(){
	pageEvent();

	// 문의 분류 조회
	qnaTypeListSearch();
	
	// 카테고리 목록 조회
	categoryListSearch();

	// 문의 목록 조회
	qnaListSearch();
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
				list : targetList,
				selected : $(e.target).attr('data-selectedIdx'),
			}, function(btnIdx, rowInfo, setting){
	
				if(btnIdx == 1){
					currentPageNum = '1';
					totalPageCnt = 0;

					$(e.target).text(rowInfo.title).val(rowInfo.value).attr('data-selectedIdx', rowInfo.index);
	
					if(selectList == 0) {
						if(rowInfo.value == "1" || rowInfo.value == "2") {
							$('#appSection').removeClass('none');

							// 앱 목록 조회
							appListSearch();
						} else {
							$('#appSection').addClass('none');
							$('#appInfo').val('');
							
							// 문의 목록 조회
							qnaListSearch();
						}
					} else if(selectList == 1) {
						// 앱 목록 조회
						appListSearch();
					} else {
						
						// 문의 목록 조회
						qnaListSearch();
					}
				}
			});
		}
	});

	// 문의내역 내용보기
	$(document).on('click', '#qnaList > dl > dt', function() {
		if($(this).next().css('display') != 'none'){
			$(this).next().slideUp();
			$(this).removeClass('active');
		}else {
			$('#qnaList > dl > dd').slideUp();
			$(this).next().slideDown();
			$(this).addClass('active');
			$(this).addClass('active').parent().siblings('dl').find('dt.active').removeClass('active');
		}
		return false;
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
	
	//scroll이벤트
	$("#content").on('scroll', function(e){
		let el = e.target;

		if ( (currentPageNum < totalPageCnt) && (el.scrollHeight - Math.abs(el.scrollTop) <= el.clientHeight) ) {
			currentPageNum = String(Number(currentPageNum) + 1);
			qnaListSearch();
		}
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
			qnaTypeList.unshift({"title" : "전체", "value" : ""});

			$('#qnaType').text(qnaTypeList[0].title).val(qnaTypeList[0].value).attr('data-selectedIdx', 0);

			// setTimeout(function (){
			// 	!$('.full_loding').hasClass('none') ? $('.full_loding').addClass('none') : ''
			// }, 400);

		},
		errCallback: function(errCd, errMsg) {
			$('.full_loding').addClass('none');
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

			// setTimeout(function (){
			// 	!$('.full_loding').hasClass('none') ? $('.full_loding').addClass('none') : ''
			// }, 400);

		},
		errCallback : function(errCd, errMsg){
			$('.full_loding').addClass('none');
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
				qnaListSearch();
			} else {
				$('#appInfo').text('선택').val('').attr('data-selectedIdx');

				$('.no-date').addClass('none');
				$('#qnaList').addClass('none');
				$('.no-date').removeClass('none');

				setTimeout(function (){
					!$('.full_loding').hasClass('none') ? $('.full_loding').addClass('none') : ''
				}, 400);
			}
			
		},
		errCallback : function(errCd, errMsg){
			$('.full_loding').addClass('none');
		}
	});
}

// 문의 목록 조회
var qnaListSearch = function() {

	var qnaType = $('#qnaType').val();
	var appIdx = $('#appInfo').val();

	if(currentPageNum > totalPageCnt) {
		$('#qnaList').html('');
		$('#qnaList').addClass('none');
	}

	MNet.httpSend({
		path: "skimp/common/api/SKIMP-0023",
		sendData: {
			askUserId: MData.storage('encData').userId
			, qnaType: qnaType
			, appIdx: appIdx
			, cdGrpId: "Q0001"
			, pageNum: currentPageNum
			, pageSize: '10'
		},
		callback: function(rst) {
			var listHtml = '';
			var listData = rst.qnaList;

			$('.no-date').addClass('none');

			if(listData.length <= 0) {
				$('.no-date').removeClass('none');
				
				//#content 영역 보이기
				$('#content > div').not('.no-date, #qnaList').removeClass('none');
			} else {

				totalPageCnt = Math.ceil(rst.count / 10);

				listData.forEach((item, idx) => {

					var qnaContent = item.qna_content.replace(/\n/g, '<br>');
					
					listHtml += '<dl>';
					listHtml += '<dt class="cursor">';
					listHtml += '<h3>';
					
					// 답변여부 체크
					if(item.rpl_rslt_yn == "Y") {
						listHtml += '<span class="answer-done">답변완료</span>';
					} else {
						listHtml += '<span class="answer-wait">답변대기</span>';
					}
					
					listHtml += item.qna_title + '</h3>';
					listHtml += '<p class="date">' + item.ask_dt;
					
					// 앱 명칭 추가 체크
					if(item.app_nm != "" && item.app_nm != null && item.app_nm != undefined) {
						listHtml += ' / ' + item.app_nm + '</p>';
					} else {
						listHtml += '</p>';
					}
					
					listHtml += '</dt>';
					listHtml += '<dd style="display:none">';
					listHtml += '<div class="notice-content"><span>문의 내역(' + item.qna_type_nm + ')</span><br/>' + qnaContent + '</div>';
					
					// 답변출력
					if(item.rpl_rslt_yn == "Y") {
						var rqlContent = item.rpl_content.replace(/\r\n/g, '<br>');

						listHtml += '<div class="notice-content btn-list"><span>관리자 답변</span><br/>' + rqlContent + '</div>';
					}

					listHtml += '</dd>';
					listHtml += '</dl>';
				})

				$('#qnaList').append(listHtml);

				$('#qnaList').removeClass('none');
				$('.no-date').addClass('none');
			}

			setTimeout(function (){
				!$('.full_loding').hasClass('none') ? $('.full_loding').addClass('none') : ''
			}, 400);
		},
		errCallback: function(errCd, errMsg) {
			$('.full_loding').addClass('none');
		}
	});
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
