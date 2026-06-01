import { NavigationContainer, DefaultTheme, createNavigationContainerRef } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Bell, BriefcaseBusiness, LineChart, ListFilter, ShieldCheck, TrendingUp } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Alert, Text, TouchableOpacity } from "react-native";

import AlertsScreen from "./app/screens/AlertsScreen";
import LoginScreen from "./app/screens/LoginScreen";
import PortfolioScreen from "./app/screens/PortfolioScreen";
import SignalsFeedScreen from "./app/screens/SignalsFeedScreen";
import StockAnalysisScreen from "./app/screens/StockAnalysisScreen";
import TopPicksScreen from "./app/screens/TopPicksScreen";
import WealthHubScreen from "./app/screens/WealthHubScreen";
import { logoutSession } from "./app/services/auth";
import { registerAlertBackgroundTask } from "./app/services/backgroundAlerts";

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  StockAnalysis: { symbol: string };
};

export type TabsParamList = {
  Portfolio: undefined;
  Signals: undefined;
  Picks: undefined;
  Alerts: undefined;
  Wealth: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabsParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#151615",
    card: "#20211f",
    text: "#f7f4ea",
    border: "#363933",
    primary: "#73c441"
  }
};

function MainTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#20211f" },
        headerTintColor: "#f7f4ea",
        headerRight: () => (
          <TouchableOpacity onPress={onLogout} style={{ paddingHorizontal: 12 }}>
            <Text style={{ color: "#73c441", fontWeight: "900" }}>Logout</Text>
          </TouchableOpacity>
        ),
        tabBarStyle: { backgroundColor: "#20211f", borderTopColor: "#363933" },
        tabBarActiveTintColor: "#73c441",
        tabBarInactiveTintColor: "#a9aba2"
      }}
    >
      <Tabs.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{ tabBarIcon: ({ color, size }) => <LineChart color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="Signals"
        component={SignalsFeedScreen}
        options={{ tabBarIcon: ({ color, size }) => <ListFilter color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="Picks"
        component={TopPicksScreen}
        options={{ tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{ tabBarIcon: ({ color, size }) => <Bell color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="Wealth"
        component={WealthHubScreen}
        options={{ tabBarIcon: ({ color, size }) => <BriefcaseBusiness color={color} size={size} /> }}
      />
    </Tabs.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    registerAlertBackgroundTask().catch(() => undefined);
  }, []);

  function logout() {
    Alert.alert("Log out", "This clears the local session token on this device.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logoutSession().catch(() => undefined);
          if (navigationRef.isReady()) {
            navigationRef.reset({ index: 0, routes: [{ name: "Login" }] });
          }
        }
      }
    ]);
  }

  return (
    <NavigationContainer ref={navigationRef} theme={theme}>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: "#20211f" },
          headerTintColor: "#f7f4ea",
          contentStyle: { backgroundColor: "#151615" }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: "SignalKite" }} />
        <Stack.Screen name="Main" options={{ headerShown: false }}>
          {() => <MainTabs onLogout={logout} />}
        </Stack.Screen>
        <Stack.Screen
          name="StockAnalysis"
          component={StockAnalysisScreen}
          options={({ route }) => ({
            title: route.params.symbol,
            headerRight: () => <ShieldCheck color="#73c441" size={20} />
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
