import { useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import {
    Button,
    Text,
    useColorScheme,
    View,
    TextInput
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { ShopSettingsContext } from '../../contexts/ShopSettingsContext';
import QRScanner from '../QRScanner';

const ConnectToHub = (props) => {
    const {lndhub, setLndhub, lndhubUser, setLndhubUser} = useContext(ShopSettingsContext);
    const [hub, setHub] = useState('');
    const {navigate} = useNavigation();
    const isDarkMode = useColorScheme() === 'dark';
    const backgroundStyle = {
      backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };
    const {setScanMode, scanMode} = props;
    const textStyle = {
        color: isDarkMode ? '#fff' : '#000',
        borderColor: isDarkMode ? '#fff' : '#000',
      };
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
                style={{...backgroundStyle, ...textStyle}}>
                <View style={{padding: 20}}>
                <Text style={{fontSize: 30, fontWeight: 'bold', ...textStyle}}>
                    Current Settings
                </Text>
                <Text style={{fontWeight:'bold', ...textStyle}}>LND Hub User:</Text>
                <Text style={{...textStyle}}>{lndhubUser && lndhubUser != 'blank' && lndhubUser}</Text>
                <Text style={{fontWeight:'bold', ...textStyle}}>LND Hub:</Text>
                <Text style={{...textStyle}}>{lndhub && lndhub != 'blank' && lndhub}</Text>
                <Text style={{fontSize: 30, fontWeight: 'bold', marginTop:20, ...textStyle}}>
                    Setup Instructions
                </Text>
                <Text style={{fontSize: 20, ...textStyle}}>
                    1. Install LNBits on your server.
                </Text>
                <Text style={{fontSize: 20, ...textStyle}}>
                    2. Install the LNDHub Extension.
                </Text>
                <Text style={{fontSize: 20, ...textStyle}}>
                    3. Copy hub invoice URL and paste into the box or press the Scan QR Code button and scan the "Invoice" QR Code.
                </Text>
                <TextInput
                  style={{...textStyle, fontSize: 16, borderWidth: 1, marginVertical: 10, padding: 10}}
                  editable={true}
                  value={hub}
                  onChangeText={text => setHub(text)}
                />  
                <Button
                    onPress={() => onScanSuccess({data:hub})}
                    title="Save Hub URL"
                />
                <Text style={{...textStyle}}>OR</Text>                  
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