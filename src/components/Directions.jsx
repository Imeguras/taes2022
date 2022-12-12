import MapView, { AnimatedRegion, Marker } from "react-native-maps";
import React from "react";
import { theme } from "../core/theme";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";
import { FASTUGA_LOCATION, GOOGLE_MAPS_APIKEY } from "../utils/locationUtil";
import { Image } from "react-native";

const LATITUDE_DELTA = 0.0025;
const LONGITUDE_DELTA = 0.0025;
const LATITUDE = FASTUGA_LOCATION.latitude;
const LONGITUDE = FASTUGA_LOCATION.latitude;

export default class Directions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      distanceTravelled: 0,
      prevLatLng: {},
      coordinate: new AnimatedRegion({
        latitude: LATITUDE,
        longitude: LONGITUDE,
      }),
    };
  }

  async componentDidMount() {
    await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High },
      (position) => {
        const { coordinate } = this.state;
        const { latitude, longitude } = position.coords;

        const newCoordinate = { latitude, longitude };

        if (coordinate) {
          coordinate.timing(newCoordinate).start();
        }

        this.setState({
          latitude,
          longitude,
          prevLatLng: newCoordinate,
        });
      },
      (error) => console.log(error)
    );
  }

  getMapRegion = () => ({
    latitude: this.state.latitude,
    longitude: this.state.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  render() {
    return (
      <MapView
        showUserLocation
        followUserLocation
        loadingEnabled
        loadingIndicatorColor={theme.colors.primary}
        style={{
          width: "100%",
          height: "100%",
        }}
        region={this.getMapRegion()}
      >
        <Marker
          coordinate={this.props.destinationCoords}
          title={"Destination"}
        />

        <Marker.Animated
          ref={(marker) => {
            this.marker = marker;
          }}
          coordinate={this.state.coordinate}
          anchor={{ x: 0.5, y: 0.6 }}
        >
          <Image
            source={require("../assets/thumb-map.png")}
            style={{ width: 35, height: 35 }}
          />
        </Marker.Animated>

        <MapViewDirections
          origin={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
          }}
          destination={this.props.destinationCoords}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={6}
          strokeColor={theme.colors.secondary}
          optimizeWaypoints={true}
        />
      </MapView>
    );
  }
}
