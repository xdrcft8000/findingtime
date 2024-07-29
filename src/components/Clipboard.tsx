const renderItem = ({item, index}: {item: any; index: number}) => {
  const isLeftmostColumn = index % NUM_COLUMNS === 0;
  const indexVar = index % (NUM_COLUMNS * ZOOM_QUOTIENT); //32
  const hourVar = index % (NUM_COLUMNS * ZOOM_QUOTIENT); //32
  return isLeftmostColumn ? (
    <View
      style={[
        styles.hourSquare,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          borderWidth: 0,
          backgroundColor: 'rgba(255, 255, 255, 0)',
        },
      ]}>
      <Text style={[styles.hour, {backgroundColor: 'rgba(255, 255, 255, 0)'}]}>
        {getHour(index)}
      </Text>
    </View>
  ) : (
    <Pressable
      onPress={() => {
        availability.current[index] = !availability.current[index];
        doRender();
      }}
      onLongPress={() => {
        setFlatListScrollEnabled(false);
        panresponderActive.current = true;
        doRender();
      }}
      pressRetentionOffset={{top: 10, left: 10, bottom: 10, right: 10}}
      onPressOut={() => {
        setFlatListScrollEnabled(true);
        panresponderActive.current = false;
      }}
      style={({pressed}) => [
        styles.square,

        {
          opacity: pressed ? 0.5 : 1,
          backgroundColor: availability.current[index]
            ? COLOURS.teal
            : dark
            ? COLOURS.darkgrey
            : 'white',
          borderColor: dark ? 'black' : COLOURS.grey,
          borderTopWidth:
            indexVar > NUM_COLUMNS * 2
              ? indexVar < NUM_COLUMNS * 3
                ? 1
                : 0
              : 0,
          borderBottomWidth: indexVar > NUM_COLUMNS * 3 ? 4 : 0,
          borderTopLeftRadius: hourVar < NUM_COLUMNS ? CORNER_RADIUS : 0,
          borderTopRightRadius: hourVar < NUM_COLUMNS ? CORNER_RADIUS : 0,
          borderBottomLeftRadius:
            hourVar > NUM_COLUMNS * (ZOOM_QUOTIENT - 1) - 1 ? CORNER_RADIUS : 0,
          borderBottomRightRadius:
            hourVar > NUM_COLUMNS * (ZOOM_QUOTIENT - 1) - 1 ? CORNER_RADIUS : 0,
        },
      ]}>
      {/* <Text>{index}</Text> */}
    </Pressable>
  );
};


// export const oldGetCompactedA = async (
//   selectionIDs: string[],
//   startDate: any,
//   endDate: any,
// ) => {
//   let newStartHour = 24;
//   let newEndHour = 0;
//   const selections = [];
//   for (let i = 0; i < selectionIDs.length; i++) {
//     const selection = await firestore()
//       .collection('Selections')
//       .doc(selectionIDs[i])
//       .get()
//       .then(doc => {
//         return doc.data()!;
//       });
//     selections.push(selection);
//     newStartHour = Math.min(newStartHour, selection.startHour);
//     newEndHour = Math.max(newEndHour, selection.endHour);
//   }
//   const dayLength = newEndHour - newStartHour;
//   const duration = differenceInWeeks(endDate.toDate(), startDate.toDate());
//   const arrayOfZeros = new Array(dayLength * 32).fill(0);
//   const compactedA: CompactedAvailability = {};
//   const fieldsToRemove = [
//     'userID',
//     'startHour',
//     'endHour',
//     'title',
//     'userName',
//   ];
//   for (let i = 0; i < selections.length; i++) {
//     const selection = selections[i];
//     const currentName = selection.userName;
//     const startIndex = (selection.startHour - newStartHour) * 32;
//     fieldsToRemove.forEach(field => {
//       delete selection[field];
//     });
//     compactedA[currentName] = [...arrayOfZeros];
//     for (let j = 0; j < duration; j++) {
//       const closestDateKey = getClosestDate(
//         formatDate(addWeeks(startDate.toDate(), j)),
//         selection,
//       );
//       const numberArray = selection[closestDateKey].map((value: boolean) =>
//         value ? 1 : 0,
//       );
//       const addedArray = [...compactedA[currentName]];
//       for (let k = 0; k < numberArray.length; k++) {
//         addedArray[k + startIndex] =
//           addedArray[k + startIndex] + numberArray[k];
//       }
//       compactedA[currentName] = addedArray;
//     }
//   }
//   return [compactedA, newStartHour, newEndHour];
// };
