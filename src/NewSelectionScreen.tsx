import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAuth} from './Auth';
import {
  Button,
  DateSelector,
  Loading,
  Text,
  TextInputClear,
  WhiteButton,
} from './components/Button';
import Icon2 from 'react-native-vector-icons/Feather';
import COLOURS from '../constants/colours';
import WeekSelector from './components/WeekSelector';
import {useUser} from './User';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
const {height} = Dimensions.get('window');

interface CustomMarkerProps {
  currentValue: number;
  dark: boolean;
}

const getHour = (hour: number) => {
  const clockHour = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? 'am' : 'pm';
  return `${clockHour}${ampm}`;
};

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

const NewSelectionScreen = ({navigation}) => {
  const auth = useAuth();
  const user = useUser();
  const styles = auth.styles;
  const textInputRef = useRef<typeof TextInputClear>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const showAlert = () => {
    Alert.alert(
      'Continue without saving?',
      'All changes will be lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Save',
          onPress: () => {
            save();
          },
        },
        {
          text: 'Discard',
          onPress: () => {
            back();
          },
          style: 'destructive',
        },
      ],
      {cancelable: false},
    );
  };

  const decideSize = (length: number) => {
    if (length > 15) {
      return 22;
    } else if (length > 10) {
      return 25;
    } else {
      return 30;
    }
  };

  const [title, setTitle] = useState('New Selection');
  const [titleSize, setTitleSize] = useState(decideSize(title.length));

  const handleChangeTitle = (text: string) => {
    setTitleSize(decideSize(text.length));
    if (text.length > 13) {
      const count = (text.match(/[wWmMOU]/gi) || []).length;
      if (count > 13) {
        setTitleSize(18);
      }
    }
    user.setSelectionTitle(text);
    setTitle(text);
  };

  const save = async () => {
    if (user.selectionTitle === '') {
      Alert.alert('Name your selection.');
      textInputRef.current && textInputRef.current.focus();
      return;
    }
    setLoading(true);
    user
      .saveSelection(auth.authData!.id, auth.authData!.name)
      .then(() => {
        if (user.fromGroup.current) {
          user.fromGroup.current = false;
          navigation.goBack();
          navigation.navigate('Groups');
        } else {
          navigation.goBack();
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const back = () => {
    if (step === 1) {
      navigation.goBack();
    } else {
      user.cancelSelection();
      setStep(1);
    }
  };

  if (step === 1) {
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
              user.setStartHour(24 - values[1]);
              user.setEndHour(24 - values[0]);
            }}
            vertical={true}
            values={[user.startHour, user.endHour]}
            min={0}
            max={24}
            sliderLength={270}
            minMarkerOverlapDistance={1}
            isMarkersSeparated={true}
            selectedStyle={{backgroundColor: COLOURS.teal}}
            trackStyle={{
              backgroundColor: auth.dark ? COLOURS.white : COLOURS.black,
              width: 0.5,
            }}
            customMarkerLeft={e => {
              return (
                <CustomSliderMarkerLeft
                  currentValue={24 - e.currentValue}
                  dark={auth.dark}
                />
              );
            }}
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
              user.reset();
              setStep(2);
            }}
            containerStyle={{marginTop: '50%'}}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {}]}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity
          onPress={() => {
            showAlert();
          }}>
          <Icon2
            name="chevron-left"
            size={25}
            color={auth.dark ? COLOURS.white : COLOURS.black}
            style={{padding: '8%'}}
          />
        </TouchableOpacity>
        <TextInputClear
          ref={textInputRef}
          dark={auth.dark}
          size={titleSize}
          font={'P'}
          style={{padding: '5%'}}
          onChangeText={handleChangeTitle}
          autoCorrect={false}
          maxLength={18}>
          {title}
        </TextInputClear>
      </View>
      <View
        style={{
          width: '100%',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '5%',
          paddingBottom: 60,
        }}>
        <DateSelector dark={auth.dark} setDate={user.setDate} />
        <WeekSelector
          START_HOUR={user.startHour}
          END_HOUR={user.endHour}
          availibility={[]}
          containerStyle={{paddingTop: '10%'}}
          containerHeight={height * height * 0.00055}
          dark={auth.dark}
          resetKey={user.resetKey}
        />
      </View>
      <View
        style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}>
        <Text darkbg={auth.dark} size={16} font={'G'}>
          Hold down a square to drag select multiple.
        </Text>
      </View>
      {loading ? (
        <Loading
          size={22}
          containerStyle={{
            position: 'absolute',
            bottom: '4%',
            justifyContent: 'center',
            width: '100%',
          }}
        />
      ) : (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '80%',
            marginLeft: '5%',
            position: 'absolute',
            bottom: '2%',
          }}>
          <WhiteButton
            title={'Reset page'}
            half
            dark={auth.dark}
            containerStyle={{marginRight: 0}}
            onPress={() => user.reset()}
          />
          <Button title={'Save'} half onPress={save} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default NewSelectionScreen;
