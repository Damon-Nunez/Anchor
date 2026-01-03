import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { login } from "../services/auth";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    console.log("LOGIN BUTTON PRESSED");
    if (!email || !password) {
      Alert.alert("Missing info", "Enter email + password.");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);

      // ✅ Hard redirect reset: user can’t go “Back” to login
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (e: any) {
      Alert.alert("Login failed", e.message || "Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-black px-6 justify-center">
      <Text className="text-white text-3xl font-bold mb-6">Login</Text>

      <TextInput
        className="bg-zinc-900 text-white px-4 py-3 rounded-xl mb-3"
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        className="bg-zinc-900 text-white px-4 py-3 rounded-xl mb-4"
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        className={`py-3 rounded-xl items-center ${
          loading ? "bg-zinc-700" : "bg-white"
        }`}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="text-black font-semibold">
          {loading ? "Logging in..." : "Login"}
        </Text>
      </Pressable>

      <Pressable
        className="mt-4 items-center"
        onPress={() => navigation.navigate("Signup")}
      >
        <Text className="text-zinc-300">
          Don’t have an account?{" "}
          <Text className="text-white font-semibold">Sign up</Text>
        </Text>
      </Pressable>
    </View>
  );
}
