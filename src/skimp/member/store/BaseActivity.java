package skimp.member.store;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Build;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.webkit.ValueCallback;
import android.webkit.WebView;

import org.json.JSONException;
import org.json.JSONObject;

import m.client.android.library.core.utils.CommonLibUtil;
import m.client.android.library.core.utils.PLog;
import m.client.android.library.core.view.MainActivity;
import skimp.member.store.common.Const;
import skimp.member.store.common.Utils;
import skimp.member.store.implementation.ExtendApplication;
import skimp.member.store.implementation.ExtendWNInterface;
import skimp.member.store.manager.InterfaceManager;
import skimp.member.store.nativeex.MDM;
import skimp.member.store.nativeex.PermissionManager;
import skimp.member.store.push.PushMessageManager;

/**
 * BaseActivity Class
 * 
 * @author 김태욱(<a mailto="tukim@uracle.co.kr">tukim@uracle.co.kr</a>)
 * @version v 1.0.0
 * @since Android 2.1 <br>
 *        <DT><B>Date: </B>
 *        <DD>2013.08.01</DD>
 *        <DT><B>Company: </B>
 *        <DD>Uracle Co., Ltd.</DD>
 * 
 * 모피어스 내에서 제공되는 모든 Web 페이지의 기본이 되는 Activity
 * html 화면은 모두 BaseActivity 상에서 출력된다.
 * 제어를 원하는 이벤트들은 overriding 하여 구현하며, 각각 페이지 별 이벤트는 화면 단위로 분기하여 처리한다.
 * 플랫폼 내부에서 사용하는 클래스로 해당 클래스의 이름은 변경할 수 없다.
 * 
 * Copyright (c) 2001-2011 Uracle Co., Ltd. 
 * 166 Samseong-dong, Gangnam-gu, Seoul, 135-090, Korea All Rights Reserved.
 */

public class BaseActivity extends MainActivity {
	private static final String TAG = BaseActivity.class.getSimpleName();

	@Override
	public void onCreate(Bundle savedInstanceState) {
		PLog.e(TAG, "onCreate(Bundle savedInstanceState) = " + savedInstanceState);
		super.onCreate(savedInstanceState);

		// 사용자가 단말기 환경 설정에서 화면 크게/ 글씨 크기 등을 크게 변경하는 경우를 대비하여 최대한 깨지지 않게 맞추기 위한 `
		if (Build.VERSION.SDK_INT > Build.VERSION_CODES.ICE_CREAM_SANDWICH) {
			getWebView().getSettings().setTextZoom(100);
		}
	}

	@Override
	protected void onDestroy() {
		PLog.e(TAG, "onDestroy()");
		super.onDestroy();
	}

	@Override
	protected void onResume() {
		PLog.e(TAG, "onResume()");
		super.onResume();

//		// 인트로 페이지 이후에 MDM(MDS) 검사 하도록
//		String targetUrl = (String) mParams.getParam("TARGET_URL");
//		String introPageUrl = "www/html/SKIMP-FR-001.html";
//		if(targetUrl != null && targetUrl.contains(introPageUrl)) {
//			// do nothing
//			return;
//		}
//
//		if(ExtendApplication.sCheckMDM) {
//			checkMDM();
//		}
		
		// 루팅 체크
//		new ExtendWNInterface(this, getWebView()).exWNRootCheck();
		// 앱 위변조 체크
		new ExtendWNInterface(this, getWebView()).exWNVaildApp();
		// 해시값 체크
//		new ExtendWNInterface(this, getWebView()).getAppKeyHash();

	}
	
	/**
	 * Webview가 시작 될 때 호출되는 함수
	 */
	@Override
	public void onPageStarted (WebView view, String url, Bitmap favicon) {
		super.onPageStarted(view, url, favicon);
	}
	
	/**
	 * Webview내 컨텐츠가 로드되고 난 후 호출되는 함수
	 */
	@Override
	public void onPageFinished(WebView view, String url)  {
		super.onPageFinished(view, url);

		// 푸시 노티클릭으로 실행되었는지 체크
		PushMessageManager.checkStartFromPushNotiClick();

		// 개별앱에서 라이브러리를 통해 로그인이나 개별앱 업데이트를 위해 실행했는지 체크
		SchemeActivity.checkStartFromOtherApp();

		// 로그아웃 노티클릭으로 실행되었는지 체크
		LogoutNotiClickActivity.checkStartFromNotiClick();
	}

