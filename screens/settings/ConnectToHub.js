import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    Button,
    Text,
    useColorScheme,
    View
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import QRScanner from '../QRScanner';
const ConnectToHub = (props) => {
    
    const {navigate} = useNavigation();
    const isDarkMode = useColorScheme() === 'dark';

    const {setScanMode, scanMode, onScanSuccess, lndhub, lndhubUser} = props;
    return (
        <>
            <View
                style={{
                backgroundColor: isDarkMode ? Colors.black : Colors.white,
            }}>
                
                <View style={{padding: 20}}>
                    <Text style={{fontSize: 30, fontWeight: 'bold'}}>
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
            <Text>{lndhubUser}</Text>
            <Text>{lndhub}</Text>
        </>
    );
}
export default ConnectToHub;