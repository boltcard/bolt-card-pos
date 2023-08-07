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
import Icon from 'react-native-vector-icons/Ionicons';

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
            text2: 'LND Hub Save Success.',
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
                    <View style={{padding: 20, height:'100%', ...backgroundStyle, ...textStyle}}>
                        <Text style={{fontSize: 30, fontWeight: 'bold', ...textStyle}}>
                            Setup Instructions
                        </Text>
                        <Text style={{fontSize: 20, ...textStyle}}>
                            1. Install LNBits >10.7 & the LNDHub extension.
                        </Text>
                        <Text style={{fontSize: 20, ...textStyle}}>
                            2. Copy and paste invoice URL or Scan the "invoice" QR Code.
                        </Text>
                        <Text style={{fontSize: 20, ...textStyle, color:'orange'}}>
                            <Icon size={20} name="warning" /> NB: Minimum supported LNBits version is 10.7 and above.
                        </Text>

                        <Text style={{fontSize: 30, marginTop:20, fontWeight: 'bold', ...textStyle}}>
                            Current Settings
                        </Text>
                        <View>
                            <Text style={{fontWeight:'bold', ...textStyle}}>LND Hub User:</Text>
                            <Text style={{...textStyle}}>{lndhubUser && lndhubUser != 'blank' && lndhubUser}</Text>
                            <Text style={{fontWeight:'bold', ...textStyle}}>LND Hub:</Text>
                            <Text style={{...textStyle}}>{lndhub && lndhub != 'blank' && lndhub}</Text>
                        </View>
                        <Button
                            title="Clear Hub Connection"
                            onPress={() => {
                                setLndhubUser(null);
                                setLndhub(null);
                            }}
                        />
                        <View style={{flexDirection:'row', justifyContent:'space-between', marginVertical: 10}}>
                            <Text style={{...textStyle, marginTop:10}}>Scan Invoice QR Code</Text>
                            <Button
                                
                                title="Scan QR Code"
                                onPress={() => setScanMode(!scanMode)}
                            />
                        </View>
                        <Text style={{...textStyle, marginTop:10}}>Paste Hub URL here</Text>
                        <TextInput
                          style={{...textStyle, fontSize: 16, borderWidth: 1, marginVertical: 10, padding: 10}}
                          editable={true}
                          value={hub}
                          onChangeText={text => setHub(text)}
                        />  
                        
                        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                            <Button
                                title="Save Hub URL"
                                onPress={() => onScanSuccess({data:hub})}
                            />
                        </View>
                        
                       
                    </View>
                    
                </View>
            
            }
        </>
    );
}
export default ConnectToHub;