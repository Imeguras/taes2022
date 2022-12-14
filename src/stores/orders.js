import { db, firebase } from "../../firebase";
import { getCoordsDistanceFromRestaurant } from "../utils/locationUtil";
import { query, where, collection, getDocs } from "firebase/firestore";
import { updateStatistics } from "./statistics";
import {
  DELIVERED,
  DELIVERING,
  DELIVERY_PROBLEM,
  READY_PICK_UP,
} from "../utils/utils";
import {Notifications} from 'react-native-notifications';

export async function updateOrderAPI(order, newStatus, user, justification) {
  if (newStatus == DELIVERED || newStatus == DELIVERY_PROBLEM) {
    updateStatistics({
      order: order,
      userID: user.id,
      newStatus: newStatus,
      earnings: calculateOrderEarnings(order.distance),
      previousCustomers: await getListOfPreviousCustomers(user.id),
    });
  }

  let updateObj = {};

  if (newStatus == DELIVERED) {
    user.balance = user.balance + calculateOrderEarnings(order.distance);
    await db.collection("users").doc(user.id).update(user);

    //Adds the delivered timestamp
    updateObj = {
      ...updateObj,
      delivery_end: firebase.firestore.FieldValue.serverTimestamp(),
    };
  }

  if (newStatus == DELIVERING) {
    //Adds the start delivery timestamp
    updateObj = {
      ...updateObj,
      delivery_start: firebase.firestore.FieldValue.serverTimestamp(),
    };
  }

  updateObj = newStatus
    ? {
        ...updateObj,
        assigned_driver: user.id,
        status: newStatus,
        cancel_justification: justification,
      }
    : { ...updateObj, assigned_driver: user.id };

  newStatus == DELIVERED && {
    ...updateObj,
    delivery_end: firebase.firestore.FieldValue.serverTimestamp(),
  };

  return await db.collection("orders").doc(order.key).update(updateObj);
}

export async function fetchUnassignedOrdersAPI() {
  const unssOrdersQuery = query(
    collection(db, "orders"),
    where("assigned_driver", "==", ""),
    where("status", "<", DELIVERED)
  );

  return await getDocs(unssOrdersQuery);
}

export async function fetchDriverOrdersAPI(id) {
  const driverOrderQuery = query(
    collection(db, "orders"),
    where("assigned_driver", "==", id),
    where("status", "<", DELIVERED)
  );

  return await getDocs(driverOrderQuery);
}

export async function fetchDriverFinishedOrdersAPI(id) {
  const driverOrderQuery = query(
    collection(db, "orders"),
    where("assigned_driver", "==", id),
    where("status", ">", DELIVERING)
  );

  return await getDocs(driverOrderQuery);
}

async function getListOfPreviousCustomers(userID) {
  const customers = [];
  await fetchDriverFinishedOrdersAPI(userID).then((res) => {
    res.docs.map((doc) => {
      customers.push(doc.data().customer);
    })[0];
  });

  return customers;
}

export function getOrderStatusText(status) {
  switch (status) {
    case DELIVERY_PROBLEM:
      return "Cancelled";

    case DELIVERED:
      return "Delivered";

    case DELIVERING:
      return "Delivering";

    case READY_PICK_UP:
      return "Ready for pick-up";

    default:
      return "Preparing";
  }
}
export function formatOrders(orderList) {
  return orderList.map((item) => {
    return {
      key: item.key,
      status: item.status,
      customer: item.customer,
      assigned: !!item.assigned_driver,
      price: item.price,
      number_items: item.number_items,
      //distance to fastuga restaurant
      distance: getCoordsDistanceFromRestaurant(item.delivery_coords),
      coords: {
        latitude: item.delivery_coords.latitude,
        longitude: item.delivery_coords.longitude,
      },
      delivery_start: item.delivery_start ? item.delivery_start : "",
      delivery_end: item.delivery_end ? item.delivery_end : "",
    };
  });
}

export function calculateOrderEarnings(distance) {
  //Drivers earn fixed fees: 2€ per routes up until 3 km; 3€ per routes up until 10 km; and, 4€ for routes of greater length.
  if (distance <= 3.0) {
    return 2;
  } else if (distance <= 10.0) {
    return 3;
  } else {
    return 4;
  }
}
