import {useNavigation} from '@react-navigation/native';
import React, {useContext, useState, useEffect, useCallback} from 'react';
import {
  Text,
  useColorScheme,
  View,
  TextInput,
  Pressable,
  ScrollView,
  BackHandler,
} from 'react-native';
import {Button} from 'react-native-elements';
import Toast from 'react-native-toast-message';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {ShopSettingsContext} from '../../contexts/ShopSettingsContext';
import QRScanner from '../QRScanner';
import Icon from 'react-native-vector-icons/Ionicons';
import PinSetScreen from './PinSetScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ConnectToHub = props => {
  const {lndhub, setLndhub, lndhubUser, setLndhubUser, setShopWallet} =
    useContext(ShopSettingsContext);
  const [hub, setHub] = useState('');
  const [showLnbitsInstr, setShowLnbitsInstr] = useState(false);
  const [showBtcPayInstr, setShowBtcPayInstr] = useState(false);
  const [hubData, setHubData] = useState([]);
  const {navigate} = useNavigation();
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const [scanMode, setScanMode] = useState(false);

  // const [showPinSetScreen, setShowPinSetScreen] = useState(false);

  const textStyle = {
    color: isDarkMode ? '#fff' : '#000',
    borderColor: isDarkMode ? '#fff' : '#000',
  };

  const onScanSuccess = (e: {data: string}) => {
    if (!e.data.startsWith('lndhub://')) {
      Toast.show({
        type: 'error',
        text1: 'Invalid QR Code',
        text2: 'LND Hub URL should start lndhub://',
      });
      console.log('Toast.show');
    } else {
      setScanMode(false);
      const data = e.data.split('@');
      setLndhubUser(data[0]);
      setLndhub(data[1]);
      Toast.show({
        type: 'success',
        text1: 'LND Connect',
        text2: 'LND Hub Save Success.',
      });
    }
  };

  useEffect(() => {
    const backAction = () => {
      console.log('scanMode', scanMode);
      if (scanMode) {
        setScanMode(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [scanMode]);
  return (
    <>
      {scanMode ? (
        <QRScanner
          cancel={() => setScanMode(!scanMode)}
          onScanSuccess={onScanSuccess}
        />
      ) : (
        <ScrollView style={{...backgroundStyle, ...textStyle}}>
          <View
            style={{
              padding: 20,
              height: '100%',
              ...backgroundStyle,
              ...textStyle,
            }}>
            <Text
              style={{
                fontSize: 30,
                fontWeight: 'bold',
                marginBottom: 7,
                ...textStyle,
              }}>
              Setup Instructions
            </Text>
            <Button
              title="Set up instructions for LNBits"
              onPress={() => setShowLnbitsInstr(!showLnbitsInstr)}
              type="clear"
              buttonStyle={{
                justifyContent: 'flex-start',
                paddingLeft: 0,
              }}></Button>
            {showLnbitsInstr && (
              <View style={{marginBottom: 10}}>
                <Text
                  style={{
                    fontSize: 25,
                    fontWeight: 'bold',
                    marginBottom: 4,
                    ...textStyle,
                  }}>
                  LNBits
                </Text>
                <Text style={{fontSize: 20, ...textStyle}}>
                  1. Install LNBits >10.7 & the LNDHub extension.
                </Text>
                <Text style={{fontSize: 20, ...textStyle}}>
                  2. Copy and paste invoice URL or Scan the "invoice" QR Code.
                </Text>
                <Text style={{fontSize: 20, ...textStyle, color: 'orange'}}>
                  <Icon size={20} name="warning" /> NB: Minimum supported LNBits
                  version is 10.7 and above.
                </Text>
              </View>
            )}
            <Button
              title="Set up instructions for BTCPay Server"
              onPress={() => setShowBtcPayInstr(!showBtcPayInstr)}
              type="clear"
              buttonStyle={{
                justifyContent: 'flex-start',
                paddingLeft: 0,
              }}></Button>
            {showBtcPayInstr && (
              <View>
                <Text
                  style={{
                    fontSize: 25,
                    fontWeight: 'bold',
                    marginBottom: 4,
                    ...textStyle,
                  }}>
                  BTCPay Server
                </Text>
                <Text style={{fontSize: 20, ...textStyle}}>
                  1. Install BTCPay Server & the LNbank extension.
                </Text>
                <Text style={{fontSize: 20, ...textStyle}}>
                  2. Enable Lightning wallet in BTCPay server.
                </Text>
                <Text style={{fontSize: 20, ...textStyle}}>
                  3. Create a LNbank wallet.
                </Text>
                <Text style={{fontSize: 20, ...textStyle}}>
                  4. Go to settings in LNbank Wallet and either copy and paste
                  the access URL or scan the QR code.
                </Text>
              </View>
            )}

            <Text
              style={{
                fontSize: 30,
                marginTop: 20,
                fontWeight: 'bold',
                ...textStyle,
              }}>
              Current Settings
            </Text>
            <View>
              <Text style={{fontWeight: 'bold', ...textStyle}}>
                LND Hub User:
              </Text>
              <Text style={{...textStyle}}>
                {lndhubUser && lndhubUser != 'blank' && lndhubUser}
              </Text>
              <Text style={{fontWeight: 'bold', ...textStyle}}>LND Hub:</Text>
              <Text style={{...textStyle}}>
                {lndhub && lndhub != 'blank' && lndhub}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginVertical: 10,
              }}>
              <Text style={{...textStyle, marginTop: 10}}>
                Scan Invoice QR Code
              </Text>
              <Button
                title="Scan QR Code"
                onPress={() => setScanMode(!scanMode)}
              />
            </View>
            <Text style={{...textStyle, marginTop: 10}}>
              Paste Hub URL here
            </Text>
            <TextInput
              style={{
                ...textStyle,
                fontSize: 16,
                borderWidth: 1,
                marginVertical: 10,
                padding: 10,
              }}
              editable={true}
              value={hub}
              onChangeText={text => setHub(text)}
            />

            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Button
                title="Save Hub URL"
                onPress={() => onScanSuccess({data: hub})}
              />
            </View>
            <Button
              title="Clear Hub Connection"
              onPress={async () => {
                try {
                  setLndhubUser(null);
                  setLndhub(null);
                  setShopWallet(null);
                  await AsyncStorage.setItem('manager-pin', '');
                } catch (err) {
                  Toast.show({
                    type: 'error',
                    text1: 'PIN reset error',
                    text2: err.message,
                  });
                }
              }}
            />
          </View>
        </ScrollView>
      )}
      // <PinSetScreen
      //   showBaseModal={showPinSetScreen}
      //   onClose={() => setShowPinSetScreen(false)}
      //   title="Set Admin Access PIN"
      //   successMessage="LND Hub Save Success."
      //   successCallback={() => {
      //     setLndhubUser(hubData[0]);
      //     setLndhub(hubData[1]);
      //     Toast.show({
      //       type: 'success',
      //       text1: 'LND Connect',
      //       text2: 'LND Hub Save Success.',
      //     });
      //     setHubData([]);
      //   }}
      //   failCallback={() => {
      //     setHubData([]);
      //   }}
      // />
    </>
  );
};
export default ConnectToHub;
