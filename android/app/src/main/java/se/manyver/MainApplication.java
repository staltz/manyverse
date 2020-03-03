/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package se.manyver;

import android.content.Context;
import androidx.annotation.Nullable;

import com.janeasystems.rn_nodejs_mobile.RNNodeJsMobilePackage;
import com.aakashns.reactnativedialogs.ReactNativeDialogsPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.peel.react.rnos.RNOSModule;
import com.bitgo.randombytes.RandomBytesPackage;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.soloader.SoLoader;
import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.reactnativenavigation.react.ReactGateway;
import com.scuttlebutt.bluetoothbridge.BluetoothSocketBridgeConfiguration;
import com.scuttlebutt.bluetoothbridge.BluetoothSocketBridgePackage;
import com.staltz.reactnativeandroidlocalnotification.NotificationPackage;
import com.staltz.reactnativehasinternet.HasInternetPackage;
import com.staltz.flagsecure.FlagSecurePackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import org.wonday.orientation.OrientationPackage;
import com.rnfs.RNFSPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.reactnativecommunity.viewpager.RNCViewPagerPackage;
import com.reactnativecommunity.slider.ReactSliderPackage;
import com.ninty.system.setting.SystemSettingPackage;
import org.acra.*;
import org.acra.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@AcraCore(buildConfigClass = BuildConfig.class)
@AcraMailSender(mailTo = "incoming+staltz-manyverse-6814019-issue-@incoming.gitlab.com")
@AcraDialog(resText = R.string.acra_dialog_text, resCommentPrompt = R.string.acra_dialog_comment)
public class MainApplication extends NavigationApplication {

  @Override
  protected void attachBaseContext(Context base) {
    super.attachBaseContext(base);
    ACRA.init(this);
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }

  @Override
  protected ReactNativeHost createReactNativeHost() {
      return new NavigationReactNativeHost(this) {
          @Override
          protected String getJSMainModuleName() {
              return "index.android";
          }
      };
  }

  @Override
  public boolean isDebug() {
    // Make sure you are using BuildConfig from your own application
    return BuildConfig.DEBUG;
  }

  @Nullable
  @Override
  public List<ReactPackage> createAdditionalReactPackages() {
    String socketDir = this.getApplicationInfo().dataDir + "/files";

    UUID uuid = UUID.fromString("b0b2e90d-0cda-4bb0-8e4b-fb165cd17d48");

    BluetoothSocketBridgeConfiguration bluetoothConfig = new BluetoothSocketBridgeConfiguration(socketDir,
        "manyverse_bt_incoming.sock", "manyverse_bt_outgoing.sock", "manyverse_bt_control.sock", "scuttlebutt", uuid);

    List<ReactPackage> packages = new ArrayList<>();
    packages.add(new BuildConfigPackage());
    packages.add(new AsyncStoragePackage());
    packages.add(new BluetoothSocketBridgePackage(bluetoothConfig));
    packages.add(new PickerPackage());
    packages.add(new HasInternetPackage());
    packages.add(new RandomBytesPackage());
    packages.add(new RNNodeJsMobilePackage());
    packages.add(new ReactNativeDialogsPackage());
    packages.add(new VectorIconsPackage());
    packages.add(new RNOSModule());
    packages.add(new NotificationPackage());
    packages.add(new FlagSecurePackage());
    packages.add(new OrientationPackage());
    packages.add(new RNFSPackage());
    packages.add(new SplashScreenReactPackage());
    packages.add(new RNCViewPagerPackage());
    packages.add(new ReactSliderPackage());
    packages.add(new SystemSettingPackage());
    return packages;
  }
}
