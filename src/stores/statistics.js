import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { DELIVERED } from "../utils/utils";
import moment from "moment";

export function getTime(mins) {
  let hours = Math.floor(mins / 60);
  let minutes = mins % 60;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return `${hours ? hours + "h" : ""}${Math.round(minutes)}min`;
}

export async function fetchStatisticsAPI(id) {
  const unssOrdersQuery = query(
    collection(db, "statistics"),
    where("driver", "==", id)
  );

  const res = await getDocs(unssOrdersQuery);

  return res.docs.map((doc) => {
    return { ...doc.data(), id: doc.id };
  })[0];
}

export async function updateStatistics({
  order,
  newStatus,
  userID,
  earnings,
  previousCustomers,
}) {
  const statistics = await fetchStatisticsAPI(userID);
  const obj = {};

  //Total Different Customers
  obj.total_different_clients = !previousCustomers.includes(order.customer)
    ? statistics.total_different_clients + 1
    : statistics.total_different_clients;

  if (newStatus == DELIVERED) {
    //Earnings
    obj.total_earnings = statistics.total_earnings + earnings;

    //Total Finished Deliveries
    obj.total_finished_deliveries = statistics.total_finished_deliveries + 1;

    //Furthest Delivery Distance
    obj.furthest_distance =
      statistics.furthest_distance < order.distance
        ? order.distance
        : statistics.furthest_distance;

    //Total Delivery Time
    const minutes_diff = getMinutesDifference(
      order.delivery_start,
      order.delivery_end
    );
    obj.total_time = statistics.total_time + minutes_diff;

    const total_deliveries =
      obj.total_finished_deliveries + statistics.total_cancelled_deliveries;

    //Average Delivery Time
    obj.avg_delivery_time = getNewAverage(
      statistics.avg_delivery_time,
      minutes_diff,
      total_deliveries
    );
  } else {
    //Total Cancelled Deliveries
    obj.total_cancelled_deliveries = statistics.total_cancelled_deliveries + 1;
  }

  await db.collection("statistics").doc(statistics.id).update(obj);
}

function getNewAverage(average, value, nValues) {
  return average + (value - average) / nValues;
}

function getMinutesDifference(start_obj, end_obj) {
  const start = moment(
    new Timestamp(start_obj.seconds, start_obj.nanoseconds).toDate()
  );
  const end = moment(
    new Timestamp(end_obj.seconds, end_obj.nanoseconds).toDate()
  );
  return moment.duration(end.diff(start)).asMinutes();
}
