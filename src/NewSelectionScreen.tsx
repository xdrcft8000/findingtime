import React, {useRef, useState} from 'react';
import {Alert, Dimensions, TouchableOpacity, View} from 'react-native';
import {useAuth} from './context/Auth';
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
import {useUser} from './context/User';
const {height} = Dimensions.get('window');
import {
  SafeAreaView,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import TimezoneButton from './components/TimezoneButton';
import AvailabilitySlider from './components/AvailabilitySliderScreen';

const NewSelectionScreen = ({navigation}: any) => {
  const auth = useAuth();
  const user = useUser();
  const styles = auth.styles;
  const textInputRef = useRef<typeof TextInputClear>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timezone, setTimezone] = useState(user.defaultTimezone);
  const [title, setTitle] = useState('New Selection');

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

  const decideSize2 = (text: string) => {
    const count = (text.match(/[wWmMOU]/gi) || []).length;
    const len = text.length + count;

    if (len > 31) {
      return 12;
    } else if (len > 29) {
      return 14;
    } else if (len > 25) {
      return 16;
    } else if (len > 21) {
      return 18;
    } else if (len > 19) {
      return 20;
    } else if (len > 17) {
      return 22;
    } else if (len > 15) {
      return 25;
    } else {
      return 30;
    }
  };

  const [titleSize, setTitleSize] = useState(decideSize2(title));

  const handleChangeTitle = (text: string) => {
    setTitleSize(decideSize2(text));

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
      .saveSelection(auth.authData!.id, auth.authData!.name, timezone)
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

  const saveWindow = () => {
    user.reset();
    setStep(2);
  };

  const back = () => {
    if (step === 1) {
      navigation.goBack();
    } else {
      user.cancelSelection();
      setStep(1);
    }
  };
  const insetTop = initialWindowMetrics?.insets.top;

  if (step === 1) {
    return <AvailabilitySlider saveWindow={saveWindow} back={back} />;
  }

  return (
    <SafeAreaView style={[styles.container, {}]}>
      <TouchableOpacity
        onPress={showAlert}
        style={{
          position: 'absolute',

          marginTop: '5%',
          marginLeft: '5%',
          zIndex: 10,
        }}>
        <Icon2
          name="chevron-left"
          size={25}
          color={auth.dark ? COLOURS.white : COLOURS.black}
          style={{
            paddingTop: insetTop!,
          }}
        />
      </TouchableOpacity>

      <TimezoneButton
        containerStyle={{
          marginRight: '2%',
          marginTop: '1.5%',
          justifyContent: 'flex-end',
          paddingBottom: '2%',
          position: 'absolute',
          right: 1,
          top: insetTop,
          zIndex: 10,
        }}
        setTz={setTimezone}
        tz={timezone}
        dark={auth.dark}
      />

      <View
        style={{
          flexDirection: 'row',
          marginBottom: '2%',
          marginLeft: 50,
          height: 60,
        }}>
        <TextInputClear
          ref={textInputRef}
          dark={auth.dark}
          size={titleSize}
          font={'P'}
          style={{paddingLeft: '5%'}}
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
          alignItems: 'center',
          paddingBottom: 60,
        }}>
        <DateSelector dark={auth.dark} setDate={user.setDate} />
        <WeekSelector
          START_HOUR={user.startHour}
          END_HOUR={user.endHour}
          containerStyle={{paddingTop: '10%'}}
          containerHeight={height - (insetTop! + 60 + height / 2.6)}
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
