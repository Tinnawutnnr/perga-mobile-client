import { router, useFocusEffect} from "expo-router";
import { useCallback} from "react";
import { Text, View } from "react-native";

export default function Index() {
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        router.replace("/onboarding");
      }, 100);
      
      return () => clearTimeout(timer);
    }, [])
  );

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Loading...</Text>
    </View>
  );
}
