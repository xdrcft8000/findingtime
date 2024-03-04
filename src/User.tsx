import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from 'react';
import auth from '@react-native-firebase/auth';
import {format, startOfWeek} from 'date-fns';
import firestore from '@react-native-firebase/firestore';

type UserContextData = {
  loading: boolean;
  setLoading: (value: boolean) => void;
  availability: React.MutableRefObject<any[]>;
  availabilitySelection: React.MutableRefObject<Selection>;
  date: Date;
  setDate: (value: Date) => void;
  updateSelection: () => void;
  saveSelection: (userID: string, userName: string) => Promise<void>;
  resetKey: number;
  reset: () => void;
  changeFlag: React.MutableRefObject<boolean>;
  selectionTitle: string;
  setSelectionTitle: (value: string) => void;
  selections: SelectionData;
  getDate: () => string;
  getClosestDate: (dateKey: string) => string | null;
  loadSelection: (id: string) => void;
  deleteSelection: (id: string) => void;
  clearSelection: () => void;
  mostRecentSelection: React.MutableRefObject<string | null>;
  editSelection: () => Promise<void>;
  revertSelection: () => void;
  copySelection: () => void;
  cancelSelection: () => void;
};

interface Selection {
  [date: string]: boolean[];
}

interface SelectionData {
  [id: string]: {
    [key: string]: any; // Allow additional dynamic properties
  };
}

const UserContext = createContext<UserContextData>({} as UserContextData);
type Props = {
  children?: React.ReactNode;
};
const UserProvider: React.FC<Props> = ({children}) => {
  const [loading, setLoading] = useState(true);
  const DAY_LENGTH = 8;
  const availability = useRef(Array(DAY_LENGTH * 8 * 4).fill(false));
  const availabilitySelection = useRef<Selection>({});
  const availabilitySelectionCopy = useRef<Selection>({});
  const [date, setDateState] = useState<Date>(
    startOfWeek(new Date(), {weekStartsOn: 1}), // Start week on Monday
  );
  const [selectionTitle, setSelectionTitle] = useState('');
  const [selections, setSelections] = useState<SelectionData>({});
  const [resetKey, setResetKey] = useState(0);
  const reset = () => {
    availability.current = Array(32 * DAY_LENGTH).fill(false);
    setResetKey(resetKey + 1);
  };
  const refresh = () => {
    setResetKey(resetKey + 1);
  };
  const mostRecentSelection = useRef<string | null>(null);

  const changeFlag = useRef(false);

  useEffect(() => {
    //firebase snapshot query
    const subscriber = firestore()
      .collection('Selections')
      .where('userID', '==', auth().currentUser?.uid)
      .onSnapshot(querySnapshot => {
        const data: SelectionData = querySnapshot.docs.reduce(
          (acc: SelectionData, doc) => {
            acc[doc.id] = {
              ...doc.data(),
            };
            return acc;
          },
          {},
        );
        setSelections(data);
        setLoading(false);
        // setSelectionTitles(titles);
      });
    return () => subscriber();
  }, []);

  const getDate = () => {
    return format(date, 'yyyy-MM-dd');
  };

  const setDate = (value: Date, withoutUpdate = false) => {
    if (!withoutUpdate) {
      updateSelection();
    }
    // Convert the date to a string key
    const dateKey = format(value, 'yyyy-MM-dd');
    // Check if the date exists in availabilitySelection
    const closestDate = getClosestDate(dateKey);
    closestDate &&
      (availability.current = [...availabilitySelection.current[closestDate]]);
    // Set the new date state
    setDateState(value);
    refresh();
  };

  const getClosestDate: (dateKey: string) => string | null = (
    dateKey: string,
  ) => {
    if (dateKey in availabilitySelection.current) {
      return dateKey;
    }
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
    // If a closest date is found and its value is identical to currentAvailability, do nothing

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

  const saveSelection = async (
    userID: string,
    userName: string,
  ): Promise<void> => {
    console.log('Saving selection');
    // Update the selection title
    updateSelection();

    // Wrap Firestore operation in a Promise
    return new Promise<void>((resolve, reject) => {
      firestore()
        .collection('Selections')
        .add({
          title: selectionTitle,
          userID: userID,
          userName: userName,
          ...availabilitySelection.current,
        })
        .then(docRef => {
          console.log('Document written with ID: ', docRef.id);
          mostRecentSelection.current = docRef.id;
          setDate(startOfWeek(new Date(), {weekStartsOn: 1}), true);
          resolve(); // Resolve the Promise
        })
        .catch(error => {
          console.error('Error saving availability:', error);
          reject(error); // Reject the Promise with the error
        });
    });
  };

  const deleteSelection = async (id: string) => {
    mostRecentSelection.current = null;
    firestore()
      .collection('Selections')
      .doc(id)
      .delete()
      .then(() => {
        setSelectionTitle('');
        reset();
      });
  };

  const loadSelection = (id: string) => {
    const excludedFields = ['title', 'userID', 'userName']; // Specify the fields you want to exclude
    let unexcludedData = {...selections[id]};
    // Exclude specified fields
    for (const field of excludedFields) {
      delete unexcludedData[field];
    }
    availabilitySelection.current = {...unexcludedData}; // Copy all fields from selections[id]
    availability.current = [
      ...availabilitySelection.current[getClosestDate(getDate())!],
    ];
    mostRecentSelection.current = id;

    refresh();
  };

  const clearSelection = () => {
    reset();
    availabilitySelection.current = {};
    setDateState(startOfWeek(new Date(), {weekStartsOn: 1}));
  };

  const editSelection = async (): Promise<void> => {
    updateSelection();
    const updateDoc = selectionTitle
      ? {title: selectionTitle, ...availabilitySelection.current}
      : {...availabilitySelection.current};

    // Wrap Firestore operation in a Promise
    return new Promise<void>((resolve, reject) => {
      if (mostRecentSelection.current) {
        firestore()
          .collection('Selections')
          .doc(mostRecentSelection.current)
          .update(updateDoc)
          .then(() => {
            console.log('Availability saved');
            resolve();
          })
          .catch(error => {
            console.error('Error saving availability:', error);
            reject(error); // Reject the Promise with the error
          });
      } else {
        // If mostRecentSelection.current is not set, resolve the Promise immediately
        console.log('No recent selection found');
        resolve();
      }
    });
  };

  const revertSelection = () => {
    availability.current = [...availabilitySelectionCopy.current[getDate()]];
    availabilitySelection.current = {...availabilitySelectionCopy.current};
    refresh();
  };

  const cancelSelection = () => {
    mostRecentSelection.current
      ? (availability.current = [
          ...selections[mostRecentSelection.current!][getDate()],
        ])
      : reset();
  };

  const copySelection = () => {
    availabilitySelectionCopy.current = {...availabilitySelection.current};
  };

  return (
    //This component will be used to encapsulate the whole App,
    //so all components will have access to the Context
    <UserContext.Provider
      value={{
        loading,
        setLoading,
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
        selections,
        getDate,
        getClosestDate,
        loadSelection,
        deleteSelection,
        clearSelection,
        mostRecentSelection,
        editSelection,
        revertSelection,
        copySelection,
        cancelSelection,
      }}>
      {children}
    </UserContext.Provider>
  );
};

function useUser(): UserContextData {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within an UserProvider');
  }

  return context;
}

export {UserContext, UserProvider, useUser};
