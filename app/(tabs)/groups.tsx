import { AppText as Text, AppTextInput as TextInput } from "@/components/typography";
import { useTodo } from "@/store/todo-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const PICKER_COLORS = ["#F97316", "#0EA5E9", "#10B981", "#E11D48", "#7C3AED", "#D97706"];

export default function GroupsScreen() {
    const router = useRouter();
    const {
        theme,
        groups,
        addGroup,
        getTasksForGroup,
        openComposer,
    } = useTodo();

    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupColor, setNewGroupColor] = useState(PICKER_COLORS[0]);

    const createGroup = () => {
        const result = addGroup(newGroupName, newGroupColor);
        if (!result.ok) {
            Alert.alert("Creation impossible", result.message ?? "Verifie le nom du groupe.");
            return;
        }

        setNewGroupName("");
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <StatusBar style={theme.isDark ? "light" : "dark"} />
            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View entering={FadeInDown.duration(380)}>
                    <Text style={[styles.title, { color: theme.text }]}>Groupes de taches</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(60).duration(420)} style={[styles.groupCreator, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Nouveau groupe</Text>
                    <TextInput
                        value={newGroupName}
                        onChangeText={setNewGroupName}
                        style={[
                            styles.input,
                            {
                                color: theme.text,
                                borderColor: theme.border,
                                backgroundColor: theme.background,
                            },
                        ]}
                        placeholder="Ex: Freelance"
                        placeholderTextColor={theme.textMuted}
                    />

                    <View style={styles.colorRow}>
                        {PICKER_COLORS.map((color) => {
                            const selected = color === newGroupColor;
                            return (
                                <Pressable
                                    key={color}
                                    onPress={() => setNewGroupColor(color)}
                                    style={[
                                        styles.colorDot,
                                        {
                                            backgroundColor: color,
                                            borderColor: selected ? theme.text : "transparent",
                                        },
                                    ]}
                                />
                            );
                        })}
                    </View>

                    <Pressable onPress={createGroup} style={[styles.createBtn, { backgroundColor: theme.primary }]}>
                        <Text style={styles.createBtnText}>Creer le groupe</Text>
                    </Pressable>
                </Animated.View>

                <View style={styles.groupList}>
                    {groups.map((group) => {
                        const tasks = getTasksForGroup(group.id);
                        const done = tasks.filter((task) => task.completed).length;
                        const active = tasks.length - done;

                        return (
                            <Animated.View key={group.id} entering={FadeInDown.delay(100).duration(420)}>
                                <Pressable
                                    onPress={() => router.push(`/groups/${group.id}` as never)}
                                    style={[
                                        styles.groupCard,
                                        {
                                            backgroundColor: theme.surface,
                                            borderColor: theme.border,
                                        },
                                    ]}
                                >
                                    <View style={styles.groupTopRow}>
                                        <View style={[styles.groupColorDot, { backgroundColor: group.color }]} />
                                        <Text style={[styles.groupName, { color: theme.text }]}>{group.name}</Text>
                                    </View>
                                    <Text style={[styles.groupMeta, { color: theme.textMuted }]}>
                                        {tasks.length} taches · {active} actives · {done} terminees
                                    </Text>

                                    <View style={styles.groupActionsRow}>
                                        <Pressable
                                            onPress={(event) => {
                                                event.stopPropagation();
                                                openComposer(group.id);
                                            }}
                                            style={[styles.inlineAction, { borderColor: theme.border }]}
                                        >
                                            <Text style={[styles.inlineActionText, { color: theme.text }]}>+ Ajouter</Text>
                                        </Pressable>

                                        <Text style={[styles.openText, { color: theme.textMuted }]}>Ouvrir ›</Text>
                                    </View>
                                </Pressable>
                            </Animated.View>
                        );
                    })}
                </View>
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: "800",
    },
    groupCreator: {
        borderWidth: 1,
        borderRadius: 18,
        padding: 12,
        gap: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 9,
        fontSize: 14,
    },
    colorRow: {
        flexDirection: "row",
        gap: 8,
    },
    colorDot: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 2,
    },
    createBtn: {
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
    },
    createBtnText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "800",
    },
    groupList: {
        gap: 8,
    },
    groupCard: {
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    groupTopRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    groupColorDot: {
        width: 10,
        height: 10,
        borderRadius: 999,
    },
    groupName: {
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 2,
    },
    groupMeta: {
        fontSize: 12,
        fontWeight: "600",
    },
    groupActionsRow: {
        marginTop: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    inlineAction: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    inlineActionText: {
        fontSize: 12,
        fontWeight: "700",
    },
    openText: {
        fontSize: 12,
        fontWeight: "700",
    },
});
