import { AppText as Text, AppTextInput as TextInput } from "@/components/typography";
import { TaskPriority, useTodo } from "@/store/todo-context";
import { getDateKeyWithOffset } from "@/utils/date";
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

const PRIORITY_OPTIONS: { key: TaskPriority; label: string }[] = [
    { key: "low", label: "Douce" },
    { key: "medium", label: "Normale" },
    { key: "high", label: "Urgente" },
];

const DUE_OPTIONS = [
    { key: getDateKeyWithOffset(0), label: "Aujourd hui" },
    { key: getDateKeyWithOffset(1), label: "Demain" },
    { key: getDateKeyWithOffset(2), label: "+2 jours" },
    { key: getDateKeyWithOffset(7), label: "+1 semaine" },
];

export function TaskComposerSheet() {
    const {
        composerOpen,
        closeComposer,
        composerPresetGroupId,
        groups,
        addTask,
        theme,
        preferences,
    } = useTodo();

    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [groupId, setGroupId] = useState<string>(groups[0]?.id ?? "");
    const [priority, setPriority] = useState<TaskPriority>(preferences.defaultPriority);
    const [dueDate, setDueDate] = useState(DUE_OPTIONS[0].key);

    const progress = useSharedValue(0);

    useEffect(() => {
        if (!composerOpen) {
            return;
        }

        setTitle("");
        setNotes("");
        setGroupId(composerPresetGroupId ?? groups[0]?.id ?? "");
        setPriority(preferences.defaultPriority);
        setDueDate(DUE_OPTIONS[0].key);
    }, [composerOpen, composerPresetGroupId, groups, preferences.defaultPriority]);

    useEffect(() => {
        progress.value = withTiming(composerOpen ? 1 : 0, {
            duration: composerOpen ? 280 : 220,
            easing: Easing.out(Easing.cubic),
        });
    }, [composerOpen, progress]);

    const canSubmit = useMemo(() => title.trim().length > 0, [title]);

    const animatedBackdrop = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 1], [0, 1]),
    }));

    const animatedSheet = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: interpolate(progress.value, [0, 1], [560, 0]),
            },
        ],
    }));

    const onCreateTask = () => {
        const result = addTask({
            title,
            notes,
            groupId,
            dueDate,
            priority,
        });

        if (!result.ok) {
            Alert.alert("Creation impossible", result.message ?? "Verifie les champs.");
            return;
        }

        closeComposer();
    };

    return (
        <View pointerEvents={composerOpen ? "auto" : "none"} style={styles.modalRoot}>
            <AnimatedPressable style={[styles.backdrop, animatedBackdrop]} onPress={closeComposer} />

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
                <Text style={[styles.title, { color: theme.text }]}>Nouvelle tache</Text>

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
                    placeholder="Titre de la tache"
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
                    placeholder="Notes optionnelles"
                    placeholderTextColor={theme.textMuted}
                    multiline
                />

                <Text style={[styles.label, { color: theme.textMuted }]}>Groupe</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                    {groups.map((group) => {
                        const selected = group.id === groupId;
                        return (
                            <Pressable
                                key={group.id}
                                onPress={() => setGroupId(group.id)}
                                style={[
                                    styles.pill,
                                    {
                                        borderColor: selected ? group.color : theme.border,
                                        backgroundColor: selected ? group.color : theme.background,
                                    },
                                ]}
                            >
                                <Text style={[styles.pillText, { color: selected ? "#FFFFFF" : theme.text }]}>
                                    {group.name}
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

                <Pressable
                    onPress={onCreateTask}
                    style={[
                        styles.submit,
                        {
                            opacity: canSubmit ? 1 : 0.6,
                            backgroundColor: theme.primary,
                        },
                    ]}
                    disabled={!canSubmit}
                >
                    <Text style={styles.submitText}>Creer maintenant</Text>
                </Pressable>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    modalRoot: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-end",
        zIndex: 50,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(17, 24, 39, 0.35)",
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
        marginBottom: 4,
    },
    title: {
        fontSize: 21,
        fontWeight: "800",
        marginBottom: 4,
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
        paddingBottom: 4,
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
    submit: {
        marginTop: 8,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
    },
    submitText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 14,
    },
});
