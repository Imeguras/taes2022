import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
const FCM = require('fcm-notification');
const serverKey='./privatekey.json';
const fcm = new FCM(serverKey);
// Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyAO9FQOrl-DzEwFJBN9RR59T-lxn8RsoB4",
	authDomain: "fastugadriver-taes.firebaseapp.com",
	projectId: "fastugadriver-taes",
	storageBucket: "fastugadriver-taes.appspot.com",
	messagingSenderId: "169236192365",
	appId: "1:169236192365:web:c7149e73e6738e0a353364",
	measurementId: "G-7LHG2G85ZH"
  };
  
  

let app;

  app = firebase.initializeApp(firebaseConfig);
  
  //messaging = getMessaging(app); 



const db = app.firestore();
//erase all documents from notifications
const doStuff = async () => {
db.collection("notifications").get().then((querySnapshot) => {
	querySnapshot.forEach((doc) => {
		doc.ref.delete();
	});
}
);
// set order addressed to false
db.collection("orders").get().then((querySnapshot) => {
	querySnapshot.forEach((doc) => {
		doc.ref.update({addressed: false});
	});
});
}
doStuff().then(() => {
	console.log("done");
});
