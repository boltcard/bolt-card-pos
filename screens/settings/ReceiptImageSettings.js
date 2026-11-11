import React, {useState, useContext, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {ShopSettingsContext} from '../../contexts/ShopSettingsContext';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {SimpleListItem} from '../../SimpleComponents';
import {
  downloadReceiptLogo,
  getReceiptLogo,
  isLogoUrl,
  MAX_LOGO_BYTES,
} from '../../helper/receiptLogo';

/**
 * Chooses the image printed on receipts: the payment QR code or the shop's
 * own logo loaded from a web address, and whether it goes above or below the
 * receipt text.
 */
const ReceiptImageSettings = () => {
  const {goBack} = useNavigation();
  const {
    receiptImage,
    setReceiptImage,
    receiptImagePosition,
    setReceiptImagePosition,
    receiptLogoUrl,
    setReceiptLogoUrl,
  } = useContext(ShopSettingsContext);

  const [newImage, setNewImage] = useState(receiptImage);
  const [newPosition, setNewPosition] = useState(receiptImagePosition);
  const [newLogoUrl, setNewLogoUrl] = useState(receiptLogoUrl);
  const [savedLogo, setSavedLogo] = useState(null);
  const [saving, setSaving] = useState(false);

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const textStyle = {
    color: isDarkMode ? '#fff' : '#000',
  };

  useEffect(() => {
    // the logo currently saved on the device, shown as a preview
    getReceiptLogo(receiptLogoUrl).then(setSavedLogo);
  }, [receiptLogoUrl]);

  const handleSave = async () => {
    const logoUrl = newLogoUrl.trim();

    if (newImage === 'logo') {
      if (!isLogoUrl(logoUrl)) {
        Alert.alert(
          'Logo address',
          'Enter the web address of your logo image. It must start with https://',
        );
        return;
      }
      setSaving(true);
      try {
        await downloadReceiptLogo(logoUrl);
      } catch (error) {
        Alert.alert('Logo not saved', error.message);
        return;
      } finally {
        setSaving(false);
      }
    }

    setReceiptImage(newImage);
    setReceiptImagePosition(newPosition);
    setReceiptLogoUrl(logoUrl);
    Toast.show({type: 'success', text1: 'Receipt image saved'});
    goBack();
  };

  const showPreview =
    newImage === 'logo' && savedLogo && newLogoUrl.trim() === receiptLogoUrl;

  return (
    <>
      <View />
      <ScrollView
        style={{...styles.root, ...backgroundStyle}}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={{...styles.heading, ...textStyle}}>
          Image on the receipt
        </Text>
        <SimpleListItem
          title="Payment QR code"
          checkmark={newImage === 'qr'}
          onPress={() => setNewImage('qr')}
          disabled={saving}
        />
        <SimpleListItem
          title="My own logo"
          checkmark={newImage === 'logo'}
          onPress={() => setNewImage('logo')}
          disabled={saving}
        />

        {newImage === 'logo' && (
          <>
            <TextInput
              style={{...styles.textInput, ...textStyle}}
              value={newLogoUrl}
              onChangeText={setNewLogoUrl}
              placeholder="https://example.com/logo.png"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              editable={!saving}
            />
            <Text style={{...styles.hint, ...textStyle}}>
              Web address of a PNG or JPEG file, {MAX_LOGO_BYTES / 1024} KB at
              most. A black and white image up to 384 pixels wide prints best.
              The logo is downloaded when you save and again each time the app
              starts, so you can change the file on your server later.
            </Text>
            {showPreview ? (
              <Image
                style={styles.preview}
                resizeMode="contain"
                source={{uri: 'data:image/png;base64,' + savedLogo}}
              />
            ) : null}
          </>
        )}

        <Text style={{...styles.heading, ...textStyle}}>Image position</Text>
        <SimpleListItem
          title="Below the text"
          checkmark={newPosition === 'bottom'}
          onPress={() => setNewPosition('bottom')}
          disabled={saving}
        />
        <SimpleListItem
          title="Above the text"
          checkmark={newPosition === 'top'}
          onPress={() => setNewPosition('top')}
          disabled={saving}
        />

        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  textInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  hint: {
    fontSize: 13,
    opacity: 0.7,
  },
  preview: {
    height: 120,
    marginTop: 10,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#f90',
    padding: 10,
    marginVertical: 20,
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#000',
    textAlign: 'center',
  },
});

export default ReceiptImageSettings;
