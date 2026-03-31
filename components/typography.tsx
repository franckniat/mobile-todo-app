import { forwardRef } from "react";
import {
    Text as RNText,
    TextInput as RNTextInput,
    StyleProp,
    StyleSheet,
    TextInputProps,
    TextProps,
    TextStyle,
} from "react-native";

const getSpaceGroteskFamily = (fontWeight?: TextStyle["fontWeight"]) => {
    if (!fontWeight || fontWeight === "normal") {
        return "SpaceGrotesk_400Regular";
    }

    if (fontWeight === "bold") {
        return "SpaceGrotesk_700Bold";
    }

    const numericWeight = Number(fontWeight);
    if (Number.isNaN(numericWeight)) {
        return "SpaceGrotesk_400Regular";
    }

    if (numericWeight >= 700) {
        return "SpaceGrotesk_700Bold";
    }

    if (numericWeight >= 600) {
        return "SpaceGrotesk_600SemiBold";
    }

    if (numericWeight >= 500) {
        return "SpaceGrotesk_500Medium";
    }

    if (numericWeight <= 300) {
        return "SpaceGrotesk_300Light";
    }

    return "SpaceGrotesk_400Regular";
};

const normalizeTextStyle = (style?: StyleProp<TextStyle>) => {
    const flattened = StyleSheet.flatten(style) ?? {};
    const fontFamily = getSpaceGroteskFamily(flattened.fontWeight);

    return {
        ...flattened,
        fontWeight: undefined,
        fontFamily,
    };
};

export const AppText = forwardRef<RNText, TextProps>(function AppText({ style, ...props }, ref) {
    return <RNText ref={ref} {...props} style={normalizeTextStyle(style)} />;
});

export const AppTextInput = forwardRef<RNTextInput, TextInputProps>(function AppTextInput(
    { style, ...props },
    ref,
) {
    return <RNTextInput ref={ref} {...props} style={normalizeTextStyle(style)} />;
});
