import React from "react";
import { StyleSheet } from "react-native";
import { theme } from "../core/theme";
import { ActivityIndicator, Card, Text } from "react-native-paper";

export default function StatisticsCard(props) {
  return (
    <Card style={styles.card}>
      <Card.Title
        titleStyle={{ ...styles.cardTitle }}
        title={
          props.data.isLoading ? (
            <ActivityIndicator theme={theme} />
          ) : (
            props.data.value
          )
        }
      />
      <Card.Content>
        <Text style={styles.cardText}>{props.data.title}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "46.5%",
    margin: 10,
  },

  cardTitle: {
    marginTop: 17,
    fontWeight: "900",
    fontSize: 24,
    color: theme.colors.primary,
  },

  cardText: {
    color: theme.colors.secondary,
    fontWeight: "700",
    fontSize: 13.5,
  },
});
