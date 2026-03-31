import { FloatingAddButton } from "@/components/floating-add-button";
import { TaskComposerSheet } from "@/components/task-composer-sheet";
import { TaskDetailsSheet } from "@/components/task-details-sheet";
import { AppText as Text } from "@/components/typography";
import { useTodo } from "@/store/todo-context";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function TabsLayout() {
    const { hydrated, theme } = useTodo();

    if (!hydrated) {
        return (
            <View style={[styles.loaderWrap, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loaderText, { color: theme.textMuted }]}>Chargement...</Text>
            </View>
        );
    }

    return (
        <>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: theme.primary,
                    tabBarInactiveTintColor: theme.textMuted,
                    tabBarStyle: {
                        backgroundColor: theme.tabBar,
                        borderTopColor: theme.border,
                        height: 70,
                        paddingTop: 8,
                        paddingBottom: 8,
                    },
                    tabBarLabelStyle: {
                        fontFamily: "SpaceGrotesk_700Bold",
                        fontSize: 12,
                    },
                    sceneStyle: {
                        backgroundColor: theme.background,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Aujourd hui",
                        tabBarIcon: ({ color, size }) => <Ionicons name="sunny-outline" size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="groups"
                    options={{
                        title: "Groupes",
                        tabBarIcon: ({ color, size }) => <Ionicons name="layers-outline" size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        title: "Parametres",
                        tabBarIcon: ({ color, size }) => <Ionicons name="options-outline" size={size} color={color} />,
                    }}
                />
            </Tabs>

            <FloatingAddButton />
            <TaskComposerSheet />
            <TaskDetailsSheet />
        </>
    );
}

const styles = StyleSheet.create({
    loaderWrap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    loaderText: {
        fontSize: 14,
        fontWeight: "600",
    },
});
