import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  TouchableOpacity,
  View,
  Switch,
  Dimensions,
  Alert,
} from 'react-native';
import {useAuth} from './Auth';
import {
  Button,
  DateSelector,
  DropDownMenu,
  Loading,
  Text,
  WhiteButton,
} from './components/Button';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Feather';
import COLOURS from '../constants/colours';
import Modal from 'react-native-modal';
import WeekView from './components/WeekView';
import {useUser} from './User';

const {height} = Dimensions.get('window');
interface SelectionTitles {
  key: string;
  value: string;
}

const ProfileScreen = ({navigation}) => {
  const auth = useAuth();
  const user = useUser();
  const styles = auth.styles;
  const [selected, _setSelected] = React.useState('');
  const [visible, setVisible] = useState(false);
  const [selectionTitles, setSelectionTitles] = useState<SelectionTitles[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  const setSelected = (value: string) => {
    _setSelected(value);
    if (value) {
      user.loadSelection(value);
    }
  };

  const toggleOverlay = () => {
    setVisible(!visible);
  };

  useEffect(() => {
    if (!user.loading) {
      collectTitles();
      user.mostRecentSelection.current
        ? _setSelected(user.mostRecentSelection.current)
        : null;
      setResetKey(resetKey + 1);
      setLoading(false);
    }
  }, [user.loading, user.selections, user.date]);

  const collectTitles = () => {
    let data = [];
    const keys = Object.keys(user.selections);
    for (let i = 0; i < keys.length; i++) {
      data.push({key: keys[i], value: user.selections[keys[i]].title});
    }
    setSelectionTitles(data);
    setResetKey(resetKey + 1);
  };

  const showAlert = () => {
    Alert.alert(
      `Delete '${user.selections[selected].title}'?`,
      'This selection will be lost permanently.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            user.deleteSelection(selected);
            setSelected('');
            collectTitles();
          },
          style: 'destructive', // Set the style to destructive to make the button red
        },
      ],
      {cancelable: false},
    );
  };

  const handleNewSelection = () => {
    navigation.navigate('New Selection');
    user.setSelectionTitle('');
    user.clearSelection();
  };

  const handleEdit = () => {
    navigation.navigate('Edit Selection');
    user.copySelection();
    user.setSelectionTitle(user.selections[selected].title);
  };

  return (
    <>
      {!user.loading && !loading ? (
        <SafeAreaView style={[styles.container, {}]}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
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
            <Text
              darkbg={auth.dark}
              size={40}
              font={'P'}
              style={{padding: '5%'}}>
              {auth.authData?.name}
            </Text>
          </View>
          <View
            style={{
              padding: '5%',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <DropDownMenu
              key={resetKey}
              data={selectionTitles}
              setSelected={setSelected}
              dark={auth.dark}
              onPress={() => handleNewSelection()}
              maxHeight={215}
              save="key"
              placeholder={
                user.mostRecentSelection.current
                  ? user.selections[user.mostRecentSelection.current].title
                  : 'Choose a selection'
              }
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
            {selected ? (
              <>
                <DateSelector
                  dark={auth.dark}
                  setDate={user.setDate}
                  initialDate={user.date}
                  key={resetKey}
                />
                <WeekView
                  START_HOUR={0}
                  END_HOUR={8}
                  availibility={
                    user.selections[selected][
                      user.getClosestDate(user.getDate())!
                    ]
                  }
                  containerStyle={{paddingTop: '10%'}}
                  containerHeight={height * height * 0.0005}
                  dark={auth.dark}
                  resetKey={user.resetKey}
                />
              </>
            ) : (
              <View
                style={{
                  paddingTop: '10%',
                  width: '100%',
                  height: height * height * 0.00055,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text darkbg={auth.dark} size={14} font={'G'}>
                  Nothing selected
                </Text>
              </View>
            )}
          </View>
          <View
            style={{
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          />
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
              title={'Delete'}
              half
              dark={auth.dark}
              containerStyle={{marginRight: 0}}
              onPress={!selected ? () => {} : showAlert}
              disabled={!selected}
            />
            <Button
              title={'Edit'}
              onPress={!selected ? () => {} : handleEdit}
              half
              disabled={!selected}
            />
          </View>

          <Modal
            testID={'modal'}
            isVisible={visible}
            onSwipeComplete={toggleOverlay}
            onBackdropPress={toggleOverlay}
            useNativeDriverForBackdrop={true}
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
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '80%',
                  paddingBottom: '3%',
                }}>
                <Text
                  style={{paddingLeft: '5%'}}
                  darkbg={auth.dark}
                  size={16}
                  font={'G'}>
                  Dark Mode
                </Text>
                <Switch
                  trackColor={{false: COLOURS.grey, true: 'white'}}
                  thumbColor={auth.dark ? COLOURS.salmon : COLOURS.white}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => {
                    auth.setDarkMode(!auth.dark);
                  }}
                  value={auth.dark}
                />
              </View>
              <Button
                title={'Sign Out'}
                onPress={() => {
                  auth.setFirstTime(true);
                  auth.signOut();
                }}
              />
              <WhiteButton
                dark={auth.dark}
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
      ) : (
        <View
          style={[
            styles.container,
            {flex: 1, justifyContent: 'center', alignItems: 'center'},
          ]}>
          <Loading size={30} />
        </View>
      )}
    </>
  );
};

export default ProfileScreen;
