package skimp.member.store.nativeex;

import android.annotation.SuppressLint;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.provider.Settings;
import android.util.Log;

import com.sktelecom.ssm.lib.SSMLib;
import com.sktelecom.ssm.lib.SSMLibListener;
import com.sktelecom.ssm.lib.constants.SSMProtocolParam;
import com.sktelecom.ssm.remoteprotocols.ResultCode;

import org.json.JSONObject;

/**
 * MDM(SSM) 연동 클래스
 */

public class MDM extends NativeBase implements SSMLibListener {
	private static final String TAG = MDM.class.getSimpleName();

	/** MDM(SSM)앱 패키지명 */
	private static final String MDM_PACKAGE_NAME = "com.sktelecom.ssm";

//	private static final String MDM_INSTALL_URL = "https://qa.ssm.link/inhouse";
	private static final String MDM_INSTALL_URL = "https://ssm-skimp.skinnovation.com:52444/inhouse";
	private static final String MDM_SERVER_URL = "https://ssm-skimp.skinnovation.com:52444";

	public static final int OK = SSMLib.OK;
	public static final int ERROR_NOT_INSTALLED = ResultCode.NOT_INSTALLED;
	public static final int ERROR_OLD_VERSION_INSTALLED = ResultCode.OLD_VERSION_INSTALLED;



	public interface OnResultListener {
		void onResult(JSONObject result);
	}

	private static MDM sInstance;
	public static synchronized MDM getInstance() {
		if (sInstance == null) {
			sInstance = new MDM();
		}
		return sInstance;
	}

	/** MDM(SSM) 라이브러리 */
	private SSMLib ssmLib;

	private MDM() {
	}

	private Context mApplicationContext;

	// 1. MDM(SSM) 설치확인 확인
	public boolean isInstalled() {
		return ssmLib.isInstalledSSM();
	}

