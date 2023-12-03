import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {createContext, useEffect, useState} from 'react';
import {FiatUnit} from '../models/fiatUnit';

import {LightningCustodianWallet} from '../wallets/lightning-custodian-wallet.js';

import currency from '../helper/currency';

const ShopSettingsContext = createContext();

const ShopSettingsProvider = ({children}) => {
  const [shopName, setShopName] = useState('');
  const [printer, setPrinter] = useState('');
  const [lndhubUser, setLndhubUser] = useState('');
  const [lndhub, setLndhub] = useState('');
  const [shopWallet, setShopWallet] = useState('');
  const [preferredFiatCurrency, _setPreferredFiatCurrency] = useState(
    FiatUnit.USD,
  );
  const [defaultUnit, setDefaultUnit] = useState('sats');

  const getPreferredCurrency = async () => {
    const item = await currency.getPreferredCurrency();
    _setPreferredFiatCurrency(item);
  };

  const setPreferredFiatCurrency = () => {
    getPreferredCurrency();
  };

  useEffect(() => {
    async function getShopName() {
      try {
        const retrievedShopSettings = await AsyncStorage.getItem(
          'shopSettings',
        );
        console.log('loading settings...');
        if (retrievedShopSettings !== null) {
          const settings = JSON.parse(retrievedShopSettings);
          console.log('found settings...', retrievedShopSettings);

          setShopName(settings.shopName ? settings.shopName : 'New Shop');
          setLndhubUser(settings.lndhubUser ? settings.lndhubUser : 'blank');
          setLndhub(settings.lndhub ? settings.lndhub : 'blank');
          setPrinter(settings.printer ? settings.printer : 'bitcoinize');
          setDefaultUnit(settings.defaultUnit ? settings.defaultUnit : 'sats');
          console.log('loaded settings...', settings);
        } else {
          console.log('using default settings...');

          setShopName('New Shop');
          setLndhubUser('blank');
          setLndhub('blank');
          setPrinter('bitcoinize');
          setDefaultUnit('sats');
        }
      } catch (error) {
        console.error('Failed to get shop name from storage:', error);
        setShopName('New Shop');
      }
    }
    getShopName();
  }, []);

  useEffect(() => {
    async function saveShopSettings() {
      try {
        await AsyncStorage.setItem(
          'shopSettings',
          JSON.stringify({
            shopName: shopName?.toString(),
            lndhubUser: lndhubUser?.toString(),
            lndhub: lndhub?.toString(),
            printer: printer?.toString(),
            defaultUnit: defaultUnit?.toString(),
          }),
        );
        currency.getPreferredCurrency().then(async preferred => {
          if(!preferred) {
            await currency.setPrefferedCurrency(FiatUnit.USD);
          }
          _setPreferredFiatCurrency(preferred);
        });
        console.log('Saved shop settings');
      } catch (error) {
        console.error('Failed to save shop name to storage:', error);
      }
    }
    saveShopSettings();
  }, [shopName, lndhub, lndhubUser, printer, defaultUnit]);

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
      setShopWallet(wallet);

      console.log(wallet);
      console.log('wallet.getID()', wallet.getID());
      // setInitialisingWallet(false);
    }
    if (lndhub == 'blank' || lndhubUser == 'blank') {
      // setInitialisingWallet(false);
      // setWalletConfigured(false);
    } else if (lndhub && lndhubUser) {
      // setWalletConfigured(true);

      console.log('init with lndhub, lndhubUser', lndhub, lndhubUser);
      initWallet();
    }
  }, [lndhub, lndhubUser]);

  console.log('Context updated: ', shopName, lndhub, lndhubUser);
  return (
    <ShopSettingsContext.Provider
      value={{
        shopName,
        setShopName,
        lndhubUser,
        setLndhubUser,
        lndhub,
        setLndhub,
        setPreferredFiatCurrency,
        shopWallet,
        setShopWallet,
        printer,
        setPrinter,
        defaultUnit,
        setDefaultUnit
      }}>
      {children}
    </ShopSettingsContext.Provider>
  );
};

export {ShopSettingsContext, ShopSettingsProvider};
