import React, {useRef, useState} from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  View,
} from 'react-native';
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
import {initialWindowMetrics} from 'react-native-safe-area-context';
import TimezoneButton from './components/TimezoneButton';
import AvailabilitySlider from './components/AvailabilitySliderScreen';
const {height} = Dimensions.get('window');

const EditSelectionScreen = ({navigation}) => {
  const auth = useAuth();
  const user = useUser();
  const styles = auth.styles;
  const [title, setTitle] = useState(
    user.selections[user.mostRecentSelection.current!].title,
  );
  const textInputRef = useRef<typeof TextInputClear>(null);
  const [loading, setLoading] = useState(false);
  const [timezone, setTimezone] = useState(
    user.selections[user.mostRecentSelection.current!].timezone,
  );
  const [step, setStep] = useState(1);
  const [newStartHour, setNewStartHour] = useState(user.startHour);
  const [newEndHour, setNewEndHour] = useState(user.endHour);
  const insetTop = initialWindowMetrics?.insets.top;

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

  const save = () => {
    if (!user.selectionTitle) {
      Alert.alert('Please enter a title');
      textInputRef.current?.focus();
      return;
    }
    setLoading(true);
    user
      .editSelection(timezone)
      .then(() => {
        setLoading(false);
        Alert.alert('Saved changes');
        navigation.goBack();
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
        Alert.alert('Error saving changes');
      });
  };

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

  const saveWindow = () => {
    user.loadSelectionForEdit(newStartHour, newEndHour);
    setStep(2);
  };

  const back = () => {
    if (step === 1) {
      navigation.goBack();
    } else {
      user.revertSelection();
      setStep(1);
    }
  };

  if (step === 1) {
    return (
      <AvailabilitySlider
        saveWindow={saveWindow}
        back={back}
        newStartHour={newStartHour}
        newEndHour={newEndHour}
        setNewStartHour={setNewStartHour}
        setNewEndHour={setNewEndHour}
      />
    );
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
          padding: '5%',
          paddingBottom: 60,
        }}>
        <DateSelector
          dark={auth.dark}
          setDate={user.setDate}
          initialDate={user.date}
        />
        <WeekSelector
          START_HOUR={user.startHour}
          END_HOUR={user.endHour}
          containerStyle={{paddingTop: '10%'}}
          containerHeight={height * height * 0.00055}
          dark={auth.dark}
          resetKey={user.resetKey}
        />
      </View>
      <View
        style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}>
        <Text darkbg={auth.dark} size={16} font={'G'}>
          long press to box select/unselect
        </Text>
      </View>
      {loading ? (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            position: 'absolute',
            bottom: '5%',
          }}>
          <Loading size={22} />
        </View>
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
            title={'Reset'}
            half
            dark={auth.dark}
            containerStyle={{marginRight: 0}}
            onPress={user.reset}
          />
          <Button title={'Save'} half onPress={save} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default EditSelectionScreen;
