import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  Platform,
  Image,
} from 'react-native';

import { useNavigation, useFocusEffect } from '@react-navigation/native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import QRCode from 'react-native-qrcode-svg';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import PinPadButton from '../components/PinPadButton';
import { ShopSettingsContext } from '../contexts/ShopSettingsContext';
import { LightningCustodianWallet } from '../wallets/lightning-custodian-wallet.js';
import ConnectToHub from './settings/ConnectToHub';
import Clipboard from '@react-native-clipboard/clipboard';

const boltLogo = require('../img/bolt-card-icon.png');
const boltPosLogo = require('../img/bolt-card-pos.png');


export type Props = {
  navigation: any;
};

function Home({navigation}): React.FC<Props> {
  const fetchInvoiceInterval = useRef();

  const isDarkMode = useColorScheme() === 'dark';
  const {navigate} = useNavigation();

  const [scanMode, setScanMode] = useState(false);

  const [inputAmount, setInputAmount] = useState('');
  const [initialisingWallet, setInitialisingWallet] = useState<boolean>(true);
  const [walletConfigured, setWalletConfigured] = useState<boolean>(false);

  //invoice stuff
  const [isFetchingInvoices, setIsFetchingInvoices] = useState<boolean>(false);
  const [lndInvoice, setLndInvoice] = useState<string>();
  const [invoiceIsPaid, setInvoiceIsPaid] = useState<boolean>(false);
  const [invoiceLoading, setInvoiceLoading] = useState<boolean>(false);

  //NFC shizzle
  const [ndef, setNdef] = useState<string>();
  const [boltLoading, setBoltLoading] = useState<boolean>(false);

  //connection
  const [lndWallet, setLndWallet] = useState<LightningCustodianWallet>();

  //shop settings
  const {shopName, lndhub, lndhubUser} = useContext(ShopSettingsContext);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const textStyle = {
    color: isDarkMode ? '#fff' : '#000',
    borderColor: isDarkMode ? '#fff' : '#000',
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log('useFocusEffect', shopName, lndhub, lndhubUser);
      if(!shopName || !lndhub || !lndhubUser) {
        setWalletConfigured(false);
      }
      // return () => unsubscribe();
    }, [lndhub, lndhubUser])
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('SettingsRoot');
          }}>
          <Icon name="cog" color={isDarkMode ? '#fff' : '#000'} size={30} />
        </TouchableOpacity>
      ),
      headerShown: true,
      title: shopName,
      headerStyle: {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
        borderBottomWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
        shadowOffset: {height: 0, width: 0},
      },
      headerTintColor: isDarkMode ? '#fff' : '#000',
    });
  }, [navigation, shopName]);

  //once the connections details have been loaded from local store
  //set up the connection objects to connect to the hub 
  useEffect(() => {
    async function initWallet() {
      console.log('initialising wallet...');
      const wallet = new LightningCustodianWallet();
      wallet.setLabel('initialised custodial wallet');
      const isValidNodeAddress =
        await LightningCustodianWallet.isValidNodeAddress(lndhub);
      if (isValidNodeAddress) {
        console.log('isValidNodeAddress...');
        wallet.setBaseURI(lndhub);
        await wallet.init();
      } else {
        throw new Error(
          'The provided node address is not a valid LND Hub node.',
        );
      }
      await wallet.setSecret(lndhubUser);
      setLndWallet(wallet);

      console.log(wallet);
      console.log('wallet.getID()', wallet.getID());
      setInitialisingWallet(false);
    }
    if (lndhub == 'blank' || lndhubUser == 'blank') {
      setInitialisingWallet(false);
      setWalletConfigured(false);
    } else if (lndhub && lndhubUser) {
      setWalletConfigured(true);

      console.log('init with lndhub, lndhubUser', lndhub, lndhubUser)
      initWallet();
    }
  }, [lndhub, lndhubUser]);

  const makeLndInvoice = async () => {
    if (!lndWallet) {
      throw new Error(
        'Wallet not configured, please reconnect to the hub in the settings',
      );
    }

    if (lndWallet) {
      setInvoiceLoading(true);
      console.log('invoicing...');
      setInvoiceIsPaid(false);
      try {
        await lndWallet.authorize();
      } catch (error) {
        console.log(error.message);
        Toast.show({
          type: 'error',
          text1: 'LND Auth error',
          text2: error.message,
        });
        setInvoiceLoading(false);

      }
      try {
        const result = await lndWallet.addInvoice(
          parseInt(inputAmount),
          shopName,
        );
        console.log('result', result);
        setLndInvoice(result);
        setIsFetchingInvoices(true);
      } catch (error) {
        console.log(error.message);
        Toast.show({
          type: 'error',
          text1: 'Add invoice error',
          text2: error.message,
        });
        setInvoiceLoading(false);
      }
      if (Platform.OS !== 'ios') readNdef();
      setInvoiceLoading(false);
    }
  };

  function bin2String(array) {
    var result = '';
    for (var i = 0; i < array.length; i++) {
      result += String.fromCharCode(parseInt(array[i], 2));
    }
    return result;
  }

  async function readNdef() {
    console.log('***** Await NFC Tag');
    try {
      // register for the NFC tag with NDEF in it
      await NfcManager.requestTechnology(NfcTech.Ndef);
      // the resolved tag object will contain `ndefMessage` property
      const tag = await NfcManager.getTag();
      // console.log('Tag found', tag);
      // console.log('NDEF', tag.ndefMessage[0].payload);
      const bytesToNdef = String.fromCharCode(...tag.ndefMessage[0].payload);
      setNdef(bytesToNdef.substring(1, bytesToNdef.length));
      console.log(bytesToNdef.substring(1, bytesToNdef.length));
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
    setBoltLoading(false);
    stopReadNdef();
  };

  useEffect(() => {
    // BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    return () => {
      // BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
      clearInterval(fetchInvoiceInterval.current);
      fetchInvoiceInterval.current = undefined;
    };
  }, []);

  useEffect(() => {
    console.log(
      'Polling invoices - invoiceIsPaid:',
      invoiceIsPaid,
      'isFetchingInvoices',
      isFetchingInvoices,
    );
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

            console.log(Date.now() + ' ispaid?', updatedUserInvoice.ispaid);

            if (typeof updatedUserInvoice !== 'undefined') {
              if (updatedUserInvoice.ispaid) {
                // we fetched the invoice, and it is paid :-)
                setInvoiceIsPaid(true);
                setBoltLoading(false);
                setIsFetchingInvoices(false);
                clearInterval(fetchInvoiceInterval.current);
                fetchInvoiceInterval.current = undefined;
              } else {
                const currentDate = new Date();
                const now = (currentDate.getTime() / 1000) | 0;
                const invoiceExpiration =
                  updatedUserInvoice.timestamp + updatedUserInvoice.expire_time;
                if (invoiceExpiration < now && !updatedUserInvoice.ispaid) {
                  // invoice expired :-(
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
    if (ndef) {
      setBoltLoading(true);
      const url = ndef.replace('lnurlw://', 'https://');
      fetch(url)
        .then(response => response.json())
        .then(data => {
          console.log('bolt request', data);
          if (data.callback) {
            const callback = new URL(data.callback);
            callback.searchParams.set('k1', data.k1);
            callback.searchParams.set('pr', lndInvoice);
            fetch(callback.toString())
              .then(cbResponse => cbResponse.json())
              .then(cbData => {
                console.log('bolt callback', cbData);
                if (cbData.status == 'ERROR') {
                  console.error(cbData.reason);
                  Toast.show({
                    type: 'error',
                    text1: 'Bolt Card Error',
                    text2: cbData.reason,
                  });
                  setTimeout(() => {
                    if (Platform.OS !== 'ios') readNdef()
                  }, 1000);
                  setBoltLoading(false);
                }
              })
              .catch(err => {
                console.error(err);
                Toast.show({
                  type: 'error',
                  text1: 'Bolt Card Error',
                  text2: err.message,
                });
                setTimeout(() => {
                  if (Platform.OS !== 'ios') readNdef();
                }, 1000);
                setBoltLoading(false);
              })
              .finally(() => {
                setNdef(undefined);
              });
          } else if (data.status == 'ERROR') {
            console.error(data.reason);
            Toast.show({
              type: 'error',
              text1: 'Bolt Card Error',
              text2: data.reason,
            });
            setTimeout(() => {
              if (Platform.OS !== 'ios') readNdef();
            }, 1000);
            setBoltLoading(false);
            setNdef(undefined);
          }
        })
        .catch(err => {
          console.error(err);
          Toast.show({
            type: 'error',
            text1: 'Bolt Card Error',
            text2: err.message,
          });
          setTimeout(() => {
            if (Platform.OS !== 'ios') readNdef();
          }, 1000);
          setBoltLoading(false);
        })
        .finally(() => {
          setNdef(undefined);
        });
    }
  }, [ndef]);

  const press = (input: string) => {
    console.log(inputAmount);
    if (input === 'c') {
      setInputAmount('0');
    } else {
      setInputAmount(inputAmount === '0' ? input : inputAmount + '' + input);
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(lndInvoice);
    Toast.show({
      type: 'success',
      text1: 'Copied to clipboard',
      text2: 'Invoice has been copied to clipboard',
    });
  }


  if (initialisingWallet) {
    return <ActivityIndicator />;
  }
  return (
    <View style={{...backgroundStyle, flex: 1}}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={{...backgroundStyle, flex: 1}}>
        {!walletConfigured && (
          <ConnectToHub 
            lndhub={lndhub}
            lndhubUser={lndhubUser}
          />
        )}
        {walletConfigured && (
          <>
            <View style={{alignItems:'center', flexDirection:'row'}}>
              <Image source={boltPosLogo} style={{width:100, height:100}} />
              <View style={{alignItems:'flex-start', flexDirection:'column'}}>
                <Text style={{...textStyle, fontSize: 30}}>{shopName}</Text>
                <Text style={{...textStyle, fontSize: 15, color:'#ccc'}}>Bolt Card POS</Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', flex:1}}>
              <TextInput
                style={{...textStyle, fontSize: 40, borderWidth: 1, margin: 10, flex:3}}
                keyboardType="numeric"
                placeholder="0"
                editable={false}
                value={inputAmount}
                onChangeText={text => setInputAmount(text)}
              />
              <Text style={{...textStyle,flex:1, fontSize:30,margin: 10,  lineHeight:80}}>sats</Text>
            </View>
            {!lndInvoice && (
              <View style={{flex:4}}>
                <View style={{flex: 1, padding: 10}}>
                  <View style={{flexDirection: 'row', alignItems: 'stretch'}}>
                    <PinPadButton number="7" onPress={() => press('7')} />
                    <PinPadButton number="8" onPress={() => press('8')} />
                    <PinPadButton number="9" onPress={() => press('9')} />
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <PinPadButton number="4" onPress={() => press('4')} />
                    <PinPadButton number="5" onPress={() => press('5')} />
                    <PinPadButton number="6" onPress={() => press('6')} />
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <PinPadButton number="1" onPress={() => press('1')} />
                    <PinPadButton number="2" onPress={() => press('2')} />
                    <PinPadButton number="3" onPress={() => press('3')} />
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <PinPadButton number="0" onPress={() => press('0')} />
                    <PinPadButton number="." onPress={() => press('.')} />
                    <PinPadButton number="C" onPress={() => press('c')} />
                  </View>
                </View>
                <View style={{padding: 10}}>
                  <Pressable
                    onPress={() => makeLndInvoice()}
                    disabled={invoiceLoading}>
                    <View
                      style={{
                        backgroundColor: invoiceLoading ? '#D3D3D3' : '#ff9900',
                        height: 50,
                        justifyContent: 'center',
                      }}>
                      {invoiceLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text
                          style={{
                            fontSize: 40,
                            textAlign: 'center',
                            color: '#fff',
                          }}>
                          Invoice
                        </Text>
                      )}
                    </View>
                  </Pressable>
                </View>
              </View>
            )}
            {lndInvoice &&
              (!invoiceIsPaid ? (
                <View style={{flexDirection: 'column', alignItems: 'center'}}>
                  <View style={{padding: 20, backgroundColor: '#fff'}}>
                    <QRCode
                      size={300}
                      value={lndInvoice}
                      logo={boltLogo}
                      logoSize={80}
                      logoBackgroundColor="transparent"
                    />
                  </View>
                  {/*<View style={{width:'100%', padding: 20, flexDirection:'row', justifyContent:'space-around'}}>
                    <View  style={{borderWidth:1, borderColor: '#ccc', padding:10, borderRadius:10}}>
                      <Pressable 
                        onPress={() => copyToClipboard()}
                      >
                        <Text style={{fontSize:20}}><Icon name="copy" color="#F60" size={30} /> Copy</Text>
                      </Pressable>
                    </View>
                    <View style={{borderWidth:1, borderColor: '#ccc', padding:10, borderRadius:10}}>
                      <Pressable 
                        onPress={() => share()}
                      >
                        <Text style={{fontSize:20}}><Icon name="share" color="#F60" size={30} /> Share</Text>
                      </Pressable>
                    </View>
                  </View>*/}
                  {Platform.OS === 'ios' && (
                    <View style={{padding: 20, backgroundColor: "#999"}}>
                      <Pressable
                        onPress={readNdef}
                      >
                        <Text style={{fontSize:20, color:"#fff"}}>Enable Bolt Card NFC</Text>
                      </Pressable>
                    </View>
                  )}
                  <View style={{padding: 20}}>
                    <View style={{padding: 20, backgroundColor: "#f00"}}>
                      <Pressable
                        onPress={resetInvoice}
                      >
                        <Text style={{fontSize:20, color:"#fff"}}>Cancel</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ) : (
                <View
                  style={{flexDirection: 'column', justifyContent: 'center'}}>
                  <View
                    style={{flexDirection: 'row', justifyContent: 'center'}}>
                    <Icon name="checkmark-circle" color="#0f0" size={250} />
                  </View>
                  <View
                    style={{flexDirection: 'row', justifyContent: 'center'}}>
                    <Text style={{fontSize: 60}}>Paid!</Text>
                  </View>
                  <View style={{padding: 20}}>
                    <Button title="Done" onPress={resetInvoice} />
                  </View>
                </View>
              ))}
            {boltLoading && <ActivityIndicator size="large" color="#ff9900" />}
          </>
        )}
      </ScrollView>
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
