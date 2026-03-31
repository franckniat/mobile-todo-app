import { AppText as Text, AppTextInput as TextInput } from "@/components/typography";
import { TaskPriority, useTodo } from "@/store/todo-context";
import { formatDateLabel, getDateKeyWithOffset } from "@/utils/date";
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const DUE_OPTIONS = [
    { key: getDateKeyWithOffset(0), label: "Aujourd hui" },
    { key: getDateKeyWithOffset(1), label: "Demain" },
    { key: getDateKeyWithOffset(2), label: "+2 jours" },
    { key: getDateKeyWithOffset(7), label: "+1 semaine" },
];

const PRIORITY_OPTIONS: { key: TaskPriority; label: string }[] = [
    { key: "low", label: "Douce" },
    { key: "medium", label: "Normale" },
    { key: "high", label: "Urgente" },
];

export function TaskDetailsSheet() {
    const {
        closeTaskSheet,
        sheetTaskId,
        getTaskById,
        getGroupById,
        groups,
        updateTask,
        deleteTask,
        toggleTask,
        preferences,
        theme,
    } = useTodo();

    const task = sheetTaskId ? getTaskById(sheetTaskId) : undefined;
    const group = task ? getGroupById(task.groupId) : undefined;

    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [groupId, setGroupId] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("medium");
    const [dueDate, setDueDate] = useState(getDateKeyWithOffset(0));

    const isOpen = Boolean(task);
    const progress = useSharedValue(0);

    useEffect(() => {
        if (!task) {
            return;
        }

        setEditing(false);
        setTitle(task.title);
        setNotes(task.notes);
        setGroupId(task.groupId);
        setPriority(task.priority);
        setDueDate(task.dueDate);
    }, [task]);

    useEffect(() => {
        progress.value = withTiming(isOpen ? 1 : 0, {
            duration: isOpen ? 280 : 220,
            easing: Easing.out(Easing.cubic),
        });
    }, [isOpen, progress]);

    const close = () => {
        setEditing(false);
        closeTaskSheet();
    };

    const onDelete = () => {
        if (!task) {
            return;
        }

        const applyDeletion = () => {
            deleteTask(task.id);
            closeTaskSheet();
        };

        if (!preferences.confirmBeforeDelete) {
            applyDeletion();
            return;
        }

        Alert.alert("Supprimer la tache", "Cette action est irreversible.", [
            { text: "Annuler", style: "cancel" },
            { text: "Supprimer", style: "destructive", onPress: applyDeletion },
        ]);
    };

    const onSave = () => {
        if (!task) {
            return;
        }

        if (!title.trim()) {
            Alert.alert("Titre requis", "Le titre ne peut pas etre vide.");
            return;
        }

        updateTask(task.id, {
            title: title.trim(),
            notes: notes.trim(),
            groupId,
            priority,
            dueDate,
        });

        setEditing(false);
    };

    const priorityLabel = useMemo(
        () => PRIORITY_OPTIONS.find((option) => option.key === task?.priority)?.label ?? "Normale",
        [task?.priority],
    );

    const animatedBackdrop = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 1], [0, 1]),
    }));

    const animatedSheet = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: interpolate(progress.value, [0, 1], [580, 0]),
            },
        ],
    }));

    return (
        <View pointerEvents={isOpen ? "auto" : "none"} style={styles.modalRoot}>
            <AnimatedPressable style={[styles.backdrop, animatedBackdrop]} onPress={close} />

            <Animated.View
                style={[
                    styles.sheet,
                    {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                    },
                    animatedSheet,
                ]}
            >
                <View style={[styles.handle, { backgroundColor: theme.border }]} />

                {task ? (
                    <>
                        <View style={styles.headerRow}>
                            <Text style={[styles.title, { color: theme.text }]}>Vue tache</Text>
                            <Pressable onPress={close} style={[styles.closeBtn, { borderColor: theme.border }]}>
                                <Text style={[styles.closeBtnText, { color: theme.textMuted }]}>Fermer</Text>
                            </Pressable>
                        </View>

                        {editing ? (
                            <>
                                <TextInput
                                    value={title}
                                    onChangeText={setTitle}
                                    style={[
                                        styles.input,
                                        {
                                            color: theme.text,
                                            borderColor: theme.border,
                                            backgroundColor: theme.background,
                                        },
                                    ]}
                                    placeholder="Titre"
                                    placeholderTextColor={theme.textMuted}
                                />
                                <TextInput
                                    value={notes}
                                    onChangeText={setNotes}
                                    style={[
                                        styles.input,
                                        styles.textarea,
                                        {
                                            color: theme.text,
                                            borderColor: theme.border,
                                            backgroundColor: theme.background,
                                        },
                                    ]}
                                    placeholder="Notes"
                                    placeholderTextColor={theme.textMuted}
                                    multiline
                                />

                                <Text style={[styles.label, { color: theme.textMuted }]}>Groupe</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                                    {groups.map((item) => {
                                        const selected = item.id === groupId;
                                        return (
                                            <Pressable
                                                key={item.id}
                                                onPress={() => setGroupId(item.id)}
                                                style={[
                                                    styles.pill,
                                                    {
                                                        borderColor: selected ? item.color : theme.border,
                                                        backgroundColor: selected ? item.color : theme.background,
                                                    },
                                                ]}
                                            >
                                                <Text style={[styles.pillText, { color: selected ? "#FFFFFF" : theme.text }]}>
                                                    {item.name}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </ScrollView>

                                <Text style={[styles.label, { color: theme.textMuted }]}>Date</Text>
                                <View style={styles.wrapRow}>
                                    {DUE_OPTIONS.map((option) => {
                                        const selected = option.key === dueDate;
                                        return (
                                            <Pressable
                                                key={option.key}
                                                onPress={() => setDueDate(option.key)}
                                                style={[
                                                    styles.smallPill,
                                                    {
                                                        borderColor: selected ? theme.primary : theme.border,
                                                        backgroundColor: selected ? theme.primarySoft : theme.background,
                                                    },
                                                ]}
                                            >
                                                <Text style={[styles.smallPillText, { color: theme.text }]}>{option.label}</Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>

                                <Text style={[styles.label, { color: theme.textMuted }]}>Priorite</Text>
                                <View style={styles.wrapRow}>
                                    {PRIORITY_OPTIONS.map((option) => {
                                        const selected = option.key === priority;
                                        return (
                                            <Pressable
                                                key={option.key}
                                                onPress={() => setPriority(option.key)}
                                                style={[
                                                    styles.smallPill,
                                                    {
                                                        borderColor: selected ? theme.primary : theme.border,
                                                        backgroundColor: selected ? theme.primarySoft : theme.background,
                                                    },
                                                ]}
                                            >
                                                <Text style={[styles.smallPillText, { color: theme.text }]}>{option.label}</Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>

                                <View style={styles.actionRow}>
                                    <Pressable
                                        style={[styles.actionGhost, { borderColor: theme.border, backgroundColor: theme.background }]}
                                        onPress={() => setEditing(false)}
                                    >
                                        <Text style={[styles.actionGhostText, { color: theme.text }]}>Annuler</Text>
                                    </Pressable>
                                    <Pressable
                                        style={[styles.actionPrimary, { backgroundColor: theme.primary }]}
                                        onPress={onSave}
                                    >
                                        <Text style={styles.actionPrimaryText}>Enregistrer</Text>
                                    </Pressable>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={[styles.taskTitle, { color: theme.text }]}>{task.title}</Text>
                                <Text style={[styles.metaText, { color: theme.textMuted }]}>Echeance: {formatDateLabel(task.dueDate)}</Text>
                                <Text style={[styles.metaText, { color: theme.textMuted }]}>Priorite: {priorityLabel}</Text>
                                <Text style={[styles.metaText, { color: theme.textMuted }]}>Groupe: {group?.name ?? "Sans groupe"}</Text>

                                <View style={[styles.notesBox, { borderColor: theme.border, backgroundColor: theme.background }]}>
                                    <Text style={[styles.notesText, { color: theme.text }]}>
                                        {task.notes || "Aucune note pour cette tache."}
                                    </Text>
                                </View>

                                <View style={styles.actionRow}>
                                    <Pressable
                                        style={[styles.actionGhost, { borderColor: theme.border, backgroundColor: theme.background }]}
                                        onPress={() => toggleTask(task.id)}
                                    >
                                        <Text style={[styles.actionGhostText, { color: theme.text }]}>
                                            {task.completed ? "Reouvrir" : "Terminer"}
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        style={[styles.actionGhost, { borderColor: theme.border, backgroundColor: theme.background }]}
                                        onPress={() => setEditing(true)}
                                    >
                                        <Text style={[styles.actionGhostText, { color: theme.text }]}>Modifier</Text>
                                    </Pressable>
                                    <Pressable
                                        style={[styles.actionDanger, { backgroundColor: theme.danger }]}
                                        onPress={onDelete}
                                    >
                                        <Text style={styles.actionDangerText}>Supprimer</Text>
                                    </Pressable>
                                </View>
                            </>
                        )}
                    </>
                ) : null}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    modalRoot: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-end",
        zIndex: 60,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(15, 23, 42, 0.42)",
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderBottomWidth: 0,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 30,
        gap: 8,
        maxHeight: "88%",
    },
    handle: {
        width: 48,
        height: 5,
        borderRadius: 999,
        alignSelf: "center",
        marginBottom: 2,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 2,
    },
    title: {
        fontSize: 21,
        fontWeight: "800",
    },
    closeBtn: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    closeBtnText: {
        fontSize: 12,
        fontWeight: "700",
    },
    taskTitle: {
        fontSize: 22,
        fontWeight: "900",
        marginTop: 2,
        marginBottom: 2,
    },
    metaText: {
        fontSize: 13,
        fontWeight: "600",
    },
    notesBox: {
        marginTop: 6,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    notesText: {
        fontSize: 14,
        lineHeight: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: "700",
        marginTop: 2,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
    },
    textarea: {
        minHeight: 78,
        textAlignVertical: "top",
    },
    row: {
        flexDirection: "row",
        gap: 8,
        paddingBottom: 2,
    },
    wrapRow: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    pill: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 7,
    },
    pillText: {
        fontSize: 12,
        fontWeight: "700",
    },
    smallPill: {
        borderWidth: 1,
        borderRadius: 11,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    smallPillText: {
        fontSize: 12,
        fontWeight: "700",
    },
    actionRow: {
        marginTop: 8,
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    actionGhost: {
        borderWidth: 1,
        borderRadius: 11,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    actionGhostText: {
        fontSize: 12,
        fontWeight: "700",
    },
    actionPrimary: {
        borderRadius: 11,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    actionPrimaryText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "800",
    },
    actionDanger: {
        borderRadius: 11,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    actionDangerText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "800",
    },
});
