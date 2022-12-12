import { View, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { Button, Card, FAB, Provider, Text } from "react-native-paper";
import { errorToast, theme } from "../core/theme";
import { getOrderStatusText } from "../stores/orders";
import { db } from "../../firebase";
import { useEffect, useState } from "react";
import Maps from "../components/Maps";
import * as Location from "expo-location";
import { useToast } from "react-native-styled-toast";
import { order } from "styled-system";

export default function OrderDetails({ route, navigation }) {
  const [customer, setCustomer] = useState({});

  useEffect(() => {
    (async () => {
      await getLocation();
      await fetchCustomerData();
    })();
  }, []);

  const { toast } = useToast();
  async function getLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      toast(errorToast("Location Permission not granted"));
      return navigation.goBack();
    }
  }

  async function fetchCustomerData() {
    await db
      .collection("customers")
      .doc(route.params.customer)
      .get()
      .then(async (res) => {
        if (res.exists) setCustomer(await res.data());
      });
  }

  return (
    <ScrollView>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Order ID</Text>
        <Text style={styles.cardText}>{route.params.key}</Text>

        <Text style={styles.cardTitle}>Status</Text>
        <Text style={styles.cardText}>
          {getOrderStatusText(route.params.status)}
        </Text>

        <View style={styles.row}>
          <View>
            <Text style={styles.cardTitle}>Quantity</Text>
            <Text style={styles.cardText}>
              {route.params.number_items} items
            </Text>
          </View>

          <View style={{ marginLeft: 64 }}>
            <Text style={styles.cardTitle}>Price</Text>
            <Text style={styles.cardText}>{route.params.price}€</Text>
          </View>
        </View>
      </Card>
      <Maps
        viewDirectionsCallback={() => {
          const order = route.params;
          navigation.navigate("MapDirections", {
            name:
              order.status == 2
                ? `Picking-up Order (${order.number_items} ${
                    order.number_items == 1 ? "item" : "items"
                  })`
                : `Delivering to ${customer.name}`,
            data: order,
          });
        }}
        order={route.params}
        customer={customer}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginHorizontal: 20,
    marginTop: 14,
  },

  cardTitle: {
    color: theme.colors.primary,
    fontSize: 17,
    paddingTop: 14,
    fontWeight: "600",
  },

  cardText: {
    fontWeight: "700",
    fontSize: 14.5,
    color: "#4f5d5e",
  },

  row: {
    flexDirection: "row",
    overflow: "hidden",
  },
});
