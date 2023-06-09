import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';
import { FiatUnit } from '../models/fiatUnit';

const ShopSettingsContext = createContext();

const ShopSettingsProvider = ({children}) => {
  const [shopName, setShopName] = useState('');
  const [lndhubUser, setLndhubUser] = useState('');
  const [lndhub, setLndhub] = useState('');
  const [preferredFiatCurrency, _setPreferredFiatCurrency] = useState(FiatUnit.USD);
  
  const getPreferredCurrency = async () => {
    const item = await getPreferredCurrencyAsyncStorage();
    _setPreferredFiatCurrency(item);
  };

  const setPreferredFiatCurrency = () => {
    getPreferredCurrency();
  };


  useEffect(() => {
    async function getShopName() {
      try {
        const retrievedShopSettings = await AsyncStorage.getItem('shopSettings');
        console.log('loading settings...');
        if (retrievedShopSettings !== null) {
          const settings = JSON.parse(retrievedShopSettings);
          console.log('found settings...', retrievedShopSettings);

          setShopName(settings.shopName ? settings.shopName : 'New Shop');
          setLndhubUser(settings.lndhubUser ? settings.lndhubUser : 'blank');
          setLndhub(settings.lndhub ? settings.lndhub : 'blank');
          console.log('loaded settings...', settings);
        }
        else {
          console.log('using default settings...');

          setShopName('New Shop');
          setLndhubUser('blank');
          setLndhub('blank');
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
        await AsyncStorage.setItem('shopSettings', JSON.stringify({
          shopName: shopName?.toString(),
          lndhubUser: lndhubUser?.toString(),
          lndhub: lndhub?.toString(),
        }));
        console.log('Saved shop settings');
      } catch (error) {
        console.error('Failed to save shop name to storage:', error);
      }
    }
    saveShopSettings();
  }, [shopName, lndhub, lndhubUser]);
  console.log('Context updated: ', shopName, lndhub, lndhubUser);
  return (
    <ShopSettingsContext.Provider value={{
      shopName, setShopName,
      lndhubUser, setLndhubUser,
      lndhub, setLndhub,
      setPreferredFiatCurrency
    }}>
      {children}
    </ShopSettingsContext.Provider>
  );
};

export { ShopSettingsContext, ShopSettingsProvider };

