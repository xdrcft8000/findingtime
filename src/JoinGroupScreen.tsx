/* eslint-disable react-native/no-inline-styles */
import {FlatList, SafeAreaView, TouchableOpacity, View} from 'react-native';
import {Button, Text} from './components/Button';
import {useGroup} from './context/Group';
import {useUser} from './context/User';
import {useAuth} from './context/Auth';
import {useState} from 'react';
import React from 'react';
import COLOURS from '../constants/colours';
import Icon from 'react-native-vector-icons/Feather';
import {getCurrentOffsetFromGMT} from './HelperFunctions';

interface SelectionTitles {
  key: string;
  title: string;
  timezone: string;
}

const JoinGroupScreen = ({navigation}) => {
  const auth = useAuth();
  const user = useUser();
  const group = useGroup();
  const styles = auth.styles;

  const [selectionTitles, setSelectionTitles] = useState<SelectionTitles[]>([]);
  const [loading, setLoading] = useState(false);
  const [selection, setSelection] = useState('');

  React.useEffect(() => {
    collectTitles();
  }, []);


  const collectTitles = () => {
    let data = [];
    const keys = Object.keys(user.selections);
    for (let i = 0; i < keys.length; i++) {
      const title = user.selections[keys[i]].title;
      const timezoneOffset = getCurrentOffsetFromGMT(
        user.selections[keys[i]].timezone,
      );

      data.push({title: title, key: keys[i], timezone: timezoneOffset});
    }
    setSelectionTitles(data);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleJoin = async () => {
    setLoading(true);
    await group
      .joinGroup(selection, auth.authData!.id)
      .then(() => {
        setLoading(false);
        navigation.navigate('Group');
        // navigation.goBack();
      })
      .catch(e => console.log(e));
  };

  const renderTitle = ({index, item}) => {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignContent: 'center',
          padding: '5%',
          backgroundColor:
            selection === item.key ? (auth.dark ? 'black' : 'white') : null,
          borderRadius: 10,
        }}
        onPress={() => {
          setSelection(item.key);
        }}>
        <Text
          darkbg={auth.dark}
          size={20}
          font={'P'}
          style={{
            overflow: 'hidden',
            textAlign: 'center',
            maxWidth: '70%',
          }}>
          {item.title}
          {'  '}
        </Text>
        {user.useTimezones && (
          <Text darkbg={auth.dark} size={14} font={'G'}>
            {item.timezone}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          padding: '10%',
          alignItems: 'center',
          justifyContent: 'space-evenly',
        },
      ]}>
      <View
        style={{
          position: 'absolute',
          top: '7%',
          left: '5%',
          width: 30,
          height: 30,
          zIndex: 10,
        }}>
        <TouchableOpacity style={{marginTop: 5}} onPress={handleBack}>
          <Icon
            name="x"
            size={30}
            color={auth.dark ? COLOURS.white : COLOURS.black}
          />
        </TouchableOpacity>
      </View>

      <Text
        darkbg={auth.dark}
        size={25}
        font={'G'}
        style={{
          paddingBottom: '15%',
          paddingTop: '20%',
          paddingHorizontal: '5%',
          textAlign: 'center',
        }}>
        Pick a selection to share with {group.group?.name}
      </Text>
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          height: '40%',
        }}>
        <FlatList
          key={user.resetKey}
          style={{
            width: user.useTimezones ? '95%' : '80%',
            marginHorizontal: '20%',
            paddingHorizontal: '10%',
            paddingBottom: -170,
          }}
          data={selectionTitles}
          renderItem={renderTitle}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          width: '100%',
          bottom: '5%',
        }}>
        <Button
          containerStyle={{marginTop: '30%'}}
          title="Join"
          loading={loading}
          disabled={selection === ''}
          onPress={selection === '' ? undefined : handleJoin}
        />
      </View>
    </SafeAreaView>
  );
};

export default JoinGroupScreen;
