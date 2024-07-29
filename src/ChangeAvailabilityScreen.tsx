import {FlatList, SafeAreaView, TouchableOpacity, View} from 'react-native';
import {Button, Text} from './components/Button';
import {useGroup} from './context/Group';
import {useAuth} from './context/Auth';
import {useState} from 'react';
import React from 'react';
import COLOURS from '../constants/colours';
import Icon from 'react-native-vector-icons/Feather';
import {useUser} from './context/User';

interface SelectionTitles {
  key: string;
  title: string;
}

const ChangeAvailabilityScreen = ({navigation}) => {
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
      if (group.group!.selections.includes(keys[i])) {
        continue;
      }
      data.push({title: user.selections[keys[i]].title, key: keys[i]});
    }
    setSelectionTitles(data);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleChange = async () => {
    setLoading(true);
    await group
      .changeAvailability(selection, Object.keys(user.selections))
      .then(() => {
        setLoading(false);
        navigation.navigate('GroupsScreen');
      })
      .catch(e => console.log(e));
  };

  const renderTitle = ({index, item}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setSelection(item.key);
        }}>
        <Text
          darkbg={auth.dark}
          size={25}
          font={'P'}
          style={{
            padding: '5%',
            backgroundColor:
              selection === item.key
                ? auth.dark
                  ? 'black'
                  : 'white'
                : undefined,
            borderRadius: 10,
            overflow: 'hidden',
            textAlign: 'center',
          }}>
          {item.title}
        </Text>
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
            width: '70%',
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
          title="Change"
          loading={loading}
          disabled={selection === ''}
          onPress={selection === '' ? undefined : handleChange}
        />
      </View>
    </SafeAreaView>
  );
};

export default ChangeAvailabilityScreen;
