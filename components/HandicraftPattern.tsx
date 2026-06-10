import React from "react";
import { View, StyleSheet } from "react-native";

interface Props {
  color?: string;
  opacity?: number;
}

export function HandicraftPattern({ color = "#e67e22", opacity = 0.08 }: Props) {
  const c = color;
  return (
    <View style={[StyleSheet.absoluteFill, styles.root]} pointerEvents="none">
      {/* Top-right corner motif */}
      <View style={[styles.cornerTR]}>
        {[0, 1, 2, 3, 4].map(i => (
          <View key={i} style={[styles.diamond, {
            width: 10 + i * 6, height: 10 + i * 6,
            borderColor: c, opacity: opacity * (1 - i * 0.15),
            transform: [{ rotate: "45deg" }],
          }]} />
        ))}
      </View>

      {/* Bottom-left corner motif */}
      <View style={[styles.cornerBL]}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[styles.diamond, {
            width: 8 + i * 6, height: 8 + i * 6,
            borderColor: c, opacity: opacity * (1 - i * 0.18),
            transform: [{ rotate: "45deg" }],
          }]} />
        ))}
      </View>

      {/* Dot grid pattern */}
      {[...Array(6)].map((_, row) =>
        [...Array(5)].map((_, col) => (
          <View key={`${row}-${col}`} style={[styles.dot, {
            top: 60 + row * 90,
            left: 30 + col * 70,
            backgroundColor: c,
            opacity: opacity * 0.6,
          }]} />
        ))
      )}

      {/* Horizontal weave lines */}
      {[140, 240, 340, 480, 600].map(top => (
        <View key={top} style={[styles.weaveLine, { top, borderTopColor: c, opacity: opacity * 0.5 }]} />
      ))}

      {/* Small diamond accents */}
      {[
        { top: 120, left: 30 }, { top: 200, left: 340 },
        { top: 350, left: 60 }, { top: 430, left: 310 },
        { top: 520, left: 150 }, { top: 640, left: 50 },
      ].map((pos, i) => (
        <View key={i} style={[styles.smallDiamond, {
          top: pos.top, left: pos.left,
          borderColor: c, opacity: opacity * 0.7,
          transform: [{ rotate: "45deg" }],
        }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { overflow: "hidden" },
  cornerTR: {
    position: "absolute", top: 10, right: 10,
    alignItems: "center", justifyContent: "center",
    width: 80, height: 80,
  },
  cornerBL: {
    position: "absolute", bottom: 80, left: 10,
    alignItems: "center", justifyContent: "center",
    width: 60, height: 60,
  },
  diamond: {
    position: "absolute",
    borderWidth: 1.5,
  },
  smallDiamond: {
    position: "absolute",
    width: 12, height: 12,
    borderWidth: 1.5,
  },
  dot: {
    position: "absolute",
    width: 4, height: 4, borderRadius: 2,
  },
  weaveLine: {
    position: "absolute", left: 0, right: 0,
    borderTopWidth: 1, borderTopStyle: "dashed",
  } as any,
});
