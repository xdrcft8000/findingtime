/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {useUser} from './context/User';
import {useAuth} from './context/Auth';
import {
  Alert,
  Dimensions,
  Pressable,
  SafeAreaView,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button, Text, WhiteButton} from './components/Button';
import Icon from 'react-native-vector-icons/Feather';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import COLOURS from '../constants/colours';
import {useGroup} from './context/Group';
import Clipboard from '@react-native-clipboard/clipboard';
import Modal from 'react-native-modal';
import OverallGroupView from './components/OverallGroupView';
import GroupWeeklyView from './GroupWeeklyView';

export default function GroupScreen({navigation}: any) {
  const auth = useAuth();
  const user = useUser();
  const group = useGroup();
  const styles = auth.styles;
  const [viewState, setViewState] = useState<'overall' | 'week'>('overall');
  const [visible, setVisible] = useState(false);
  const toggleOverlay = () => {
    setVisible(!visible);
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

  const handleLeave = () => {
    Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
      {
        text: 'Cancel',
        onPress: () => toggleOverlay(),
        style: 'cancel',
      },
      {
        text: 'Confirm',
        onPress: () => {
          group.leaveGroup(Object.keys(user.selections), auth.authData!.id);
          toggleOverlay();
          navigation.goBack();
        },
      },
    ]);
  };

  const handleChange = () => {
    if (Object.keys(user.selections).length === 1) {
      Alert.alert("You haven't got any other availability selections yet.");
      return;
    }
    toggleOverlay();
    navigation.navigate('Change Availability');
  };

  const groupMenuModal = () => {
    let currentSelection = '';
    const keys = Object.keys(user.selections);
    for (let i = 0; i < keys.length; i++) {
      if (group.group!.selections.includes(keys[i])) {
        currentSelection = user.selections[keys[i]].title;
      }
    }

    return (
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
            }}
          />
          <View
            style={{
              width: '80%',
              borderRadius: 12,
              justifyContent: 'center',
              alignContent: 'center',
              paddingTop: '0%',
              padding: '5%',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  size={24}
                  font={'P'}
                  darkbg={auth.dark}
                  style={{padding: 5}}>
                  {group.group!.userIDs.length}
                </Text>
                <Icon2
                  style={{
                    fontSize: 25,
                    paddingVertical: 10,
                    textAlign: 'center',
                  }}
                  name="user"
                  color={auth.dark ? COLOURS.white : COLOURS.black}
                />
              </View>

              <View style={{height: '100%', padding: 10}}>{copyCodeBox()}</View>
            </View>
          </View>
          {/* <Text size={24} font={'G'} darkbg={auth.dark} style={{padding: 5}}>
            Your selection:
          </Text> */}
          <Text
            size={20}
            font={'P'}
            darkbg={auth.dark}
            style={{padding: 5, paddingBottom: 20, textAlign: 'center'}}>
            Your selection: {currentSelection}
          </Text>
          <Button title={'Change selection'} onPress={handleChange} />
          <WhiteButton
            dark={auth.dark}
            title={'Leave Group'}
            onPress={handleLeave}
          />
          {group.group!.adminIDs.includes(auth.authData!.id) ? (
            <WhiteButton
              dark={auth.dark}
              title={'Delete Group'}
              onPress={() => {
                group.deleteGroup(group.group!.id).then(() => {
                  navigation.goBack();
                  Alert.alert('Deleted');
                });
              }}
            />
          ) : null}
          <View style={{height: 100}} />
        </View>
      </Modal>
    );
  };

  function back() {
    navigation.goBack();
  }

  const showCopyAlert = () => {
    Alert.alert('Copied!');
  };

  const copyCodeBox = () => {
    return (
      <Pressable
        onPress={() => {
          Clipboard.setString(group.group!.code);
          showCopyAlert();
        }}
        style={{
          borderRadius: 18,
          borderColor: auth.dark ? COLOURS.white : COLOURS.black,
          borderWidth: 1,
          paddingVertical: '4%',
          paddingHorizontal: '7%',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Text
          size={18}
          font={'P'}
          darkbg={auth.dark}
          style={{
            textAlign: 'center',
            paddingHorizontal: '3%',
            paddingRight: '2%',
          }}>
          {group.group!.code}
        </Text>
        <Icon
          name="copy"
          size={18}
          color={auth.dark ? 'white' : 'black'}
          style={{paddingTop: '2%'}}
        />
      </Pressable>
    );
  };

  if (group.group!.selections.length < 2) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {justifyContent: 'flex-start', alignContent: 'center'},
        ]}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingBottom: '5%',
          }}>
          <TouchableOpacity
            onPress={() => {
              back();
            }}>
            <Icon
              name="chevron-left"
              size={25}
              color={auth.dark ? COLOURS.white : COLOURS.black}
              style={{padding: '8%'}}
            />
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              darkbg={auth.dark}
              size={26}
              font={'P'}
              style={{padding: '1%'}}>
              {group.group?.name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              toggleOverlay();
            }}>
            <Icon2
              name="bars"
              size={20}
              color={auth.dark ? COLOURS.white : COLOURS.black}
              style={{padding: '8%'}}
            />
          </TouchableOpacity>
        </View>

        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: '80%',
          }}>
          <Text darkbg={auth.dark} size={18} font={'G'}>
            You're the only one here
          </Text>
          <Text darkbg={auth.dark} size={18} font={'G'}>
            Others can join by entering this code:
          </Text>
          <Pressable
            onPress={() => {
              Clipboard.setString(group.group!.code);
              showCopyAlert();
            }}
            style={{
              borderRadius: 25,
              borderColor: auth.dark ? 'white' : 'black',
              borderWidth: 2,
              margin: '10%',
              marginBottom: '10%',
              paddingVertical: '4%',
              paddingHorizontal: '7%',
              flexDirection: 'row',
              width: '45%',
              justifyContent: 'space-between',
            }}>
            <Text
              size={25}
              font={'P'}
              darkbg={auth.dark}
              style={{
                textAlign: 'center',
                paddingHorizontal: '3%',
                paddingRight: '6%',
              }}>
              {group.group!.code}
            </Text>
            <Icon
              name="copy"
              size={25}
              color={auth.dark ? 'white' : 'black'}
              style={{paddingTop: '6%'}}
            />
          </Pressable>
        </View>
        {groupMenuModal()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        {justifyContent: 'flex-start', alignContent: 'center'},
      ]}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingBottom: '5%',
        }}>
        <TouchableOpacity
          onPress={() => {
            back();
          }}>
          <Icon
            name="chevron-left"
            size={25}
            color={auth.dark ? COLOURS.white : COLOURS.black}
            style={{padding: '8%'}}
          />
        </TouchableOpacity>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            darkbg={auth.dark}
            size={decideSize(group.group!.name.length)}
            font={'P'}
            style={{padding: '1%'}}>
            {group.group?.name}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            toggleOverlay();
          }}>
          <Icon2
            name="bars"
            size={20}
            color={auth.dark ? COLOURS.white : COLOURS.black}
            style={{padding: '8%', paddingTop: '9%'}}
          />
        </TouchableOpacity>
      </View>

      <View style={{width: '100%', flexDirection: 'row'}}>
        <Pressable
          onPress={() => setViewState('overall')}
          style={{
            width: '42%',
            marginHorizontal: '5%',
            borderRadius: 16,
            paddingVertical: '2%',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor:
              viewState === 'overall' ? COLOURS.salmon : undefined,
          }}>
          <Text
            darkbg={auth.dark && viewState !== 'overall'}
            size={18}
            font={'G'}
            style={{textAlign: 'center'}}>
            Overall View
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setViewState('week')}
          style={{
            width: '38%',
            borderRadius: 16,
            marginHorizontal: '5%',
            paddingVertical: '2%',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor:
              viewState === 'overall' ? undefined : COLOURS.salmon,
          }}>
          <Text
            darkbg={auth.dark && viewState !== 'week'}
            size={18}
            font={'G'}
            style={{
              textAlign: 'center',
            }}>
            Weekly View
          </Text>
        </Pressable>
      </View>

      {viewState === 'overall' ? (
        <>
          <OverallGroupView
            START_HOUR={group.startHour}
            END_HOUR={group.endHour}
            containerHeight={Dimensions.get('window').height / 2.2}
            availibility={[]}
            resetKey={0}
            dark={auth.dark}
          />
          <View style={{paddingLeft: '10%'}}>
            <View style={{flexDirection: 'row', paddingTop: 70}}>
              <View
                style={{
                  width: 20,
                  height: 10,
                  backgroundColor: COLOURS.salmon,
                  borderRadius: 5,
                  marginTop: 6,
                }}
              />
              <Text darkbg={auth.dark} size={0} font={'P'}>
                {' '}
                - Some people are free.
              </Text>
            </View>
            <View style={{flexDirection: 'row', paddingTop: '2%'}}>
              <View
                style={{
                  width: 20,
                  height: 10,
                  backgroundColor: COLOURS.teal,
                  borderRadius: 5,
                  marginTop: 6,
                }}
              />
              <Text darkbg={auth.dark} size={0} font={'P'}>
                {' '}
                - Everyone is free.
              </Text>
            </View>
          </View>
        </>
      ) : (
        <GroupWeeklyView />
      )}
      {groupMenuModal()}
    </SafeAreaView>
  );
}
