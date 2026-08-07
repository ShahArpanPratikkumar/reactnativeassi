import { View, Text, Button } from "react-native";
import React from "react";
import * as Location from "expo-location";
import { Alert } from "react-native";
import { useState } from "react";

export default function LocationScreen() {
  const [location, setLocation] = useState(null);

  const GetPermission = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.granted) {
      Alert.alert("Permission granted");
      console.log("Permission granted");
    } else {
      Alert.alert("Permission denied");
    }

    
  };
  const GetCurrentLocation = async () => {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      console.log(currentLocation);
    };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" , backgroundColor: ""}}>
      <Text>Location Screen</Text>
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
      <Button title="get permission" onPress={GetPermission} />
      <Button title="current location" onPress={GetCurrentLocation} />
      {location && (
        <View style={{ marginTop: 20, alignItems: "center" , color: "white", backgroundColor: "black", padding: 10, borderRadius: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20, color: "white" }}>
            Latitude:{location.coords.latitude}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20, color: "white" }}>
            Longitude:{location.coords.longitude}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20, color: "white" }}>
            accuracy:{location.coords.accuracy}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20, color: "white" }}>
            altitude:{location.coords.altitude}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20, color: "white" }}>
            heading:{location.coords.heading}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20, color: "white" }}>
            speed:{location.coords.speed}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20, color: "white" }}> 
            timestamp:{location.timestamp}
        </Text>
        
        </View>
      )}
    </View>
  );
}
