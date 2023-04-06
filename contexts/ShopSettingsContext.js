import React, {useState, createContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ShopSettingsContext = createContext();

const ShopSettingsProvider = ({children}) => {
  const [shopName, setShopName] = useState('');

  useEffect(() => {
    async function getShopName() {
      try {
        const retrievedShopName = await AsyncStorage.getItem('shopName');
        if (retrievedShopName !== null) {
          setShopName(retrievedShopName);
        } else {
          setShopName('New Shop');
        }
      } catch (error) {
        console.error('Failed to get shop name from storage:', error);
        setShopName('New Shop');
      }
    }
    getShopName();
  }, []);

  useEffect(() => {
    async function saveShopName() {
      try {
        await AsyncStorage.setItem('shopName', shopName?.toString());
      } catch (error) {
        console.error('Failed to save shop name to storage:', error);
      }
    }
    saveShopName();
  }, [shopName]);

  return (
    <ShopSettingsContext.Provider value={{shopName, setShopName}}>
      {children}
    </ShopSettingsContext.Provider>
  );
};

export {ShopSettingsContext, ShopSettingsProvider};
