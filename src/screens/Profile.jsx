import React from "react";
import TextInput from "../components/TextInput";
import { capitalize, phoneRegExp, plateRegExp } from "../helpers/helper";
import { View, ScrollView } from "react-native";
import { useState } from "react";
import * as yup from "yup";
import { db } from "../../firebase";
import { successToast } from "../core/theme";
import { useToast } from "react-native-styled-toast";
import Loading from "../components/Loading";
import { Formik } from "formik";
import Button from "../components/Button";

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

export default function Profile({ route }) {
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
    </ScrollView>
  );
}
