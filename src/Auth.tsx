import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import {Alert, useColorScheme} from 'react-native';
import {darkStyles, lightStyles} from './styles/styles';
import {format, startOfWeek} from 'date-fns';
import firestore from '@react-native-firebase/firestore';

type AuthContextData = {
  authData?: AuthData;
  initializing: boolean;
  loading: boolean;
  firstTime: boolean;
  setFirstTime: (value: boolean) => void;
  // isConnected: boolean;
  setLoading: (value: boolean) => void;
  signIn: (email: string, password: string) => Promise<any>;
  createUser: (email: string, password: string, name: string) => Promise<any>;
  signOut(): void;
  deleteUser(): void;
  styles: any;
  dark: boolean;
  setDarkMode: (value: boolean) => void;
  availability: React.MutableRefObject<any[]>;
  availabilitySelection: React.MutableRefObject<Selection>;
  date: Date;
  setDate: (value: Date) => void;
  updateSelection: () => void;
  saveSelection: () => void;
  resetKey: number;
  reset: () => void;
  changeFlag: React.MutableRefObject<boolean>;
  selectionTitle: string;
  setSelectionTitle: (value: string) => void;
};

export type AuthData = {
  email: string;
  name: string;
  id: string;
};
interface Selection {
  [date: string]: boolean[];
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);
type Props = {
  children?: React.ReactNode;
};
const AuthProvider: React.FC<Props> = ({children}) => {
  const DAY_LENGTH = 8;
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [firstTime, setFirstTime] = useState(false);
  const [authData, setAuthData] = useState<AuthData>();
  const colorScheme = useColorScheme();
  const [dark, setDark] = useState(colorScheme === 'dark' ? true : false);
  const styles = dark ? darkStyles : lightStyles;
  const availability = useRef(Array(8 * 8 * 4).fill(false));
  const availabilitySelection = useRef<Selection>({});
  const [date, setDateState] = useState<Date>(
    startOfWeek(new Date(), {weekStartsOn: 1}), // Start week on Monday
  );
  const [selectionTitle, setSelectionTitle] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const reset = () => {
    availability.current = Array(32 * DAY_LENGTH).fill(false);
    setResetKey(resetKey + 1);
  };
  const refresh = () => {
    setResetKey(resetKey + 1);
  };

  const changeFlag = useRef(false);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(newUser => {
      if (newUser) {
      } else {
      }
    });
    loadStorageData();
    return subscriber; // unsubscribe on unmount
  }, []);

  const loadStorageData = async () => {
    try {
      const storageAuthData = await AsyncStorage.getItem('@AuthData');
      const darkModeData = await AsyncStorage.getItem('@DarkMode');
      if (storageAuthData) {
        setAuthData(JSON.parse(storageAuthData));
      }
      if (darkModeData) {
        setDark(JSON.parse(darkModeData));
      }
    } catch (e) {
      console.log(e);
    } finally {
      setInitializing(false);
    }
  };

  const setDarkMode = async (value: boolean) => {
    setDark(value);
    await AsyncStorage.setItem('@DarkMode', JSON.stringify(value));
  };

  const setDate = (value: Date) => {
    updateSelection();

    // Convert the date to a string key
    const dateKey = format(value, 'yyyy-MM-dd');

    // Check if the date exists in availabilitySelection
    if (dateKey in availabilitySelection.current) {
      // If the date exists, update availability.current and refresh
      availability.current = availabilitySelection.current[dateKey];
      refresh();
    } else {
      const closestDate = getClosestDate(dateKey);
      closestDate &&
        (availability.current = [
          ...availabilitySelection.current[closestDate],
        ]);
      refresh();
    }

    // Set the new date state
    setDateState(value);
  };

  const getClosestDate: (dateKey: string) => string | null = (
    dateKey: string,
  ) => {
    const selectionDates = Object.keys(availabilitySelection.current).sort();
    let closestDate: string | null = null;
    for (let i = selectionDates.length - 1; i >= 0; i--) {
      if (selectionDates[i] < dateKey) {
        closestDate = selectionDates[i];
        return closestDate;
      }
    }
    return null;
  };

  const updateSelection = () => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const currentAvailability = [...availability.current];
    // Find the closest date prior to the current date
    const closestDate = getClosestDate(dateKey);
    // If a previous date is found and its value is identical to currentAvailability, do nothing
    const closestDateAvailability = closestDate
      ? availabilitySelection.current[closestDate]
      : null;

    // If a closest date is found and its value is identical to currentAvailability, do nothing
    if (
      closestDate &&
      JSON.stringify(closestDateAvailability) ===
        JSON.stringify(currentAvailability)
    ) {
      return;
    }

    // If the date doesn't exist or its value is different from currentAvailability, add it as a new key-value pair
    availabilitySelection.current[dateKey] = currentAvailability;
  };

  const saveSelection = async () => {
    await firestore()
      .collection('Selections')
      .add({
        title: selectionTitle,
        userID: authData?.id,
        userName: authData?.name,
        ...availabilitySelection.current,
      })
      .then(() => {
        console.log('Availability saved');
      });
  };

  const createUser = async (
    email: string,
    password: string,
    name: string,
  ): Promise<any> => {
    setLoading(true);
    try {
      const newUserCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );

      console.log('User account created & signed in!');

      await newUserCredential.user.updateProfile({
        displayName: name,
      });

      const userData = {
        email: email,
        name: name,
        id: newUserCredential.user.uid,
      };

      setFirstTime(true);
      setAuthData(userData);
      await AsyncStorage.setItem('@AuthData', JSON.stringify(userData));

      return userData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<any> => {
    setLoading(true);
    try {
      const newUser = await auth().signInWithEmailAndPassword(email, password);
      const userID = newUser.user.uid;
      const userName = newUser.user.displayName;
      const userEmail = newUser.user.email;

      if (userEmail && userName) {
        const userData = {
          email: userEmail,
          name: userName,
          id: userID,
        };

        setAuthData(userData);
        await AsyncStorage.setItem('@AuthData', JSON.stringify(userData));
        return true;
      } else {
        Alert.alert('Error', 'No email/name saved to this user');
      }
    } catch (error) {
      console.error('Error during sign in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await auth()
        .signOut()
        .then(async () => {
          await AsyncStorage.removeItem('@AuthData');
          setAuthData(undefined);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const deleteUser = async () => {
    try {
      await auth()
        .currentUser?.delete()
        .then(async () => {
          await AsyncStorage.removeItem('@AuthData');
          setAuthData(undefined);
        });
    } catch (error) {
      console.log(error);
    }
  };

  // const addUser = async (
  //   userID: string,
  //   name: string,
  //   email: string,
  // ): Promise<Boolean> => {
  //   const userDoc = {
  //     id: userID,
  //     name: name,
  //     email: email,
  //   };
  //   try {
  //     await firestore()
  //       .collection('Users')
  //       .doc(userID)
  //       .get()
  //       .then(async doc => {
  //         if (doc.exists) {
  //           console.log('User already existed');
  //         } else {
  //           await firestore()
  //             .collection('Users')
  //             .doc(userID)
  //             .set(userDoc)
  //             .then(() => {
  //               console.log('New user created');
  //             });
  //         }
  //       });
  //     return true;
  //   } catch (e: any) {
  //     console.log(e.message);
  //     throw e;
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  return (
    //This component will be used to encapsulate the whole App,
    //so all components will have access to the Context
    <AuthContext.Provider
      value={{
        authData,
        loading,
        initializing,
        firstTime,
        setFirstTime,
        // isConnected,
        setLoading,
        signIn,
        createUser,
        signOut,
        deleteUser,
        styles,
        dark,
        setDarkMode,
        availability,
        availabilitySelection,
        updateSelection,
        saveSelection,
        date,
        setDate,
        resetKey,
        changeFlag,
        reset,
        selectionTitle,
        setSelectionTitle,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export {AuthContext, AuthProvider, useAuth};
