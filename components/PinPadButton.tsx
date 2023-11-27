import {Pressable, Text} from 'react-native';

export default function App(props): JSX.Element {
  return (
    <Pressable
      style={{flex: 1, margin: 1}}
      onPress={() => {
        props.onPress();
      }}>
      <Text
        style={{
          height: '100%',
          backgroundColor: '#FF9900',
          fontSize: 30,
          verticalAlign: 'middle',
          textAlign: 'center',
          padding: 10,
          borderWidth: 1,
          fontWeight: 'bold',
          borderRadius: 20,
          borderColor: 'transparent',
          color: '#000',
        }}>
        {props.number}
      </Text>
    </Pressable>
  );
}
