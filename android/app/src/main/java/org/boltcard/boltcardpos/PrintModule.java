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

    @ReactMethod
    public void printImage(String base64) {
        MainActivity activity = (MainActivity) getCurrentActivity();
        if(activity != null) activity.printImage(base64);
    }

    @ReactMethod
    public void printImageCiontek(String base64) {
        MainActivity activity = (MainActivity) getCurrentActivity();
        if(activity != null) activity.printImageCiontek(base64);
    }

    @ReactMethod
    public void printImageSunmi(String base64) {
        MainActivity activity = (MainActivity) getCurrentActivity();
        if(activity != null) activity.printImageSunmi(base64);
    }

    /**
     * Resolves true if the base64 encoded file is an image that can be printed
     * as a receipt logo, so that a bad file is caught when it is chosen rather
     * than when a receipt is printed.
     */
    @ReactMethod
    public void isPrintableImage(String base64, Promise promise) {
        promise.resolve(ReceiptImage.fromBase64(base64) != null);
    }

}