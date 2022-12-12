import { RefreshControl, SafeAreaView, View, StyleSheet, ScrollView } from "react-native";
import { Card, Text } from "react-native-paper";
import { React, useEffect, useState } from "react";
import { db } from "../../firebase";
import { query, where, collection, getDocs } from "firebase/firestore";

const wait = timeout => {
	return new Promise(resolve => setTimeout(resolve, timeout));
  };
export default function NotificationHistory({ route, navigation }) {

	const user = route.params.id;

	
	const [refreshing, setRefreshing] = useState(false);
	const [notifications, setNotifications] = useState([]);
	//TODO "Store" this
	async function fetchNotifications() {
		
		// fetch notifications on collection notifications where owner == user
		t=query(
			collection(db, "notifications"),
			where("owner", "==", user.id))
		getDocs(t).then((querySnapshot) => {
				let temp = [];
				
				
				querySnapshot.forEach((doc) => {
				//setNotifications(temp);
				
					temp=[...temp, doc.data()];
				})
				setNotifications(temp);
			})
			.catch((error) => {
				console.log("Error getting documents: ", error);
			});
	}
	useEffect(()=>{
		refresh();
	})
	async function refresh() {
		await fetchNotifications();
	}
	const onRefresh= async () => {
		setRefreshing(true);
		await refresh();
		wait(500).then(() => setRefreshing(false));
	}
	
	return (
		<SafeAreaView>
		<ScrollView refreshControl={
			  <RefreshControl
				refreshing={refreshing}
				onRefresh={onRefresh}
				/>
		}	
	  >
		<View>
			<Card>
				{notifications.map((notification, index) => (
					<View key={index}>
						<Text>{notification.message+" |-> "+notification.created_on.toDate(
						).toString()}</Text>

					</View>
				))}
			</Card>
		</View>
		
		</ScrollView>
		</SafeAreaView>
	)
}