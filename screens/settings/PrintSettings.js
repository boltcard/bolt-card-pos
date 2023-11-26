import React, {useState, useContext} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Alert,
  NativeModules,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ShopSettingsContext} from '../../contexts/ShopSettingsContext';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {SimpleListItem} from '../../SimpleComponents';
import DropDownPicker from 'react-native-dropdown-picker';

const PrintSettings = () => {
  const {navigate} = useNavigation();
  const {printer, setPrinter} = useContext(ShopSettingsContext);
  const [newPrinter, setNewPrinter] = useState(printer);
  const [open, setOpen] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  //   const handleShopNameChange = newName => {
  //     setNewShopName(newName);
  //   };

  const handleSave = () => {
    setPrinter(newPrinter);
    navigate('Settings', {printer: newPrinter});
  };

  const printers = [
    {label: 'Bitcoinize', value: 'bitcoinize'},
    {label: 'Ciontek', value: 'ciontek'},
  ];

  return (
    <>
      <View
        style={{...styles.root, ...backgroundStyle}}
        keyboardShouldPersistTaps="handled">
        <Text>Print Settings</Text>

        <SimpleListItem
          title="Bitcoinize Test Print"
          onPress={() => {
            Alert.alert('Test Print', 'Are you sure?', [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {
                text: 'OK',
                onPress: () => {
                  NativeModules.PrintModule.testPrint(() => {
                    //callback
                    console.log('testPrint');
                  });
                },
              },
            ]);
          }}
          chevron
        />
        <SimpleListItem
          title="CionTek Test Print"
          onPress={() => {
            Alert.alert('CionTek Test', 'Are you sure?', [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {
                text: 'OK',
                onPress: () => {
                  NativeModules.PrintModule.testPrintCiontek();
                },
              },
            ]);
          }}
          chevron
        />
        <View style={{marginBottom: 100}}>
          <DropDownPicker
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 15,
            }}
            theme="LIGHT"
            value={newPrinter}
            items={printers}
            open={open}
            setOpen={setOpen}
            setValue={setNewPrinter}
            placeholder="Select Printer"
          />
        </View>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={{...styles.saveButtonText, zIndex: 0}}>Save</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 20,
  },
  textInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    zIndex: 10,
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

export default PrintSettings;
