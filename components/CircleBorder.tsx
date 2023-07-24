import { View } from 'react-native';

export default function CircleBorder(props): JSX.Element {
    const borderColor = props.borderColor ? props.borderColor : '#333';
    const size = props.size ? props.size : 20;
    return  (
        <View style={props.containerStyle}>
            <View 
                style={{
                    borderWidth: 1, 
                    borderColor: borderColor, 
                    backgroundColor: props.fill ? borderColor : 'transparent',
                    width: size,
                    height: size,
                    borderRadius: 60 / 2
                }} >
            </View>
        </View>
    );
}