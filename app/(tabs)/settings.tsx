import { AppText as Text } from "@/components/typography";
import { APP_THEMES, TaskPriority, ThemeName, useTodo } from "@/store/todo-context";
import { StatusBar } from "expo-status-bar";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIORITIES: { key: TaskPriority; label: string }[] = [
    { key: "low", label: "Douce" },
    { key: "medium", label: "Normale" },
    { key: "high", label: "Urgente" },
];

const themeOrder: ThemeName[] = ["light", "dark"];

export default function SettingsScreen() {
    const { theme, themeName, setThemeName, preferences, setPreference, clearCompleted } = useTodo();

    const askClearCompleted = () => {
        Alert.alert("Nettoyer les taches", "Supprimer toutes les taches terminees ?", [
            { text: "Annuler", style: "cancel" },
            { text: "Supprimer", style: "destructive", onPress: clearCompleted },
        ]);
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <StatusBar style={theme.isDark ? "light" : "dark"} />

            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View entering={FadeInDown.duration(380)}>
                    <Text style={[styles.title, { color: theme.text }]}>Parametres</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(60).duration(420)} style={[styles.block, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.blockTitle, { color: theme.text }]}>Theme</Text>
                    <Text style={[styles.subLabel, { color: theme.textMuted }]}>Par defaut, le theme suit ton appareil.</Text>
                    {themeOrder.map((name) => {
                        const item = APP_THEMES[name];
                        const selected = themeName === name;

                        return (
                            <Pressable
                                key={item.name}
                                onPress={() => setThemeName(item.name)}
                                style={[
                                    styles.themeCard,
                                    {
                                        borderColor: selected ? item.primary : theme.border,
                                        backgroundColor: selected ? item.backgroundSecondary : theme.background,
                                    },
                                ]}
                            >
                                <View style={styles.themeHeader}>
                                    <Text style={[styles.themeLabel, { color: theme.text }]}>{item.label}</Text>
                                    <View
                                        style={[
                                            styles.radio,
                                            {
                                                borderColor: selected ? item.primary : theme.border,
                                                backgroundColor: selected ? item.primary : "transparent",
                                            },
                                        ]}
                                    />
                                </View>
                                <View style={styles.previewRow}>
                                    <View style={[styles.previewSwatch, { backgroundColor: item.background }]} />
                                    <View style={[styles.previewSwatch, { backgroundColor: item.surface }]} />
                                    <View style={[styles.previewSwatch, { backgroundColor: item.primary }]} />
                                </View>
                            </Pressable>
                        );
                    })}
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(110).duration(420)} style={[styles.block, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.blockTitle, { color: theme.text }]}>Reglages des taches</Text>

                    <View style={styles.settingRow}>
                        <Text style={[styles.settingLabel, { color: theme.text }]}>Afficher les terminees du jour</Text>
                        <Switch
                            value={preferences.showDoneToday}
                            onValueChange={(value) => setPreference("showDoneToday", value)}
                            trackColor={{ false: theme.border, true: theme.primarySoft }}
                            thumbColor={preferences.showDoneToday ? theme.primary : "#FFFFFF"}
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <Text style={[styles.settingLabel, { color: theme.text }]}>Confirmer avant suppression</Text>
                        <Switch
                            value={preferences.confirmBeforeDelete}
                            onValueChange={(value) => setPreference("confirmBeforeDelete", value)}
                            trackColor={{ false: theme.border, true: theme.primarySoft }}
                            thumbColor={preferences.confirmBeforeDelete ? theme.primary : "#FFFFFF"}
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <Text style={[styles.settingLabel, { color: theme.text }]}>Mode cartes compactes</Text>
                        <Switch
                            value={preferences.compactCards}
                            onValueChange={(value) => setPreference("compactCards", value)}
                            trackColor={{ false: theme.border, true: theme.primarySoft }}
                            thumbColor={preferences.compactCards ? theme.primary : "#FFFFFF"}
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <Text style={[styles.settingLabel, { color: theme.text }]}>Mettre les terminees en bas</Text>
                        <Switch
                            value={preferences.moveDoneToBottom}
                            onValueChange={(value) => setPreference("moveDoneToBottom", value)}
                            trackColor={{ false: theme.border, true: theme.primarySoft }}
                            thumbColor={preferences.moveDoneToBottom ? theme.primary : "#FFFFFF"}
                        />
                    </View>

                    <Text style={[styles.subLabel, { color: theme.textMuted }]}>Priorite par defaut</Text>
                    <View style={styles.priorityRow}>
                        {PRIORITIES.map((option) => {
                            const selected = preferences.defaultPriority === option.key;
                            return (
                                <Pressable
                                    key={option.key}
                                    onPress={() => setPreference("defaultPriority", option.key)}
                                    style={[
                                        styles.priorityPill,
                                        {
                                            borderColor: selected ? theme.primary : theme.border,
                                            backgroundColor: selected ? theme.primarySoft : theme.background,
                                        },
                                    ]}
                                >
                                    <Text style={[styles.priorityText, { color: theme.text }]}>{option.label}</Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    <Pressable onPress={askClearCompleted} style={[styles.clearBtn, { backgroundColor: theme.danger }]}>
                        <Text style={styles.clearBtnText}>Nettoyer les taches terminees</Text>
                    </Pressable>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 120,
        gap: 10,
    },
    title: {
        fontSize: 31,
        fontWeight: "900",
        letterSpacing: -0.7,
    },
    block: {
        borderWidth: 1,
        borderRadius: 18,
        padding: 12,
        gap: 10,
    },
    blockTitle: {
        fontSize: 17,
        fontWeight: "800",
    },
    themeCard: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        gap: 6,
    },
    themeHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    themeLabel: {
        fontSize: 14,
        fontWeight: "700",
    },
    radio: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1.5,
    },
    previewRow: {
        flexDirection: "row",
        gap: 6,
    },
    previewSwatch: {
        flex: 1,
        height: 18,
        borderRadius: 6,
    },
    settingRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    settingLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
    },
    subLabel: {
        fontSize: 13,
        fontWeight: "700",
        marginTop: 2,
    },
    priorityRow: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    priorityPill: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    priorityText: {
        fontSize: 12,
        fontWeight: "700",
    },
    clearBtn: {
        marginTop: 6,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
    },
    clearBtnText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "800",
    },
});
