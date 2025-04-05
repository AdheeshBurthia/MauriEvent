import CryptoJS from "react-native-crypto-js";

const encryptData = (data, key) => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

const decryptData = (data, key) => {
  return CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
};

export { encryptData, decryptData };
