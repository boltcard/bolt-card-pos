import { useNavigation } from '@react-navigation/native';
import React, { useContext } from 'react';
import {
    Button,
    Text,
    useColorScheme,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { ShopSettingsContext } from '../../contexts/ShopSettingsContext';
import QRScanner from '../QRScanner';

const ConnectToHub = (props) => {
    const {lndhub, setLndhub, lndhubUser, setLndhubUser} = useContext(ShopSettingsContext);
    
    const {navigate} = useNavigation();
    const isDarkMode = useColorScheme() === 'dark';
    const backgroundStyle = {
      backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };
    const {setScanMode, scanMode} = props;

    const onScanSuccess = (e: {data: string}) => {
        if (!e.data.startsWith('lndhub://')) {
          Toast.show({
            type: 'error',
            text1: 'Invalid QR Code',
            text2: 'Please scan your lndconnect QR code',
          });
          console.log('Toast.show');
        } else {
          const hubData = e.data.split('@');
        //   storeData('lndhubUser', hubData[0]);
          setLndhubUser(hubData[0]);
        //   storeData('lndhub', hubData[1]);
          setLndhub(hubData[1]);
    
          Toast.show({
            type: 'success',
            text1: 'LND Connect',
            text2: 'Code scanned successfully',
          });
          setScanMode(false);
        }
      };
    return (
        <>
            <View
                style={{...backgroundStyle}}>
                <View style={{padding: 20}}>
                <Text style={{fontSize: 30, fontWeight: 'bold'}}>
                    Current Settings
                    </Text>
                    <Text style={{fontWeight:'bold'}}>LND Hub User:</Text>
                    <Text>{lndhubUser && lndhubUser != 'blank' && lndhubUser}</Text>
                    <Text style={{fontWeight:'bold'}}>LND Hub:</Text>
                    <Text>{lndhub && lndhub != 'blank' && lndhub}</Text>
                    <Text style={{fontSize: 30, fontWeight: 'bold', marginTop:20}}>
                    Setup Instructions
                    </Text>
                    <Text style={{fontSize: 20}}>
                    1. Install LNBits on your server.
                    </Text>
                    <Text style={{fontSize: 20}}>
                    2. Install the LNDHub Extension.
                    </Text>
                    <Text style={{fontSize: 20}}>
                    3. Press the Scan QR Code button and scan the "Invoice" QR Code.
                    </Text>
                    <Button
                    onPress={() => setScanMode(!scanMode)}
                    title="Scan QR Code"
                    />
                    
                    
                </View>
                {scanMode && (
                    <QRScanner
                        cancel={() => setScanMode(!scanMode)}
                        onScanSuccess={onScanSuccess}
                    />
                )}
            </View>
            
        </>
    );
}
export default ConnectToHub;