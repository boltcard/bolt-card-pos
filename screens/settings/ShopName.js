import React, {useState, useContext} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ShopSettingsContext} from '../../contexts/ShopSettingsContext';

const ShopName = () => {
  const {navigate} = useNavigation();
  const {shopName, setShopName} = useContext(ShopSettingsContext);
  const [newShopName, setNewShopName] = useState(shopName);

  const handleShopNameChange = newName => {
    setNewShopName(newName);
  };

  const handleSave = () => {
    setShopName(newShopName);
    navigate('Settings', {shopName: newShopName});
  };

  return (
    <>
      <View />
      <ScrollView style={styles.root} keyboardShouldPersistTaps="handled">
        <Text>Shop Name</Text>
        <TextInput
          style={styles.textInput}
          value={newShopName}
          onChangeText={handleShopNameChange}
          placeholder="Enter shop name"
        />
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
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
    backgroundColor: 'blue',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default ShopName;
