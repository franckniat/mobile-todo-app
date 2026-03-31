import { AppText as Text } from "@/components/typography";
import { useTodo } from "@/store/todo-context";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloatingAddButton() {
    const insets = useSafeAreaInsets();
    const { openComposer, theme } = useTodo();

    const pulseScale = useSharedValue(1);
    const pressScale = useSharedValue(1);

    useEffect(() => {
        pulseScale.value = withRepeat(
            withSequence(
                withTiming(1.06, { duration: 1700, easing: Easing.inOut(Easing.quad) }),
                withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.quad) }),
            ),
            -1,
            false,
        );

        return () => {
            cancelAnimation(pulseScale);
        };
    }, [pulseScale]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value * pressScale.value }],
    }));

    return (
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
            <AnimatedPressable
                accessibilityRole="button"
                accessibilityLabel="Ajouter une tache"
                onPress={() => openComposer()}
                onPressIn={() => {
                    pressScale.value = withSpring(0.92, { damping: 16, stiffness: 240 });
                }}
                onPressOut={() => {
                    pressScale.value = withSpring(1, { damping: 16, stiffness: 240 });
                }}
                style={[
                    styles.fab,
                    animatedStyle,
                    {
                        bottom: insets.bottom + 74,
                        backgroundColor: theme.fab,
                        shadowColor: theme.primary,
                    },
                ]}
            >
                <Text style={[styles.fabPlus, { color: theme.fabText }]}>+</Text>
            </AnimatedPressable>
        </View>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: "absolute",
        right: 18,
        width: 62,
        height: 62,
        borderRadius: 31,
        justifyContent: "center",
        alignItems: "center",
        shadowOpacity: 0.35,
        shadowRadius: 14,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        elevation: 9,
    },
    fabPlus: {
        fontSize: 34,
        lineHeight: 36,
        fontWeight: "300",
        marginTop: -1,
    },
});
