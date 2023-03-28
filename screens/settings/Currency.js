import React from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SimpleListItem } from '../../SimpleComponents';

const Settings = (props) => {

  const { navigate } = useNavigation();

  return (
    <>
      <View />
      <ScrollView style={styles.root}>
        <Text>CURRENCY</Text>
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