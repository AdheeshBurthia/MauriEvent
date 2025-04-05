import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useState, useRef, useEffect, useContext } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";

const Camera = ({ setImage, setShowCamera }) => {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [flashMode, setFlashMode] = useState("off");
  const cameraRef = useRef(null);

  //Request camera permission
  useEffect(() => {
    requestPermission();
  }, []);

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

  function toggleCameraFacing() {
    console.log("Toggling camera facing");
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const toggleFlash = () => {
    setFlashMode((current) => (current === "on" ? "off" : "on"));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        skipProcessing: true,
      });
      setImage(photo.uri);
      setShowCamera(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        flash={flashMode}
        ref={cameraRef}
      >
        <View style={styles.shutterContainer}>
          <TouchableOpacity style={styles.flash} onPress={toggleFlash}>
            <Ionicons
              name={flashMode == "on" ? "flash" : "flash-off"}
              size={32}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.outerCircle} onPress={takePicture}>
            <View style={styles.innerCircle}></View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchCamera}
            onPress={toggleCameraFacing}
          >
            <FontAwesome6 name="camera-rotate" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

export default Camera;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  displayImage: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  actionButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 50,
    height: 40,
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
  outerCircle: {
    borderColor: "white",
    borderWidth: 3,
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    backgroundColor: "white",
    borderRadius: 50,
    width: 50,
    height: 50,
  },
  switchCamera: {
    position: "absolute",
    bottom: 20,
    right: 60,
  },
  flash: {
    position: "absolute",
    bottom: 20,
    left: 60,
  },
});
