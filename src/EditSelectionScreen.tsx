import React, {useRef, useState} from 'react';
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

  const decideSize = (length: number) => {
    if (length > 15) {
      return 22;
    } else if (length > 10) {
      return 25;
    } else {
      return 30;
    }
  };
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

  const save = () => {
    if (!user.selectionTitle) {
      Alert.alert('Please enter a title');
      textInputRef.current?.focus();
      return;
    }
    setLoading(true);
    user
      .editSelection()
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

  const back = () => {
    user.revertSelection();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, {}]}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity onPress={showAlert}>
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
        <DateSelector
          dark={auth.dark}
          setDate={user.setDate}
          initialDate={user.date}
        />
        <WeekSelector
          START_HOUR={
            user.selections[user.mostRecentSelection.current!].startHour
          }
          END_HOUR={user.selections[user.mostRecentSelection.current!].endHour}
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
