import React, {useState, useContext, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ShopSettingsContext} from '../contexts/ShopSettingsContext';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { LightningCustodianWallet } from '../wallets/lightning-custodian-wallet.js';

const RecentInvoices = () => {
  const {navigate} = useNavigation();
  
  const {shopName, lndhub, lndhubUser} = useContext(ShopSettingsContext);
  const [invoices, setInvoices] = useState([]);
  const [initialisingWallet, setInitialisingWallet] = useState<boolean>(true);
  const [walletConfigured, setWalletConfigured] = useState<boolean>(false);

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [lndWallet, setLndWallet] = useState<LightningCustodianWallet>();

  
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

  useEffect(()=> {
    const fetchInvoices = async () => {
        const foundInvoices = await lndWallet?.getUserInvoices(20);
        console.log('invoices', foundInvoices);
        if (invoices && Array.isArray(foundInvoices)) setInvoices(foundInvoices);
    }
    fetchInvoices();

  }, [])
  return (
    <>
      <View />
      <ScrollView style={{...styles.root, ...backgroundStyle}} keyboardShouldPersistTaps="handled">
        <Text>Recent Invocies</Text>
        {invoices && invoices.map(inv => {
          return <View>{inv.date}</View>
        })}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 20
  },
  textInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10
  },
  saveButton: {
    backgroundColor: '#f90',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#000',
    textAlign: 'center',
  },
});

export default RecentInvoices;
