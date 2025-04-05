import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons if needed
import Colours from "../constants/Colours";
import FontFamily from "../constants/Fonts";

const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.goBack}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colours.extraLightText}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
      </View>

      <ScrollView style={styles.body}>
        <Text style={styles.privacyHeader}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last updated: [21 Jun 2024]</Text>

        <Text style={styles.sectionTitle}>MauriEvent</Text>
        <Text style={styles.paragraph}>
          ("us", "we", or "our") operates the MauriEvent mobile application (the
          "Service").
        </Text>

        <Text style={styles.paragraph}>
          This page informs you of our policies regarding the collection, use,
          and disclosure of personal data when you use our Service and the
          choices you have associated with that data.
        </Text>

        <Text style={styles.sectionTitle}>Information Collection and Use</Text>
        <Text style={styles.paragraph}>
          We collect several different types of information for various purposes
          to provide and improve our Service to you.
        </Text>

        <Text style={styles.subTitle}>Types of Data Collected</Text>
        <Text style={styles.heading3}>- Personal Data:</Text>
        <Text style={styles.paragraph}>
          While using our Service, we may ask you to provide us with certain
          personally identifiable information that can be used to contact or
          identify you ("Personal Data"). Personally identifiable information
          may include, but is not limited to:
        </Text>
        <Text style={styles.heading3}>- Email address</Text>
        <Text style={styles.heading3}>- Username</Text>
        <Text style={styles.heading3}>- Credit Card</Text>
        <Text style={styles.heading3}>- Cookies and Usage Data</Text>

        <Text style={styles.subTitle}>Usage Data</Text>
        <Text style={styles.paragraph}>
          We may also collect information on how the Service is accessed and
          used ("Usage Data"). This Usage Data may include information such as
          your device's Internet Protocol address (e.g. IP address), browser
          type, browser version, the pages of our Service that you visit, the
          time and date of your visit, the time spent on those pages, unique
          device identifiers and other diagnostic data.
        </Text>

        <Text style={styles.sectionTitle}>Use of Data</Text>
        <Text style={styles.paragraph}>
          MauriEvent uses the collected data for various purposes:
        </Text>
        <Text style={styles.heading3}>
          - To provide and maintain the Service
        </Text>
        <Text style={styles.heading3}>
          - To notify you about changes to our Service
        </Text>
        <Text style={styles.heading3}>
          - To allow you to participate in interactive features of our Service
          when you choose to do so
        </Text>
        <Text style={styles.heading3}>
          - To provide customer care and support
        </Text>
        <Text style={styles.heading3}>
          - To provide analysis or valuable information so that we can improve
          the Service
        </Text>
        <Text style={styles.heading3}>
          - To monitor the usage of the Service
        </Text>
        <Text style={styles.heading3}>
          - To detect, prevent and address technical issues
        </Text>

        <Text style={styles.sectionTitle}>Transfer of Data</Text>
        <Text style={styles.paragraph}>
          Your information, including Personal Data, may be transferred to — and
          maintained on — computers located outside of your state, province,
          country or other governmental jurisdiction where the data protection
          laws may differ from those of your jurisdiction.
        </Text>
        <Text style={styles.paragraph}>
          If you are located outside Mauritius and choose to provide information
          to us, please note that we transfer the data, including Personal Data,
          to Mauritius and process it there.
        </Text>
        <Text style={styles.paragraph}>
          Your consent to this Privacy Policy followed by your submission of
          such information represents your agreement to that transfer.
        </Text>

        <Text style={styles.sectionTitle}>Disclosure of Data</Text>
        <Text style={styles.paragraph}>
          MauriEvent may disclose your Personal Data in the good faith belief
          that such action is necessary to:
        </Text>
        <Text style={styles.heading3}>- To comply with a legal obligation</Text>
        <Text style={styles.heading3}>
          - To protect and defend the rights or property of MauriEvent
        </Text>
        <Text style={styles.heading3}>
          - To prevent or investigate possible wrongdoing in connection with the
          Service
        </Text>
        <Text style={styles.heading3}>
          - To protect the personal safety of users of the Service or the public
        </Text>
        <Text style={styles.heading3}>
          - To protect against legal liability
        </Text>

        <Text style={styles.sectionTitle}>Security of Data</Text>
        <Text style={styles.paragraph}>
          The security of your data is important to us, and we take steps to
          protect it. Credit card information provided by users or organizers is
          encrypted and securely stored. However, please note that no method of
          transmission over the Internet, or method of electronic storage is
          100% secure. While we strive to use commercially acceptable means to
          protect your Personal Data, we cannot guarantee its absolute security.
        </Text>

        <Text style={styles.sectionTitle}>Service Providers</Text>
        <Text style={styles.paragraph}>
          We may employ third party companies and individuals to facilitate our
          Service ("Service Providers"), to provide the Service on our behalf,
          to perform Service-related services or to assist us in analyzing how
          our Service is used.
        </Text>
        <Text style={styles.paragraph}>
          These third parties have access to your Personal Data only to perform
          these tasks on our behalf and are obligated not to disclose or use it
          for any other purpose.
        </Text>

        <Text style={styles.sectionTitle}>Links to Other Sites</Text>
        <Text style={styles.paragraph}>
          Our Service may contain links to other sites that are not operated by
          us. If you click on a third party link, you will be directed to that
          third party's site. We strongly advise you to review the Privacy
          Policy of every site you visit.
        </Text>
        <Text style={styles.paragraph}>
          We have no control over and assume no responsibility for the content,
          privacy policies or practices of any third party sites or services.
        </Text>

        <Text style={styles.sectionTitle}>Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our Service does not address anyone under the age of 18 ("Children").
        </Text>
        <Text style={styles.paragraph}>
          We do not knowingly collect personally identifiable information from
          anyone under the age of 18. If you are a parent or guardian and you
          are aware that your Children has provided us with Personal Data,
          please contact us. If we become aware that we have collected Personal
          Data from children without verification of parental consent, we take
          steps to remove that information from our servers.
        </Text>

        <Text style={styles.sectionTitle}>Changes to This Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update our Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page.
        </Text>
        <Text style={styles.paragraph}>
          You are advised to review this Privacy Policy periodically for any
          changes. Changes to this Privacy Policy are effective when they are
          posted on this page.
        </Text>

        <Text style={styles.sectionTitle}>Refund Policy</Text>
        <Text style={styles.paragraph}>
          The following refund policy applies to purchases made through our
          Service:
        </Text>

        <Text style={styles.refundPolicyItem}>
          - 0 days (event is today or in the past): No refund will be provided.
        </Text>
        <Text style={styles.refundPolicyItem}>
          - 1-7 days: A 50% refund will be issued.
        </Text>
        <Text style={styles.refundPolicyItem}>
          - 8 or more days: A 100% refund will be provided.
        </Text>

        <Text style={styles.paragraph}>
          Please contact us if you have any questions about our refund policy.
        </Text>

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text>
          If you have any questions about this Privacy Policy, please contact
          us:
        </Text>
        <Text style={styles.contact}>
          By email: adheeshburthia1234@gmail.com
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 42,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 16,
  },
  goBack: {
    marginRight: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    paddingBottom: 2,
  },

  body: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  privacyHeader: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
    marginBottom: 10,
  },
  heading3: {
    fontFamily: FontFamily.medium,
  },
  lastUpdated: {
    fontSize: 12,
    marginBottom: 10,
    fontFamily: FontFamily.regular,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    marginTop: 20,
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    marginBottom: 5,
  },
  paragraph: {
    marginBottom: 10,
    fontFamily: FontFamily.regular,
  },
  contact: {
    marginTop: 20,
    marginBottom: 40,
    fontFamily: FontFamily.regular,
  },
});

export default PrivacyPolicyScreen;
