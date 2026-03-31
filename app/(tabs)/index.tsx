import { AppText as Text } from "@/components/typography";
import { TaskPriority, useTodo } from "@/store/todo-context";
import { formatDateLabel, getDateKeyWithOffset } from "@/utils/date";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const priorityLabel: Record<TaskPriority, string> = {
    low: "Douce",
    medium: "Normale",
    high: "Urgente",
};

const priorityWeight: Record<TaskPriority, number> = {
    low: 1,
    medium: 2,
    high: 3,
};

export default function TodayScreen() {
    const { theme, preferences, getTasksForDate, getGroupById, openTaskSheet, toggleTask } = useTodo();

    const todayKey = getDateKeyWithOffset(0);
    const allToday = getTasksForDate(todayKey);

    const todayTasks = useMemo(() => {
        if (preferences.showDoneToday) {
            return allToday;
        }
        return allToday.filter((task) => !task.completed);
    }, [allToday, preferences.showDoneToday]);

    const stats = useMemo(() => {
        const done = todayTasks.filter((task) => task.completed).length;
        const urgent = todayTasks.filter((task) => task.priority === "high" && !task.completed).length;
        return {
            total: todayTasks.length,
            done,
            urgent,
            percent: todayTasks.length === 0 ? 0 : Math.round((done / todayTasks.length) * 100),
        };
    }, [todayTasks]);

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <StatusBar style={theme.isDark ? "light" : "dark"} />
            <View style={[styles.orbTop, { backgroundColor: theme.primarySoft }]} />
            <View style={[styles.orbBottom, { backgroundColor: theme.backgroundSecondary }]} />

            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View entering={FadeInDown.duration(380)}>
                    <Text style={[styles.kicker, { color: theme.textMuted }]}>{formatDateLabel(todayKey)}</Text>
                    <Text style={[styles.title, { color: theme.text }]}>Plan du jour</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(60).duration(420)} style={styles.statRow}>
                    <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{stats.total}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>A faire</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{stats.done}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Terminees</Text>
                    </View>
                    <View style={[styles.statCardStrong, { backgroundColor: theme.surfaceStrong, borderColor: theme.border }]}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{stats.urgent}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Urgentes</Text>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(120).duration(420)} style={[styles.progressWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={[styles.progressBarBg, { backgroundColor: theme.backgroundSecondary }]}>
                        <View style={[styles.progressBarFill, { width: `${stats.percent}%`, backgroundColor: theme.primary }]} />
                    </View>
                    <Text style={[styles.progressText, { color: theme.textMuted }]}>{stats.percent}% complet</Text>
                </Animated.View>

                {todayTasks.length === 0 ? (
                    <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>Journee libre</Text>
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>Appuie sur le bouton + flottant pour creer une nouvelle tache.</Text>
                    </View>
                ) : (
                    <View style={styles.list}>
                        {todayTasks.map((task) => {
                            const group = getGroupById(task.groupId);
                            const compact = preferences.compactCards;

                            return (
                                <Animated.View key={task.id} entering={FadeInDown.delay(150).duration(360)}>
                                    <Pressable
                                        key={task.id}
                                        onPress={() => openTaskSheet(task.id)}
                                        style={[
                                            styles.taskCard,
                                            {
                                                backgroundColor: theme.surface,
                                                borderColor: theme.border,
                                                paddingVertical: compact ? 10 : 14,
                                            },
                                            task.completed && styles.taskDone,
                                        ]}
                                    >
                                        <View style={styles.taskMainRow}>
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
                                                <Text style={[styles.checkboxMark, { color: task.completed ? "#FFFFFF" : theme.textMuted }]}>
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

                                                {!compact || task.notes ? (
                                                    <Text style={[styles.taskNote, { color: theme.textMuted }]} numberOfLines={compact ? 1 : 3}>
                                                        {task.notes || "Sans note"}
                                                    </Text>
                                                ) : null}
                                            </View>
                                        </View>

                                        <View style={styles.metaRow}>
                                            <View style={[styles.metaBadge, { backgroundColor: group?.color ?? theme.primary }]}>
                                                <Text style={styles.metaBadgeText}>{group?.name ?? "Autre"}</Text>
                                            </View>
                                            <View style={[styles.metaBadgeOutline, { borderColor: theme.border }]}>
                                                <Text style={[styles.metaBadgeOutlineText, { color: theme.text }]}>
                                                    {priorityLabel[task.priority]} · P{priorityWeight[task.priority]}
                                                </Text>
                                            </View>
                                        </View>
                                    </Pressable>
                                </Animated.View>
                            );
                        })}
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
    orbTop: {
        position: "absolute",
        width: 260,
        height: 260,
        borderRadius: 140,
        top: -90,
        right: -80,
        opacity: 0.35,
    },
    orbBottom: {
        position: "absolute",
        width: 220,
        height: 220,
        borderRadius: 120,
        bottom: -90,
        left: -60,
        opacity: 0.3,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 120,
    },
    kicker: {
        fontSize: 13,
        fontWeight: "700",
        marginBottom: 2,
    },
    title: {
        fontSize: 34,
        fontWeight: "900",
        letterSpacing: -0.8,
        marginBottom: 14,
    },
    statRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 10,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 11,
        paddingVertical: 9,
    },
    statCardStrong: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 11,
        paddingVertical: 9,
    },
    statValue: {
        fontSize: 22,
        fontWeight: "900",
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: "700",
    },
    progressWrap: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 10,
        marginBottom: 10,
    },
    progressBarBg: {
        height: 8,
        borderRadius: 999,
        overflow: "hidden",
        marginBottom: 6,
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 999,
    },
    progressText: {
        fontSize: 12,
        fontWeight: "700",
    },
    list: {
        gap: 8,
    },
    taskCard: {
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 12,
        gap: 9,
    },
    taskDone: {
        opacity: 0.7,
    },
    taskMainRow: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxMark: {
        fontSize: 13,
        fontWeight: "800",
    },
    taskTextWrap: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 15,
        fontWeight: "800",
        marginBottom: 2,
    },
    taskTitleDone: {
        textDecorationLine: "line-through",
    },
    taskNote: {
        fontSize: 12,
        fontWeight: "500",
    },
    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
    },
    metaBadge: {
        borderRadius: 999,
        paddingHorizontal: 9,
        paddingVertical: 5,
    },
    metaBadgeText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
    },
    metaBadgeOutline: {
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 5,
    },
    metaBadgeOutlineText: {
        fontSize: 11,
        fontWeight: "700",
    },
    emptyCard: {
        borderRadius: 18,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 18,
        gap: 4,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: "800",
    },
    emptyText: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: "500",
    },
});
