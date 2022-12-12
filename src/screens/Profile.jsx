import React from "react";
import TextInput from "../components/TextInput";
import { capitalize, phoneRegExp, plateRegExp } from "../helpers/helper";
import { View, ScrollView } from "react-native";
import { Text, Checkbox, Card } from "react-native-paper";
import { useState } from "react";
import * as yup from "yup";
import { db } from "../../firebase";
import { successToast } from "../core/theme";
import { useToast } from "react-native-styled-toast";
import Loading from "../components/Loading";
import { Formik } from "formik";
import Button from "../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";

const reviewSchema = yup.object({
  name: yup
    .string()
    .min(2)
    .matches(/^[A-Za-z ]*$/, "Name is not valid")
    .required(),
  phone: yup
    .string()
    .length(9)
    .matches(phoneRegExp, "Phone number is not valid")
    .required(),
  plate: yup
    .string()
    .max(8)
    .matches(plateRegExp, "License plate is not valid")
    .required(),
});

export default function Profile({ route, navigation }) {
	const  [notifationsBool, setNotifationsBool] = useState(true);

 const subscribeToNotifications = async () => {
	//Too tired to solve this... just deal with it for now
	if(!notifationsBool){
		AsyncStorage.getItem("@fcmToken").then((res) => {
			setTkn(res);
			messaging().subscribeToTopic(user.id).then().catch((error) => alert(error))
		  });
		alert("You will now receive notifications for new orders")
	}
	else{
		messaging().unsubscribeFromTopic(user.id).then().catch((error) => alert(error))

		alert("You will no longer receive notifications for new orders")
	}
}
 const fetchSettings= async () =>{
	await AsyncStorage.getItem("@notifationsBool").then((res) => {
		let k = res === "true";
		setNotifationsBool(k);
	}).catch((error) => alert(error));
  }
  const [isLoading, setLoading] = useState(false);
  const { toast } = useToast();

  const onEditPress = (form) => {
    setLoading(true);

    db.collection("users")
      .doc(route.params.user.id)
      .update({
        name: form.name,
        email: form.email,
        tel: form.phone,
        plate: form.plate,
      })
      .then(() => {
        toast(successToast("Update Successfully!"));
        setLoading(false);
        route.params.fetchUserDataCallback();
      })
      .catch((error) => {
        setLoading(false);
        alert(error.message);
      });
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <Formik
        initialValues={{
          email: route.params.user.email,
          name: route.params.user.name,
          phone: route.params.user.tel,
          plate: route.params.user.plate,
        }}
        validationSchema={reviewSchema}
        onSubmit={(values) => onEditPress(values)}
      >
        {(props) => (
          <View style={{ paddingHorizontal: 25, paddingTop: 25 }}>
            <TextInput label="Email" value={props.values.email} disabled />
            <TextInput
              label="Name"
              value={props.values.name}
              onChangeText={props.handleChange("name")}
              error={props.touched.name && props.errors.name}
              errorText={props.touched.name && capitalize(props.errors.name)}
              returnKeyType="next"
              editable={!isLoading}
            />
            <TextInput
              label="Phone"
              value={props.values.phone}
              onChangeText={props.handleChange("phone")}
              error={props.touched.phone && props.errors.phone}
              errorText={props.touched.phone && capitalize(props.errors.phone)}
              keyboardType="phone-pad"
              returnKeyType="next"
              editable={!isLoading}
            />
            <TextInput
              label="License Plate"
              value={props.values.plate}
              onChangeText={props.handleChange("plate")}
              error={props.touched.plate && props.errors.plate}
              errorText={props.touched.plate && capitalize(props.errors.plate)}
              returnKeyType="next"
              editable={!isLoading}
            />
            <Button
              mode="contained"
              disabled={isLoading}
              onPress={props.handleSubmit}
            >
              Edit Profile
            </Button>
          </View>
        )}
      </Formik>
      {isLoading && <Loading />}
	  <Card>
	  <Card.Title
              title="Settings"></Card.Title>
	  <View style={{ flexDirection: "column", paddingHorizontal: 25 }} >
		<View style={{ flexDirection: "row" }}>
			<Checkbox
				status={notifationsBool ? "checked" : "unchecked"}
				onPress={() => {
					let k = !notifationsBool;
				AsyncStorage.setItem("@notifationsBool", ""+k).then(
					() => {
						setNotifationsBool(k);
						subscribeToNotifications();
						
				}).catch((error) => alert(error));
				}}
			></Checkbox>
			<Text>Enable/Disable Notifications </Text>
		</View>
		<Button mode="contained" onPress={()=>{navigation.navigate("NotificationHistory", {"id":route.params.user.id} )}}>Notification History</Button>
	      
	  </View>
	  </Card>
	  
    </ScrollView>
  );
}
