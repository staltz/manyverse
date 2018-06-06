package com.mmmmm;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.view.inputmethod.InputMethodManager;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.util.ReactFindViewUtil;
import com.janeasystems.rn_nodejs_mobile.RNNodeJsMobilePackage;
import com.aakashns.reactnativedialogs.ReactNativeDialogsPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.peel.react.TcpSocketsModule;
import com.peel.react.rnos.RNOSModule;
import com.reactnativenavigation.controllers.ActivityCallbacks;
import com.reactnativenavigation.controllers.NavigationActivity;
import com.rnfs.RNFSPackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.staltz.react.workers.WorkersPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.reactnativenavigation.NavigationApplication;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication {

  @Override
  public boolean isDebug() {
    // Make sure you are using BuildConfig from your own application
    return BuildConfig.DEBUG;
  }

  protected List<ReactPackage> getPackages() {
    // Add additional packages you require here
    // No need to add RnnPackage and MainReactPackage
    return Arrays.<ReactPackage>asList(
      new MainReactPackage(),
      new RNNodeJsMobilePackage(),
      new ReactNativeDialogsPackage(),
      new VectorIconsPackage(),
      new TcpSocketsModule(),
      new RNOSModule(),
      new RNFSPackage(),
      new RandomBytesPackage(),
      new WorkersPackage(
        new TcpSocketsModule(),
        new RNOSModule(),
        new RNFSPackage(),
        new RandomBytesPackage()
      )
    );
  }

  @Override
  public List<ReactPackage> createAdditionalReactPackages() {
    return getPackages();
  }

  @Override
  public void onCreate() {
    super.onCreate();
    setActivityCallbacks(new ActivityCallbacks() {
      @Override
      public void onActivityCreated(Activity activity, Bundle savedInstanceState) { }

      @Override
      public void onActivityStarted(Activity activity) { }

      @Override
      public void onActivityResumed(final Activity activity) {
        emitIfPossible("resumed");
        View toBeFocused = findViewToBeSearched(activity);
        if (toBeFocused != null) {
          focusSoftInputOn(toBeFocused);
        }
      }

      @Override
      public void onActivityPaused(Activity activity) {
        emitIfPossible("paused");
      }

      @Override
      public void onActivityStopped(Activity activity) { }

      @Override
      public void onActivityDestroyed(Activity activity) { }

      View findViewToBeSearched(final Activity activity) {
        View rootView;
        if (activity instanceof NavigationActivity) {
          rootView = ((NavigationActivity) activity).getScreenWindow().getDecorView();
        } else {
          rootView = activity.getWindow().getDecorView();
        }
        if (rootView == null) return null;
        return ReactFindViewUtil.findView(rootView, "FocusViewOnResume");
      }

      void focusSoftInputOn(final View toBeFocused) {
        final Handler handler = new Handler();
        handler.postDelayed(new Runnable() {
          @Override
          public void run() {
            toBeFocused.requestFocus();
            InputMethodManager imm = (InputMethodManager)
                    getSystemService(Context.INPUT_METHOD_SERVICE);
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
    });
  }
}
