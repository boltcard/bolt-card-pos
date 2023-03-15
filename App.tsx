/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import './shim.js';

import React, { PropsWithChildren, useEffect, useState } from 'react';
import {
  Button, SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet, Text, TextInput, useColorScheme,
  View
} from 'react-native';

import { Buffer } from '@craftzdog/react-native-buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import crypto from 'crypto';
import Toast from 'react-native-toast-message';
import {
  Colors, Header
} from 'react-native/Libraries/NewAppScreen';
import QRScanner from './screens/QRScanner';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  
  const [scanMode, setScanMode] = useState(false);


  const [lndConnect, setLndConnect] = useState("");
  const [lndUrl, setLndUrl] = useState("");
  const [lndDomain, setLndDomain] = useState("");
  const [lndPort, setLndPort] = useState("");
  const [lndMacaroon, setLndMacaroon] = useState("");
  const [inputAmount, setInputAmount] = useState("0.00");

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect( () => {
    console.log('loading lndconnect....');
    getData('@lndconnect').then(lndconnecturl => {
      setLndMacaroon(lndconnecturl.split("?macaroon=")[1].split('&')[0]);
      const url = lndconnecturl.split("?macaroon=")[0].replace('lndconnect://', '');
      setLndUrl('https://'+url);
      setLndDomain(url.split(':')[0]);
      setLndPort(url.split(':')[1]);
      setLndConnect(lndconnecturl);
      console.log('lndconnect loaded...',lndconnecturl);

    }).catch(e => {
      console.log('error', e);
    })
    
    return () => {
      
    }
  }, [])

  const storeData = async (key:string, value:string) => {
    try {
        await AsyncStorage.setItem(key, value)
    } catch (e:any) {
      console.error(e);
      Toast.show({
        type: 'error',
        text1: 'Store Data Error',
        text2: e.message
      });
    }
  }

  const getData = async (key:string): Promise<string> => {
    try {
      const value = await AsyncStorage.getItem(key)
      if(value !== null) {
        // value previously stored
        return value;
      }
    } catch (e:any) {
      console.error(e);
      Toast.show({
        type: 'error',
        text1: 'Get Data Error',
        text2: e.message
      });
    }
    return "";
  }

  const onScanSuccess = (e: { data: string; }) => {
    if(!e.data.startsWith('lndconnect://')) {
      Toast.show({
        type: 'error',
        text1: 'Invalid QR Code',
        text2: 'Please scan your lndconnect QR code'
      });
      console.log('Toast.show');
    }
    else {

      storeData('@lndconnect', e.data)
      
      Toast.show({
        type: 'success',
        text1: 'LND Connect',
        text2: 'Code scanned successfully'
      });
      setScanMode(false);
    }
  };

  const makeLndInvoice = async () => {
    console.log('get '+`${lndUrl}/v1/channels`);
    const buffer = Buffer.from(lndMacaroon, 'base64');
    const macaroonHex = buffer.toString('hex');
    const preimage = await crypto.randomBytes(32, function(err, buffer) {
      return buffer.toString('hex');
    });
    // console.log('preimage', buffer)
    const request = {
      memo: 'test',
      r_preimage: preimage,
      value: 100, //sats
      // value_msat: <int64>, //msats
      // expiry: 90, //seconds
    };

    axios({
      method: 'POST',
      url: `${lndUrl}/v1/invoices`,
      headers: {
        'Grpc-Metadata-macaroon': macaroonHex,
        'Content-Type': 'application/json'
      },
      withCredentials: false,
      // httpsAgent: new https.Agent({  
      //   rejectUnauthorized: false
      // })
      data: request,
    }).then(function (response: any) {
      console.log(response.data);
    }).catch(function (error: any) {
      console.log(error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      }
    });
    
  }
  
  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Button onPress={() => setScanMode(!scanMode)} title="Scan Mode" />
          {scanMode &&  <QRScanner onScanSuccess={onScanSuccess} />}
        </View>
        <Text>{lndUrl}</Text>
        <TextInput 
        style={{fontSize:40}}
          keyboardType="numeric" 
          placeholder="0.00"
          value={inputAmount} 
          onChange={(text)=>setInputAmount(text)}
        />
        <Button onPress={() => makeLndInvoice()} title="Invoice" />
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
