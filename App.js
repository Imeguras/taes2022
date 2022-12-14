import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ThemeProvider } from "styled-components";
import { ToastProvider } from "react-native-styled-toast";
import { theme } from "./src/core/theme";
import { LogBox } from "react-native";
import LoginScreen from "./src/screens/Login";
import DashboardScreen from "./src/screens/Dashboard";
import RegisterScreen from "./src/screens/Register";
import OrderDetailsScreen from "./src/screens/OrderDetails";
import StatisticsScreen from "./src/screens/Statistics";
import MapDirectionsScreen from "./src/screens/MapDirections";
import ProfileScreen from "./src/screens/Profile";

import NotificationHistoryScreen from "./src/screens/NotificationHistory";
import firebase from '@react-native-firebase/app';
import messaging from "@react-native-firebase/messaging"; 
const Stack = createNativeStackNavigator();

export default function App() {
  LogBox.ignoreLogs([
    "Non-serializable values were found in the navigation state",
    "setNativeProps is deprecated and will be removed in next major release"
  ]);

  const [initScreen, setInitScreen] = useState(null);
  const requestNotificationPermission = async() =>{
	const authStatus= await messaging().requestPermission();
	const enabled=
	authStatus=== messaging.AuthorizationStatus.AUTHORIZED ||
	authStatus=== messaging.AuthorizationStatus.PROVISIONAL;
	if(enabled){
		console.log('Auth status:', authStatus); 
	}
  }	
  useEffect(() => {
    try {
      AsyncStorage.getItem("@userData").then((data) =>
        data !== null ? setInitScreen("Dashboard") : setInitScreen("Login")
      );
    } catch (e) {
      console.log("AsyncStorage Error: ", e);
    }
  }, []);
  useEffect(()=>{
	if(requestNotificationPermission()){
		messaging().getToken().then(token=>{
			AsyncStorage.setItem("@fcmToken", token)
		})
	}else{
		alert("Failed to acquire token for notifications: ", authStatus)
	}
	messaging().getInitialNotification().then(remoteMessage => { 
		if (remoteMessage){
			console.log("Notification opened app from quit", remoteMessage.notification);
			//setInitialRoute(remoteMessage.data.type)
		}
		//setLoading(false); 
	})
	messaging().onNotificationOpenedApp(remoteMessage=>{
		console.log("Notification opened app from background", remoteMessage.notification)
	})
	messaging().setBackgroundMessageHandler(async remoteMessage=>{
		console.log('Message Handled in the background!', remoteMessage)
	})
	const unsub = messaging().onMessage(async remoteMessage=>{
		console.log('A new FCM message arrived', JSON.stringify(remoteMessage))
	})
	return unsub; 
  }, [])
  
  if (initScreen === null) return;

  return (
    <ThemeProvider theme={theme}>
      <ToastProvider offset={100} maxToasts={1}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={initScreen}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="MapDirections"
              component={MapDirectionsScreen}
              options={({ route }) => ({ title: route.params.name })}
            />
            <Stack.Screen
              name="OrderDetails"
              component={OrderDetailsScreen}
              options={{ title: "Order Details" }}
            />
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Statistics" component={StatisticsScreen} />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: "Profile" }}
            />
			<Stack.Screen name="NotificationHistory" options={{ title: "Notification History" }} component={NotificationHistoryScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ToastProvider>
    </ThemeProvider>
  );
}
