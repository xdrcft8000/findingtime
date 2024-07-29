/* eslint-disable react-native/no-inline-styles */
import {View, TouchableOpacity} from 'react-native';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button, Text} from './Button';
import {useUser} from '../context/User';
import COLOURS from '../../constants/colours';
import {useAuth} from '../context/Auth';
import Icon2 from 'react-native-vector-icons/Feather';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

const getHour = (hour: number) => {
  const clockHour = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? 'am' : 'pm';
  return `${clockHour}${ampm}`;
};

interface CustomMarkerProps {
  currentValue: number;
  dark: boolean;
}

const CustomSliderMarkerLeft: React.FC<CustomMarkerProps> = ({
  currentValue,
  dark,
}) => {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 1.5,
        transform: [{rotate: '90deg'}],
      }}>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: 'white', // You can change the color as per your requirement
        }}
      />
      <Text
        darkbg={dark}
        size={16}
        font={'P'}
        style={{position: 'absolute', left: 30}}>
        {getHour(currentValue)}
      </Text>
    </View>
  );
};

const CustomSliderMarkerRight: React.FC<CustomMarkerProps> = ({
  currentValue,
  dark,
}) => {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 1.5,
        transform: [{rotate: '90deg'}],
      }}>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: 'white', // You can change the color as per your requirement
        }}
      />
      <Text
        darkbg={dark}
        size={16}
        font={'P'}
        style={{position: 'absolute', right: 30}}>
        {getHour(currentValue)}
      </Text>
    </View>
  );
};

interface AvailabilitySliderProps {
  saveWindow: () => void;
  back: () => void;
  newStartHour?: number;
  setNewStartHour?: (hour: number) => void;
  newEndHour?: number;
  setNewEndHour?: (hour: number) => void;
}

const AvailabilitySlider = ({
  saveWindow,
  back,
  newStartHour,
  setNewStartHour,
  newEndHour,
  setNewEndHour,
}: AvailabilitySliderProps) => {
  const user = useUser();
  const auth = useAuth();
  const styles = auth.styles;
  return (
    <SafeAreaView style={[styles.container, {}]}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity
          onPress={() => {
            back();
          }}>
          <Icon2
            name="chevron-left"
            size={25}
            color={auth.dark ? COLOURS.white : COLOURS.black}
            style={{padding: '8%'}}
          />
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.container,
          {
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}>
        <Text
          darkbg={auth.dark}
          size={22}
          font={'G'}
          style={{paddingBottom: '40%', width: '80%', textAlign: 'center'}}>
          Between what times might you have some availability?
        </Text>
        <MultiSlider
          onValuesChange={values => {
            setNewStartHour
              ? setNewStartHour(24 - values[1])
              : user.setStartHour(24 - values[1]);
            setNewEndHour
              ? setNewEndHour(24 - values[0])
              : user.setEndHour(24 - values[0]);
          }}
          vertical={true}
          values={
            newStartHour && newEndHour
              ? [24 - newEndHour, 24 - newStartHour]
              : [24 - user.endHour, 24 - user.startHour]
          }
          min={0}
          max={24}
          sliderLength={270}
          minMarkerOverlapDistance={-1}
          isMarkersSeparated={true}
          selectedStyle={{backgroundColor: COLOURS.teal}}
          trackStyle={{
            backgroundColor: auth.dark ? COLOURS.white : COLOURS.black,
            width: 0.5,
          }}
          // eslint-disable-next-line react/no-unstable-nested-components
          customMarkerLeft={e => {
            return (
              <CustomSliderMarkerLeft
                currentValue={24 - e.currentValue}
                dark={auth.dark}
              />
            );
          }}
          // eslint-disable-next-line react/no-unstable-nested-components
          customMarkerRight={e => {
            return (
              <CustomSliderMarkerRight
                currentValue={24 - e.currentValue}
                dark={auth.dark}
              />
            );
          }}
        />
        <Button
          title={'Next'}
          onPress={() => {
            saveWindow();
          }}
          containerStyle={{marginTop: '50%'}}
        />
      </View>
    </SafeAreaView>
  );
};

export default AvailabilitySlider;
