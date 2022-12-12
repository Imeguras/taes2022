import Directions from "../components/Directions";
import { FASTUGA_LOCATION } from "../utils/locationUtil";

export default function OrderDetails({ route, navigation }) {
  const destinationCoords =
    route.params.data.status == 3 ? route.params.data.coords : FASTUGA_LOCATION;

  return <Directions destinationCoords={destinationCoords} />;
}
