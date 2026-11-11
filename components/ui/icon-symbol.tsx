/**
 * Icon component using Material Icons.
 * Compatible with Expo SDK 58.
 */

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { SymbolViewProps, SymbolWeight } from "expo-symbols";
import type { ComponentProps } from "react";
import type { OpaqueColorValue, StyleProp, TextStyle } from "react-native";

// Supported SF Symbol names (string only)
type SFSymbolName = Extract<SymbolViewProps["name"], string>;

// Supported Material Icon names
type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

// Map SF Symbols to Material Icons
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
} as const satisfies Partial<Record<SFSymbolName, MaterialIconName>>;

// Only allow icons defined in MAPPING
export type IconSymbolName = keyof typeof MAPPING;

// Component props
type IconSymbolProps = {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
};

/**
 * Material Icons fallback.
 * Compatible with Android, iOS and Web.
 */
export function IconSymbol({ name, size = 24, color, style }: IconSymbolProps) {
  const materialIconName: MaterialIconName = MAPPING[name];

  return (
    <MaterialIcons
      name={materialIconName}
      size={size}
      color={color}
      style={style}
    />
  );
}
