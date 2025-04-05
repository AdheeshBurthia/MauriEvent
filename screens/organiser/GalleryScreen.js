import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { Badge } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";

import Logo from "../../assets/logo.png";
import FontFamily from "../../constants/Fonts";
import Colours from "../../constants/Colours";
import GalleryPhotos from "./GalleryPhotos";
import GalleryVideos from "./GalleryVideos";
import { AuthContext } from "../../context/AuthContext";

const PhotosRoute = () => <GalleryPhotos />;

const VideosRoute = () => <GalleryVideos />;

const renderScene = SceneMap({
  Photos: PhotosRoute,
  Videos: VideosRoute,
});

const renderTabBar = (props) => (
  <TabBar
    {...props}
    indicatorStyle={styles.indicator}
    style={styles.tabBar}
    activeColor={Colours.primary}
    inactiveColor={Colours.extraLightText}
    renderLabel={({ route, focused, color }) => (
      <View style={focused ? styles.activeTab : styles.inactiveTab}>
        <Text style={{ color, fontFamily: FontFamily.bold, fontSize: 15 }}>
          {route.title}
        </Text>
      </View>
    )}
    pressColor="transparent"
  />
);

const GalleryScreen = ({ navigation }) => {
  const { userNotifications } = useContext(AuthContext);
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "Photos", title: "Photos" },
    { key: "Videos", title: "Videos" },
  ]);

  const handleDelete = () => {
    alert("You have to long press on the image/video to delete it.");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={Logo} style={styles.logo} />
          <Text style={styles.title}>Gallery</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notifications} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={22} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notifications}
            onPress={() => navigation.navigate("Notification")}
          >
            <Ionicons name="notifications-outline" size={22} color="black" />
            {userNotifications?.unReadCount > 0 && (
              <Badge size={6} style={styles.badge}></Badge>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
      />
      <StatusBar style="auto" />
    </View>
  );
};

export default GalleryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    paddingTop: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notifications: {
    position: "relative",
    marginRight: 16,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  logo: {
    width: 70,
    height: 30,
  },
  title: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    paddingBottom: 2,
  },
  indicator: {
    backgroundColor: Colours.primary,
  },
  tabBar: {
    backgroundColor: "white",
  },
});
