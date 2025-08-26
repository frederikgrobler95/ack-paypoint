// import React from 'react';
// import { View, StyleSheet } from 'react-native';
// import WebQrScanner from './WebQrScanner';

// interface QrScannerProps {
//   onCodeScanned: (data: string) => void;
//   showFlashlight?: boolean;
//   isActive?: boolean; // to control scanning state
//   onClose?: () => void; // optional close callback
//   scannerSize?: { width: number; height: number }; // custom scanner frame size
// }

// const QrScanner: React.FC<QrScannerProps> = ({
//   onCodeScanned,
//   showFlashlight = false,
//   isActive = true,
//   onClose,
//   scannerSize,
// }) => {
//   // The web scanner handles its own state and UI
//   // We pass through the props that WebQrScanner might need, though it currently only uses onCodeScanned
//   return (
//     <View style={styles.container}>
//       <WebQrScanner onCodeScanned={onCodeScanned} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     height: '100%',
//     bottom: 0,
//   },
// });

// export default QrScanner;