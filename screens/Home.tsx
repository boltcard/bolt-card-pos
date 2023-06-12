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
import DropDownPicker from 'react-native-dropdown-picker';
import dateFormat from "dateformat";

const currency = require('../helper/currency');

const boltLogo = require('../img/bolt-card-icon.png');
const boltPosLogo = require('../img/bolt-card-pos.png');


export type Props = {
  navigation: any;
};

function Home({navigation}): React.FC<Props> {
  const fetchInvoiceInterval = useRef();

  const isDarkMode = useColorScheme() === 'dark';
  const {navigate} = useNavigation();

  const [inputAmount, setInputAmount] = useState('');
  const [fiatAmount, setFiatAmount] = useState('');
  const [satsAmount, setSatsAmount] = useState('');

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
  const [boltServiceResponse, setBoltServiceResponse] = useState<boolean>(false);
  const [boltServiceCallback, setBoltServiceCallback] = useState<boolean>(false);
  
  //connection
  const [lndWallet, setLndWallet] = useState<LightningCustodianWallet>();

  //shop settings
  const {shopName, lndhub, lndhubUser} = useContext(ShopSettingsContext);

  const [open, setOpen] = useState(false);
  const [fiatCurrency, setFiatCurrency] = useState(null);
  const [lastRate, setLastRate] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState('sats');


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

      currency.init().then(() => {
        currency.getPreferredCurrency().then(preferred => {
          setFiatCurrency(preferred);
          console.log('currency.getPreferredCurrency()', preferred);
        });
        currency.mostRecentFetchedRate().then(lastFetchedRate => {
          setLastRate(lastFetchedRate);
          console.log('currency.mostRecentFetchedRate()', lastFetchedRate);
        });
      });
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
      const nfcData = tag.ndefMessage[0].payload;
      // console.log('Tag found', tag);
      // console.log('NDEF', nfcData);

      if(!nfcData || nfcData == "") {
        console.log('NDEF empty');
        Toast.show({
          type: 'error',
          text1: 'Bolt Card Response Empty',
          text2: 'The bolt card response was empty. Is the card configured?',
        });
        await NfcManager.cancelTechnologyRequest();
        setTimeout(() => {
          readNdef();
        }, 1000);
      }

      const bytesToNdef = String.fromCharCode(...nfcData);
      const boltURL = bytesToNdef.substring(1, bytesToNdef.length);
      if (isValidUrl(boltURL)) {
        console.log('Bolt URL found: ' + boltURL);
        setNdef(boltURL);
      } else {
        console.log('NDEF invalid: ' + boltURL);
        Toast.show({
          type: 'error',
          text1: 'Bolt Card Invalid',
          text2: 'This card did not provide a Bolt service URL',
        });
        await NfcManager.cancelTechnologyRequest();
        setTimeout(() => {
          readNdef();
        }, 1000);
      }
      console.log(bytesToNdef.substring(1, bytesToNdef.length));
    } catch (ex) {
      console.error('NFC Error:', ex);
    } finally {
      // stop the nfc scanning
      stopReadNdef();
    }
  }

  const isValidUrl = urlString => {
    try {
      return Boolean(new URL(urlString));
    } catch (e) {
      return false;
    }
  }

  async function stopReadNdef() {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (ex) {
      console.error('NFC stopReadNdef:', ex);
    }
  }

  const resetInvoice = () => {
    setInputAmount('');
    setIsFetchingInvoices(false);
    clearInterval(fetchInvoiceInterval.current);
    fetchInvoiceInterval.current = undefined;
    setLndInvoice(undefined);
    setBoltLoading(false);
    setBoltServiceResponse(false);
    setBoltServiceCallback(true);

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
      }, 2000);
    } else {
      setIsFetchingInvoices(false);
      clearInterval(fetchInvoiceInterval.current);
      fetchInvoiceInterval.current = undefined;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetchingInvoices]);


  /**
   * Set with a valid URL from the NFC reader.
   * Calls the bolt service and sends the invoice to the callback
   */
  useEffect(() => {
    if (ndef) {
      setBoltLoading(true);
      const url = ndef.replace('lnurlw://', 'https://');
      fetch(url)
        .then(response => {
          setBoltServiceResponse(true);
          return response.json();
        })
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
                    readNdef()
                  }, 1000);
                  setBoltLoading(false);
                } else {
                  setBoltServiceCallback(true);
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
                  readNdef();
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
              readNdef();
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
            readNdef();
          }, 1000);
          setBoltLoading(false);
        })
        .finally(() => {
          setNdef(undefined);
        });
    }
  }, [ndef]);

  const retryBoltcardPayment = () => {
    setBoltLoading(false);
    setBoltServiceCallback(false);
    setBoltServiceResponse(false);
    NfcManager.cancelTechnologyRequest().then(() => {
      setTimeout(() => {
        readNdef();
      }, 1000);
    });
  }

  const press = (input: string) => {
    console.log(inputAmount);
    if (input === 'c') {
      setInputAmount('0');
    } else {
      setInputAmount(inputAmount === '0' ? input : inputAmount + '' + input);
    }
  };

  /**
   * Update the various conversions to sats etc.
   */
  useEffect(()=> {
    if(selectedUnit == 'sats') {
      if(fiatCurrency) setFiatAmount(currency.satoshiToLocalCurrency(inputAmount));
      setSatsAmount(inputAmount);
    }
    else if(selectedUnit == 'btc') {
      setSatsAmount(currency.btcToSatoshi(inputAmount));
      if(fiatCurrency) setFiatAmount(currency.satoshiToLocalCurrency(currency.btcToSatoshi(inputAmount)));
    }
    else {
      if(fiatCurrency) setSatsAmount(currency.btcToSatoshi(currency.fiatToBTC(inputAmount)));
    }
  },[inputAmount, selectedUnit])

  const copyToClipboard = () => {
    Clipboard.setString(lndInvoice);
    Toast.show({
      type: 'success',
      text1: 'Copied to clipboard',
      text2: 'Invoice has been copied to clipboard',
    });
  }

  const currencyItems = [
    {label: 'Sats', value: 'sats'},
    {label: 'BTC', value: 'btc'}
  ];

  if(fiatCurrency) {
    currencyItems.push({label: fiatCurrency.endPointKey, value: fiatCurrency.endPointKey});
  }

  if (initialisingWallet) {
    return <ActivityIndicator />;
  }
  return (
    <View style={{...backgroundStyle, flex: 1}}>
      <View style={{...backgroundStyle, flex: 1}}>
        {!walletConfigured && (
          <ConnectToHub 
            lndhub={lndhub}
            lndhubUser={lndhubUser}
          />
        )}
        {walletConfigured && (
          <>
            <View style={{flexDirection: 'column',  margin:0, padding:0}}>
              <View style={{flexDirection: 'row',  margin:0, padding:0}}>
                <Text
                  style={{...textStyle, fontSize: 35, height:50, marginTop:10, marginLeft:5}}
                >{selectedUnit != 'sats' && selectedUnit != 'btc' && fiatCurrency?.symbol}</Text>
                <TextInput
                  style={{...textStyle, fontSize: 40, borderWidth: 1, marginTop: 10, marginLeft:5, flex:3, height:50, padding:0, paddingLeft:10, borderRadius: 8}}
                  placeholderTextColor="#999" 
                  keyboardType="numeric"
                  placeholder="0"
                  editable={false}
                  value={inputAmount}
                  onChangeText={text => setInputAmount(text)}
                />
                <DropDownPicker
                  open={open}
                  value={selectedUnit}
                  items={currencyItems}
                  setOpen={setOpen}
                  setValue={setSelectedUnit}
                  // setItems={setItems}
                  theme={isDarkMode ? "DARK" : "LIGHT"}
                  multiple={false}
                  containerStyle={{
                    margin: 10,
                    width: 100,
                  }}
                />
              </View>
              <View style={{flexDirection: 'column', zIndex: -1, marginHorizontal:10, marginTop:0, alignItems:'center' }}>
                  <>
                    <Text style={{...textStyle, fontSize: 15}}>
                    {'Rate update ' +Math.round((new Date()-lastRate.LastUpdated )/1000/60) +' min ago'}
                    </Text>
                  </>
                </View>
            </View>
            {!lndInvoice && (
              <View style={{flex:4, zIndex: -1 }}>
                
                <View style={{flex: 1, padding: 10}}>
                <View style={{marginBottom:10}}>
                  <Pressable
                    onPress={() => makeLndInvoice()}
                    disabled={invoiceLoading}>
                    <View
                      style={{
                        backgroundColor: invoiceLoading ? '#D3D3D3' : '#ff9900',
                        height: 60,
                        justifyContent: 'center',
                        borderRadius:20
                        
                      }}>
                      {invoiceLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text
                          style={{
                            fontSize: 30,
                            textAlign: 'center',
                            color: '#fff',
                          }}>
                          Invoice {satsAmount ? satsAmount.toLocaleString() : 0} sats
                        </Text>
                      )}
                    </View>
                  </Pressable>
                </View>
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
                
              </View>
            )}
            {lndInvoice &&
              (!invoiceIsPaid  ? (
                <View style={{flexDirection: 'column', alignItems: 'center'}}>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginVertical:5}}>
                    <Text style={{...textStyle, fontSize:25, margin: 0, lineHeight:30, marginRight:10}}>
                      Pay {satsAmount ? satsAmount.toLocaleString() : 0} sats.
                    </Text> 
                    {!boltLoading && 
                    <View style={{padding: 0}}>
                      <View style={{paddingVertical: 10, paddingHorizontal:30, backgroundColor: "#f00", borderRadius:20}}>
                        <Pressable
                          onPress={resetInvoice}
                        >
                          <Text style={{fontSize:20, color:"#fff"}}>Cancel</Text>
                        </Pressable>
                      </View>
                    </View>
                    }
                  </View>
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
                    <View style={{padding: 10, backgroundColor: "#999"}}>
                      <Pressable
                        onPress={readNdef}
                      >
                        <Text style={{fontSize:20, color:"#fff"}}>Enable Bolt Card NFC</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ) : (
                <View
                  style={{...textStyle, flexDirection: 'column', justifyContent: 'center', borderWidth:1, borderRadius:10, margin:10}}>
                  <View style={{flexDirection: 'row', justifyContent: 'center', paddingLeft:30}}>
                    <Icon name="checkmark-circle" color="#0f0" size={200} />
                  </View>
                  <View
                    style={{flexDirection: 'row', justifyContent: 'center'}}>
                    <Text style={{...textStyle, fontSize: 60}}>Paid!</Text>
                  </View>
                  <View style={{padding: 20}}>
                    <Pressable
                      onPress={resetInvoice}
                    >
                      <Text style={{
                        ...textStyle,
                        backgroundColor: '#ff9900',
                        height: 45,
                        lineHeight:40,
                        fontSize:30,
                        justifyContent: 'center',
                        textAlign:'center',
                      }}>Done</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            {lndInvoice &&
              (!invoiceIsPaid && boltLoading) &&
              <View style={{position: 'absolute', top:'20%', left:'10%', height:'30%', width:'80%', backgroundColor:'#000', padding:10, borderRadius:10}}>
                <Text style={{...textStyle, fontSize:20}}>Bolt Card Detected. <Icon name="checkmark" color="#0f0" size={20} /></Text>
                {boltServiceResponse && 
                  <Text style={{...textStyle, fontSize:20}}>
                    Bolt Service connected <Icon name="checkmark" color="#0f0" size={20} />
                  </Text>
                }
                {boltServiceCallback && 
                  <>
                    <Text style={{...textStyle, fontSize:20}}>
                      Bolt Service Callback success <Icon name="checkmark" color="#0f0" size={20} />
                    </Text>
                    <Text style={{...textStyle, fontSize:20}}>
                      Payment initiated...
                    </Text>
                  </>
                }
                
                <ActivityIndicator size="large" color="#ff9900" />
                <View style={{padding: 20}}>
                    <Pressable
                      onPress={retryBoltcardPayment}
                    >
                      <Text style={{
                        ...textStyle,
                        backgroundColor: '#ff9900',
                        height: 45,
                        lineHeight:40,
                        fontSize:30,
                        justifyContent: 'center',
                        textAlign:'center',
                      }}>Retry Payment</Text>
                    </Pressable>
                  </View>
              </View>
            }
          </>
        )}
      </View>
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
