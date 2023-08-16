import React, {useState, useEffect} from 'react';
import {View, Modal, StyleSheet} from 'react-native';
import {Text, Button, Icon} from 'react-native-elements';

import CircleBorder from './CircleBorder';
import PinCodeButton from './PinCodeButton';
import Toast from 'react-native-toast-message';

const PinCodeModal = (props: any) => {
  const {pinCode, setPinCode} = props;

  const pinPress = val => {
    if (val == 'X') {
      setPinCode(prevPin => {
        return prevPin.slice(0, -1);
      });
    } else {
      setPinCode(prevPin => {
        return '' + prevPin + val;
      });
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={props.showModal}
      onRequestClose={() => {
        setPinCode('');
      }}>
      <View
        style={{justifyContent: 'center', flex: 1, backgroundColor: '#FF9900'}}>
        {props.topText}
        <Text
          style={{
            textAlign: 'center',
            fontSize: 30,
            marginBottom: 30,
            fontWeight: 700,
            color: '#333',
          }}>
          {props.title ? props.title : 'Enter PIN'}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 30,
            height: 20,
          }}>
          {pinCode.split('').map((num, index) => (
            <CircleBorder
              fill={true}
              containerStyle={{marginRight: 10}}
              key={index}
            />
          ))}
        </View>
        <View style={{flexDirection: 'row', marginBottom: 10}}>
          <PinCodeButton number="1" onPress={() => pinPress('1')} />
          <PinCodeButton number="2" onPress={() => pinPress('2')} />
          <PinCodeButton number="3" onPress={() => pinPress('3')} />
        </View>
        <View style={{flexDirection: 'row', marginBottom: 10}}>
          <PinCodeButton number="4" onPress={() => pinPress('4')} />
          <PinCodeButton number="5" onPress={() => pinPress('5')} />
          <PinCodeButton number="6" onPress={() => pinPress('6')} />
        </View>
        <View style={{flexDirection: 'row', marginBottom: 10}}>
          <PinCodeButton number="7" onPress={() => pinPress('7')} />
          <PinCodeButton number="8" onPress={() => pinPress('8')} />
          <PinCodeButton number="9" onPress={() => pinPress('9')} />
        </View>
        <View style={{flexDirection: 'row', marginBottom: 10}}>
          <PinCodeButton
            number={<Icon name="check" size={35} />}
            onPress={() => {
              props.onEnter();
            }}
          />
          <PinCodeButton number="0" onPress={() => pinPress('0')} />
          <PinCodeButton
            number={<Icon name="backspace" size={35} />}
            onPress={() => pinPress('X')}
          />
        </View>
        <View
          style={{
            marginTop: 15,
            justifyContent: 'center',
            paddingHorizontal: 20,
          }}>
          <Button
            title="Cancel"
            onPress={() => {
              setPinCode('');
              props.onCancel();
            }}
            buttonStyle={{backgroundColor: 'tomato'}}
            titleStyle={{fontSize: 20}}></Button>
        </View>
      </View>
      <Toast />
    </Modal>
  );
};

const styles = StyleSheet.create({});

export default PinCodeModal;
