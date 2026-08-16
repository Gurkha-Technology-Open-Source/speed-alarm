package org.gurkhatech.speedalarm;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

/**
 * Starts the app after device boot when the user has enabled auto-start in settings.
 * The WebView layer then resumes GPS monitoring.
 */
public class BootReceiver extends BroadcastReceiver {

    static final String PREFS = "SpeedAlarmSystem";
    static final String KEY_BOOT_AUTO = "boot_auto_start";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        if (!Intent.ACTION_BOOT_COMPLETED.equals(action)
                && !"android.intent.action.QUICKBOOT_POWERON".equals(action)
                && !"com.htc.intent.action.QUICKBOOT_POWERON".equals(action)) {
            return;
        }

        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (!prefs.getBoolean(KEY_BOOT_AUTO, false)) return;

        Intent launch = new Intent(context, MainActivity.class);
        launch.putExtra("from_boot", true);
        launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        context.startActivity(launch);
    }
}
