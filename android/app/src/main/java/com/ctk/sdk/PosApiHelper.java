
/**************************************************************************************************
 * Copyright (C) 2021 The Ciontek Source Project
 * ---------------------------------------------
 * Filename: PosApiHelper.java
 *
 * Author: Ciontek.Tao
 * ---------------------------------------------
 * Description:
 * Class PosApiHelper describe APIs for Ciontek CS30Pro,Please call it according to
 * the function of your device
 *
 * ----------------------------------------------
 * APIs list:
 *
 * 1.Android OS Interfaces
 *   1.0.1 -> installRomPackage
 *   1.0.2 -> getOSVersion
 *   1.0.3 -> getDeviceId
 *
 * 2. Generic APIs
 *   2.0.1 -> SysLogSwitch
 *   2.0.2 -> SysGetRand
 *   2.0.3 -> SysUpdate
 *   2.0.4 -> SysGetVersion
 *   2.0.5 -> SysReadSN
 *   2.0.6 -> SysWriteSN
 *   2.0.7 -> SysReadChipID
 *
 * 3. Ic card /SAM card
 *   3.0.1 -> IccOpen
 *   3.0.2 -> IccClose
 *   3.0.3 -> IccCommand
 *   3.0.4 -> IccCheck
 *   3.0.5 -> SC_ApduCmd
 *
 * 4. printer
 *   4.0.1 -> PrintInit
 *   4.0.2 -> PrintInit(paramter)
 *   4.0.3 -> PrintSetFont
 *   4.0.4 -> PrintSetGray
 *   4.0.5 -> PrintSetSpace
 *   4.0.6 -> PrintGetFont
 *   4.0.7 -> PrintStep
 *   4.0.8 -> PrintSetVoltage
 *   4.0.9 -> PrintIsCharge
 *   4.0.10 -> PrintSetLinPixelDis
 *   4.0.11 -> PrintStr
 *   4.0.12 -> PrintBmp
 *   4.0.13 -> PrintBarcode
 *   4.0.14 -> PrintQrCode_Cut
 *   4.0.15 -> PrintCutQrCode_Str
 *   4.0.16 -> PrintStart
 *   4.0.17 -> PrintSetLeftIndent
 *   4.0.18 -> PrintSetAlign
 *   4.0.19 -> PrintCharSpace
 *   4.0.20 -> PrintSetLineSpace
 *   4.0.21 -> PrintSetLeftSpace
 *   4.0.22 -> PrintSetSpeed
 *   4.0.23 -> PrintCheckStatus
 *   4.0.24 -> PrintFeedPaper
 *   4.0.25 -> PrintSetMode
 *   4.0.26 -> PrintSetUnderline
 *   4.0.27 -> PrintSetReverse
 *   4.0.28 -> PrintSetBold
 *   4.0.29 -> PrintLogo
 *
 * 5. APP White List
 *   5.0.1 -> enableAppInstallWhiteList
 *   5.0.2 -> disableAppInstallWhiteList
 *   5.0.3 -> addAppToInstallWhiteList
 *   5.0.4 -> delAppFromInstallWhiteList
 *   5.0.5 -> getAppInstallWhiteList
 *   5.0.6 -> enableAppUninstallBlackList
 *   5.0.7 -> disableAppUninstallBlackList
 *   5.0.8 -> addAppToUninstallBlackList
 *   5.0.9 -> delAppFromUninstallBlackList
 *   5.0.10 -> getAppUninstallBlackList
 *
 * 6. fiscal module
 *   6.0.1 -> fiscalOpen
 *   6.0.2 -> fiscalClose
 *   6.0.3 -> fiscalWrite
 *   6.0.4 -> fiscalRead
 *
 *---------------------
 * Modify: Ciontek.Tao 2021-03-11
 *         The first edition
 *
 * Mdify:
 *
 **************************************************************************************************/
package com.ctk.sdk;

import android.os.IBinder;
import java.lang.reflect.Method;
import android.os.RemoteException;
import android.util.Log;
import com.ciontek.ciontekposservice.ICiontekPosService;
import android.graphics.Bitmap;
import java.util.List;


public class PosApiHelper {

    private static final String TAG = "PosApiHelper";
    public static final String POS_SERVICE = "posmanager";

    private ICiontekPosService mPosService;
    private static PosApiHelper mInstance;

