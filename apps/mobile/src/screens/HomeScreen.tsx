import React from "react";
import { View, Text, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { clearToken } from "../lib/authStorage";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View className="flex-1 bg-black px-6 justify-center">
      <Text className="text-white text-3xl font-bold mb-4">Home ✅</Text>
      <Text className="text-zinc-300 mb-8">You’re logged in.</Text>

      <Pressable
        className="bg-white py-3 rounded-xl items-center"
        onPress={async () => {
          await clearToken();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }}
      >
        <Text className="text-black font-semibold">Logout</Text>
      </Pressable>
    </View>
  );
}
