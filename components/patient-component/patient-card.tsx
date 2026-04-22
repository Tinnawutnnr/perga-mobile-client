import { PatientBrief } from "@/api/caregiver";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";

type Props = {
  patient: PatientBrief;
  isSelected: boolean;
  onPress: (id: number) => void;
  onDelete: (patient: PatientBrief) => void;
  isLast?: boolean;
};

function hexToRGBA(hex: string, alpha: number) {
  if (!/^#([A-Fa-f0-9]{6})$/.test(hex)) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const PatientCard = ({ patient, isSelected, onPress, onDelete, isLast }: Props) => {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  const fullname = `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim();
  const initial = (patient.first_name ?? patient.username ?? "?").charAt(0).toUpperCase();

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const dotButtonRef = useRef<View>(null);

  const handleDotPress = () => {
    dotButtonRef.current?.measure((_fx, _fy, _w, _h, px, py) => {
      setMenuPosition({ x: px, y: py });
      setMenuVisible(true);
    });
  };

  const discBg = isSelected ? C.tint : hexToRGBA(C.tint, 0.1);
  const discText = isSelected ? "#FFFFFF" : C.tint;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.row,
          !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
        ]}
        onPress={() => onPress(patient.id)}
        activeOpacity={0.7}
        accessibilityRole="radio"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={fullname || patient.username}
      >
        {/* Initials disc */}
        <View style={[styles.disc, { backgroundColor: discBg }]}>
          <ThemedText style={[styles.discText, { color: discText }]}>
            {initial}
          </ThemedText>
        </View>

        {/* Name block */}
        <View style={styles.nameBlock}>
          <ThemedText style={styles.name} numberOfLines={1}>
            {fullname || patient.username}
          </ThemedText>
          <ThemedText type="muted" style={styles.username} numberOfLines={1}>
            @{patient.username}
          </ThemedText>
        </View>

        {/* Right: checkmark when selected, menu when not */}
        {isSelected ? (
          <Ionicons name="checkmark-circle" size={22} color={C.tint} />
        ) : (
          <TouchableOpacity
            ref={dotButtonRef}
            onPress={handleDotPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Patient options"
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={C.muted} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.menuContainer,
                {
                  backgroundColor: C.card,
                  top: menuPosition.y + 20,
                  left: menuPosition.x - 148,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  onDelete(patient);
                }}
              >
                <Ionicons name="trash-outline" size={16} color={C.error} />
                <ThemedText style={[styles.menuDeleteText, { color: C.error }]}>
                  Remove patient
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

export default PatientCard;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 64,
    gap: 14,
  },
  disc: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  discText: {
    fontSize: 18,
    fontWeight: "700",
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  username: {
    fontSize: 13,
    marginTop: 1,
  },
  modalOverlay: { flex: 1 },
  menuContainer: {
    position: "absolute",
    borderRadius: 12,
    paddingVertical: 4,
    minWidth: 164,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  menuDeleteText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
