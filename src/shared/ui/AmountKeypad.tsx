// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// interface AmountKeypadProps {
//   onNumberPress: (number: string) => void;
//   onBackspacePress: () => void;
//   onClearPress: () => void;
//   onSubmitPress: () => void;
//   submitDisabled?: boolean;
// }

// const AmountKeypad: React.FC<AmountKeypadProps> = ({
//   onNumberPress,
//   onBackspacePress,
//   onClearPress,
//   onSubmitPress,
//   submitDisabled = false,
// }) => {
//   const renderNumberButton = (number: string) => (
//     <TouchableOpacity
//       style={styles.button}
//       onPress={() => onNumberPress(number)}
//     >
//       <Text style={styles.buttonText}>{number}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.row}>
//         {renderNumberButton('1')}
//         {renderNumberButton('2')}
//         {renderNumberButton('3')}
//       </View>
//       <View style={styles.row}>
//         {renderNumberButton('4')}
//         {renderNumberButton('5')}
//         {renderNumberButton('6')}
//       </View>
//       <View style={styles.row}>
//         {renderNumberButton('7')}
//         {renderNumberButton('8')}
//         {renderNumberButton('9')}
//       </View>
//       <View style={styles.row}>
//         <TouchableOpacity
//           style={[styles.button, styles.specialButton]}
//           onPress={onClearPress}
//         >
//           <Text style={styles.specialButtonText}>C</Text>
//         </TouchableOpacity>
//         {renderNumberButton('0')}
//         <TouchableOpacity
//           style={[styles.button, styles.specialButton]}
//           onPress={onBackspacePress}
//         >
//           <Text style={styles.specialButtonText}>⌫</Text>
//         </TouchableOpacity>
//       </View>
//       <View style={styles.row}>
//         <TouchableOpacity
//           style={[styles.submitButton, submitDisabled && styles.submitButtonDisabled]}
//           onPress={onSubmitPress}
//           disabled={submitDisabled}
//         >
//           <Text style={styles.submitButtonText}>Confirm Amount</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 15,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   button: {
//     flex: 1,
//     aspectRatio: 1,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 35,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginHorizontal: 10,
//   },
//   buttonText: {
//     fontSize: 22,
//     fontWeight: '600',
//     color: '#333',
//   },
//   specialButton: {
//     backgroundColor: '#e0e0e0',
//   },
//   specialButtonText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#666',
//   },
//   submitButton: {
//     flex: 1,
//     backgroundColor: '#007AFF',
//     borderRadius: 8,
//     paddingVertical: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginHorizontal: 5,
//   },
//   submitButtonDisabled: {
//     backgroundColor: '#cccccc',
//   },
//   submitButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default AmountKeypad;