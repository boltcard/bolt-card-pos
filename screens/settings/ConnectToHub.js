import { useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import {
    Button,
    Text,
    useColorScheme,
    View,
    TextInput,
    Pressable
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
    const [scanMode, setScanMode] = useState(false);
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
          const hubData = e.data.split('@');
          setLndhubUser(hubData[0]);
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
            {scanMode ? 
                <QRScanner
                    cancel={() => setScanMode(!scanMode)}
                    onScanSuccess={onScanSuccess}
                />
            :
                <View
                    style={{...backgroundStyle, ...textStyle}}>
                    <View style={{padding: 20}}>
                        <Text style={{fontSize: 30, fontWeight: 'bold', ...textStyle}}>
                            Current Settings
                            <Pressable
                                onPress={() => {
                                    setLndhubUser("");
                                    setLndhub("");
                                }}
                            >
                                <Text style={{...textStyle, borderWidth:1, padding:10}}>Clear Hub</Text>
                            </Pressable>
                        </Text>
                        <Text style={{fontWeight:'bold', ...textStyle}}>LND Hub User:</Text>
                        <Text style={{...textStyle}}>{lndhubUser && lndhubUser != 'blank' && lndhubUser}</Text>
                        <Text style={{fontWeight:'bold', ...textStyle}}>LND Hub:</Text>
                        <Text style={{...textStyle}}>{lndhub && lndhub != 'blank' && lndhub}</Text>
                        <Text style={{fontSize: 30, fontWeight: 'bold', marginTop:20, ...textStyle}}>
                            Setup Instructions
                        </Text>
                        <Text style={{fontSize: 20, ...textStyle}}>
                            1. Install LNBits & the LNDHub extension.
                        </Text>
                        <Text style={{fontSize: 20, ...textStyle}}>
                            2. Copy and paste invoice URL or Scan the "invoice" QR Code.
                        </Text>
                        <Text style={{...textStyle, marginTop:10}}>Enter Hub URL</Text>
                        <TextInput
                          style={{...textStyle, fontSize: 16, borderWidth: 1, marginVertical: 10, padding: 10}}
                          editable={true}
                          value={hub}
                          onChangeText={text => setHub(text)}
                        />  
                        <View style={{flexDirection:'row', justifyContent:'space-around'}}>
                            <Pressable
                                onPress={() => onScanSuccess({data:hub})}
                            >
                                <Text style={{...textStyle, borderWidth:1, padding:10}}>Save Hub URL</Text>
                            </Pressable>
                            <Text style={{...textStyle, lineHeight:40}}>OR</Text>                  
                            <Pressable
                                onPress={() => setScanMode(!scanMode)}
                            >
                                <Text style={{...textStyle, borderWidth:1, padding:10}}>Scan QR Code</Text>
                            </Pressable>
                            
                        </View>
                    </View>
                    
                </View>
            
            }
        </>
    );
}
export default ConnectToHub;