    private PosApiHelper() {
        try {
            Class serviceManager = Class.forName("android.os.ServiceManager");
            Method method = serviceManager.getMethod("getService", String.class);
            IBinder b = (IBinder)method.invoke(serviceManager.newInstance(), POS_SERVICE);
            mPosService = ICiontekPosService.Stub.asInterface(b);
            Log.d(TAG, "get pos service success!");
            if(mPosService == null){
                Log.d(TAG, "get pos service null!");
            }
        } catch (Exception e) {
                    Log.e(TAG, "get pos service Exception!");
            e.printStackTrace();
        }


    }
    synchronized public int PrintLabLocate (int step){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnFeedPaper( step);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }
    public static PosApiHelper getInstance() {
        if (null == mInstance) {
            mInstance = new PosApiHelper();
        }
        return mInstance;
    }

/*******************************************************************************************************
****************************** API start from here ******************************************************
*******************************************************************************************************/
    /**
     * @Title: SysApiVersion
     * @Description: enable/disable debug log
     * @param: @param
     * @param: @return
     * 0	success
     * !0	fail
     * @return: int
     * @throws
     */
    //0000
    public String SysApiVerson(){
        return "v1.0.2";
    }

/*--------------------------------Android OS Interface ----------------------------------------*/
    /**
     * @Title: installRomPackage
     * @Description: to update Android OS firmware
     * @param:
        romFilePath: rom file path
        example:
                String path = "/storage/emulated/0/update.zip";
                PosApiHelper.getInstance().installRomPackage(path);
     * @return:
     * 0	success
     * !0	fail
     */
    //1.0.1
    synchronized public int installRomPackage(String romFilePath){
        if (mPosService != null) {
            try {
                return mPosService.installRomPackage(romFilePath);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;

    }

    /**
     * @Title: getOSVersion
     * @Description:  get Android OS firmware version
     * @param:
     * @return:
     */
    //1.0.2
     public String getOSVersion(){
        if (mPosService != null) {
            try {
                return mPosService.getOSVersion();
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return null;

    }

    /**
     * @Title: getDeviceId
     * @Description:  get the device Serial Number
     * @param:
     * @return:
     */
    //1.0.3
     public String getDeviceId(){
        if (mPosService != null) {
            try {
                return mPosService.getDeviceId();
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return null;

    }
/*--------------------------------Peripheral Interface ----------------------------------------*/
    /**
     * @Title: SysLogSwitch
     * @Description: enable/disable debug log
     * @param: @param
     * @param: @return
     * 0	success
     * !0	fail
     * @return: int
     * @throws
     */
    //2.0.1
     synchronized public int SysLogSwitch(int level){
         if(mPosService != null){
             try {
                 return  mPosService.Lib_LogSwitch(level);
             } catch (RemoteException e) {
                 e.printStackTrace();
             }
         }
         return -5555;
     }


    /**
     * @Title: SysGetRand
     * @Description:obtain random number 
     * @param: rnd [out]
     * @param: @return
     * 0	success
     * !0	fail
     * @return: int
     * @throws
     */
    //2.0.2
    synchronized public int SysGetRand(byte[] rnd){
        if (mPosService != null) {
            try {
                return mPosService.Lib_GetRand(rnd);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }


	/**
     * @Title: SysUpdate
     * @Description: to update the mcu app firmware
     * @param: @param
     * @param: @return
     * 0	success
     * !0	fail
     * @return: int
     * @throws
     */
    //2.0.3
    synchronized public int SysUpdate(){
        if (mPosService != null) {
            try {
                return mPosService.Lib_Update_32550();
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }


    /**
     * @Title: SysGetVersion
     * @Description: get the mcu firmware version array
     * @param: @param [out] byte[] buf
     *                buf[0~2] : mcu Version number
     *                buf[3~5] : lib Version number
     *                buf[6~9] : sb Version number , 0xff mean have no sb Version number,ignore it
     * @param: @return
     * 0	success
     * !0	fail
     * @return: int
     * @throws
     */
    //2.0.4
    synchronized public int SysGetVersion(byte[] buf) {
        if (mPosService != null) {
            try {
                return mPosService.Lib_GetVersion(buf);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }


    /**
     * @Title: SysReadSN
     * @Description: read a 16 bytes serial number
     * @param: 1.SN [out]
     *
     *
     * @param: @return
     * 0	success
     * !0	fail
     * @return: int
     * @throws
     */
    //2.0.5
    synchronized public int SysReadSN(byte[] SN){
        if (mPosService != null) {
            try {
                return mPosService.Lib_ReadSN(SN);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /**
     * @Title: SysWriteSN
     * @Description: to write a 16 bytes SN
     * @param: 1.SN [out]
     *         
     *
     * @param: @return
     * 0	success
     * !0	fail
     * @return: int
     * @throws
     */	
    //2.0.6
    synchronized public int SysWriteSN(byte[] SN){
        if (mPosService != null) {
            try {
                return mPosService.Lib_WriteSN(SN);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /**
     * @Title: SysReadChipID
     * @Description: Get IC card ID no.
     * @param:
     * buf: IC card ID no.
     * len:length
     * @return:
     * 0	success
     * !0	fail
     */
    //2.0.7
    synchronized public int SysReadChipID(byte[] buf,int len){
        if (mPosService != null) {
            try {
                return mPosService.Lib_ReadChipID(buf,len);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /*---------------------------------   Ic card   --------------------------------------------*/

    /**
     * @Title: IccOpen
     * @Description: Initialize the IC card and return the response content of the card
     * @param: @param slot
     * 0x00－IC card Channel;
     * 0x01－PSAM1 card Channel;
     * 0x02－PSAM2 card Channel;
     * @param: @param VCC_Mode
     * 1---5V;
     * 2---3V;
     * 3---1.8V;
     * @param: @param ATR	Card reset response. (at least 32+1bytes of space). The contents are length (1 byte) + reset response content
     * @return:
     * 0	success.
     * (-2403)	Channel Error
     * (-2405)	The card is pulled out or not
     * (-2404)	Protocol error
     * (-2500)	Voltage mode error of IC card reset
     * (-2503)	Communication failure.
     */
    //3.0.1
    synchronized public int IccOpen(byte slot, byte vccMode, byte[] atr){
        if (mPosService != null) {
            try {
                return mPosService.Lib_IccOpen(slot,vccMode,atr);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /**
     * @Title: IccClose
     * @Description: Close IC Card
     * @param: @param slot: Channel
    Slotcassette No.：
    0x00－IC cand Channel
    0x01－PSAM1 cand Channel
    0x02－PSAM2 cand Channel
     * @return:
     * 0	success
     * !0	fail
     */
    //3.0.2
    synchronized public int IccClose(byte slot){
        if (mPosService != null) {
            try {
                Log.d("PosManagerService","Lib_IccClose");
                return mPosService.Lib_IccClose(slot);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /**
     * @Title: IccCommand
     * @Description: Read and Write IC Card
     *               If both LC and LE exist, you should set "LC = X; LE = 0x01"
     * @param: @param slot: Card Channel
     * 0x00－IC Card Channel
     * 0x01－PSAM1 Card Channel
     * 0x02－PSAM2 Card Channel
     * @param: @param ApduSend:  sent to the card’s apdu
     * @param: @param ApduResp:  Receive the card's  apdu of returned
     * @return:
    0	    successfully
    (-2503)	Communication timeout
    (-2405)	The cards are put out in the transaction
    (-2401)	Parity error
    (-2403)	Select Channel error
    (-2400)	Sending data too long（LC）
    (-2404)	The Protocol error（is Not T = 0 or T = 1）
    (-2406)	No reset card
     */
    //3.0.3
    synchronized public int IccCommand(byte slot, byte[] apduSend, byte[]  apduResp){
        if (mPosService != null) {
            try {
                return mPosService.Lib_IccCommand(slot,apduSend,apduResp);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /**
     * @Title: IccCheck
     * @Description: Check if there is a card in the specified cassette。
     * @param: @param slot: Card Channel
     * 0x00－IC Card Channel
     * @return:
     * 0	 - The IC card was detected and inserted
     * !0 - fail
     */
    //3.0.4
    synchronized public int IccCheck(byte slot){
        if (mPosService != null) {
            try {
                return mPosService.Lib_IccCheck(slot);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    //3.0.5
    synchronized public int SC_ApduCmd(byte bslot, byte[] pbInApdu, int usInApduLen, byte[]pbOut,byte[] pbOutLen){
        if (mPosService != null) {
            try {
                return mPosService.SC_ApduCmd(bslot,pbInApdu,usInApduLen,pbOut,pbOutLen);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }


/*--------------------------------    printer      --------------------------------------------*/

    /**
     * @Title: PrintInit
     * @Description: Printer initialization
     * @param:
     * @return:
     * 0	success
     * !0	fail
     */
    //4.0.1
    synchronized public int PrintInit(){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnInit();
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /**
     * @Title: PrintInit
     * @Description: Printer initialization with gray and font
     * @param:
     * Gray: the grad density. 1-high density, 2-medium,3-low

     * Fontheight: font height. 16 or 24

     * Fontwidth: font width. 16 or 24

     * Fontzoom: bolt font, 0x00 or 0x33

     * @param:
        0	success
        !0	fail
        -4001 : PRINT BUSY
        -4002 : PRINT NOPAPER
        -4003 : PRINT DATAERR
        -4004 : PRINT FAULT
        -4005 : PRINT TOOHEAT
        -4006 : PRINT UNFINISHED
        -4007 : PRINT NOFONTLIB
        -4008 : PRINT BUFFOVERFLOW
        -4009 : PRINT SETFONTERR
        -4010 : PRINT GETFONTERR
     */
    //4.0.2
    synchronized public int PrintInit(int gray,int fontHeight, int fontWidth, int fontZoom) {
        if (mPosService != null) {
            try {
                int ret = -1;
                ret =  mPosService.Lib_PrnInit();
                if(ret!=0){
                    return  ret;
                }

                //setGray
                ret = mPosService.Lib_PrnSetGray(gray);
                if(ret!=0){
                    return  ret;
                }


                //setFont
                ret = mPosService.Lib_PrnSetFont((byte)fontHeight,(byte)fontWidth,(byte)fontZoom);
                if(ret!=0){
                    return  ret;
                }

                return  ret;
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;

    }


    /**
     * @Title: PrintSetFont
     * @Description: Set font for the Printer
     * @param:
     *          1.AsciiFontHeight : font height. 16 or 24
     *          2.ExtendFontHeight: font width. 16 or 24
     *          3.Zoom            :  bolt font, 0x00 or 0x33
     * @return :
     * 0	success
     * !0	fail
     */
    //4.0.3
    synchronized public int PrintSetFont(byte AsciiFontHeight, byte ExtendFontHeight, byte Zoom){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnSetFont( AsciiFontHeight,  ExtendFontHeight,  Zoom);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /**
     * @Title: PrintSetGray
     * @Description: Set print density
     * @param:
     * nLevel: density level, value 1~5
     *          1:Lowest 3：medium 5：Highest
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //4.0.4
    synchronized public int PrintSetGray(int nLevel){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnSetGray( nLevel);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }


    /**
     * @Title: PrintSetSpace
     * @Description:
     * @param:
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //4.0.5
    synchronized public int PrintSetSpace(byte x, byte y){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnSetSpace( x,  y);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }



    /**
     * @Title: PrintGetFont
     * @Description: get current font 
     * @param:
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //4.0.6
    synchronized public int PrintGetFont( byte[] AsciiFontHeight,  byte[] ExtendFontHeight,  byte[] Zoom){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnGetFont( AsciiFontHeight,  ExtendFontHeight,  Zoom);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /**
     * @Title: PrintStep
     * @Description:
     * @param:
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //4.0.7
    synchronized public int PrintStep(int pixel){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnStep( pixel);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }


    /**
     * @Title: PrintSetVoltage
     * @Description:
     * @param:
     *      voltage： current battery voltage*10
     *
     *      example, we Set current voltage as 7.5V
     *      PrintSetVoltage(75);
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //4.0.8
    synchronized public int PrintSetVoltage(int voltage){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnSetVoltage( voltage);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }


    /**
     * @Title: PrintIsCharge
     * @Description:
     * @param:
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //4.0.9
    synchronized public int PrintIsCharge(int ischarge){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnIsCharge( ischarge);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /**
     * @Title: PrintSetLinPixelDis
     * @Description:
     * @param:
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //4.0.10
    synchronized public int PrintSetLinPixelDis(char LinDistance){
        if (mPosService != null) {
            try {
                return mPosService.Lib_SetLinPixelDis( LinDistance);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /**
     * @Title: PrintStr
     * @Description: set a String to print
     * @param: String str:
     *
     *
     * @return:
     * 0	success
     * !0	fail
     * -4002 –need paper
     * -4003 –data error
     */
    //4.0.11
    synchronized public int PrintStr(String str){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnStr(str);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /**
     * @Title: PrintBmp
     * @Description: Set BMP photo as print content ( size requirement width <=384,height <=500)
     * @param: bitmap
     *
     *
     * @return:
        0 –successfully
        Other -failure
        Such as:
        -4003 PRN_DATAERR
        -4004 PRN_FAULT
        -4008 PRN_BUFFOVERFLOW
     */
    //4.0.12
    synchronized public int PrintBmp(Bitmap bitmap){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnBmp(bitmap);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /**
     * @Title: PrintBarcode
     * @Description: print a Barcode with contents
     * @param:
     *  contents: barcode content
     *  desiredWidth: barcode width
     *  desiredHeight: barcode height
     *  barcodeFormat: barcode Format -->
     *                 "CODE_128" "CODE_39" "EAN_8" "QR_CODE" "PDF_417" "ITF"
     *
     * @return:
        0 –successfully
        Other -failure
     */
    //4.0.13
    synchronized public int PrintBarcode(String contents, int desiredWidth,int desiredHeight,String barcodeFormat){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnBarcode(contents,desiredWidth,desiredHeight,barcodeFormat);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;

    }


    /**
     * @Title: PrintQrCode_Cut
     * @Description: Print QR code
     * @param:
     *  contents: barcode content
     *  desiredWidth: barcode width
     *  desiredHeight: barcode height
     *  barcodeFormat: barcode Format -->
     *                 "CODE_128" "CODE_39" "EAN_8" "QR_CODE" "PDF_417" "ITF"
     *
     * @return:
    0 –successfully
    Other -failure
     */
    //4.0.14
    synchronized public int PrintQrCode_Cut(String contents, int desiredWidth,int desiredHeight, String barcodeFormat){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrintCutQrCode(contents,desiredWidth,desiredHeight,barcodeFormat);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;

    }


    /**
     * @Title: PrintCutQrCode_Str
     * @Description:
     * @param:
     *  contents: barcode content
     *  desiredWidth: barcode width
     *  desiredHeight: barcode height
     *  barcodeFormat: barcode Format -->
     *                 "CODE_128" "CODE_39" "EAN_8" "QR_CODE" "PDF_417" "ITF"
     *
     * @return:
    0 –successfully
    Other -failure
     */
    //4.0.15
    synchronized public int PrintCutQrCode_Str(String contents, String printTxt ,int distance,
                                                int desiredWidth,int desiredHeight, String barcodeFormat){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrintCutQrCodeStr(contents,printTxt,distance,desiredWidth,desiredHeight,barcodeFormat);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }


    /**
     * @Title: PrintStart
     * @Description: start to print
     * @param:
     * @return:
        0	success
        !0	fail
        -1001/1001：send fail；
        -1002/1002：receive timeout；
        -1：Short of paper；
        -2：The temperature is too high；
        -3: The voltage is too low；
        8/9:Instruction reply disorder；
        -1023：status error；
        -1021：Short of paper；
        -1000/-1016/-1001/-1002/-1003/-1004/-1019/-1017/-1018/-1020：print timeout；
        -1007/-1008/-1009/-1010/-1011/-1012：Print times exceeds limit；
        -1022：heat error；
        -1015/-1014;Short of paper；
     */
    //4.0.16
    synchronized public int PrintStart(){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnStart();
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /**
     * @Title: PrintSetLeftIndent
     * @Description:
     * @param:
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //4.0.17
    synchronized public int PrintSetLeftIndent(int x){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnSetLeftIndent( x);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /**
     * @Title: PrintSetAlign
     * @Description:
     * @param:
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //4.0.18
    synchronized public int PrintSetAlign(int X){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnSetAlign( X);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /**
     * @Title: PrintCharSpace
     * @Description:
     * @param:
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //4.0.19
    synchronized public int PrintCharSpace(int X){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnSetCharSpace( X);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /**
     * @Title: PrintSetLineSpace
     * @Description:
     * @param:
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //4.0.20
    synchronized public int PrintSetLineSpace(int x){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnSetLineSpace( x);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /**
     * @Title: PrintSetLeftSpace
     * @Description:
     * @param:
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //4.0.21
    synchronized public int PrintSetLeftSpace(int x){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnSetLeftSpace( x);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }


    /**
     * @Title: PrintSetSpeed
     * @Description:
     * @param:
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //4.0.22
    synchronized public int PrintSetSpeed(int iSpeed){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnSetSpeed( iSpeed);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /**
     * @Title: PrintCheckStatus
     * @Description:
     * @param:
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //7.0.23
    synchronized public int PrintCheckStatus( ){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnCheckStatus( );
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /**
     * @Title: PrintFeedPaper
     * @Description:
     * @param:
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //4.0.24
    synchronized public int PrintFeedPaper(int step){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnFeedPaper( step);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }

    /**
     * @Title: PrintSetMode
     * @Description: set print mode for receipt or lable
     * @param:
     *       mode:
     *       0(default) -> print a receipt
     *       1          -> print a lable
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //4.0.25
    synchronized public int PrintSetMode(int mode){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnSetMode(mode);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }


    /**
     * @Title: PrintSetUnderline
     * @Description: Set the lines and width of underline
     * @param:
     *       x:
     *     The value is in HEX format,
     *     The upper four digits are the number of underlined lines, greater than 2 is 2 lines, and less than 2 is 1 line
     *     The lower four bits are the width
     *
     *
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //4.0.26
    synchronized public int PrintSetUnderline(int x){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnSetUnderline(x);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }


    /**
     * @Title: PrintSetReverse
     * @Description: Set the font display reverse mode
     * @param:
     *       mode:
     *       0(default) -> normal
     *       1          -> reverse
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //4.0.27
    synchronized public int PrintSetReverse(int x){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnSetReverse(x);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }


    /**
     * @Title: PrintSetBold
     * @Description: Set the font display Bold mode
     * @param:
     *       mode:
     *       0(default) -> normal
     *       1          -> Bold
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //4.0.28
    synchronized public int PrintSetBold(int x){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnSetBold(x);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }


    /**
     * @Title: PrintLogo
     * @Description: print a picture by a byte[]
     * @param:
     *       byte[] logo: the byte[] for a picture
     *           
     *       
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //4.0.29
    synchronized public int PrintLogo(byte[] logo){
        if (mPosService != null) {
            try {
                return mPosService.Lib_PrnLogo(logo);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;
    }
    /*---------------------------  APP White List  -----------------------------------------------
    *
    * To config app whitelist for restrict APK install
    *
    * ------------------------------------------------------------------------------------------*/

    /**
     * @Title: enableAppInstallWhiteList
     * @Description: enable the function of App White list 
     * @param:
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //5.0.1
    synchronized  public boolean enableAppInstallWhiteList(){

        if (mPosService != null) {
            try {
                return mPosService.enableAppInstallWhiteList();
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return false;

    }


    /**
     * @Title: disableAppInstallWhiteList
     * @Description: disable the function of App White list 
     * @param:
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //5.0.2
    synchronized  public boolean disableAppInstallWhiteList(){

        if (mPosService != null) {
            try {
                return mPosService.disableAppInstallWhiteList();
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return false;
    }



    /**
     * @Title: addAppToInstallWhiteList
     * @Description: add a apk to white list
     * @param:
     *
     *
     * @return:
     * 0	success
     * !0	fail
     */
    //5.0.3
    synchronized public boolean addAppToInstallWhiteList(String pkgName){

        if (mPosService != null) {
            try {
                return mPosService.addAppToInstallWhiteList(pkgName);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return false;
    }


    /**
     * @Title: delAppFromInstallWhiteList
     * @Description: delect a apk from white list
     * @param:
     *
     * @return: ArrayList<String>
     *
     * example:
     *
     *
     *
     */
    //5.0.4
    synchronized public boolean delAppFromInstallWhiteList(String pkgName){

        if (mPosService != null) {
            try {
                return mPosService.delAppFromInstallWhiteList(pkgName);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return false;

    }

    /**
     * @Title: getAppInstallWhiteList
     * @Description: get the APP white list
     * @param:
     *
     * @return: ArrayList<String>
     *
     * example:
     *
     *
     *
     *
     *
     */
    //5.0.5
    synchronized public List<String> getAppInstallWhiteList(){

        if (mPosService != null) {
            try {
                return mPosService.getAppInstallWhiteList();
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return null;

    }


    /**
     * @Title: enableAppUninstallBlackList
     * @Description:
     * @param:
     *
     * @return:
     *
     * example:
     *
     *
     *
     */
    //5.0.6
    synchronized public boolean enableAppUninstallBlackList(){

        if (mPosService != null) {
            try {
                return mPosService.enableAppUninstallBlackList();
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return false;

    }


    /**
     * @Title: disableAppUninstallBlackList
     * @Description:
     * @param:
     *
     * @return:
     *
     * example:
     *
     */
    //5.0.7
    synchronized public boolean disableAppUninstallBlackList(){

        if (mPosService != null) {
            try {
                return mPosService.disableAppUninstallBlackList();
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return false;

    }



    /**
     * @Title: addAppToUninstallBlackList
     * @Description:
     * @param:
     *
     * @return:
     *
     * example:
     *
     */
    //5.0.8
    synchronized public boolean addAppToUninstallBlackList(String pkgName){

        if (mPosService != null) {
            try {
                return mPosService.addAppToUninstallBlackList(pkgName);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return false;

    }


    /**
     * @Title: delAppFromUninstallBlackList
     * @Description:
     * @param:
     *
     * @return:
     *
     * example:
     *
     */
    //5.0.9
    synchronized public boolean delAppFromUninstallBlackList(String pkgName){

        if (mPosService != null) {
            try {
                return mPosService.delAppFromUninstallBlackList(pkgName);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return false;

    }



    /**
     * @Title: getAppUninstallBlackList
     * @Description:
     * @param:
     *
     * @return:
     *
     * example:
     *
     */
    //5.0.10
    synchronized public List<String> getAppUninstallBlackList(){

        if (mPosService != null) {
            try {
                return mPosService.getAppUninstallBlackList();
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return null;

    }

/*---------------------------  Fiscal  APIs---------------------------------------------------*/

    /**
     * @Title: fiscalOpen
     * @Description: power on the fiscal and open the uart port
     * @param:
     * baudrate: the baudrate of uart port
     *     size:
     *     stop:
     *   parity:
     *    cflow:
     *
     * @return:
     *       0: success
     *      -1: fail
     *      -2: uninitialized
     *      -3: paramter error
     *      -4: timeout
     *      -5: init uart port error
     *      -6: read error
     *      -7: write error
     *
     */
    //6.0.1
    synchronized public int fiscalOpen(int baudrate,int size, int stop, char parity, char cflow){

        if (mPosService != null) {
            try {
                return mPosService.fiscalOpen(baudrate,size,stop,parity,cflow);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;

    }

    /**
     * @Title: fiscalClose
     * @Description: power off the fiscal and close the uart port
     * @param:
     *
     * @return:
     *       0: success
     *      -1: fail
     *      -2: uninitialized
     *      -3: paramter error
     *      -4: timeout
     *      -5: init uart port error
     *      -6: read error
     *      -7: write error
     *
     */
    //6.0.2
    synchronized public int fiscalClose(){

        if (mPosService != null) {
            try {
                return mPosService.fiscalClose();
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;

    }

    /**
     * @Title: fiscalWrite
     * @Description: send data to fiscal
     * @param:
     *   data: the data you want to send
     *
     * @return:
     *       0: success
     *      -1: fail
     *      -2: uninitialized
     *      -3: paramter error
     *      -4: timeout
     *      -5: init uart port error
     *      -6: read error
     *      -7: write error
     *
     */
    //6.0.3
    synchronized public int fiscalWrite(byte[] data){
        if (mPosService != null) {
            try {
                return mPosService.fiscalWrite(data);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;

    }

    /**
     * @Title: fiscalRead
     * @Description: send data to fiscal
     * @param:
     *   buffer: the buffer read from fiscal
     *   bufLen: the length of the buffer
     *  timeout: timeout for read, unit: ms
     * @return:
     *       0: success
     *      -1: fail
     *      -2: uninitialized
     *      -3: paramter error
     *      -4: timeout
     *      -5: init uart port error
     *      -6: read error
     *      -7: write error
     *
     */
    //6.0.4
    synchronized public int fiscalRead(byte[] buffer,int bufLen,int timeout){
        if (mPosService != null) {
            try {
                return mPosService.fiscalRead(buffer,bufLen,timeout);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        return -5555;

    }

}
