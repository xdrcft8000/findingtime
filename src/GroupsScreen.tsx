/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAuth} from './Auth';
import {Button, Loading, Text, WhiteButton} from './components/Button';
import {useUser} from './User';
import COLOURS from '../constants/colours';
import Icon2 from 'react-native-vector-icons/Feather';
import {Group, useGroup} from './Group';
import Modal from 'react-native-modal';

const GroupsScreen = ({navigation}) => {
  const auth = useAuth();
  const user = useUser();
  const group = useGroup();
  const styles = auth.styles;
  const [joinPressed, setJoinPressed] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [visible, setVisible] = useState(false);
  const toggleOverlay = () => {
    if (visible) {
      setVisible(!visible);
      setJoinPressed(false);
    } else {
      setVisible(!visible);
    }
  };
  const handleNewGroup = () => {
    toggleOverlay();
    //continue after a delay
    setTimeout(() => {
      if (Object.keys(user.selections).length === 0) {
        showAlert();
      } else {
        navigation.navigate('New Group');
      }
    }, 200);
  };

  const handleJoin = async () => {
    await group
      .getGroup(joinCode)
      .then(res => {
        if (res) {
          if (res.includes(auth.authData!.id)) {
            Alert.alert('You are already in this group');
          } else {
            toggleOverlay();
            navigation.navigate('Join Group');
          }
        }
      })
      .catch(err => {
        Alert.alert("That's not the right code");
      });
  };

  const handleGoToGroup = (item: Group) => {
    group.setGroup(item);
    navigation.navigate('Group');
  };

  const showAlert = () => {
    Alert.alert(
      'First tell us your availability',
      'Create a new availability selection now?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Create',
          onPress: () => {
            user.fromGroup.current = true;
            navigation.navigate('New Selection');
          },
        },
      ],
      {cancelable: false},
    );
  };

  const handlePlusButtonPress = () => {
    if (Object.keys(user.selections).length === 0) {
      showAlert();
    } else {
      toggleOverlay();
    }
  };

  type GroupsArray = Group[];

  const groupsArray: GroupsArray = Object.keys(group.groups).map(id => ({
    id,
    adminIDs: group.groups[id].adminIDs,
    name: group.groups[id].name,
    startDate: group.groups[id].startDate,
    endDate: group.groups[id].endDate,
    selections: group.groups[id].selections,
    userIDs: group.groups[id].userIDs,
    duration: group.groups[id].duration,
    startHour: group.groups[id].startHour,
    endHour: group.groups[id].endHour,
    code: group.groups[id].code,
    compactedAvailability: group.groups[id].compactedAvailability,
  }));

  const renderItem = ({item}: {item: Group}) => {
    return (
      <TouchableOpacity
        style={{borderBottomWidth: 1, borderBottomColor: COLOURS.teal}}
        onPress={() => handleGoToGroup(item)}>
        <Text
          darkbg={auth.dark}
          size={20}
          font={'G'}
          style={{
            padding: '5%',
            paddingLeft: '10%',
          }}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {!group.loading ? (
        <SafeAreaView style={[styles.container, {}]}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text
              darkbg={auth.dark}
              size={35}
              font={'P'}
              style={{padding: '5%'}}>
              Groups
            </Text>
            <TouchableOpacity onPress={handlePlusButtonPress}>
              <Icon2
                name="plus"
                size={30}
                color={auth.dark ? COLOURS.white : COLOURS.black}
                style={{padding: '8%'}}
              />
            </TouchableOpacity>
          </View>

          <FlatList data={groupsArray} renderItem={renderItem} />
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
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              <WhiteButton
                title="Create a new group"
                onPress={handleNewGroup}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  width: '100%',
                }}>
                {joinPressed ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '80%',
                      marginRight: '5%',
                    }}>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          width: '55%',
                          height: 47,
                        },
                      ]}
                      onChangeText={setJoinCode}
                      placeholder="Enter a join code"
                      placeholderTextColor={COLOURS.grey}
                      autoCapitalize="characters"
                    />
                    <Button title="Join" onPress={handleJoin} third />
                  </View>
                ) : (
                  <>
                    <Button
                      title={'Join a group'}
                      onPress={() => setJoinPressed(true)}
                    />
                  </>
                )}
              </View>
              <View style={{height: 100}} />
            </KeyboardAvoidingView>
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

export default GroupsScreen;
