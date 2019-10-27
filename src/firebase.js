import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var firebaseConfig = {
  apiKey: "AIzaSyD7XgnnByMvr206X-eCYXExMuYEBW21YsM",
  authDomain: "react-slack-clone-000.firebaseapp.com",
  databaseURL: "https://react-slack-clone-000.firebaseio.com",
  projectId: "react-slack-clone-000",
  storageBucket: "react-slack-clone-000.appspot.com",
  messagingSenderId: "1092136953427",
  appId: "1:1092136953427:web:baaba14f1630b868f748a6"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