	// 2. MDM(SSM) 설치페이지 이동
	public void goInstallPage(Context context) {
		context.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(MDM_INSTALL_URL)));
	}

	// 3. MDM(SSM) 로그인
	public int login() {
		return ssmLib.setLoginStatus(SSMProtocolParam.LOGIN);
	}

	// 4. MDM(SSM) 로그아웃
	public int logout() {
		return ssmLib.setLoginStatus(SSMProtocolParam.LOGOUT);
	}

	public int init(Context context) {
		Log.e(TAG, "init(Context context) = " + context);

		mApplicationContext = context.getApplicationContext();
		Log.e(TAG, "mApplicationContext = " + mApplicationContext);

		/* SSMLib의 체 생성 및 Listener를 등록 */
		ssmLib = SSMLib.getInstance(context);
		ssmLib.registerSSMListener(this);

		/* SSMLib 초기화 */
		int code = ssmLib.initialize();
		Log.e(TAG, "ssmLib.initialize() code = " + code);

		registerPackageEventReceiver();

		return code;
	}

	public void release() {
		ssmLib.release();
		unregisterPackageEventReceiver();
	}

	public int checkMDM(Context context) {
		Log.i(TAG, "checkMDM(Context context)");
		if(ssmLib == null) {
			init(context);
		}
		/* SSM 유효성 확인 */
		int result = ssmLib.checkSSMValidation();
		Log.e(TAG, "ssmLib.checkSSMValidation() result = " + result);

		// 단말에 설치된 MDM(SSM)이 예전 서버를 바라보고 있으면 새로운 MDM(SSM) 설치 유도
		if(!ssmLib.getServerUrl().equals(MDM_SERVER_URL)) {
			result = ERROR_OLD_VERSION_INSTALLED;
		}

		return result;
	}

	@SuppressLint("HardwareIds")
	private String getMySsaid(Context context) {
		return Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ANDROID_ID).toUpperCase();
	}

	private void setSSMSSAID(Context context) {
		Log.e(TAG, "setSSMSSAID(Context context)");
		Log.e(TAG, "Before ssmLib.getSSMSsaid() = " + ssmLib.getSSMSsaid());

		int result = ssmLib.setSsmSsaid(getMySsaid(context));
		Log.e(TAG, "ssmLib.setSsmSsaid result = " + result);

		Log.e(TAG, "After ssmLib.getSSMSsaid() = " + ssmLib.getSSMSsaid());
	}

	public String getMessage(int result) {
		String str = "";
		switch (result) {
			case ResultCode.OK_PANDING:
				str = "타엡에서 SSM 제어를 이미 사용하고 있습니다.";
				break;
			case ResultCode.OK:
				str = "성공";
				break;
			case ResultCode.ERROR_CONNECTION:
				str = "바인딩 실패";
				break;
			case ResultCode.FAILED:
				str = "실패";
				break;
			case ResultCode.ERROR:
				str = "에러";
				break;
			case ResultCode.NOT_INSTALLED:
				str = "SSM 미설치 - 설치 페이지로 이동합니다.";
				break;
			case ResultCode.UNREGISTERED:
				str = "SSM 미인증";
				break;
			case ResultCode.OLD_VERSION_INSTALLED:
				str = "SSM 이전버전 설치됨 - 설치 페이지로 이동합니다.";
				break;
			case ResultCode.NO_PERMISSION:
				str = "앱이 권한을 가지고 있지 않습니다.";
				break;
		}

		return str;
	}

	private PackageEventReceiver mPackageEventReceiver;

	private void registerPackageEventReceiver() {
		Log.e(TAG, "registerPackageEventReceiver()");
		if(mPackageEventReceiver == null) {
			Log.e(TAG, "if(mPackageEventReceiver == null) {");
			mPackageEventReceiver = new PackageEventReceiver();
			IntentFilter intentFilter = new IntentFilter();
			// 앱 업데이트하면 PACKAGE_REMOVED -> PACKAGE_ADDED -> PACKAGE_REPLACED 순으로 호출됨.
			// 따라서 PACKAGE_ADDED만 처리하면 됨.
			intentFilter.addAction(Intent.ACTION_PACKAGE_ADDED);
			intentFilter.addDataScheme("package");
			mApplicationContext.registerReceiver(mPackageEventReceiver, intentFilter);
		}
	}

	private void unregisterPackageEventReceiver() {
		if(mPackageEventReceiver != null) {
			mApplicationContext.unregisterReceiver(mPackageEventReceiver);
			mPackageEventReceiver = null;
		}
	}

	private static class PackageEventReceiver extends BroadcastReceiver {
		@Override
		public void onReceive(Context context, Intent intent) {
			Log.e(TAG, "onReceive(Context context, Intent intent)");
			String packageName = intent.getData().getSchemeSpecificPart();
			String action = intent.getAction();

			Log.e(TAG, "action = " + action);
			Log.e(TAG, "packageName = " + packageName);

			if(action.equals(Intent.ACTION_PACKAGE_ADDED)) {
				if(packageName.equalsIgnoreCase(MDM_PACKAGE_NAME)) {
					// MDM(SSM) 재설치시 SSM앱과 스토어앱 ssaid 싱크맞추기 위해 init.
					// ssmLib.initialize 해야 서비스 바인딩하고 onSSMConnected 호출됨.
					// 실재로 싱크는 onSSMConnected에서 수행.
					getInstance().init(context);
				}
			}
		}
	}

	@Override
	public void onSSMInstalled() {
		Log.e(TAG, "onSSMInstalled()");
		/* SSM 설치 완료 되었을 경우 호출 됨 */

		/* SSMLib 초기화 */
		ssmLib.initialize();
		// SSM앱과 스토어앱 ssaid 싱크
		setSSMSSAID(mApplicationContext);
	}

	@Override
	public void onSSMConnected() {
		Log.e(TAG, "onSSMConnected()");
		/* SSMLib 와 SSM가 binding 되었을 때 호출 됨 */

		// SSM앱과 스토어앱 ssaid 싱크
		setSSMSSAID(mApplicationContext);

		/* SSM 유효성 확인 */
		int result = ssmLib.checkSSMValidation();
		Log.e(TAG, "ssmLib.checkSSMValidation() result = " + result);
	}

	@Override
	public void onSSMRemoved() {
		Log.e(TAG, "onSSMRemoved()");
	}

	@Override
	public void onSSMResult(String key, Object returnValue) {
		Log.e(TAG, "onSSMResult(String key, Object returnValue)");
		Log.e(TAG, "key / returnValue = " + key + " / " + returnValue);
	}

}
