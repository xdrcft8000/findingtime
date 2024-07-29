/* eslint-disable react-native/no-inline-styles */
import {ViewStyle, TouchableOpacity, TouchableOpacityProps} from 'react-native';
import React from 'react';
import COLOURS from '../../constants/colours';
import {Text} from './Button';
import {useUser} from '../context/User';
import {getCurrentOffsetFromGMT} from '../HelperFunctions';
import TimezoneModal from './TimezoneModal';

type TimezoneButtonProps = {
  setTz: (item: string) => void;
  tz: string;
  containerStyle?: ViewStyle;
  dark?: boolean;
  resetText?: string;
  resetTz?: string;
} & TouchableOpacityProps;

const TimezoneButton: React.FC<TimezoneButtonProps> = ({
  setTz,
  tz,
  dark = false,
  containerStyle,
  resetText,
  resetTz,
}) => {
  const [visible, setVisible] = React.useState(false);
  const toggleOverlay = () => {
    setVisible(!visible);
  };
  const user = useUser();

  return (
    <>
      <TouchableOpacity style={[{}, containerStyle]} onPress={toggleOverlay}>
        <Text
          darkbg={false}
          size={14}
          font={'G'}
          style={{
            backgroundColor:
              tz === user.defaultTimezone ? COLOURS.teal : COLOURS.salmon,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 14,
            overflow: 'hidden',
          }}>
          {getCurrentOffsetFromGMT(tz)}
        </Text>
      </TouchableOpacity>
      <TimezoneModal
        setTz={setTz}
        dark={dark}
        visible={visible}
        setVisible={setVisible}
        resetText={resetText ? resetText : 'Reset'}
        resetTz={resetTz ? resetTz : user.defaultTimezone}
      />
    </>
  );
};

export default TimezoneButton;
