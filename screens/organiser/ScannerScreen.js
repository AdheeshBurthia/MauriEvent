import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useRef, useEffect, useState, useContext } from "react";
import { StyleSheet, Text, View, Animated, Alert } from "react-native";
import { AuthContext } from "../../context/AuthContext";

const CameraScreen = ({ navigation }) => {
  const { scanEvent } = useContext(AuthContext);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const scanLine = useRef(new Animated.Value(0)).current;
  const [isScanning, setIsScanning] = useState(true);

  // Request camera permission
  useEffect(() => {
    requestPermission();
    setIsScanning(true);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLine, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scanLine]);

  const stopScanning = () => {
    setIsScanning(false);
  };

  if (!permission) {
    // Camera permissions are still loading.
    return <Text>Requesting permission...</Text>;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>No access to camera</Text>
      </View>
    );
  }

  const scanLinePosition = scanLine.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300], // Here, 300 is the height of the middleContainer in pixels
  });

  const handleBarcodeScanned = async ({ type, data }) => {
    stopScanning();
    const parsedData = JSON.parse(data);
    try {
      const response = await scanEvent(parsedData.id, parsedData.userId);
      if (response.success) {
        alert("Access Granted");
      } else if (response.message === "notgranted") {
        alert(
          `Ticket already scanned at ${new Date(
            response.dateScanned.seconds * 1000
          ).toLocaleString()}`
        );
      } else if (response.message === "invalid") {
        alert("Ticket is not valid");
      }
    } catch (error) {
      alert("Error scanning event");
      console.log(error);
    } finally {
      setIsScanning(true);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        ref={cameraRef}
        onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
      >
        <View style={styles.overlay}>
          <View style={styles.middleContainer}>
            <View style={styles.topLeftCorner} />
            <View style={styles.topRightCorner} />
            <View style={styles.bottomLeftCorner} />
            <View style={styles.bottomRightCorner} />
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY: scanLinePosition }] },
              ]}
            />
          </View>
        </View>
        <View style={styles.shutterContainer}></View>
      </CameraView>
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  shutterContainer: {
    flexDirection: "row",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    marginBottom: 30,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  middleContainer: {
    width: "80%",
    height: 300, // Fixed height for interpolation
    position: "relative",
  },
  topLeftCorner: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 20,
    height: 20,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "white",
  },
  topRightCorner: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: "white",
  },
  bottomLeftCorner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: "white",
  },
  bottomRightCorner: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "white",
  },
  scanLine: {
    width: "100%",
    height: 2,
    backgroundColor: "red",
    position: "absolute",
  },
});
