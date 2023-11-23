package net.nyx.printerclient;
import org.boltcard.boltcardpos.R;
public class Result {

    public static String msg(int code) {
        String s;
        switch (code) {
            case SdkResult.SDK_SENT_ERR:
                s = Utils.getApp().getString(R.string.result_sent_err);
                break;
            case SdkResult.SDK_RECV_ERR:
                s = Utils.getApp().getString(R.string.result_recv_err);
                break;
            case SdkResult.SDK_TIMEOUT:
                s = Utils.getApp().getString(R.string.result_timeout);
                break;
            case SdkResult.SDK_PARAM_ERR:
                s = Utils.getApp().getString(R.string.result_params_err);
                break;
            case SdkResult.SDK_UNKNOWN_ERR:
                s = Utils.getApp().getString(R.string.result_unknown_err);
                break;
            case SdkResult.DEVICE_NOT_CONNECT:
                s = Utils.getApp().getString(R.string.result_device_not_conn);
                break;
            case SdkResult.DEVICE_DISCONNECT:
                s = Utils.getApp().getString(R.string.result_device_disconnect);
                break;
            case SdkResult.DEVICE_CONN_ERR:
                s = Utils.getApp().getString(R.string.result_conn_err);
                break;
            case SdkResult.DEVICE_CONNECTED:
                s = Utils.getApp().getString(R.string.result_device_connected);
                break;
            case SdkResult.DEVICE_NOT_SUPPORT:
                s = Utils.getApp().getString(R.string.result_device_not_support);
                break;
            case SdkResult.DEVICE_NOT_FOUND:
                s = Utils.getApp().getString(R.string.result_device_not_found);
                break;
            case SdkResult.DEVICE_OPEN_ERR:
                s = Utils.getApp().getString(R.string.result_device_open_err);
                break;
            case SdkResult.DEVICE_NO_PERMISSION:
                s = Utils.getApp().getString(R.string.result_device_no_permission);
                break;
            case SdkResult.BT_NOT_OPEN:
                s = Utils.getApp().getString(R.string.result_bt_not_open);
                break;
            case SdkResult.BT_NO_LOCATION:
                s = Utils.getApp().getString(R.string.result_bt_no_location);
                break;
            case SdkResult.BT_NO_BONDED_DEVICE:
                s = Utils.getApp().getString(R.string.result_bt_no_bonded);
                break;
            case SdkResult.BT_SCAN_TIMEOUT:
                s = Utils.getApp().getString(R.string.result_bt_scan_timeout);
                break;
            case SdkResult.BT_SCAN_ERR:
                s = Utils.getApp().getString(R.string.result_bt_scan_err);
                break;
            case SdkResult.BT_SCAN_STOP:
                s = Utils.getApp().getString(R.string.result_bt_scan_stop);
                break;
            case SdkResult.PRN_COVER_OPEN:
                s = Utils.getApp().getString(R.string.result_prn_cover_open);
                break;
            case SdkResult.PRN_PARAM_ERR:
                s = Utils.getApp().getString(R.string.result_prn_params_err);
                break;
            case SdkResult.PRN_NO_PAPER:
                s = Utils.getApp().getString(R.string.result_prn_no_paper);
                break;
            case SdkResult.PRN_OVERHEAT:
                s = Utils.getApp().getString(R.string.result_prn_overheat);
                break;
            case SdkResult.PRN_UNKNOWN_ERR:
                s = Utils.getApp().getString(R.string.result_prn_unknown_err);
                break;
            case SdkResult.PRN_PRINTING:
                s = Utils.getApp().getString(R.string.result_prn_printing);
                break;
            case SdkResult.PRN_NO_NFC:
                s = Utils.getApp().getString(R.string.result_prn_no_nfc);
                break;
            case SdkResult.PRN_NFC_NO_PAPER:
                s = Utils.getApp().getString(R.string.result_nfc_no_paper);
                break;
            case SdkResult.PRN_LOW_BATTERY:
                s = Utils.getApp().getString(R.string.result_prn_low_battery);
                break;
            case SdkResult.PRN_LBL_LOCATE_ERR:
                s = Utils.getApp().getString(R.string.result_prn_locate_err);
                break;
            case SdkResult.PRN_LBL_DETECT_ERR:
                s = Utils.getApp().getString(R.string.result_prn_detect_err);
                break;
            case SdkResult.PRN_LBL_NO_DETECT:
                s = Utils.getApp().getString(R.string.result_prn_no_detect);
                break;
            case SdkResult.PRN_UNKNOWN_CMD:
            case SdkResult.SDK_UNKNOWN_CMD:
                s = Utils.getApp().getString(R.string.result_unknown_cmd);
                break;
            default:
                s = "" + code;
                break;
        }
        return s;
    }
}
