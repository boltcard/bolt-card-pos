// ICiontekPosService.aidl
package com.ciontek.ciontekposservice;
import android.graphics.Bitmap;
// Declare any non-default types here with import statements

interface ICiontekPosService {
/*--------------------------------Android OS Interface ----------------------------------------*/
    //1.0.1
    int installRomPackage(String romFilePath);

    //1.0.2
    String getOSVersion();

    //1.0.3
    String getDeviceId();

/*--------------------------------Peripheral Interface ----------------------------------------*/
    //2.0.1
    int Lib_LogSwitch(int LogSwitch);

    //2.0.2
    int Lib_GetRand(out byte[] rnd);

    //2.0.3
    int Lib_Update_32550();

    //2.0.4
    int Lib_GetVersion(out byte[] buf);

    //2.0.5
    int Lib_ReadSN(out byte[] SN);

    //2.0.6
    int Lib_WriteSN(in byte[] SN);

    //2.0.7
    int Lib_ReadChipID(out byte[] buf, int len);

/*--------------------------------IC card ---------------------------------------------------*/
    //3.0.1
    int Lib_IccOpen(byte slot, byte vccMode, out byte[] atr);

    //3.0.2
    int Lib_IccClose(byte slot);

    //3.0.3
    int Lib_IccCommand(byte slot, in byte[] apduSend, out byte[]  apduResp);

    //3.0.4
    int Lib_IccCheck(byte slot);

    //3.0.5
    int SC_ApduCmd(byte bslot, in byte[] pbInApdu, int usInApduLen, out byte[]pbOut,out byte[] pbOutLen);


/*--------------------------------    printer      --------------------------------------------*/
    //7.0.1
    int Lib_PrnInit();

    //7.0.2
    int Lib_PrnSetSpace(byte x, byte y);

    //7.0.3
    int Lib_PrnSetFont(byte AsciiFontHeight, byte ExtendFontHeight, byte Zoom);

    //7.0.4
    int Lib_PrnGetFont(in byte[] AsciiFontHeight, in byte[] ExtendFontHeight, in byte[] Zoom);

    //7.0.5
    int Lib_PrnStep(int pixel);

    //7.0.6
    int Lib_PrnSetVoltage(int voltage);

    //7.0.7
    int Lib_PrnIsCharge(int ischarge);

    //7.0.8
    int Lib_PrnStr(String str);

    //7.0.9
    int Lib_PrnBmp(in Bitmap bitmap);

    //7.0.10
    int Lib_PrnBarcode(String contents, int desiredWidth, int desiredHeight,String barcodeType);

    //7.0.11
    int Lib_PrintCutQrCode(String contents, int desiredWidth, int desiredHeight, String barcodeType);

    //7.0.12
    int Lib_PrintCutQrCodeStr(String qrContent, String printTxt, int distance, int desiredWidth, int desiredHeight, String barcodeType);

    //0140
    //int Lib_PrnCutPicture(in byte[] logo);

    //0141
    //int Lib_PrnCutPictureStr(in byte[] jlogo,in byte[] jString,int LinDis);

    //0142
    int Lib_PrnLogo(in byte[] logo);

    //7.0.13
    int Lib_SetLinPixelDis(char LinDistance);

    //7.0.14
    int Lib_PrnStart();

    //0145
    //int Lib_PrnConventional(int jnlevel);

    //0146
    //int Lib_PrnContinuous(int jnlevel);

    //0147
    //int Lib_PrnClose();

    //0148
    //int Lib_CTNPrnStart();

    //7.0.15
    int Lib_PrnSetLeftIndent(int x);

    //7.0.16
    int Lib_PrnSetAlign(int X);

    //7.0.17
    int Lib_PrnSetCharSpace(int X);

    //7.0.18
    int Lib_PrnSetLineSpace(int x);

    //7.0.19
    int Lib_PrnSetLeftSpace(int x);

    //7.0.20
    int Lib_PrnSetGray(int nLevel);

    //7.0.21
    int Lib_PrnSetSpeed(int iSpeed);

    //7.0.22
    int Lib_PrnCheckStatus( );

    //7.0.23
    int Lib_PrnFeedPaper(int step);

    //7.0.24
    int Lib_PrnSetMode(int mode);

    //7.0.25
    int Lib_PrnSetUnderline(int x);

    //7.0.26
    int Lib_PrnSetReverse(int x);

    //7.0.27
    int Lib_PrnSetBold(int x);

 /*---------------------------  APP White List  -----------------------------------------------*/

    //5.0.1
    boolean enableAppInstallWhiteList();

    //5.0.2
    boolean disableAppInstallWhiteList();

    //5.0.3
    boolean addAppToInstallWhiteList(String pkgName);

    //5.0.4
    boolean delAppFromInstallWhiteList(String pkgName);

    //5.0.5
    List<String> getAppInstallWhiteList();

    //5.1.1
    boolean enableAppUninstallBlackList();

    //5.1.2
    boolean disableAppUninstallBlackList();

    //5.1.3
    boolean addAppToUninstallBlackList(String pkgName);

    //5.1.4
    boolean delAppFromUninstallBlackList(String pkgName);

    //5.1.5
    List<String> getAppUninstallBlackList();

/*---------------------------  Fiscal APIs -------------------------------------------------------*/
    //6.0.1
    int fiscalOpen(int baudrate,int size, int stop, char parity, char cflow);

    //6.0.2
    int fiscalClose();

    //6.0.3
    int fiscalWrite(in byte[] data);

    //6.0.4
     int fiscalRead(out byte[] buffer,int bufLen,int timeout);
}
