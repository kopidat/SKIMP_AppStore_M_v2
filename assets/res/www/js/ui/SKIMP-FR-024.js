/**
  * SKIMP-FR-024.js
 * @ 근무지역 설정
 * 2022.02.16
 */

var pageInit = function(){
	pageEvent();
	usrInfo();
	workLocation();
};

var pageEvent = function(){
	
	// 근무지 저장 이벤트
	$(document).on('click', '#btnLocMod', function() {
		var positionId = $("[name='wrk-location']:checked").val();
		if(positionId != null && positionId != undefined && positionId != '') {
			locationMod();
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

		MPage.html({
			url : thisPageUrl,
			animation : "NONE",
		})
	});
	
};

// 근무지역 목록 조회(공통코드 조회)
var workLocation = function() {
	MNet.httpSend({
		path: "skimp/common/api/SKIMP-0021",
		sendData: {
			cdGrpId: "CM001"
		},
		callback: function(rst) {

			$("#locationList").html("");

			var locationList = getListPopArr(rst.sysCdList, "cd_nm", "cd_id");

			var locationHtml = "";

			locationList.forEach((item, idx)=> {
				locationHtml += '<li><label for="radio';
				locationHtml += idx;
				locationHtml += '" class="radio-box"><input type="radio" class="radio" name="wrk-location" id="radio';
				locationHtml += idx;
				locationHtml += '" value="';
				locationHtml += item.value;
				locationHtml += '"><span>';
				locationHtml += item.title;
				locationHtml += '</span></label></li>';
			});

			$("#locationList").append(locationHtml);

			var positionId = 'A101';
			
			if(MData.storage('positionInfo').userId == MData.storage('encData').userId) {
				positionId = !StringUtil.isEmpty(MData.storage('positionInfo')) ? MData.storage('positionInfo').positionId : 'A101';
			}
			
			$('input:radio[name=wrk-location]:input[value=' + positionId + ']').prop("checked", true);

			setTimeout(function (){
				!$('.full_loding').hasClass('none') ? $('.full_loding').addClass('none') : ''
			}, 400);

		},
		errCallback: function(errCd, errMsg) {
			$('.full_loding').addClass('none');
		}
	});
}

// 근무지역 저장
var locationMod = function() {
	
	var hphone = MInfo.device("comm.phone");
	var positionId = $("[name='wrk-location']:checked").val();
	var osKind = MNavigator.device("ios") ? "2" : "1";
	var userId = MData.storage('encData').userId;
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
			M.pop.instance({
				message : "근무지 변경을 실패하였습니다."
				, showTime : "SHORT"
			});
			$('.full_loding').addClass('none');
		}
	});
}

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