package com.mmmmm;

import com.janeasystems.rn_nodejs_mobile.RNNodeJsMobilePackage;
import com.aakashns.reactnativedialogs.ReactNativeDialogsPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.peel.react.TcpSocketsModule;
import com.peel.react.rnos.RNOSModule;
import com.rnfs.RNFSPackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.staltz.react.workers.WorkersPackage;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
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
    return Arrays.<ReactPackage>asList(new MainReactPackage(), new TcpSocketsModule(), new RNFSPackage(),
        new RandomBytesPackage(), new RNNodeJsMobilePackage(), new ReactNativeDialogsPackage(),
        new VectorIconsPackage(), new RNOSModule(),
        new WorkersPackage(new TcpSocketsModule(), new RNOSModule(), new RNFSPackage(), new RandomBytesPackage()));
  }

  @Override
  public List<ReactPackage> createAdditionalReactPackages() {
    return getPackages();
  }

}
