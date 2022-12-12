import React from "react";
import { StyleSheet, View } from "react-native";
import { Badge, Button, IconButton, List, Text } from "react-native-paper";
import { theme } from "../core/theme";
import {
  formatOrders,
  getOrderStatusText,
  updateOrderAPI,
  calculateOrderEarnings,
} from "../stores/orders";
import { DELIVERED, DELIVERING, PREPARING } from "../utils/utils";

export default class OrderList extends React.Component {
  async updateOrder(order, newStatus, user) {
    await updateOrderAPI(order, newStatus, user, "").finally(() => {
      this.props.updateCallback();
    });
  }

  pressOrderItem(order) {
    this.props.onPressOrder(order);
  }

  render() {
    const orders = formatOrders(this.props.data);
    const user = this.props.user;
    return orders.length > 0 ? (
      orders.map((order, index) => (
        <View key={index}>
          <List.Item
            key={index}
            style={{
              marginLeft: -16,
              marginRight: -16,
            }}
            title={order.key.slice(0, 16)}
            descriptionStyle={{ fontWeight: "bold" }}
            onPress={() => this.pressOrderItem(order)}
            disabled={this.props.isLoading}
            description={() => (
              <View style={{ flexDirection: "row" }}>
                <Text style={{ fontWeight: "700" }}>
                  {getOrderStatusText(order.status)}
                </Text>
                <Badge style={{ ...styles.badge, backgroundColor: "grey" }}>
                  {order.distance} km
                </Badge>
                <Badge
                  style={{
                    ...styles.badge,
                    backgroundColor: theme.colors.primary,
                  }}
                >
                  {calculateOrderEarnings(order.distance)}€
                </Badge>
              </View>
            )}
            right={() =>
              order.assigned ? (
                order.status == PREPARING ? (
                  <View />
                ) : order.status == DELIVERING ? (
                  <View style={{ flexDirection: "row", marginRight: -15 }}>
                    <IconButton
                      icon="close"
                      size={23}
                      mode="contained"
                      containerColor="red"
                      iconColor="white"
                      onPress={() => this.props.cancelCallback(order)}
                      disabled={this.props.isLoading}
                    />
                    <IconButton
                      icon="check"
                      size={23}
                      mode="contained"
                      containerColor="green"
                      iconColor="white"
                      onPress={() => this.updateOrder(order, DELIVERED, user)}
                      disabled={this.props.isLoading}
                    />
                  </View>
                ) : (
                  <View style={{ marginRight: -10 }}>
                    <Button
                      mode="contained"
                      buttonColor={theme.colors.secondary}
                      onPress={() => this.updateOrder(order, DELIVERING, user)}
                      disabled={this.props.isLoading}
                      labelStyle={{ marginLeft: 12, marginRight: 12 }}
                    >
                      Picked up
                    </Button>
                  </View>
                )
              ) : (
                <Button
                  icon="clipboard-arrow-down"
                  mode="contained"
                  buttonColor={theme.colors.primary}
                  onPress={() => this.updateOrder(order, "", user)}
                  disabled={this.props.isLoading}
                  style={{ marginRight: -12 }}
                >
                  Assign!
                </Button>
              )
            }
          />
        </View>
      ))
    ) : (
      <Text style={{ fontStyle: "italic", color: "grey", paddingVertical: 10 }}>
        There are no orders..
      </Text>
    );
  }
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 5,
    marginBottom: -1,
    marginLeft: 5,
    fontWeight: "700",
  },
});
