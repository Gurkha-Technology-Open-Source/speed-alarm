package org.gurkhatech.speedalarm;

import android.Manifest;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "SystemBridge",
    permissions = {
        @Permission(
            strings = { Manifest.permission.FOREGROUND_SERVICE_LOCATION },
            alias = "foregroundServiceLocation"
        )
    }
)
public class SystemBridgePlugin extends Plugin {

    static final String PREFS = "SpeedAlarmSystem";
    static final String KEY_BOOT_AUTO = "boot_auto_start";

    private static volatile boolean autoStartPending = false;

    static void markAutoStartPending() {
        autoStartPending = true;
    }

    @PluginMethod
    public void ensureTrackingPermissions(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            if (getPermissionState("foregroundServiceLocation") != PermissionState.GRANTED) {
                requestPermissionForAlias("foregroundServiceLocation", call, "onTrackingPermissions");
                return;
            }
        }
        call.resolve();
    }

    @PermissionCallback
    private void onTrackingPermissions(PluginCall call) {
        call.resolve();
    }

    @PluginMethod
    public void setBootAutoStart(PluginCall call) {
        Boolean enabled = call.getBoolean("enabled", false);
        getContext()
            .getSharedPreferences(PREFS, android.content.Context.MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_BOOT_AUTO, enabled)
            .apply();
        call.resolve();
    }

    @PluginMethod
    public void consumeAutoStartFlag(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("autoStart", autoStartPending);
        autoStartPending = false;
        call.resolve(ret);
    }

    @PluginMethod
    public void openBatterySettings(PluginCall call) {
        try {
            String pkg = getContext().getPackageName();
            PowerManager pm = (PowerManager) getContext().getSystemService(android.content.Context.POWER_SERVICE);
            Intent intent = new Intent();
            if (pm != null && !pm.isIgnoringBatteryOptimizations(pkg)) {
                intent.setAction(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                intent.setData(Uri.parse("package:" + pkg));
            } else {
                intent.setAction(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
            }
            getActivity().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }
}
