import React, {useEffect, useRef, useState} from 'react';
import {Alert, Dimensions, SafeAreaView, TouchableOpacity, View} from 'react-native';
import {useAuth} from './Auth';
import {
  Button,
  DateSelector,
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

  const save = () => {
    if (!user.selectionTitle) {
      Alert.alert('Please enter a title');
      textInputRef.current?.focus();
      return;
    }
    user.editSelection().then(() => {
      navigation.goBack();
    });
  };

  const showAlert = () => {
    Alert.alert(
      `Continue without saving?`,
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
          size={30}
          font={'P'}
          style={{padding: '5%'}}
          onChangeText={user.setSelectionTitle}
          autoCorrect={false}
          maxLength={20}>
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
          START_HOUR={0}
          END_HOUR={8}
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
          onPress={auth.reset}
        />
        <Button title={'Save'} half onPress={save} />
      </View>
    </SafeAreaView>
  );
};

export default EditSelectionScreen;
