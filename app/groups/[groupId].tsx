import { AppText as Text } from "@/components/typography";
import { useTodo } from "@/store/todo-context";
import { formatDateLabel } from "@/utils/date";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GroupDetailsScreen() {
    const router = useRouter();
    const { groupId: rawGroupId } = useLocalSearchParams<{ groupId: string }>();
    const groupId = Array.isArray(rawGroupId) ? rawGroupId[0] : rawGroupId;

    const { theme, preferences, getGroupById, getTasksForGroup, openComposer, openTaskSheet, toggleTask } = useTodo();

    const group = groupId ? getGroupById(groupId) : undefined;

    const tasks = useMemo(() => {
        if (!groupId) {
            return [];
        }

        const all = getTasksForGroup(groupId);
        return preferences.showDoneToday ? all : all.filter((task) => !task.completed);
    }, [getTasksForGroup, groupId, preferences.showDoneToday]);

    if (!group) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
                <View style={styles.notFoundWrap}>
                    <Text style={[styles.notFoundTitle, { color: theme.text }]}>Groupe introuvable</Text>
                    <Pressable onPress={() => router.back()} style={[styles.backBtn, { borderColor: theme.border }]}>
                        <Text style={[styles.backBtnText, { color: theme.text }]}>Retour</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    const doneCount = tasks.filter((task) => task.completed).length;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <StatusBar style={theme.isDark ? "light" : "dark"} />

            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View entering={FadeInDown.duration(380)}>
                    <View style={styles.headerRow}>
                        <Pressable onPress={() => router.back()} style={[styles.backBtn, { borderColor: theme.border }]}>
                            <Text style={[styles.backBtnText, { color: theme.text }]}>Retour</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => openComposer(group.id)}
                            style={[styles.addBtn, { backgroundColor: theme.primary }]}
                        >
                            <Text style={styles.addBtnText}>+ Ajouter</Text>
                        </Pressable>
                    </View>

                    <View style={styles.groupTitleRow}>
                        <View style={[styles.dot, { backgroundColor: group.color }]} />
                        <Text style={[styles.title, { color: theme.text }]}>{group.name}</Text>
                    </View>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                        {tasks.length} taches · {doneCount} terminees
                    </Text>
                </Animated.View>

                {tasks.length === 0 ? (
                    <Animated.View entering={FadeInDown.delay(60).duration(420)} style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucune tache ici</Text>
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>Ajoute une tache pour ce groupe avec le bouton ci-dessus.</Text>
                    </Animated.View>
                ) : (
                    <View style={styles.list}>
                        {tasks.map((task, index) => (
                            <Animated.View key={task.id} entering={FadeInDown.delay(80 + index * 30).duration(360)}>
                                <Pressable
                                    onPress={() => openTaskSheet(task.id)}
                                    style={[styles.taskCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                >
                                    <View style={styles.taskRow}>
                                        <Pressable
                                            onPress={() => toggleTask(task.id)}
                                            style={[
                                                styles.checkbox,
                                                {
                                                    borderColor: task.completed ? theme.primary : theme.border,
                                                    backgroundColor: task.completed ? theme.primary : theme.background,
                                                },
                                            ]}
                                        >
                                            <Text style={[styles.checkMark, { color: task.completed ? "#FFFFFF" : theme.textMuted }]}>
                                                {task.completed ? "✓" : ""}
                                            </Text>
                                        </Pressable>

                                        <View style={styles.taskTextWrap}>
                                            <Text
                                                style={[
                                                    styles.taskTitle,
                                                    { color: theme.text },
                                                    task.completed && styles.taskTitleDone,
                                                ]}
                                            >
                                                {task.title}
                                            </Text>
                                            <Text style={[styles.taskMeta, { color: theme.textMuted }]}>
                                                {formatDateLabel(task.dueDate)} · {task.priority}
                                            </Text>
                                        </View>
                                    </View>

                                    {task.notes ? (
                                        <Text style={[styles.notes, { color: theme.textMuted }]} numberOfLines={2}>
                                            {task.notes}
                                        </Text>
                                    ) : null}
                                </Pressable>
                            </Animated.View>
                        ))}
                    </View>
                )}
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
    notFoundWrap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    notFoundTitle: {
        fontSize: 22,
        fontWeight: "800",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    backBtn: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    backBtnText: {
        fontSize: 12,
        fontWeight: "700",
    },
    addBtn: {
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    addBtnText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "800",
    },
    groupTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 2,
    },
    dot: {
        width: 11,
        height: 11,
        borderRadius: 999,
    },
    title: {
        fontSize: 31,
        fontWeight: "900",
        letterSpacing: -0.7,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: "600",
    },
    list: {
        gap: 8,
    },
    taskCard: {
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 11,
        paddingVertical: 10,
        gap: 7,
    },
    taskRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
    },
    checkbox: {
        width: 23,
        height: 23,
        borderRadius: 11.5,
        borderWidth: 1.5,
        justifyContent: "center",
        alignItems: "center",
    },
    checkMark: {
        fontSize: 12,
        fontWeight: "800",
    },
    taskTextWrap: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 15,
        fontWeight: "800",
        marginBottom: 1,
    },
    taskTitleDone: {
        textDecorationLine: "line-through",
        opacity: 0.7,
    },
    taskMeta: {
        fontSize: 12,
        fontWeight: "600",
    },
    notes: {
        fontSize: 12,
        lineHeight: 17,
    },
    emptyCard: {
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 16,
        gap: 3,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "800",
    },
    emptyText: {
        fontSize: 13,
        fontWeight: "600",
    },
});
