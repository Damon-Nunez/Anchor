import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { signup } from "../services/auth";

type Props = NativeStackScreenProps<RootStackParamList, "Signup">;

export default function SignUpScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // ✅ NEW
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email || !username || !password) {
      Alert.alert("Missing info", "Enter email, username, and password.");
      return;
    }

    try {
      setLoading(true);

      // ✅ Backend expects { email, username, password } at POST /auth/register
      await signup(email, username, password);

      Alert.alert("Success", "Account created. Please log in.");
      navigation.navigate("Login");
    } catch (e: any) {
      Alert.alert("Signup failed", e?.message || "Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-black px-6 justify-center">
      <Text className="text-white text-3xl font-bold mb-6">Sign Up</Text>

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
        className="bg-zinc-900 text-white px-4 py-3 rounded-xl mb-3"
        placeholder="Username"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
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
        onPress={handleSignup}
        disabled={loading}
      >
        <Text className="text-black font-semibold">
          {loading ? "Creating..." : "Create account"}
        </Text>
      </Pressable>

      <Pressable
        className="mt-4 items-center"
        onPress={() => navigation.navigate("Login")}
      >
        <Text className="text-zinc-300">
          Already have an account?{" "}
          <Text className="text-white font-semibold">Log in</Text>
        </Text>
      </Pressable>
    </View>
  );
}