	@Override
	public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
		if(requestCode == PermissionManager.PERMISSIONS_REQUEST) {
			PermissionManager.getInstance().onRequestPermissionsResult(requestCode, permissions, grantResults);
		}

		super.onRequestPermissionsResult(requestCode, permissions, grantResults);
	}

	@Override
	public void onActivityResult(int requestCode, int resultCode, Intent data) {
		PLog.i(TAG, "onActivityResult(int requestCode, int resultCode, Intent data)");
		PLog.d(TAG, "requestCode = " + requestCode);
		PLog.d(TAG, "resultCode = " + resultCode);
		PLog.d(TAG, "data = " + data);

		Utils.debugIntent(TAG, data);

		if(data == null) return;

		super.onActivityResult(requestCode, resultCode, data);

		// 간편 인증
		if (requestCode == Const.REQ_AUTH_PIN) {
			Log.d("KDS", "result = "+data.getStringExtra("KEY_RESULT"));
			Log.d("KDS", "pin = "+data.getStringExtra("pin"));
			String result = data.getStringExtra("KEY_RESULT");
			String pin = data.getStringExtra("pin");
			String message = data.getStringExtra("message");
			JSONObject obj = new JSONObject();
			try {
				obj.put("result", result);
				obj.put("message", TextUtils.isEmpty(message)? result:message);
				if(!TextUtils.isEmpty(pin) || resultCode == Const.REQ_AUTH_PIN_GET)
					obj.put("pin", pin);
			} catch (JSONException e) {
				e.printStackTrace();
			}
			InterfaceManager.getInstance().loadUrl(this, Const.JS_PinAuthManager, result, obj);
		} else if (requestCode == Const.REQ_AUTH_PATTERN) {
			Log.d("KDS", "result = "+data.getStringExtra("KEY_RESULT"));
			Log.d("KDS", "KEY_CODE = "+data.getStringExtra("KEY_CODE"));
			String result = data.getStringExtra("KEY_RESULT");
			String KEY_CODE = data.getStringExtra("KEY_CODE");
			String message = data.getStringExtra("message");
			JSONObject obj = new JSONObject();
			try {
				obj.put("result", result);
				obj.put("message", TextUtils.isEmpty(message)? result:message);
				if(!TextUtils.isEmpty(KEY_CODE)) obj.put("KEY_CODE", KEY_CODE);
			} catch (JSONException e) {
				e.printStackTrace();
			}
			InterfaceManager.getInstance().loadUrl(this, Const.JS_PatternAuthManager, result, obj);
		}
	}

	AlertDialog mdmAlertDialog;
	private void showMDMErrorDialog(int errorCode) {
		if(mdmAlertDialog != null && mdmAlertDialog.isShowing()) {
			// do nothing
			return;
		}
		AlertDialog.Builder alertDialog = new AlertDialog.Builder(this);
		alertDialog.setCancelable(false);
		alertDialog.setTitle("알림");
		alertDialog.setMessage(MDM.getInstance().getMessage(errorCode));
		if(errorCode == MDM.ERROR_NOT_INSTALLED || errorCode == MDM.ERROR_OLD_VERSION_INSTALLED) {
			alertDialog.setNegativeButton("확인", new DialogInterface.OnClickListener() {
				@Override
				public void onClick(DialogInterface dialog, int which) {
					MDM.getInstance().goInstallPage(BaseActivity.this);
					// 앱 종료, 페이지 이동했을 경우 상위 액티비티만 종료하는게 아니라 앱을 종료하기 위해 finishAffinity() 사용
//					finish();
					finishAffinity();
				}
			});
		} else {
			alertDialog.setNegativeButton("종료", new DialogInterface.OnClickListener() {
				@Override
				public void onClick(DialogInterface dialog, int which) {
					// 앱 종료, 페이지 이동했을 경우 상위 액티비티만 종료하는게 아니라 앱을 종료하기 위해 finishAffinity() 사용
//					finish();
					finishAffinity();
				}
			});
		}

		mdmAlertDialog = alertDialog.create();
		mdmAlertDialog.show();
	}

	private void checkMDM() {
		int mdmResultCode = MDM.getInstance().checkMDM(this);
		if(mdmResultCode != MDM.OK) {
			showMDMErrorDialog(mdmResultCode);
		}
	}

}
