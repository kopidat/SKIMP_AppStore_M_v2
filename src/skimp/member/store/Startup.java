package skimp.member.store;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.webkit.WebView;

import m.client.android.library.core.common.CommonLibHandler;
import m.client.android.library.core.common.LibDefinitions;
import m.client.android.library.core.utils.CommonLibUtil;
import skimp.member.store.common.Utils;
import skimp.member.store.implementation.ExtendApplication;
import skimp.member.store.nativeex.AppExitCheckService;
import skimp.member.store.nativeex.MDM;




/**
 * Startup Class
 * 
 * @author 김태욱(<a mailto="tukim@uracle.co.kr">tukim@uracle.co.kr</a>)
 * @version v 1.0.0
 * @since Android 2.1 <br>
 *        <DT><B>Date: </B>
 *        <DD>2013.08.01</DD>
 *        <DT><B>Company: </B>
 *        <DD>Uracle Co., Ltd.</DD>
 * 
 * 앱이 구동 될 시 시작되는 Activity 
 * 해당 Activity는 최초 앱 구동 후 실제 webApplication이 로딩 후(BaseActivity) 
 * 종료 된다. 
 * 
 * Copyright (c) 2011-2013 Uracle Co., Ltd. 
 * 166 Samseong-dong, Gangnam-gu, Seoul, 135-090, Korea All Rights Reserved.
 */

public class Startup extends Activity {
	
	private String CLASS_TAG = "Startup";

	private CommonLibHandler commLibHandle = CommonLibHandler.getInstance();
	
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
		Log.e(CLASS_TAG, "onCreate(Bundle savedInstanceState) = " + savedInstanceState);

    	super.onCreate(savedInstanceState);

		Utils.debugIntent(getIntent());

        ////////////////////////////////////////////////////////////////////////////////
		if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
			WebView.setWebContentsDebuggingEnabled(true);
		}

		// 최근 실행목록에서 앱 종료 확인용 서비스 and MDM(SSM)앱의 SSAID 설정을 위해 이용
		// 앱 종료시 AuthContentProvider 재실행되면서 ssmLib 초기화 시켜서 스토어앱 SSAID값을 SSM앱에 설정하도록 함.
		startService(new Intent(this, AppExitCheckService.class));

		if(ExtendApplication.sCheckMDM) {
			initMDM();
		} else {
			goMain();
		}
    }

	private void showMDMErrorDialog(int errorCode) {
		AlertDialog.Builder alertDialog = new AlertDialog.Builder(this);
		alertDialog.setTitle("알림");
		alertDialog.setMessage(MDM.getInstance().getMessage(errorCode));
		if(errorCode == MDM.ERROR_NOT_INSTALLED || errorCode == MDM.ERROR_OLD_VERSION_INSTALLED) {
			alertDialog.setNegativeButton("확인", new DialogInterface.OnClickListener() {
				@Override
				public void onClick(DialogInterface dialog, int which) {
					MDM.getInstance().goInstallPage(Startup.this);
					finishAffinity();
				}
			});
		} else {
			alertDialog.setNegativeButton("종료", new DialogInterface.OnClickListener() {
				@Override
				public void onClick(DialogInterface dialog, int which) {
					finishAffinity();
				}
			});
		}

		alertDialog.show();
	}

	private void initMDM() {
		int mdmResult = MDM.getInstance().init(this);
		Log.e(CLASS_TAG, "mdmResult = " + mdmResult);
		goMain();
	}

	private void checkMDM() {
		int mdmResult = MDM.getInstance().init(this);
		if(mdmResult != MDM.OK) {
			showMDMErrorDialog(mdmResult);
		} else {
			goMain();
		}
	}

	private void goMain() {
		// Local 서버 사용 조건을 해제 한다.
		CommonLibUtil.setVariableToStorage(LibDefinitions.strings.KEY_USE_LOCAL_SERVER, "false", this);

		// - 중요 -
		// 최초 시작 Activity에 아래의 코드를 넣어야 한다.

		commLibHandle.processAppInit(this);
		////////////////////////////////////////////////////////////////////////////////
	}

}
