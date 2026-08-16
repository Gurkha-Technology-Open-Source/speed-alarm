package org.gurkhatech.speedalarm;

import android.content.Intent;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetBridgePlugin.class);
        registerPlugin(SystemBridgePlugin.class);
        super.onCreate(savedInstanceState);
        handleAutoStartIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleAutoStartIntent(intent);
    }

    private void handleAutoStartIntent(Intent intent) {
        if (intent != null && intent.getBooleanExtra("from_boot", false)) {
            SystemBridgePlugin.markAutoStartPending();
        }
    }
}
