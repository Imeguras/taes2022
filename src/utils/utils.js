import AsyncStorage from "@react-native-async-storage/async-storage";;
import { React, useEffect, useState } from "react";
import OrderList from "../components/OrderList";
import messaging from "@react-native-firebase/messaging"; 
import { db } from "../../firebase";
import { theme } from "../core/theme";

export const PREPARING = 1;
export const READY_PICK_UP = 2;
export const DELIVERING = 3;
export const DELIVERED = 4;
export const DELIVERY_PROBLEM = 5;

/*

export const notificationsState = { notifationsBool: notifationsBool, setNotifationsBool: setNotifationsBool}
const  [notifationsBool, setNotifationsBool] = useState(true);

export const subscribeToNotifications = async () => {
	//Too tired to solve this... just deal with it for now
	if(!notifationsBool){
		AsyncStorage.getItem("@fcmToken").then((res) => {
			setTkn(res);
			//messaging().subscribeToTopic(user.id).then().catch((error) => alert(error))
		  });
		alert("You will now receive notifications for new orders")
	}
	else{
		//messaging().unsubscribeFromTopic(user.id).then().catch((error) => alert(error))

		alert("You will no longer receive notifications for new orders")
	}
}
export const fetchSettings= async () =>{
	await AsyncStorage.getItem("@notifationsBool").then((res) => {
		let k = res === "true";
		setNotifationsBool(k);
	}).catch((error) => alert(error));
  }
*/
  