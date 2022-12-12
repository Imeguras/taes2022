import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { React, useEffect, useState } from "react";
import OrderList from "../components/OrderList";
import messaging from "@react-native-firebase/messaging"; 
import {
  Card,
  Checkbox, 
  Divider,
  ProgressBar,
  Button,
  Dialog,
  Portal,
  Provider,
  Text,
  IconButton,
} from "react-native-paper";
import {
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import { db } from "../../firebase";
import { theme } from "../core/theme";
import {
  DELIVERY_PROBLEM,
  fetchDriverOrdersAPI,
  fetchUnassignedOrdersAPI,
  updateOrderAPI,
} from "../stores/orders";
import TextInput from "../components/TextInput";
const wait = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

export default function Dashboard({ route, navigation }) {
  const [user, setUser] = useState(null);
  const [order, setOrder] = useState([]);
  const [selfOrder, setSelfOrder] = useState([]);
  const [tkn, setTkn] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [visible, setVisible] = useState(false);
  const [notifationsBool, setNotifationsBool] = useState(true);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);
  const [justification, setJustification] = useState({ value: "", error: "" });
  const [orderBeingCancelled, setOrderBeingCancelled] = useState(null);


  async function fetchSettings() {
	await AsyncStorage.getItem("@notifationsBool").then((res) => {
		setNotifationsBool(res);
	}).catch((error) => alert(error));
  }
  //on drag down refresh page
  async function fetchPrivateInfo() {
    try {
      let userID;
      await AsyncStorage.getItem("@userData").then((res) => {
        userID = res ? JSON.parse(res).id : route.params.id;
        setUser(JSON.parse(res));
      });

      await db
        .collection("users")
        .doc(userID)
        .get()
        .then(async (snapshot) => {
          if (snapshot.exists) {
            setUser({ ...snapshot.data(), id: userID });
          }
		  
		  
          await fetchDriverOrdersAPI(snapshot.id).then((orders) => {
            setSelfOrder(
              orders.docs.map((doc) => {
                return { key: doc.id, ...doc.data() };
              })
            );
          });
        })
        .catch((error) => console.log(error));

      await getAssignedOrders(userID ? userID : route.params.id);
    } catch (error) {
      console.log(error);
    }
  }

  async function getUnassignedOrders() {
    await fetchUnassignedOrdersAPI()
      .then((orders) => {
        setOrder(
          orders.docs.map((doc) => {
            return { key: doc.id, ...doc.data() };
          })
        );
      })
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  }

  async function getAssignedOrders(id) {
    await fetchDriverOrdersAPI(id).then((orders) => {
      setSelfOrder(
        orders.docs.map((doc) => {
          return { key: doc.id, ...doc.data() };
        })
      );
    });
  }

  async function cancelOrder() {
    if (!justification.value) {
      return setJustification({
        ...justification,
        error: "Justification can't be empty",
      });
    }

    await updateOrderAPI(
      orderBeingCancelled,
      DELIVERY_PROBLEM,
      user,
      justification.value
    )
      .catch((error) => console.log(error))
      .finally(() => {
        hideDialog();
        setJustification({});
        setOrderBeingCancelled(null);
        refresh();
      });
  }

  function showCancelationDialog(order) {
    setOrderBeingCancelled(order);
    showDialog();
  }

  const logout = (navigation) => {
	messaging().unsubscribeFromTopic(user.id).then().catch((error) => alert(error))
    AsyncStorage.removeItem("@userData");

    navigation.replace("Login");
  };

  function justificationHandler(enteredText) {
    setJustification({ value: enteredText, error: "" });
  }
  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    wait(500).then(() => setRefreshing(false));
  };

  async function refresh() {
    await fetchPrivateInfo();
    await getUnassignedOrders();
	await fetchSettings();
  }

  function viewOrderDetails(order) {
    navigation.navigate("OrderDetails", order);
  }

  useEffect(() => {
    refresh();
	if(notifationsBool){
	AsyncStorage.getItem("@fcmToken").then((res) => {
		setTkn(res);
		messaging().subscribeToTopic(user.id).then().catch((error) => alert(error))
	  });
	}
  }, []);
  
  return (
    <SafeAreaView style={{ height: "100%" }}>
      <Provider style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <StatusBar style="inverted" />
          <View style={styles.dashboard} />
          <View
            style={{
              flexDirection: "row",
              marginTop: 38,
              justifyContent: "space-between",
              width: "100%",
              paddingLeft: 22,
              paddingRight: 8,
            }}
          >
            <Text style={styles.helloText}>{`Hello, ${
              user && user.name ? user.name.split(" ")[0] : "... "
            }! 👋`}</Text>
			<Checkbox
            
            status={notifationsBool ? "checked" : "unchecked"}
            onPress={() => {
				let k = !notifationsBool;
			  AsyncStorage.setItem("@notifationsBool", k);
              setNotifationsBool(k);
            }}
		></Checkbox>
            <IconButton
              icon="logout-variant"
              size={24}
              iconColor="white"
              onPress={() => logout(navigation)}
            />
          </View>
          <View style={styles.cardRow}>
            <Card style={{ ...styles.card, width: "45%" }}>
              <Card.Title
                titleStyle={{ ...styles.cardTitle }}
                title="Balance  💸"
              />
              <Card.Content style={{ paddingTop: 6, marginBottom: -6 }}>
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontWeight: "bold",
                    fontSize: 22,
                  }}
                >{`${user && user.balance ? user.balance : "..."}€`}</Text>
              </Card.Content>
            </Card>
            <Card
              style={{ ...styles.card, width: "45%" }}
              // onPress={() => console.log("ssss")}
            >
              <Card.Title
                titleStyle={{ ...styles.cardTitle }}
                title="Statistics  📊"
              />
              <Card.Content style={{ marginBottom: -6 }}>
                <Text style={{ fontStyle: "italic" }}>
                  View statistics about your work!
                </Text>
              </Card.Content>
            </Card>
          </View>
          <Card style={styles.card}>
            <Card.Title
              title="Available Orders"
              titleStyle={styles.cardTitle}
            />
            {isLoading ? (
              <ProgressBar color={theme.colors.primary} indeterminate={true} />
            ) : (
              <Divider />
            )}
            <Card.Content style={{ marginBottom: -15.75 }}>
              <OrderList
                data={order}
                onPressOrder={viewOrderDetails}
                user={user}
                updateCallback={refresh}
                cancelCallback={showCancelationDialog}
              ></OrderList>
            </Card.Content>
          </Card>
          <Card style={styles.card}>
            <Card.Title title="My Orders" titleStyle={styles.cardTitle} />
            {isLoading ? (
              <ProgressBar color={theme.colors.primary} indeterminate={true} />
            ) : (
              <Divider />
            )}
            <Card.Content style={{ marginBottom: -15.75 }}>
              <OrderList
                data={selfOrder}
                onPressOrder={viewOrderDetails}
                user={user}
                updateCallback={refresh}
                cancelCallback={showCancelationDialog}
              ></OrderList>
            </Card.Content>
          </Card>
		  <Card style={styles.card}>
			<Card.Title title="TODO style this somewhere" titleStyle={styles.cardTitle} />
				<Button onPress={()=>{navigation.replace("NotificationHistory", {"id":user} )}} textColor={theme.colors.primary}>Notification History</Button>
	      </Card>
          <Portal>
            <Dialog
              visible={visible}
              onDismiss={hideDialog}
              style={{ marginBottom: 200 }}
              theme={theme}
            >
              <Dialog.Title>Cancel Order</Dialog.Title>
              <Dialog.Content>
                <TextInput
                  value={justification}
                  label="Justification"
                  onChangeText={justificationHandler}
                  error={justification.error}
                  errorText={justification.error}
                ></TextInput>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={cancelOrder} textColor={theme.colors.primary}>
                  OK
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </ScrollView>
      </Provider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },

  card: {
    alignSelf: "stretch",
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 5,
  },

  cardTitle: {
    fontWeight: "bold",
    fontSize: 19,
    paddingTop: 8,
  },

  cardRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
    paddingHorizontal: 14,
    marginTop: -10,
  },

  helloText: {
    fontWeight: "bold",
    fontSize: 24,
    color: "white",
    paddingTop: 9,
  },

  dashboard: {
    backgroundColor: theme.colors.primary,
    borderBottomEndRadius: 25,
    borderBottomStartRadius: 25,
    paddingBottom: 240,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});
