/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import 'react-native-gesture-handler';
import './shim.js';

import React, { PropsWithChildren } from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet, TouchableOpacity, useColorScheme, View, Text
} from 'react-native';
import {
  Colors
} from 'react-native/Libraries/NewAppScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { navigationRef } from './NavigationService';
import Navigation from './Navigation';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function App(): JSX.Element {

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <>
      <SafeAreaProvider>
        <View style={styles.root}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          />
          <NavigationContainer ref={navigationRef} >
            <Navigation />
          </NavigationContainer>

        </View>
      </SafeAreaProvider>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
