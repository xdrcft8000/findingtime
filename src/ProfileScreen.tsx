import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  TouchableOpacity,
  View,
  Switch,
  Dimensions,
  Alert,
  Platform,
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
import Dialog from 'react-native-dialog';

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
  const setSelected = (value: string) => {
    _setSelected(value);
    if (value) {
      user.loadSelection(value);
    }
  };

  const [visible, setVisible] = useState(false);
  const toggleOverlay = () => {
    setVisible(!visible);
  };
  const [selectionTitles, setSelectionTitles] = useState<SelectionTitles[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  const [promptVisible, setPromptVisible] = useState(false);
  const [password, setPassword] = useState('');

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
            user
              .checkDeletable(selected)
              .then(() => {
                console.log('deleted successfully');
                user.deleteSelection(selected);
                setSelected('');
                collectTitles();
              })
              .catch(err => {
                showDeleteErrorAlert(err);
              });
          },
          style: 'destructive', // Set the style to destructive to make the button red
        },
      ],
      {cancelable: false},
    );
  };

  const showDeleteErrorAlert = (err: string) => {
    Alert.alert("Can't be deleted", err);
  };

  const showDeleteAccountAlert = () => {
    Alert.alert(
      'Delete Account?',
      'This will permanently delete your account and all your data.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () => {
            if (Platform.OS === 'ios') {
              reLoginInAlert();
            } else {
              androidReloginAlert();
            }
          },
          style: 'destructive', // Set the style to destructive to make the button red
        },
      ],
      {cancelable: false},
    );
  };
  const androidReloginAlert = () => {
    setPromptVisible(true);
    // prompt(
    //   'Enter your password to delete your account.',
    //   'prompt', // Display error message if any
    //   [
    //     {
    //       text: 'Cancel',
    //       style: 'cancel',
    //     },
    //     {
    //       text: 'Delete',
    //       onPress: passinput => {
    //         console.log('pass', passinput);
    //         // Handle deletion logic here
    //         if (!passinput) {
    //           Alert.alert('Incorrect password, please try again');
    //           return;
    //         }
    //         auth
    //           .signIn(auth.authData!.email, passinput)
    //           .then(res => {
    //             handleDeleteAccount();
    //           })
    //           .catch(err => {
    //             if (err.code === 'auth/invalid-credential') {
    //               console.log('Wrong password');
    //               Alert.alert('Incorrect password, please try again');
    //             }
    //           });
    //       },
    //       style: 'destructive',
    //     },
    //   ],
    //   {
    //     type: 'secure-text',
    //     cancelable: true,
    //   },
    // );
  };

  const reLoginInAlert = () => {
    Alert.prompt(
      'Enter your password to delete your account.',
      ' ', // Display error message if any
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: pass => loginThenDelete(pass),
          style: 'destructive',
        },
      ],
      'secure-text',
      '',
      'default',
    );
  };

  const loginThenDelete = (passinput: any) => {
    // Handle deletion logic here
    if (!passinput) {
      Alert.alert('Incorrect password, please try again');
      return;
    }
    auth
      .signIn(auth.authData!.email, passinput)
      .then(res => {
        handleDeleteAccount();
      })
      .catch(err => {
        if (err.code === 'auth/invalid-credential') {
          console.log('Wrong password');
          Alert.alert('Incorrect password, please try again');
        }
      });
  };

  const handleDeleteAccount = () => {
    console.log('handling delete');
    auth.deleteUser().then(() => {
      user.deleteUserData(auth.authData!.id);
    });
  };

  const handleNewSelection = () => {
    setSelected('');
    user.mostRecentSelection.current = null;

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
                size={25}
                color={auth.dark ? COLOURS.white : COLOURS.black}
                style={{padding: '8%'}}
              />
            </TouchableOpacity>
            <Text
              darkbg={auth.dark}
              size={35}
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
                  START_HOUR={user.selections[selected].startHour}
                  END_HOUR={user.selections[selected].endHour}
                  availibility={
                    user.selections[selected][
                      user.getClosestDate(
                        user.getDate(),
                        user.availabilitySelection.current,
                      )!
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
                <Text darkbg={auth.dark} size={16} font={'G'}>
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
                  auth.signOut();
                }}
              />
              <WhiteButton
                dark={auth.dark}
                title={'Delete Account'}
                onPress={() => {
                  showDeleteAccountAlert();
                }}
              />
              <View style={{height: 100}} />
            </View>
          </Modal>
          <Dialog.Container visible={promptVisible}>
            <Dialog.Title>Delete Account</Dialog.Title>
            <Dialog.Description>
              Enter your password to delete your account, this cannot be undone.
            </Dialog.Description>
            <Dialog.Input
              label="Password"
              secureTextEntry
              onChangeText={text => setPassword(text)}
            />
            <Dialog.Button
              label="Cancel"
              onPress={() => {
                setPromptVisible(false);
              }}
            />
            <Dialog.Button
              label="Delete"
              style={{color: 'red'}}
              onPress={() => loginThenDelete(password)}
            />
          </Dialog.Container>
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
