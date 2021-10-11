// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

package se.manyver;

import android.app.Activity;
import android.content.Context;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import androidx.annotation.Nullable;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.inputmethod.InputMethodManager;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.content.Intent;
import android.content.res.Configuration;

import com.facebook.react.bridge.Arguments;
import com.janeasystems.rn_nodejs_mobile.RNNodeJsMobileModule;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.util.ReactFindViewUtil;
import com.reactnativenavigation.NavigationActivity;
import org.devio.rn.splashscreen.SplashScreen;

import org.acra.ACRA;

public class MainActivity extends NavigationActivity {

    private RNNodeJsMobileModule nodejsModule;

    public void setSplashLayout() {
        LinearLayout linearLayout = new LinearLayout(this);
        linearLayout.setBackgroundColor(Color.parseColor("#3b5bdb"));
        LinearLayout.LayoutParams lp =
            new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.MATCH_PARENT);
        linearLayout.setLayoutParams(lp);
        linearLayout.setOrientation(LinearLayout.VERTICAL);
        linearLayout.setGravity(Gravity.CENTER);

        ImageView imageView = new ImageView(this);
        imageView.setImageResource(R.drawable.logo_outline);
        imageView.setLayoutParams(
            new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT));
        linearLayout.addView(imageView);

        setContentView(linearLayout);
    }

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        SplashScreen.show(this, R.style.AppTheme);
        super.onCreate(savedInstanceState);
        setSplashLayout();
        try {
            this.maybeStartNodejs();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    void maybeStartNodejs() throws Exception {
        if (this.nodejsModule != null) {
            try {
                this.nodejsModule.startNodeProject("loader.js", Arguments.createMap());
            } catch (Exception e) {
                Log.e("NODEJS-RN", "startNodeProject failed to run loader.js");
            }
            return;
        }
        ReactNativeHost host = MainApplication.instance.getReactNativeHost();
        if (host == null) {
            throw new Exception("maybeStartNodejs() failed because of no ReactNativeHost");
        }
        ReactInstanceManager manager = host.getReactInstanceManager();
        if (manager == null) {
            throw new Exception("maybeStartNodejs() failed because of no ReactInstanceManager");
        }
        manager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
            @Override
            public void onReactContextInitialized(ReactContext context) {
                nodejsModule = context.getNativeModule(RNNodeJsMobileModule.class);
                nodejsModule.setJsExceptionInvokable(new RNNodeJsMobileModule.Invokable<String>() {
                    public void invoke(String ex) {
                        ACRA.getErrorReporter().handleException(new Exception(ex));
                    }
                });
                try {
                    nodejsModule.startNodeProject("loader.js", Arguments.createMap());
                } catch (Exception e) {
                    Log.e("NODEJS-RN", "startNodeProject failed to run loader.js");
                }
                manager.removeReactInstanceEventListener(this);
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        emitIfPossible("resumed");
        View toBeFocused = findViewToBeSearched(this);
        if (toBeFocused != null) {
            focusSoftInputOn(toBeFocused);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        emitIfPossible("paused");
    }

    // @Override
    // protected void onDestroy() {
    //     super.onDestroy();
    // }

    // @Override
    // public void onReload() {
    //     super.onReload();
    // }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Intent intent = new Intent("onConfigurationChanged");
        intent.putExtra("newConfig", newConfig);
        this.sendBroadcast(intent);
    }

    View findViewToBeSearched(final Activity activity) {
        View rootView;
        rootView = activity.getWindow().getDecorView();
        if (rootView == null) return null;
        return ReactFindViewUtil.findView(rootView, "FocusViewOnResume");
    }

    void focusSoftInputOn(final View toBeFocused) {
        final Handler handler = new Handler();
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                toBeFocused.requestFocus();
                InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
                imm.showSoftInput(toBeFocused, InputMethodManager.SHOW_IMPLICIT);
            }
        }, 100);
    }

    void emitIfPossible(String value) {
        ReactNativeHost host = MainApplication.instance.getReactNativeHost();
        if (host == null) return;
        ReactInstanceManager manager = host.getReactInstanceManager();
        if (manager == null) return;
        ReactContext context = manager.getCurrentReactContext();
        if (context == null) return;
        DeviceEventManagerModule.RCTDeviceEventEmitter module = context
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
        if (module == null) return;
        module.emit("activityLifecycle", value);
    }

}
