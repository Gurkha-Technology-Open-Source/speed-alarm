package org.gurkhatech.speedalarm;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Tiny bridge that lets the web layer push a JSON snapshot to the
 * home-screen widget. The snapshot is persisted in SharedPreferences so the
 * widget can render it even when the app process is dead.
 */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    static final String PREFS_NAME = "SpeedAlarmWidget";
    static final String KEY_DATA = "data";

    @PluginMethod
    public void update(PluginCall call) {
        String data = call.getString("data");
        if (data == null) {
            call.reject("Missing 'data'");
            return;
        }

        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_DATA, data).apply();

        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(
                new ComponentName(context, SpeedAlarmWidgetProvider.class));
        if (ids.length > 0) {
            SpeedAlarmWidgetProvider.updateAll(context, manager, ids);
        }

        call.resolve();
    }
}
