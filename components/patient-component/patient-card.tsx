import { PatientBrief } from "@/api/caregiver";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type Props = {
  patient: PatientBrief;
  isSelected: boolean;
  onPress: (id: number) => void;
  onDelete: (patient: PatientBrief) => void;
};

const PatientCard = ({ patient, isSelected, onPress, onDelete }: Props) => {
  const fullname =
    `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const dotButtonRef = useRef<View>(null);

  const handleDotPress = () => {
    dotButtonRef.current?.measure((_fx, _fy, _w, _h, px, py) => {
      setMenuPosition({ x: px, y: py });
      setMenuVisible(true);
    });
  };

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={() => onPress(patient.id)}
      activeOpacity={0.8}
    >
      <View style={styles.headerRow}>
        <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
          <Text
            style={[styles.avatarText, isSelected && styles.avatarTextSelected]}
          >
            {(patient.first_name ?? patient.username ?? "?")
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>
        <View style={styles.nameBlock}>
          <Text style={[styles.name, isSelected && styles.nameSelected]}>
            {fullname}
          </Text>
          <Text
            style={[styles.username, isSelected && styles.usernameSelected]}
          >
            @{patient.username}
          </Text>
        </View>
        <TouchableOpacity
          ref={dotButtonRef}
          onPress={handleDotPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={isSelected ? "#FFFFFF" : "#808080"}
          />
        </TouchableOpacity>
      </View>

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
                { top: menuPosition.y + 24, left: menuPosition.x - 120 },
              ]}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  onDelete(patient);
                }}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text style={styles.menuDeleteText}>Remove Patient</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </TouchableOpacity>
  );
};

export default PatientCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 12,
  },
  cardSelected: {
    borderColor: "#4F7D81",
    backgroundColor: "#4F7D81",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F0F1",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSelected: { backgroundColor: "rgba(255,255,255,0.25)" },
  avatarText: { fontSize: 18, fontWeight: "700", color: "#4F7D81" },
  avatarTextSelected: { color: "#FFFFFF" },
  nameBlock: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600", color: "#000000" },
  nameSelected: { color: "#FFFFFF" },
  username: { fontSize: 13, color: "#808080", marginTop: 2 },
  usernameSelected: { color: "rgba(255,255,255,0.75)" },
  modalOverlay: { flex: 1 },
  menuContainer: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 4,
    minWidth: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  menuDeleteText: { fontSize: 14, color: "#EF4444", fontWeight: "500" },
});
