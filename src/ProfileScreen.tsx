import React, {useState} from 'react';
import {
  SafeAreaView,
  Touchable,
  TouchableOpacity,
  View,
  Switch,
} from 'react-native';
import {useAuth} from './Auth';
import {
  Button,
  ClearButton,
  DropDownMenu,
  Text,
  WhiteButton,
} from './components/Button';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Feather';
import COLOURS from '../constants/colours';
import Modal from 'react-native-modal';
import WeekView from './components/WeekView';

const ProfileScreen = () => {
  const auth = useAuth();
  const styles = auth.styles;
  const [selected, setSelected] = React.useState('');
  const [visible, setVisible] = useState(false);
  const toggleOverlay = () => {
    setVisible(!visible);
  };

  const data = [
    {key: '2', value: 'Appliances'},
    {key: '3', value: 'Cameras'},
    {key: '5', value: 'Vegetables'},
    {key: '6', value: 'Diary Products'},
    {key: '7', value: 'Drinks'},
    {key: '8', value: 'Fruits'},
  ];

  return (
    <SafeAreaView style={[styles.container, {}]}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text
          darkbg={auth.dark}
          size={40}
          font={'P'}
          textStyle={{padding: '5%'}}>
          {auth.authData?.name}
        </Text>
        <TouchableOpacity
          onPress={() => {
            toggleOverlay();
          }}>
          <Icon
            name="bars"
            size={30}
            color={auth.dark ? COLOURS.white : COLOURS.black}
            style={{padding: '8%'}}
          />
        </TouchableOpacity>
      </View>
      <View
        style={{
          padding: '5%',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <DropDownMenu
          data={data}
          setSelected={setSelected}
          dark={auth.dark}
          onPress={() => console.log('pressed')}
          maxHeight={115}
        />
      </View>
      <View
        style={{
          width: '100%',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '5%',
          zIndex: -10,
          paddingBottom: 60,
        }}>
        <WeekView
          START_HOUR={0}
          END_HOUR={8}
          availibility={[]}
          containerStyle={{zIndex: -10}}
          containerHeight={250}
          dark={auth.dark}
        />
      </View>
      <View
        style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}>
        <Text darkbg={auth.dark} size={16} font={'G'}>
          long press to box select
        </Text>
      </View>
      <Modal
        testID={'modal'}
        isVisible={visible}
        onSwipeComplete={toggleOverlay}
        onBackdropPress={toggleOverlay}
        swipeDirection={['down']}
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: -50,
        }}>
        <View
          style={{
            backgroundColor: auth.dark ? COLOURS.black : COLOURS.white,
            borderRadius: 20,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Icon2
            style={{
              fontSize: 35,
              padding: 10,
              textAlign: 'center',
            }}
            name="minus"
            color={'gray'}
          />

          <Button
            title={'Sign Out'}
            onPress={() => {
              auth.setFirstTime(true);
              auth.signOut();
            }}
          />
          <WhiteButton
            title={'Delete Account'}
            onPress={() => {
              auth.setFirstTime(true);
              auth.signOut();
            }}
          />
          <View style={{height: 100}} />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;
