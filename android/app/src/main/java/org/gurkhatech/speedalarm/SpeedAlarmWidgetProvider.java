package org.gurkhatech.speedalarm;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import org.json.JSONObject;

/**
 * Home-screen widget showing the configured speed limit and the most recent
 * trip (distance, average, max, safety score). Data is pushed from the web
 * layer through WidgetBridgePlugin; tapping the widget opens the app.
 */
public class SpeedAlarmWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        updateAll(context, manager, appWidgetIds);
    }

    static void updateAll(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int id : appWidgetIds) {
            manager.updateAppWidget(id, buildViews(context));
        }
    }

    private static RemoteViews buildViews(Context context) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_speed_alarm);

        String limit = "50 km/h";
        String tripLine1 = "No trips recorded yet";
        String tripLine2 = "";
        String score = "";

        SharedPreferences prefs = context.getSharedPreferences(
                WidgetBridgePlugin.PREFS_NAME, Context.MODE_PRIVATE);
        String raw = prefs.getString(WidgetBridgePlugin.KEY_DATA, null);
        if (raw != null) {
            try {
                JSONObject data = new JSONObject(raw);
                limit = data.optString("limit", limit);
                JSONObject trip = data.optJSONObject("lastTrip");
                if (trip != null) {
                    tripLine1 = trip.optString("date", "") + " · " + trip.optString("distance", "");
                    tripLine2 = "avg " + trip.optString("avg", "--") + " · max " + trip.optString("max", "--");
                    score = trip.optString("score", "");
                }
            } catch (Exception ignored) {
                // Corrupt snapshot: fall back to defaults.
            }
        }

        views.setTextViewText(R.id.widget_limit, "LIMIT " + limit);
        views.setTextViewText(R.id.widget_trip_line1, tripLine1);
        views.setTextViewText(R.id.widget_trip_line2, tripLine2);
        views.setTextViewText(R.id.widget_score, score);

        Intent launch = new Intent(context, MainActivity.class);
        launch.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(
                context, 0, launch,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, pi);

        return views;
    }
}
