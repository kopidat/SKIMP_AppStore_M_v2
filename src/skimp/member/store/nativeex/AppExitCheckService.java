package skimp.member.store.nativeex;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;

import java.io.FileDescriptor;
import java.io.PrintWriter;

import skimp.member.store.common.Utils;

/**
 * 앱 강제종료 핸들링
 */
public class AppExitCheckService extends Service {
    private static final String TAG = AppExitCheckService.class.getSimpleName();

    @Override
    public void onCreate() {
        Log.e(TAG,"onCreate()");
        super.onCreate();
    }

    @Override
    public void onStart(Intent intent, int startId) {
        Log.e(TAG,"onStart(Intent intent, int startId)");
        super.onStart(intent, startId);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.e(TAG,"onStartCommand(Intent intent, int flags, int startId)");
        Log.e(TAG, "flags = " + flags);
        Log.e(TAG, "startId = " + startId);

        Utils.debugIntent(TAG, intent);

//        return super.onStartCommand(intent, flags, startId);
        int superOnStartCommand = super.onStartCommand(intent, flags, startId);
        Log.e(TAG, "superOnStartCommand = " + superOnStartCommand);
        return superOnStartCommand;
    }

    @Override
    public void onDestroy() {
        Log.e(TAG,"onDestroy()");
        super.onDestroy();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        Log.e(TAG,"onConfigurationChanged(Configuration newConfig) = " + newConfig);
        super.onConfigurationChanged(newConfig);
    }

    @Override
    public void onLowMemory() {
        Log.e(TAG,"onLowMemory()");
        super.onLowMemory();
    }

    @Override
    public void onTrimMemory(int level) {
        Log.e(TAG,"onTrimMemory(int level) = " + level);
        super.onTrimMemory(level);
    }

    @Override
    public boolean onUnbind(Intent intent) {
        Log.e(TAG,"onUnbind(Intent intent) = " + intent);
        return super.onUnbind(intent);
    }

    @Override
    public void onRebind(Intent intent) {
        Log.e(TAG,"onRebind(Intent intent) = " + intent);
        super.onRebind(intent);
    }

    @Override
    protected void dump(FileDescriptor fd, PrintWriter writer, String[] args) {
        super.dump(fd, writer, args);
    }

    @Override
    protected void attachBaseContext(Context newBase) {
        Log.e(TAG,"attachBaseContext(Context newBase) = " + newBase);
        super.attachBaseContext(newBase);
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        Log.e(TAG,"onBind(Intent intent) = " + intent);

        Utils.debugIntent(TAG, intent);

        return null;
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        Log.e(TAG,"onTaskRemoved(Intent rootIntent) = " + rootIntent);
        super.onTaskRemoved(rootIntent);

        Utils.debugIntent(TAG, rootIntent);

        MDM.getInstance().release();

        // 자동으로 다시 실행안되기 때문에 stopSelf() 호출하면 안됨.
//        stopSelf();
    }

}