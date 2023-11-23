package org.boltcard.boltcardpos;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import android.os.Bundle;
import android.os.Handler;
import net.nyx.printerservice.print.IPrinterService;
import net.nyx.printerservice.print.PrintTextFormat;
import android.content.ServiceConnection;
import android.content.ComponentName;
import android.os.IBinder;
import android.util.Log;
import com.facebook.react.bridge.Callback;
import android.os.RemoteException;
import android.content.*;
import static net.nyx.printerclient.Result.msg;

public class MainActivity extends ReactActivity {

    static final String TAG = "bolt-card-pos";
    private Handler handler = new Handler();
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Bolt Card PoS";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled(), // fabricEnabled
        // If you opted-in for the New Architecture, we enable Concurrent React (i.e. React 18).
        DefaultNewArchitectureEntryPoint.getConcurrentReactEnabled() // concurrentRootEnabled
        );
  }

  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    bindService();
}

  private IPrinterService printerService;
  private ServiceConnection connService = new ServiceConnection() {
      @Override
      public void onServiceDisconnected(ComponentName name) {
          Log.d(TAG,"printer service disconnected, try reconnect");
          printerService = null;
          // 尝试重新bind
          handler.postDelayed(() -> bindService(), 5000);
      }

      @Override
      public void onServiceConnected(ComponentName name, IBinder service) {
          Log.d(TAG,"onServiceConnected: "+ name);
          printerService = IPrinterService.Stub.asInterface(service);
      }
  };

  private void bindService() {
      Intent intent = new Intent();
      intent.setPackage("net.nyx.printerservice");
      intent.setAction("net.nyx.printerservice.IPrinterService");
      bindService(intent, connService, Context.BIND_AUTO_CREATE);
  }

  private void unbindService() {
      unbindService(connService);
  }

    public void printText(String text, int size) {
        try {
             /**
             * Print text
             *
             * @param text       text content
             * @param textFormat text format
             * @param textWidth  maximum text width, <384px
             * @param align      The alignment of the maximum text width relative to the 384px printing paper
             *                   The default is 0. 0--Align left, 1--Align center, 2--Align right
             * @return Print result
             */
            PrintTextFormat textFormat = new PrintTextFormat();
            if(size > 0) textFormat.setTextSize(size); // default is 24
            int ret = printerService.printText(text, textFormat);
        } catch (RemoteException e) {
            e.printStackTrace();
            // callBack.invoke("Error: "+e.getMessage());
        }
    }
    
    public void printQRCode(String text, int width, int height) {
        try {
            /**
             * Print QR code
             *
             * @param content QRCode content
             * @param width   QRCode width, px
             * @param height  QRCode height, px
             * @param align   alignment, the default is 0. 0--Align left, 1--Align center, 2--Align right
             * @return Print result
             */
            int ret = printerService.printQrCode(text, width, height, 1);
            // callBack.invoke(msg(ret));
        } catch (RemoteException e) {
            e.printStackTrace();
            // callBack.invoke("Error: "+e.getMessage());
        }
    }

    public void testPrint(Callback callBack) {
        Log.d(TAG, "Test Print!");
        try {
            PrintTextFormat textFormat = new PrintTextFormat();
            // textFormat.setTextSize(32);
            // textFormat.setUnderline(true);
            int ret = printerService.printText("hello", textFormat);
            ret = printerService.printBarcode("123456789", 400, 160, 1, 1);
            ret = printerService.printQrCode("123456789", 400, 400, 1);

            printerService.paperOut(100);
            callBack.invoke(msg(ret));

        } catch (RemoteException e) {
            e.printStackTrace();
            callBack.invoke("Error: "+e.getMessage());

        }
    }  

    public void paperOut(int pixels) {
        try {
            printerService.paperOut(pixels);
            // callBack.invoke("paperOut "+pixels);
        } catch (RemoteException e) {
            e.printStackTrace();
            // callBack.invoke("Error: "+e.getMessage());
        }
    }


      // singleThreadExecutor.submit(new Runnable() {
      //     @Override
      //     public void run() {
      //         try {
      //             int ret = printerService.labelLocate(240, 16);
      //             if (ret == 0) {
      //                 PrintTextFormat format = new PrintTextFormat();
      //                 printerService.printText("/nModel:/t/tNB55", format);
      //                 printerService.printBarcode("1234567890987654321", 320, 90, 2, 0);
      //                 String date = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
      //                 printerService.printText("Time:/t/t" + date, format);
      //                 ret = printerService.labelPrintEnd();
      //             }
      //             showLog("Print label: " + msg(ret));
      //         } catch (Exception e) {
      //             e.printStackTrace();
      //         }
      //     }
      // });

}
