/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package se.manyver;

import android.content.Context;
import androidx.annotation.Nullable;

import com.janeasystems.rn_nodejs_mobile.RNNodeJsMobilePackage;
import com.peel.react.rnos.RNOSModule;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.PackageList;
import com.facebook.soloader.SoLoader;
import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.reactnativenavigation.react.ReactGateway;
import com.scuttlebutt.bluetoothbridge.BluetoothSocketBridgeConfiguration;
import com.scuttlebutt.bluetoothbridge.BluetoothSocketBridgePackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.reactnativecommunity.viewpager.RNCViewPagerPackage;
import com.reactnativecommunity.slider.ReactSliderPackage;
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

  private final ReactNativeHost mReactNativeHost =
    new NavigationReactNativeHost(this) {
      @Override
      protected String getJSMainModuleName() {
        return "index.android";
      }

      @Override
      public boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
      }

      @Override
      public List<ReactPackage> getPackages() {
        ArrayList<ReactPackage> packages = new PackageList(this).getPackages();
        String socketDir = MainApplication.this.getApplicationInfo().dataDir + "/files";

        UUID uuid = UUID.fromString("b0b2e90d-0cda-4bb0-8e4b-fb165cd17d48");

        BluetoothSocketBridgeConfiguration bluetoothConfig = new BluetoothSocketBridgeConfiguration(socketDir,
          "manyverse_bt_incoming.sock", "manyverse_bt_outgoing.sock", "manyverse_bt_control.sock", "scuttlebutt", uuid);

        packages.add(new BuildConfigPackage());
        packages.add(new AsyncStoragePackage());
        packages.add(new BluetoothSocketBridgePackage(bluetoothConfig));
        packages.add(new RNNodeJsMobilePackage());
        packages.add(new RNOSModule());
        packages.add(new RNCViewPagerPackage());
        packages.add(new ReactSliderPackage());
        return packages;
      }
    };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }
}
