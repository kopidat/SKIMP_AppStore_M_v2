package skimp.member.store.implementation;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.util.Log;

import m.client.android.library.core.common.MorpheusApplication;

public class ExtendApplication extends MorpheusApplication {
	private static final String TAG = ExtendApplication.class.getSimpleName();

	public static final boolean sCheckMDM = true;

	private static String sLogoutNotiChannelId;

	public ExtendApplication() {
	}

	public static String getLogoutNotiChannelId() {
		return sLogoutNotiChannelId;
	}

	@Override
	public void onCreate() {
		super.onCreate();

		sLogoutNotiChannelId = createLogoutNotiChannel();
	}

	private String createLogoutNotiChannel() {
		Log.i(TAG, "createLogoutNotiChannel()");

		String channelId = "logout notification alarm channel id";
		String channelName = "Logout notification 알람";

		if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.O) {
			return null;
		}

		int importance = NotificationManager.IMPORTANCE_DEFAULT;
		NotificationChannel notificationChannel = new NotificationChannel(channelId, channelName, importance);
		notificationChannel.setDescription("");
		notificationChannel.enableLights(true);
		notificationChannel.setLightColor(Color.RED);
		notificationChannel.setShowBadge(false);
		notificationChannel.enableVibration(true);
		notificationChannel.setVibrationPattern(new long[]{0, 500, 1000});
		Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
		AudioAttributes audioAttributes = new AudioAttributes.Builder()
				.setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
				.setUsage(AudioAttributes.USAGE_NOTIFICATION)
				.build();
		notificationChannel.setSound(defaultSoundUri, audioAttributes);

		final NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
		notificationManager.createNotificationChannel(notificationChannel);

		return channelId;
	}
}
