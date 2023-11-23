package net.nyx.printerclient;

public class SdkResult {
    public static final int SDK_OK                              = 0;
    public static final int SDK_BASE_ERR                        = -1000;
    public static final int SDK_SENT_ERR                        = -1001;    //发送失败
    public static final int SDK_PARAM_ERR          	            = -1002;	//参数错误
    public static final int SDK_TIMEOUT           	            = -1003;	//超时
    public static final int SDK_RECV_ERR                        = -1004; 	//接受错误
    public static final int SDK_UNKNOWN_ERR                     = -1005; 	//其他异常
    public static final int SDK_CMD_ERR                         = -1006; 	//收发指令不一致
    public static final int SDK_UNKNOWN_CMD                     = -1015; 	//未知命令
    public static final int SDK_FEATURE_NOT_SUPPORT             = -1099; 	//功能不支持

    //设备连接
    public static final int DEVICE_NOT_CONNECT                  = -1100;    // 未连接
    public static final int DEVICE_DISCONNECT                   = -1101;    // 断开连接
    public static final int DEVICE_CONNECTED                    = -1102;    // 已连接
    public static final int DEVICE_CONN_ERR                     = -1103;    // 连接失败
    public static final int DEVICE_NOT_SUPPORT                  = -1104;
    public static final int DEVICE_NOT_FOUND                    = -1105;
    public static final int DEVICE_OPEN_ERR                     = -1106;
    public static final int DEVICE_NO_PERMISSION                = -1107;

    public static final int BT_NOT_SUPPORT                      = -1108;
    public static final int BT_NOT_OPEN                         = -1109;
    public static final int BT_NO_LOCATION                      = -1110;
    public static final int BT_NO_BONDED_DEVICE                 = -1111;
    public static final int BT_SCAN_TIMEOUT                     = -1112;
    public static final int BT_SCAN_ERR                         = -1113;
    public static final int BT_SCAN_STOP                        = -1114;

    //打印机
    public static final int PRN_BASE_ERR                        = -1200;
    public static final int PRN_COVER_OPEN                      = (PRN_BASE_ERR -1); //打印机仓盖未关闭
    public static final int PRN_PARAM_ERR 				        = (PRN_BASE_ERR -2); //参数错误
    public static final int PRN_NO_PAPER                        = (PRN_BASE_ERR -3); //打印机缺纸
    public static final int PRN_OVERHEAT          			    = (PRN_BASE_ERR -4); //打印机过热
    public static final int PRN_UNKNOWN_ERR    			        = (PRN_BASE_ERR -5); //打印机未知异常
    public static final int PRN_PRINTING        			    = (PRN_BASE_ERR -6); //打印机正在打印
    public static final int PRN_NO_NFC        			        = (PRN_BASE_ERR -7); //打印机无NFC标签
    public static final int PRN_NFC_NO_PAPER        			= (PRN_BASE_ERR -8); //打印机NFC标签没有剩余次数
    public static final int PRN_LOW_BATTERY        			    = (PRN_BASE_ERR -9); //打印机低电量
    public static final int PRN_UNKNOWN_CMD                     = (PRN_BASE_ERR -15);//打印机未知命令
    public static final int PRN_LBL_LOCATE_ERR                  = (PRN_BASE_ERR -90);//打印机标签定位错误
    public static final int PRN_LBL_DETECT_ERR                  = (PRN_BASE_ERR -91);//打印机标签纸检测错误
    public static final int PRN_LBL_NO_DETECT                   = (PRN_BASE_ERR -92);//打印机未检测标签纸

    //fw
    public static final int FW_BASE_ERR                        = -1300;
    public static final int FW_BIN_ERR                         = (FW_BASE_ERR -1); //固件文件错误
    public static final int FW_CRC_ERR                         = (FW_BASE_ERR -2); //CRC错误

}
