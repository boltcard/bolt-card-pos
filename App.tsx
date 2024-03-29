/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import 'react-native-gesture-handler';
import './shim.js';

import React from 'react';
import {StatusBar, StyleSheet, useColorScheme, View} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {NavigationContainer} from '@react-navigation/native';
import {navigationRef} from './NavigationService';
import Navigation from './Navigation';
import {ShopSettingsProvider} from './contexts/ShopSettingsContext';

import Toast, { SuccessToast, ErrorToast } from 'react-native-toast-message';
const currency = require('./helper/currency');


const toastConfig = {
  /*
    Overwrite 'success' type,
    by modifying the existing `BaseToast` component
  */
  success: props => (
    <SuccessToast
      {...props}
      contentContainerStyle={{paddingHorizontal: 15}}
      text2NumberOfLines={5}
      text1Style={{
        fontSize: 15,
        fontWeight: '400',
      }} />
  ),
  /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
  error: props => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 17,
      }}
      text2Style={{
        fontSize: 15,
      }}
      text2NumberOfLines={5}
      style={{
        paddingVertical:20,
        height:100,
        borderLeftColor: 'red'
      }}
    />
  ),
};

function App(): JSX.Element {
  
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <>
      <ShopSettingsProvider>
        <SafeAreaProvider>
          <View style={styles.root}>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              backgroundColor={backgroundStyle.backgroundColor}
            />
            <NavigationContainer ref={navigationRef}>
              <Navigation />
            </NavigationContainer>
          </View>
        </SafeAreaProvider>
      </ShopSettingsProvider>
      
      <Toast config={toastConfig} />
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
