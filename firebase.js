import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

 
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAO9FQOrl-DzEwFJBN9RR59T-lxn8RsoB4",
  authDomain: "fastugadriver-taes.firebaseapp.com",
  projectId: "fastugadriver-taes",
  storageBucket: "fastugadriver-taes.appspot.com",
  messagingSenderId: "169236192365",
  appId: "1:169236192365:web:c7149e73e6738e0a353364",
};

let app;

if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

const db = app.firestore();
const auth = firebase.auth;

export { db, auth, firebase };
