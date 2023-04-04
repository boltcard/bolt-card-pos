import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Button, Pressable, SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import QRCode from 'react-native-qrcode-svg';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  Colors
} from 'react-native/Libraries/NewAppScreen';
import PinPadButton from '../components/PinPadButton';
import QRScanner from './QRScanner';
import { LightningCustodianWallet } from '../wallets/lightning-custodian-wallet.js';
import alert from '../components/Alert';
let boltLogo = require('../img/bolt-card-icon.png');

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Home(): JSX.Element {
  const fetchInvoiceInterval = useRef();

  const isDarkMode = useColorScheme() === 'dark';
  const { navigate } = useNavigation();

  const [scanMode, setScanMode] = useState(false);

  // const [lndConnect, setLndConnect] = useState("");
  // const [lndUrl, setLndUrl] = useState("");
  // const [lndDomain, setLndDomain] = useState("");
  // const [lndPort, setLndPort] = useState("");
  // const [lndMacaroon, setLndMacaroon] = useState("");
  
  const [inputAmount, setInputAmount] = useState("");
  const [initialisingWallet, setInitialisingWallet] = useState<boolean>(true);
  const [walletConfigured, setWalletConfigured] = useState<boolean>(false);
  
  //invoice stuff
  const [isFetchingInvoices, setIsFetchingInvoices] = useState<boolean>(false);
  const [lndInvoice, setLndInvoice] = useState<string>();
  const [invoiceIsPaid, setInvoiceIsPaid] = useState<boolean>(false);

  //NFC shizzle
  const [ndef, setNdef] = useState<string>();
  const [boltLoading, setBoltLoading] = useState<boolean>(false);

  //connection
  const [lndhubUser, setLndhubUser] = useState("");
  const [lndhub, setLndhub] = useState("");
  const [lndWallet, setLndWallet] = useState<LightningCustodianWallet>();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const textStyle = {
    color: isDarkMode ? '#fff' : '#000',
    borderColor:isDarkMode ? '#fff' : '#000'
  };


  useEffect( () => {
    console.log('loading wallet ....');
    async function fetchData() {
      // getData('wallet').then(wallet => {
      //   if(wallet) {
      //     setLndWallet(JSON.parse(wallet));
      //   }
      // })
      getData('lndhub').then(hub => {
        console.log('lndhub', hub)
        if(!hub) setLndhub('blank');
        setLndhub(hub)
      });
      getData('lndhubUser').then(user => {
        console.log('lndhubUser', user)
        if(!user) setLndhubUser('blank');
        setLndhubUser(user)
      });
    }
    fetchData();

    return () => {
    
    }
    
  }, [])

  useEffect( () => {
    async function initWallet() {
      console.log('initialising wallet...');
      const wallet = new LightningCustodianWallet();
      wallet.setLabel("initialised custodial wallet");
      const isValidNodeAddress = await LightningCustodianWallet.isValidNodeAddress(lndhub);
      if (isValidNodeAddress) {
        console.log('isValidNodeAddress...');
        wallet.setBaseURI(lndhub);
        await wallet.init();
      } else {
        throw new Error('The provided node address is not a valid LND Hub node.');
      }
      await wallet.setSecret(lndhubUser)
      setLndWallet(wallet);
      
      console.log(wallet);
      console.log('wallet.getID()',wallet.getID());
      setInitialisingWallet(false);
    }
    if(lndhub == 'blank' && lndhubUser !== 'blank') {
      setInitialisingWallet(false);
      setWalletConfigured(false);
    }
    else if(lndhub && lndhubUser) {
      setWalletConfigured(true);
      initWallet();
    }

  },[lndhub, lndhubUser]);

  const saveToDisk = async (wallet:any) => {
    await storeData('wallet', JSON.stringify(wallet));
  }

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
    if(!e.data.startsWith('lndhub://')) {
      Toast.show({
        type: 'error',
        text1: 'Invalid QR Code',
        text2: 'Please scan your lndconnect QR code'
      });
      console.log('Toast.show');
    }
    else {
      const hubData = e.data.split('@');
      storeData('lndhubUser', hubData[0])
      setLndhubUser(hubData[0]);
      storeData('lndhub', hubData[1])
      setLndhub(hubData[1]);
      
      Toast.show({
        type: 'success',
        text1: 'LND Connect',
        text2: 'Code scanned successfully'
      });
      setScanMode(false);
    }
  };

  const makeLndInvoice = async () => {
    if(!lndWallet) {
      throw new Error('lnd wallet not configured');  
    }

    if(lndWallet) {
      console.log('invoicing...')
      setInvoiceIsPaid(false);
      await lndWallet.authorize();
      const result = await lndWallet.addInvoice(parseInt(inputAmount), "test");
      console.log('result', result);
      setLndInvoice(result);
      setIsFetchingInvoices(true);
      readNdef();
    }

  }

  function bin2String(array) {
    var result = "";
    for (var i = 0; i < array.length; i++) {
      result += String.fromCharCode(parseInt(array[i], 2));
    }
    return result;
  }

  async function readNdef() {
    console.log('***** Await NFC Tag')
    try {
      // register for the NFC tag with NDEF in it
      await NfcManager.requestTechnology(NfcTech.Ndef);
      // the resolved tag object will contain `ndefMessage` property
      const tag = await NfcManager.getTag();
      // console.log('Tag found', tag);
      // console.log('NDEF', tag.ndefMessage[0].payload);
      const bytesToNdef = String.fromCharCode(...(tag.ndefMessage[0].payload));
      setNdef(bytesToNdef.substring(1,bytesToNdef.length));
      console.log(bytesToNdef.substring(1,bytesToNdef.length));
    } catch (ex) {
      console.error('NFC Error:', ex);
    } finally {
      // stop the nfc scanning
      NfcManager.cancelTechnologyRequest();
    }
  }

  async function stopReadNdef() {
    try {
      NfcManager.cancelTechnologyRequest();
    } catch (ex) {
      console.error('NFC stopReadNdef:', ex);
    }
  }

  const resetInvoice = () => {
    setIsFetchingInvoices(false);
    clearInterval(fetchInvoiceInterval.current);
    fetchInvoiceInterval.current = undefined;
    setLndInvoice(undefined);
    stopReadNdef();
  }

  useEffect(() => {
    // BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    return () => {
      // BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
      clearInterval(fetchInvoiceInterval.current);
      fetchInvoiceInterval.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log('Polling invoices - invoiceIsPaid:', invoiceIsPaid,'isFetchingInvoices', isFetchingInvoices);
    if (!invoiceIsPaid) {
      fetchInvoiceInterval.current = setInterval(async () => {
        if (isFetchingInvoices) { 
          try {
            const userInvoices = await lndWallet?.getUserInvoices(20);
            // console.log('userInvoices', userInvoices);
            // fetching only last 20 invoices
            // for invoice that was created just now - that should be enough (it is basically the last one, so limit=1 would be sufficient)
            // but that might not work as intended IF user creates 21 invoices, and then tries to check the status of invoice #0, it just wont be updated
            const updatedUserInvoice = userInvoices.filter(filteredInvoice =>
              typeof lndInvoice === 'object'
                ? filteredInvoice.payment_request === lndInvoice.payment_request
                : filteredInvoice.payment_request === lndInvoice,
            )[0];
            
            console.log(Date.now()+' ispaid?', updatedUserInvoice.ispaid);

            if (typeof updatedUserInvoice !== 'undefined') {
              // setParams({ invoice: updatedUserInvoice });
              // setIsLoading(false);
              if (updatedUserInvoice.ispaid) {
                // we fetched the invoice, and it is paid :-)
                setInvoiceIsPaid(true);
                setBoltLoading(false);
                setIsFetchingInvoices(false);
                clearInterval(fetchInvoiceInterval.current);
                fetchInvoiceInterval.current = undefined;
                // fetchAndSaveWalletTransactions(walletID);
              } else {
                const currentDate = new Date();
                const now = (currentDate.getTime() / 1000) | 0;
                const invoiceExpiration = updatedUserInvoice.timestamp + updatedUserInvoice.expire_time;
                if (invoiceExpiration < now && !updatedUserInvoice.ispaid) {
                  // invoice expired :-(
                  // fetchAndSaveWalletTransactions(walletID);
                  setIsFetchingInvoices(false);
                  setBoltLoading(false);
                  // ReactNativeHapticFeedback.trigger('notificationError', { ignoreAndroidSystemSettings: false });
                  clearInterval(fetchInvoiceInterval.current);
                  fetchInvoiceInterval.current = undefined;
                }
              }
            }
          } catch (error) {
            console.error(error);
          }
        }
      }, 3000);
    } else {
      setIsFetchingInvoices(false);
      clearInterval(fetchInvoiceInterval.current);
      fetchInvoiceInterval.current = undefined;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetchingInvoices]);


  useEffect(() => {
    if(ndef) {
      setBoltLoading(true);
      const url = ndef.replace('lnurlw://','https://');
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          console.log('bolt request', data);
          if(data.status == 'OK') {
            const callback = new URL(data.callback);
            callback.searchParams.set('k1', data.k1);
            callback.searchParams.set('pr', lndInvoice);
            fetch(callback.toString())
              .then((cbResponse) => cbResponse.json())
              .then((cbData) => {
                console.log('bolt callback', cbData);
              }).catch(err => {
                console.error(err);
                Toast.show({
                  type: 'error',
                  text1: 'Bolt Card Error',
                  text2: err.message
                });
                setTimeout(()=>readNdef(),1000);
                setBoltLoading(false);
  
              }).finally(() => {
                setNdef(undefined);
              });
          } else if(data.status == 'ERROR') {
            console.error(data.reason);
            Toast.show({
              type: 'error',
              text1: 'Bolt Card Error',
              text2: data.reason
            });
            setTimeout(()=>readNdef(),1000);
            setBoltLoading(false);
            setNdef(undefined);
          }
        })
        .catch(err => {
          console.error(err);
          Toast.show({
            type: 'error',
            text1: 'Bolt Card Error',
            text2: err.message
          });
          setTimeout(()=>readNdef(),1000);
          setBoltLoading(false);
        })
        .finally(()=>{
          setNdef(undefined);
        });
    }
  },[ndef]);

  const press = (input:string) => {
    console.log(inputAmount);
    if(input === 'c') setInputAmount('0');
    else setInputAmount(inputAmount === '0' ? input : inputAmount+''+input);
  }
  if(initialisingWallet) return <ActivityIndicator />
  return (
    <View>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        >
          {/* @TODO: move this to headerRight navigation option */}
          <View style={{alignItems: 'flex-end', margin: 20}}>
            <TouchableOpacity onPress={() => {
              navigate('SettingsRoot');
            }}>
              <Icon name="cog" color="#000" size={30} />
            </TouchableOpacity>
          </View>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
            {!walletConfigured && 
              <View style={{padding:20}}>
                <Text style={{fontSize:30, fontWeight:'bold'}}>Setup Instructions</Text>
                <Text style={{fontSize:20}}>1. Install LNBits on your server.</Text>
                <Text style={{fontSize:20}}>2. Install the LNDHub Extension.</Text>
                <Text style={{fontSize:20}}>3. Press the Scan QR Code button and scan the "Invoice" QR Code.</Text> 
                <Button onPress={() => setScanMode(!scanMode)} title="Scan QR Code" />
              </View>
            }
            {scanMode && <QRScanner cancel={()=> setScanMode(!scanMode)} onScanSuccess={onScanSuccess} />}

        </View>
        <Text>{lndhubUser}</Text>
        <Text>{lndhub}</Text>
        {walletConfigured && 
        <>
          <TextInput 
            style={{...textStyle, fontSize:40, borderWidth:1, margin:10}}
            keyboardType="numeric"
            placeholder="0.00"
            editable={false}
            value={inputAmount}
            onChangeText={(text)=>setInputAmount(text)}
          />
          {!lndInvoice && <>
            <View style={{flex: 1}}>
              <View style={{flexDirection:'row', alignItems:'stretch'}}>
                <PinPadButton number="7" onPress={() => press("7")}/>
                <PinPadButton number="8" onPress={() => press("8")}/>
                <PinPadButton number="9" onPress={() => press("9")}/>
              </View>
              <View style={{flexDirection:'row'}}>
                <PinPadButton number="4" onPress={() => press("4")}/>
                <PinPadButton number="5" onPress={() => press("5")}/>
                <PinPadButton number="6" onPress={() => press("6")}/>
              </View>
              <View style={{flexDirection:'row'}}>
                <PinPadButton number="1" onPress={() => press("1")}/>
                <PinPadButton number="2" onPress={() => press("2")}/>
                <PinPadButton number="3" onPress={() => press("3")}/>
              </View>
              <View style={{flexDirection:'row'}}>
                <PinPadButton number="0" onPress={() => press("0")}/>
                <PinPadButton number="." onPress={() => press(".")}/>
                <PinPadButton number="C" onPress={() => press("c")}/>
              </View>
            </View>
            <View style={{padding:10}}>
              <Pressable onPress={() => makeLndInvoice()}>
                <Text style={{backgroundColor:'#ff9900', color:'#fff', fontSize:40, textAlign:'center'}}>Invoice</Text>
              </Pressable>
            </View>
          </>}
          {lndInvoice && (
            !invoiceIsPaid ?
              <View style={{flexDirection:'column', alignItems: 'center'}}>
                <View style={{padding:20, backgroundColor:'#fff'}}>
                  <QRCode
                    size={200}
                    value={lndInvoice}
                    logo={boltLogo}
                    logoSize={40}
                    logoBackgroundColor='transparent'
                  />
                </View>
                <View style={{padding:20}}>
                  <View style={{padding:20}}>
                    <Button title="Cancel" color="#f00" onPress={resetInvoice} />
                  </View>
                </View>
              </View>
            :
              <View style={{flexDirection:'column', justifyContent:'center'}}>
                <View style={{flexDirection:'row', justifyContent:'center'}}>
                  <Icon name="checkmark-circle" color="#0f0" size={120} />
                </View>
                <View style={{flexDirection:'row', justifyContent:'center'}}>
                  <Text style={{fontSize:40}}>Paid!</Text>
                </View>
                <View style={{padding:20}}>
                  <Button title="Done" onPress={resetInvoice} />
                </View>
              </View>
          )}
          {boltLoading && <ActivityIndicator size="large" color="#ff9900" />}
        </>}
      </ScrollView>
      <Toast />
    </View>
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

export default Home;
