import { getDateKeyWithOffset } from "@/utils/date";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { LayoutAnimation, Platform, UIManager, useColorScheme } from "react-native";

export type TaskPriority = "low" | "medium" | "high";
export type ThemeName = "light" | "dark";

export type TaskGroup = {
    id: string;
    name: string;
    color: string;
};

export type TaskItem = {
    id: string;
    title: string;
    notes: string;
    completed: boolean;
    groupId: string;
    priority: TaskPriority;
    dueDate: string;
    createdAt: number;
    updatedAt: number;
};

export type TaskPreferences = {
    showDoneToday: boolean;
    confirmBeforeDelete: boolean;
    compactCards: boolean;
    moveDoneToBottom: boolean;
    defaultPriority: TaskPriority;
};

export type AppTheme = {
    name: ThemeName;
    label: string;
    isDark: boolean;
    primary: string;
    primarySoft: string;
    background: string;
    backgroundSecondary: string;
    surface: string;
    surfaceStrong: string;
    text: string;
    textMuted: string;
    border: string;
    danger: string;
    tabBar: string;
    fab: string;
    fabText: string;
};

const STORAGE_KEY = "todo-atelier-multipage-v1";
const PRIMARY_BLUE = "#2563EB";

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 9)}`;

const GROUP_COLORS = ["#F97316", "#0EA5E9", "#10B981", "#E11D48", "#7C3AED", "#D97706"];

const DEFAULT_GROUPS: TaskGroup[] = [
    { id: "work", name: "Travail", color: "#F97316" },
    { id: "life", name: "Maison", color: "#10B981" },
    { id: "learn", name: "Apprentissage", color: "#0EA5E9" },
];

const DEFAULT_PREFERENCES: TaskPreferences = {
    showDoneToday: true,
    confirmBeforeDelete: true,
    compactCards: true,
    moveDoneToBottom: true,
    defaultPriority: "medium",
};

const DEFAULT_TASKS: TaskItem[] = [
    {
        id: "seed-1",
        title: "Planifier la semaine",
        notes: "Definir 3 objectifs realistes",
        completed: false,
        groupId: "work",
        priority: "high",
        dueDate: getDateKeyWithOffset(0),
        createdAt: Date.now() - 1000 * 60 * 60 * 8,
        updatedAt: Date.now() - 1000 * 60 * 60 * 8,
    },
    {
        id: "seed-2",
        title: "Faire une session sport",
        notes: "30 min minimum",
        completed: false,
        groupId: "life",
        priority: "medium",
        dueDate: getDateKeyWithOffset(0),
        createdAt: Date.now() - 1000 * 60 * 60 * 6,
        updatedAt: Date.now() - 1000 * 60 * 60 * 6,
    },
    {
        id: "seed-3",
        title: "Lire 20 pages",
        notes: "Sujet UI mobile",
        completed: true,
        groupId: "learn",
        priority: "low",
        dueDate: getDateKeyWithOffset(0),
        createdAt: Date.now() - 1000 * 60 * 60 * 4,
        updatedAt: Date.now() - 1000 * 60 * 60 * 4,
    },
];

export const APP_THEMES: Record<ThemeName, AppTheme> = {
    light: {
        name: "light",
        label: "Clair",
        isDark: false,
        primary: PRIMARY_BLUE,
        primarySoft: "#BFDBFE",
        background: "#F7FAFF",
        backgroundSecondary: "#DFEAFF",
        surface: "#FFFFFF",
        surfaceStrong: "#EEF4FF",
        text: "#0F172A",
        textMuted: "#475569",
        border: "#CBD5E1",
        danger: "#DC2626",
        tabBar: "#F1F5F9",
        fab: PRIMARY_BLUE,
        fabText: "#FFFFFF",
    },
    dark: {
        name: "dark",
        label: "Sombre",
        isDark: true,
        primary: PRIMARY_BLUE,
        primarySoft: "#1E3A8A",
        background: "#020617",
        backgroundSecondary: "#0F172A",
        surface: "#111827",
        surfaceStrong: "#1E293B",
        text: "#E2E8F0",
        textMuted: "#94A3B8",
        border: "#334155",
        danger: "#F87171",
        tabBar: "#0B1220",
        fab: "#E2E8F0",
        fabText: "#0B1220",
    },
};

const isThemeName = (value: unknown): value is ThemeName => value === "light" || value === "dark";

type AddTaskInput = {
    title: string;
    notes?: string;
    groupId?: string;
    priority?: TaskPriority;
    dueDate?: string;
};

type TodoContextValue = {
    hydrated: boolean;
    groups: TaskGroup[];
    tasks: TaskItem[];
    themeName: ThemeName;
    theme: AppTheme;
    preferences: TaskPreferences;
    composerOpen: boolean;
    composerPresetGroupId: string | null;
    sheetTaskId: string | null;
    setThemeName: (nextTheme: ThemeName) => void;
    setPreference: <K extends keyof TaskPreferences>(key: K, value: TaskPreferences[K]) => void;
    openComposer: (groupId?: string) => void;
    closeComposer: () => void;
    openTaskSheet: (taskId: string) => void;
    closeTaskSheet: () => void;
    addGroup: (name: string, color?: string) => { ok: boolean; message?: string; group?: TaskGroup };
    addTask: (input: AddTaskInput) => { ok: boolean; message?: string; task?: TaskItem };
    updateTask: (taskId: string, patch: Partial<Omit<TaskItem, "id" | "createdAt">>) => void;
    toggleTask: (taskId: string) => void;
    deleteTask: (taskId: string) => void;
    clearCompleted: () => void;
    getTaskById: (taskId: string) => TaskItem | undefined;
    getGroupById: (groupId: string) => TaskGroup | undefined;
    getTasksForDate: (dateKey: string) => TaskItem[];
    getTasksForGroup: (groupId: string) => TaskItem[];
};

const TodoContext = createContext<TodoContextValue | undefined>(undefined);

type PersistedState = {
    groups: TaskGroup[];
    tasks: TaskItem[];
    themeName: ThemeName;
    preferences: TaskPreferences;
};

const sortTasks = (items: TaskItem[], preferences: TaskPreferences) => {
    return [...items].sort((a, b) => {
        if (preferences.moveDoneToBottom && a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }

        if (a.dueDate !== b.dueDate) {
            return a.dueDate.localeCompare(b.dueDate);
        }

        return b.updatedAt - a.updatedAt;
    });
};

export function TodoProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useColorScheme();
    const systemThemeName: ThemeName = systemColorScheme === "dark" ? "dark" : "light";

    const [hydrated, setHydrated] = useState(false);
    const [groups, setGroups] = useState<TaskGroup[]>(DEFAULT_GROUPS);
    const [tasks, setTasks] = useState<TaskItem[]>(DEFAULT_TASKS);
    const [themeName, setThemeNameState] = useState<ThemeName>(systemThemeName);
    const [preferences, setPreferences] = useState<TaskPreferences>(DEFAULT_PREFERENCES);

    const [composerOpen, setComposerOpen] = useState(false);
    const [composerPresetGroupId, setComposerPresetGroupId] = useState<string | null>(null);
    const [sheetTaskId, setSheetTaskId] = useState<string | null>(null);

    useEffect(() => {
        if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const hydrate = async () => {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if (!raw) {
                    return;
                }

                const parsed = JSON.parse(raw) as Partial<PersistedState>;

                if (!mounted) {
                    return;
                }

                if (Array.isArray(parsed.groups) && parsed.groups.length > 0) {
                    setGroups(parsed.groups);
                }

                if (Array.isArray(parsed.tasks)) {
                    setTasks(parsed.tasks);
                }

                if (isThemeName(parsed.themeName)) {
                    setThemeNameState(parsed.themeName);
                } else {
                    setThemeNameState(systemThemeName);
                }

                if (parsed.preferences) {
                    setPreferences({
                        ...DEFAULT_PREFERENCES,
                        ...parsed.preferences,
                    });
                }
            } catch (error) {
                console.warn("Todo state hydration failed", error);
            } finally {
                if (mounted) {
                    setHydrated(true);
                }
            }
        };

        hydrate();

        return () => {
            mounted = false;
        };
    }, [systemThemeName]);

    useEffect(() => {
        if (!hydrated) {
            return;
        }

        const persist = async () => {
            const payload: PersistedState = {
                groups,
                tasks,
                themeName,
                preferences,
            };

            try {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            } catch (error) {
                console.warn("Todo state persistence failed", error);
            }
        };

        persist();
    }, [groups, hydrated, preferences, tasks, themeName]);

    const setThemeName = useCallback((nextTheme: ThemeName) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setThemeNameState(nextTheme);
    }, []);

    const setPreference = useCallback(
        <K extends keyof TaskPreferences>(key: K, value: TaskPreferences[K]) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setPreferences((prev) => ({
                ...prev,
                [key]: value,
            }));
        },
        [],
    );

    const openComposer = useCallback((groupId?: string) => {
        if (groupId) {
            setComposerPresetGroupId(groupId);
        } else {
            setComposerPresetGroupId(null);
        }
        setComposerOpen(true);
    }, []);

    const closeComposer = useCallback(() => {
        setComposerOpen(false);
        setComposerPresetGroupId(null);
    }, []);

    const openTaskSheet = useCallback((taskId: string) => {
        setSheetTaskId(taskId);
    }, []);

    const closeTaskSheet = useCallback(() => {
        setSheetTaskId(null);
    }, []);

    const addGroup = useCallback(
        (name: string, color?: string) => {
            const trimmed = name.trim();
            if (!trimmed) {
                return { ok: false, message: "Nom de groupe requis." };
            }

            const exists = groups.some((group) => group.name.toLowerCase() === trimmed.toLowerCase());
            if (exists) {
                return { ok: false, message: "Ce groupe existe deja." };
            }

            const nextGroup: TaskGroup = {
                id: makeId(),
                name: trimmed,
                color: color ?? GROUP_COLORS[groups.length % GROUP_COLORS.length],
            };

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setGroups((prev) => [...prev, nextGroup]);
            return { ok: true, group: nextGroup };
        },
        [groups],
    );

    const addTask = useCallback(
        (input: AddTaskInput) => {
            const title = input.title.trim();
            if (!title) {
                return { ok: false, message: "Titre requis." };
            }

            const groupId = input.groupId && groups.some((g) => g.id === input.groupId)
                ? input.groupId
                : groups[0]?.id;

            if (!groupId) {
                return { ok: false, message: "Ajoute un groupe avant de creer une tache." };
            }

            const task: TaskItem = {
                id: makeId(),
                title,
                notes: input.notes?.trim() ?? "",
                completed: false,
                groupId,
                priority: input.priority ?? preferences.defaultPriority,
                dueDate: input.dueDate ?? getDateKeyWithOffset(0),
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setTasks((prev) => [task, ...prev]);
            return { ok: true, task };
        },
        [groups, preferences.defaultPriority],
    );

    const updateTask = useCallback(
        (taskId: string, patch: Partial<Omit<TaskItem, "id" | "createdAt">>) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setTasks((prev) =>
                prev.map((task) =>
                    task.id === taskId
                        ? {
                            ...task,
                            ...patch,
                            updatedAt: Date.now(),
                        }
                        : task,
                ),
            );
        },
        [],
    );

    const toggleTask = useCallback((taskId: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId
                    ? {
                        ...task,
                        completed: !task.completed,
                        updatedAt: Date.now(),
                    }
                    : task,
            ),
        );
    }, []);

    const deleteTask = useCallback(
        (taskId: string) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setTasks((prev) => prev.filter((task) => task.id !== taskId));
            if (sheetTaskId === taskId) {
                setSheetTaskId(null);
            }
        },
        [sheetTaskId],
    );

    const clearCompleted = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setTasks((prev) => prev.filter((task) => !task.completed));
    }, []);

    const getTaskById = useCallback((taskId: string) => tasks.find((task) => task.id === taskId), [tasks]);

    const getGroupById = useCallback(
        (groupId: string) => groups.find((group) => group.id === groupId),
        [groups],
    );

    const getTasksForDate = useCallback(
        (dateKey: string) => sortTasks(tasks.filter((task) => task.dueDate === dateKey), preferences),
        [preferences, tasks],
    );

    const getTasksForGroup = useCallback(
        (groupId: string) => sortTasks(tasks.filter((task) => task.groupId === groupId), preferences),
        [preferences, tasks],
    );

    const value = useMemo<TodoContextValue>(
        () => ({
            hydrated,
            groups,
            tasks,
            themeName,
            theme: APP_THEMES[themeName],
            preferences,
            composerOpen,
            composerPresetGroupId,
            sheetTaskId,
            setThemeName,
            setPreference,
            openComposer,
            closeComposer,
            openTaskSheet,
            closeTaskSheet,
            addGroup,
            addTask,
            updateTask,
            toggleTask,
            deleteTask,
            clearCompleted,
            getTaskById,
            getGroupById,
            getTasksForDate,
            getTasksForGroup,
        }),
        [
            addGroup,
            addTask,
            clearCompleted,
            closeComposer,
            closeTaskSheet,
            composerOpen,
            composerPresetGroupId,
            deleteTask,
            getGroupById,
            getTaskById,
            getTasksForDate,
            getTasksForGroup,
            groups,
            hydrated,
            openComposer,
            openTaskSheet,
            preferences,
            setPreference,
            setThemeName,
            sheetTaskId,
            tasks,
            themeName,
            toggleTask,
            updateTask,
        ],
    );

    return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodo() {
    const context = useContext(TodoContext);
    if (!context) {
        throw new Error("useTodo must be used within TodoProvider");
    }
    return context;
}
