package com.mmmmm;

import android.content.Context;

import com.janeasystems.rn_nodejs_mobile.RNNodeJsMobilePackage;
import com.aakashns.reactnativedialogs.ReactNativeDialogsPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.peel.react.TcpSocketsModule;
import com.peel.react.rnos.RNOSModule;
import com.rnfs.RNFSPackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.reactnativenavigation.NavigationApplication;
import com.staltz.reactnativeandroidlocalnotification.NotificationPackage;
import com.staltz.reactnativehasinternet.HasInternetPackage;
import com.devstepbcn.wifi.AndroidWifiPackage;
import org.acra.*;
import org.acra.annotation.*;

import java.util.Arrays;
import java.util.List;

@AcraCore(buildConfigClass = BuildConfig.class)
@AcraMailSender(mailTo = "incoming+staltz/mmmmm-mobile@incoming.gitlab.com")
@AcraDialog(resText = R.string.acra_dialog_text, resCommentPrompt = R.string.acra_dialog_comment)
public class MainApplication extends NavigationApplication {

  @Override
  protected void attachBaseContext(Context base) {
    super.attachBaseContext(base);
    ACRA.init(this);
  }

  @Override
  public boolean isDebug() {
    // Make sure you are using BuildConfig from your own application
    return BuildConfig.DEBUG;
  }

  protected List<ReactPackage> getPackages() {
    // Add additional packages you require here
    // No need to add RnnPackage and MainReactPackage
    return Arrays.<ReactPackage>asList(new MainReactPackage(),
            new HasInternetPackage(),
            new AndroidWifiPackage(), new TcpSocketsModule(), new RNFSPackage(),
        new RandomBytesPackage(), new RNNodeJsMobilePackage(), new ReactNativeDialogsPackage(),
        new VectorIconsPackage(), new RNOSModule(), new NotificationPackage());
  }

  @Override
  public List<ReactPackage> createAdditionalReactPackages() {
    return getPackages();
  }

}
