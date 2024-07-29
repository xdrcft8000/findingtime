/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
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
import {useAuth} from './context/Auth';
import {Button, Loading, Text, WhiteButton} from './components/Button';
import {useUser} from './context/User';
import COLOURS from '../constants/colours';
import Icon2 from 'react-native-vector-icons/Feather';
import {useGroup} from './context/Group';
import Modal from 'react-native-modal';
import {Group} from './Models';

const GroupsScreen = ({navigation}: any) => {
  const auth = useAuth();
  const user = useUser();
  const group = useGroup();
  const styles = auth.styles;
  const [pageLoading, setPageLoading] = useState(true);
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
  const [groupsArrayState, setGroupsArrayState] = useState([] as GroupsArray);

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
      .catch(_ => {
        Alert.alert("That's not the right code");
      });
  };

  const handleGoToGroup = (item: GroupWithLoading) => {
    setLoading(item.group.id, true);
    group.loadGroup(item.group).then(() => {
      setLoading(item.group.id, false);
      navigation.navigate('Group');
    });
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

  type GroupWithLoading = {
    group: Group;
    loading: boolean;
  };

  type GroupsArray = GroupWithLoading[];

  useEffect(() => {
    if (group.loading) {
      return;
    }
    const groupsArray: GroupsArray = Object.keys(group.groups).map(id => ({
      group: {
        id,
        adminIDs: group.groups[id].adminIDs,
        name: group.groups[id].name,
        startDate: group.groups[id].startDate,
        endDate: group.groups[id].endDate,
        selections: group.groups[id].selections,
        userIDs: group.groups[id].userIDs,
        duration: group.groups[id].duration,
        code: group.groups[id].code,
        compactedAvailability: group.groups[id].compactedAvailability,
        lastUpdated: group.groups[id].lastUpdated,
      },
      loading: false,
    }));
    setGroupsArrayState(groupsArray);
    setPageLoading(false);
  }, [group.groups, group.loading]);

  const setLoading = (groupId: string, loading: boolean) => {
    setGroupsArrayState(prevGroupsArray =>
      prevGroupsArray.map(groupWithLoading =>
        groupWithLoading.group.id === groupId
          ? {...groupWithLoading, loading}
          : groupWithLoading,
      ),
    );
  };

  const renderItem = ({item}: {item: GroupWithLoading}) => {
    return (
      <TouchableOpacity
        style={{
          display: 'flex',
          borderBottomWidth: 1,
          borderBottomColor: COLOURS.teal,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => handleGoToGroup(item)}>
        <Text
          darkbg={auth.dark}
          size={20}
          font={'G'}
          style={{
            padding: '5%',
            paddingLeft: '10%',
          }}>
          {item.group.name}
        </Text>
        {item.loading && (
          <Loading size={15} containerStyle={{marginRight: '10%'}} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      {!group.loading && !pageLoading ? (
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

          <FlatList data={groupsArrayState} renderItem={renderItem} />
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
