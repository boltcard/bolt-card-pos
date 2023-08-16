import React, {useState, useEffect} from 'react';
import PinCodeModal from '../../components/PinCodeModal';
import {Modal, StyleSheet, View, BackHandler, Alert} from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PinSetScreen = (props: any) => {
  const [pinCode, setPinCode] = useState('');
  const [confirmPinCode, setConfirmPinCode] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showConfirmPinModal, setShowConfirmPinModal] = useState(false);

  const {showBaseModal} = props;

  useEffect(() => {
    if(showBaseModal) {
      reset();
    } else {
      closeModal();
    }
  }, [showBaseModal])

  const closeModal = () => {
    setPinCode('');
    setConfirmPinCode('');
    setShowPinModal(false);
    setShowConfirmPinModal(false);
    props.onClose();
  };

  const savePin = async () => {
    let toastMessage = null;
    try {
      await AsyncStorage.setItem('manager-pin', pinCode);
      console.log(await AsyncStorage.getItem('manager-pin'));
      toastMessage = {
        type: 'success',
        text1: 'PIN saved',
      };
      if(props.successMessage) {
        toastMessage.text2 = props.successMessage;
      }
      props.successCallback();
    } catch (err) {
      toastMessage = {
        type: 'error',
        text1: 'Error saving PIN',
        text2: err.message,
      };
      props.failCallback();
    } finally {
      closeModal();
      if(toastMessage) {
        Toast.show(toastMessage);
      }
    }
  };

  const reset = () => {
    setPinCode('');
    setConfirmPinCode('');
    setShowConfirmPinModal(false);
    setShowPinModal(true);
  };

  return (
    <Modal
      visible={showBaseModal}
      transparent={false}
    >
      <View style={{backgroundColor: '#FF9900', flex: 1}}>
        <PinCodeModal
          showModal={showPinModal}
          onCancel={closeModal}
          onEnter={() => {
            if(pinCode.length < 4 || pinCode.length > 8) {
              Toast.show({
                type: 'error',
                text1: 'PIN error',
                text2: 'PIN has to be between 4 to 8 numbers'
              });
              reset();
            } else {
              setShowPinModal(false);
              setShowConfirmPinModal(true);
            }
          }}
          pinCode={pinCode}
          setPinCode={setPinCode}
          title={props.title}
        />
        <PinCodeModal
          showModal={showConfirmPinModal}
          onCancel={closeModal}
          onEnter={() => {
            if (confirmPinCode === pinCode) {
              //save the PIN
              savePin();
            } else {
              reset();
              setTimeout(() => {
                Toast.show({
                  type: 'error',
                  text1: 'Incorrect PIN',
                  text2: 'Please try again',
                });
              }, 500);
            }
          }}
          pinCode={confirmPinCode}
          setPinCode={setConfirmPinCode}
          title="Enter PIN again"
        />
      </View>

    </Modal>
  );
};

const styles = StyleSheet.create({
  
})

export default PinSetScreen;