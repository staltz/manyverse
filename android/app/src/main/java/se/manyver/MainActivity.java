/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package se.manyver;

import android.app.Activity;
import android.content.Context;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import androidx.annotation.Nullable;
import android.util.Log;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.LinearLayout;

import com.facebook.react.bridge.Arguments;
import com.janeasystems.rn_nodejs_mobile.RNNodeJsMobileModule;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.util.ReactFindViewUtil;
import com.reactnativenavigation.NavigationActivity;

import org.acra.ACRA;

public class MainActivity extends NavigationActivity {

    private RNNodeJsMobileModule nodejsModule;

    public void setSplashLayout() {
        LinearLayout view = new LinearLayout(this);
        view.setBackgroundColor(Color.parseColor("#3b5bdb"));
        LinearLayout.LayoutParams lp = new
        LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 315);
        view.setLayoutParams(lp);
        // View view = new View(this);
        // view.setBackgroundColor(Color.WHITE);
        setContentView(view);
    }

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
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
