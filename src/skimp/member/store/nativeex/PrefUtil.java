
package skimp.member.store.nativeex;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;

import androidx.annotation.NonNull;
import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKeys;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;

import skimp.member.store.implementation.ExtendApplication;

public class PrefUtil {

	private static final String TAG = PrefUtil.class.getSimpleName();

	private static final byte[] SECURE_KEY = {'c', 'o', 'm', '.', 's', 'k', 'i', 'm', 'p', '.', 'c', 'o', 'm', 'm', 'o', 'n',
			'c', 'o', 'm', '.', 's', 'k', 'i', 'm', 'p', '.', 'c', 'o', 'm', 'm', 'o', 'n'};
	private static final byte[] APP_HASH_KEY = {'1', 'R', 'b', '4', 'O', 'l', 'R', 'G', 'Q', 'C', '0', 'm', 'Y', '1', '8', 'e',
			'o', 'X', 'Y', 'R', 'E', '+', '/', 'D', 'C', 'N', 'g', '='};


	private static final String KEY_SECURE_KEY = "KEY_SECURE_KEY";
	private static final String KEY_APP_HASH_KEY = "KEY_APP_HASH_KEY";

	private static final String KEY_IS_FIRST_REQUEST_PRIFIX = "KEY_IS_FIRST_REQUEST_";

	private static SharedPreferences sSharedPreferences;

	static {
		Context context = ExtendApplication.getInstance().getApplicationContext();
		sSharedPreferences = getSharedPreferences(context);
		putString(context, KEY_SECURE_KEY, new String(SECURE_KEY));
		putString(context, KEY_APP_HASH_KEY, new String(APP_HASH_KEY));
		Arrays.fill(SECURE_KEY, (byte)0x20);
		Arrays.fill(APP_HASH_KEY, (byte)0x20);
	}


	public static final String getSecureKey(Context context) {
		return getString(context, KEY_SECURE_KEY, new String(SECURE_KEY));
	}

	public static final String getKeyAppHashKey(Context context) {
		return getString(context, KEY_APP_HASH_KEY, new String(APP_HASH_KEY));
	}

	public static void setFirstRequest(Context context, @NonNull String[] permissions) {
		for (String permission : permissions) {
			setFirstRequest(context, permission);
		}
	}

	private static void setFirstRequest(Context context, String permission) {
		putBoolean(context, getPrefsNamePermission(permission), false);
	}

	public static boolean isFirstRequest(Context context, @NonNull String[] permissions) {
		for (String permission : permissions) {
			if (!isFirstRequest(context, permission)) {
				return false;
			}
		}
		return true;
	}

	public static boolean isFirstRequest(Context context, String permission) {
		return getBoolean(context, getPrefsNamePermission(permission), true);
	}

	private static String getPrefsNamePermission(String permission) {
		return KEY_IS_FIRST_REQUEST_PRIFIX + permission;
	}

	public static void clearSharedPreference(Context context) {
		Editor editor = getEditor(context);
		editor.clear();
		editor.commit();
	}
	
	private static void remove(Context context, String key) {
		Editor editor = getEditor(context);
		editor.remove(key);
		editor.commit();
	}
	
	public static void removeAll(Context context) {
		Editor editor = getEditor(context);
		editor.clear();
		editor.commit();
	}

	private static SharedPreferences getEncryptedSharedPreferences(Context context) {
		if(sSharedPreferences != null) {
			return sSharedPreferences;
		}

		String sharedPrefsFile = context.getPackageName() + "_secret_shared_prefs";
		String masterKeyAlias = null;
		try {
			masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC);
		} catch (GeneralSecurityException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}

		try {
			sSharedPreferences = EncryptedSharedPreferences.create(
					sharedPrefsFile,
					masterKeyAlias,
					context,
					EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
					EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
			);
		} catch (GeneralSecurityException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}

		return sSharedPreferences;
	}

	private static SharedPreferences getSharedPreferences(Context context) {
//		return context.getSharedPreferences(context.getPackageName(), Context.MODE_PRIVATE);
		return getEncryptedSharedPreferences(context);
	}
	
	private static Editor getEditor(Context context) {
		SharedPreferences prefs = getSharedPreferences(context);
		return prefs.edit();
	}
	
	private static void putString(Context context, String key, String value) {
		Editor editor = getEditor(context);
		editor.putString(key, value);
		editor.commit();
	}
	
	private static String getString(Context context, String key, String defValue) {
		SharedPreferences prefs = getSharedPreferences(context);
		return prefs.getString(key, defValue);
	}
	
	private static String getString(Context context, String key) {
		return getString(context, key, null);
	}
	
	private static void putInt(Context context, String key, int value) {
		Editor editor = getEditor(context);
		editor.putInt(key, value);
		editor.commit();
	}
	
	private static int getInt(Context context, String key, int defValue) {
		SharedPreferences prefs = getSharedPreferences(context);
		return prefs.getInt(key, defValue);
	}
	
	private static int getInt(Context context, String key) {
		return getInt(context, key, 0);
	}
	
	private static void putLong(Context context, String key, long value) {
		Editor editor = getEditor(context);
		editor.putLong(key, value);
		editor.commit();
	}
	
	private static long getLong(Context context, String key, long defValue) {
		SharedPreferences prefs = getSharedPreferences(context);
		return prefs.getLong(key, defValue);
	}
	
	private static long getLong(Context context, String key) {
		return getLong(context, key, 0);
	}
	
	private static void putFloat(Context context, String key, float value) {
		Editor editor = getEditor(context);
		editor.putFloat(key, value);
		editor.commit();
	}
	
	private static float getFloat(Context context, String key, float defValue) {
		SharedPreferences prefs = getSharedPreferences(context);
		return prefs.getFloat(key, defValue);
	}
	
	private static float getFloat(Context context, String key) {
		return getFloat(context, key, 0);
	}
	
	private static void putBoolean(Context context, String key, boolean value) {
		Editor editor = getEditor(context);
		editor.putBoolean(key, value);
		editor.commit();
	}
	
	private static boolean getBoolean(Context context, String name, boolean defValue) {
		SharedPreferences prefs = getSharedPreferences(context);
		return prefs.getBoolean(name, defValue);
	}
	
	private static boolean getBoolean(Context context, String key) {
		return getBoolean(context, key, false);
	}
}