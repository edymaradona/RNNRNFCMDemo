package com.example;

import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.util.Log;
import android.widget.ProgressBar;

import com.google.firebase.iid.FirebaseInstanceId;
import com.reactnativenavigation.controllers.SplashActivity;

import in.tweedl.pushextension.localnotification.DatabaseManager;

public class MainActivity extends SplashActivity {

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.e("foooooo", "inside on create");
        String refreshedToken = FirebaseInstanceId.getInstance().getToken();
        Log.e("fooooooo", "Refreshed token: " + refreshedToken);
    }


    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }
}
