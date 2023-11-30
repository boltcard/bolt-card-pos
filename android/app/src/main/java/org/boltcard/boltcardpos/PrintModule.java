package org.boltcard.boltcardpos;

import com.facebook.react.*;
import com.facebook.react.bridge.*;
import java.util.*;
import android.app.*;
import android.util.Log;
import com.facebook.react.bridge.Callback;

/**
 * This class is just to pass function calls through from React Native
 * to the main activity. There might be a cleaner way of doing this. Not sure.
 */
public class PrintModule extends ReactContextBaseJavaModule {
    static final String TAG = "bolt-card-pos";

    public PrintModule(ReactApplicationContext reactContext) {
        super(reactContext);
        Log.d(TAG, "reactContext");
        

    }

    @Override
    public String getName() {
        return getClass().getSimpleName();
    }

    @ReactMethod
    public void printText(String text, int size) {
        MainActivity activity = (MainActivity) getCurrentActivity();
        if(activity != null) activity.printText(text, size);
    }
    
    @ReactMethod
    public void printQRCode(String text, int width, int height) {
        MainActivity activity = (MainActivity) getCurrentActivity();
        if(activity != null) activity.printQRCode(text, width, height);
    }

    @ReactMethod
    public void paperOut(int pixels) {
        MainActivity activity = (MainActivity) getCurrentActivity();
        if(activity != null) activity.paperOut(pixels);
    }

    @ReactMethod
    public void testPrint( 
        Callback callBack
    ) {
        MainActivity activity = (MainActivity) getCurrentActivity();
        if(activity != null) activity.testPrint(callBack);
    }

    @ReactMethod
    public void printTextCiontek(String text, int size) {
        MainActivity activity = (MainActivity) getCurrentActivity();
        if(activity != null) activity.printTextCiontek(text, size);
    }

    @ReactMethod
    public void printQRCodeCiontek(String text, int width, int height) {
        MainActivity activity = (MainActivity) getCurrentActivity();
        if(activity != null) activity.printQRCodeCiontek(text, width, height);
    }

    @ReactMethod
    public void paperOutCiontek() {
        MainActivity activity = (MainActivity) getCurrentActivity();
        if(activity != null) activity.paperOutCiontek();
    }

    @ReactMethod
    public void testPrintCiontek() {
        MainActivity activity = (MainActivity) getCurrentActivity();
        if(activity != null) activity.testPrintCiontek();
    }

    @ReactMethod
    public void printQRCodeSunmi(String text, int width, int height) {
        MainActivity activity = (MainActivity) getCurrentActivity();
        if(activity != null) activity.printQRCodeSunmi(text, width, height);
    }

    @ReactMethod
    public void paperOutSunmi() {
        MainActivity activity = (MainActivity) getCurrentActivity();
        if(activity != null) activity.paperOutSunmi();
    }

    @ReactMethod
    public void printTextSunmi(String text, int size) {
        MainActivity activity = (MainActivity) getCurrentActivity();
        if(activity != null) activity.printTextSunmi(text, size);
    }

    @ReactMethod
    public void testPrintSunmi() {
        MainActivity activity = (MainActivity) getCurrentActivity();
        if(activity != null) activity.testPrintSunmi();
    }

}