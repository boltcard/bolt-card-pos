import React from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView
} from 'react-native';
import { navigate } from '../NavigationService';
import { SimpleListItem } from '../SimpleComponents';

const Settings = (props) => {
    
    return (
      <>
        <View />
        <ScrollView style={styles.root}>
          <SimpleListItem title="LNBIT" onPress={() => console.log("TODO: navigate to QR code scan screen")} chevron />
        </ScrollView>
      </>
    );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  }
});


export default Settings;