// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpd4jfPdddWLVpBfE70zPsTOexmwN2o2c",
  authDomain: "tmt-clnt.firebaseapp.com",
  projectId: "tmt-clnt",
  storageBucket: "tmt-clnt.firebasestorage.app",
  messagingSenderId: "201782516514",
  appId: "1:201782516514:web:26557aa17448849f89a37b",
  measurementId: "G-D7ZXJGX0R3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
