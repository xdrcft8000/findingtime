import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from './Auth';
import {useUser} from './User';
import {Button, Loading, Text, TextInputClear} from './components/Button';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
  FlatList,
  Pressable,
} from 'react-native';
import {useGroup} from './Group';
import Icon from 'react-native-vector-icons/Feather';
import COLOURS from '../constants/colours';
import Clipboard from '@react-native-clipboard/clipboard';
import {validateDuration, validateTitle} from './Validation';
interface SelectionTitles {
  key: string;
  title: string;
}

const NewGroupScreen = ({navigation}) => {
  const auth = useAuth();
  const user = useUser();
  const group = useGroup();
  const styles = auth.styles;
  const textInputRef = React.createRef<typeof TextInputClear>();
  const textInputRef2 = React.createRef<typeof TextInputClear>();
  const [selectionTitles, setSelectionTitles] = useState<SelectionTitles[]>([]);
  const [loading, setLoading] = useState(false);
  const [selection, setSelection] = useState('');

  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [code, setCode] = useState('');

  const [step, setStep] = useState(1);

  React.useEffect(() => {
    collectTitles();
    textInputRef.current?.focus();
  }, []);

  const handleBack = () => {
    if (step === 1) {
      navigation.goBack();
    } else {
      setStep(1);
    }
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

  const [nameSize, setTitleSize] = useState(30);

  const handleChangeName = (text: string) => {
    setTitleSize(decideSize(text.length));
    if (text.length > 13) {
      const count = (text.match(/[wWmMOU]/gi) || []).length;
      if (count > 13) {
        setTitleSize(18);
      }
    }
    setName(text);
  };


  const handleNumberChange = (value: string) => {
    // Remove any non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    setDuration(numericValue);
  };
  const handleNext = () => {
    // if (name === '') {
    //   Alert.alert('Please enter a group name');
    //   textInputRef.current?.focus();
    //   return;
    // }
    validateTitle(name).then(res => {
      if (!(res === 'valid')) {
        Alert.alert(res);
        textInputRef.current?.focus();
      } else {
        validateDuration(duration).then(res => {
          if (!(res === 'valid')) {
            Alert.alert(res);
            textInputRef2.current?.focus();
          } else {
            setStep(2);
          }
        });
      }
    });
  };

  const showCopyAlert = () => {
    Alert.alert(
      'Copied!',
      '',
      [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('GroupsScreen');
          },
        },
      ],
      {
        onDismiss: () => {
          navigation.navigate('Groups');
        },
      },
    );
  };

  const handleCreate = () => {
    setLoading(true);
    group
      .createGroup(
        name,
        parseInt(duration),
        selection,
        user.selections[selection].startHour,
        user.selections[selection].endHour,
      )
      .then(groupcode => {
        setCode(groupcode);
        setLoading(false);
        setStep(3);
      });
  };

  const collectTitles = () => {
    let data = [];
    const keys = Object.keys(user.selections);
    for (let i = 0; i < keys.length; i++) {
      data.push({title: user.selections[keys[i]].title, key: keys[i]});
    }
    setSelectionTitles(data);
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
              selection === item.key ? (auth.dark ? 'black' : 'white') : null,
            borderRadius: 10,
            overflow: 'hidden',
            textAlign: 'center',
          }}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  if (step === 3) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {justifyContent: 'flex-start', alignItems: 'center'},
        ]}>
        <Text
          darkbg={auth.dark}
          size={34}
          font={'P'}
          style={[
            styles.introText,
            {
              color: auth.dark ? 'white' : 'black',
              paddingTop: '20%',
            },
          ]}>
          “There’s time enough, but none to spare.”
        </Text>
        <View style={{width: '90%', alignItems: 'center'}}>
          <Text
            darkbg={auth.dark}
            size={25}
            font={'G'}
            style={[
              styles.introSubText,
              {
                paddingTop: '5%',
                color: auth.dark ? 'white' : 'black',
              },
            ]}>
            – Charles W. Chesnutt
          </Text>
          <Text
            darkbg={auth.dark}
            size={18}
            font={'G'}
            style={{
              textAlign: 'center',
              paddingTop: '30%',
              paddingBottom: '5%',
            }}>
            Other members can join {name} by entering this code:
          </Text>
          <Pressable
            onPress={() => {
              Clipboard.setString(code);
              showCopyAlert();
            }}
            style={{
              borderRadius: 25,
              borderColor: auth.dark ? 'white' : 'black',
              borderWidth: 2,
              margin: '5%',
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
              {code}
            </Text>
            <Icon
              name="copy"
              size={25}
              color={auth.dark ? 'white' : 'black'}
              style={{paddingTop: '6%'}}
            />
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 2) {
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
            paddingHorizontal: '20%',
            textAlign: 'center',
          }}>
          Pick a selection to share with the group
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
            title="Create"
            loading={loading}
            disabled={selection === ''}
            onPress={selection === '' ? undefined : handleCreate}
          />
        </View>
      </SafeAreaView>
    );
  }
  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.container}>
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
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingVertical: '10%',
            paddingHorizontal: '5%',
          }}>
          <View
            style={{
              flex: 1,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '1%',
            }}>
            <Text
              style={{width: '80%', textAlign: 'center'}}
              darkbg={auth.dark}
              size={25}
              font={'G'}>
              Our group is called...{' '}
            </Text>
            <TextInputClear
              ref={textInputRef}
              dark={auth.dark}
              size={nameSize}
              font={'P'}
              style={{
                padding: '5%',
                borderBottomWidth: 1,
                borderBottomColor: COLOURS.teal,
              }}
              onChangeText={handleChangeName}
              maxLength={18}>
              {name}
            </TextInputClear>
            <View>
              <Text
                style={{textAlign: 'center'}}
                darkbg={auth.dark}
                size={25}
                font={'G'}>
                and we want to find time
              </Text>
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  flexDirection: 'row',
                }}>
                {/* <Text
                  style={{textAlign: 'center'}}
                  darkbg={auth.dark}
                  size={25}
                  font={'G'}>
                  for the next{'  '}
                </Text> */}
                <TextInputClear
                  ref={textInputRef2}
                  dark={auth.dark}
                  size={30}
                  font={'P'}
                  style={{
                    width: 'auto',
                    paddingHorizontal: 5,
                    paddingBottom: 5,
                    borderBottomWidth: 1,
                    borderBottomColor: COLOURS.teal,
                  }}
                  value={duration.toString()}
                  onChangeText={handleNumberChange}
                  autoCorrect={false}
                  maxLength={3}
                  keyboardType="numeric"
                />
                <Text darkbg={auth.dark} size={25} font={'G'}>
                  {' '}
                  week(s) in advance
                </Text>
              </View>
            </View>
            <Button title={'Next'} onPress={handleNext} />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default NewGroupScreen;
