import React from 'react';
import {ListItem, Avatar} from 'react-native-elements';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
  I18nManager,
  useColorScheme,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

// const { height, width } = Dimensions.get('window');
// const aspectRatio = height / width;
// let isIpad;
// if (aspectRatio > 1.6) {
//   isIpad = false;
// } else {
//   isIpad = true;
// }

export const SimpleListItem = React.memo(props => {
  const {colors} = useTheme();
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const textStyle = {
    color: isDarkMode ? '#fff' : '#000',
    borderColor: isDarkMode ? '#fff' : '#000',
  };
  return (
    <ListItem
      containerStyle={props.containerStyle ?? {backgroundColor: 'transparent'}}
      Component={props.Component ?? TouchableOpacity}
      bottomDivider={
        props.bottomDivider !== undefined ? props.bottomDivider : true
      }
      topDivider={props.topDivider !== undefined ? props.topDivider : false}
      testID={props.testID}
      onPress={props.onPress}
      onLongPress={props.onLongPress}
      disabled={props.disabled}
      accessible={props.switch === undefined}>
      {props.leftAvatar && <Avatar>{props.leftAvatar}</Avatar>}
      {props.leftIcon && <Avatar icon={props.leftIcon} />}
      <ListItem.Content>
        <ListItem.Title
          style={{
            color: props.disabled
              ? colors.buttonDisabledTextColor
              : isDarkMode ? '#fff' : '#000',
            fontSize: 16,
            fontWeight: '500',
            writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
          }}
          numberOfLines={0}
          accessible={props.switch === undefined}>
          {props.title}
        </ListItem.Title>
        {props.subtitle && (
          <ListItem.Subtitle
            numberOfLines={props.subtitleNumberOfLines ?? 1}
            accessible={props.switch === undefined}
            style={{
              flexWrap: 'wrap',
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
              color: colors.alternativeTextColor,
              fontWeight: '400',
              fontSize: 14,
            }}>
            {props.subtitle}
          </ListItem.Subtitle>
        )}
      </ListItem.Content>
      {props.rightTitle && (
        <ListItem.Content right>
          <ListItem.Title style={props.rightTitleStyle} numberOfLines={0} right>
            {props.rightTitle}
          </ListItem.Title>
        </ListItem.Content>
      )}
      {props.isLoading ? (
        <ActivityIndicator />
      ) : (
        <>
          {props.chevron && (
            <ListItem.Chevron
              iconStyle={{transform: [{scaleX: I18nManager.isRTL ? -1 : 1}]}}
            />
          )}
          {props.rightIcon && <Avatar icon={props.rightIcon} />}
          {props.switch && (
            <Switch
              {...props.switch}
              accessibilityLabel={props.title}
              accessible
              accessibilityRole="switch"
            />
          )}
          {props.checkmark && (
            <ListItem.CheckBox
              iconType="octaicon"
              checkedColor="#0070FF"
              checkedIcon="check"
              checked
            />
          )}
        </>
      )}
    </ListItem>
  );
});
