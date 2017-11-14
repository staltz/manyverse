package com.mmmmm;


import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import java.util.HashMap;
import java.util.Map;

public class DataDir extends ReactContextBaseJavaModule {

    public DataDir(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "DataDir";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("PATH", this.getReactApplicationContext().getApplicationInfo().dataDir);
        return constants;
    }
}
