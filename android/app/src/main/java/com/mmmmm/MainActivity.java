package com.mmmmm;

import android.graphics.Color;
import android.widget.LinearLayout;

import com.reactnativenavigation.controllers.SplashActivity;

public class MainActivity extends SplashActivity {

    @Override
    public LinearLayout createSplashLayout() {
        LinearLayout view = new LinearLayout(this);
        view.setBackgroundColor(Color.parseColor("#3b5bdb"));
        LinearLayout.LayoutParams lp =
            new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 315);
        view.setLayoutParams(lp);
        return view;
    }
}
