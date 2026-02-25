import { useThemeContext } from "@/context/theme-context";
import { Patient } from "@/types/patient";
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
  patient: Patient;
  isSelected: boolean;
  onPress: (id: number) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
};

const PatientCard = ({
  patient,
  isSelected,
  onPress,
  onEdit,
  onDelete,
}: Props) => {
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";

  const colors = {
    card: isDark ? "#1E1E1E" : "#FFFFFF",
    cardBorder: isDark ? "#2E2E2E" : "#E5E5E5",
    avatar: isDark ? "#2E2E2E" : "#E5E5E5",
    avatarText: isDark ? "#AAAAAA" : "#808080",
    name: isDark ? "#FFFFFF" : "#000000",
    infoRow: isDark ? "#2A2A2A" : "#F9F9F9",
    infoDivider: isDark ? "#3A3A3A" : "#E5E5E5",
    infoLabel: isDark ? "#AAAAAA" : "#808080",
    infoValue: isDark ? "#FFFFFF" : "#000000",
    menuBg: isDark ? "#2A2A2A" : "#FFFFFF",
    menuDivider: isDark ? "#3A3A3A" : "#F0F0F0",
    menuText: isDark ? "#FFFFFF" : "#000000",
    dotIcon: isDark ? "#AAAAAA" : "#808080",
  };

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
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.cardBorder },
        isSelected && styles.cardSelected,
      ]}
      onPress={() => onPress(patient.id)}
      activeOpacity={0.8}
    >
      <View style={styles.headerRow}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: colors.avatar },
            isSelected && styles.avatarSelected,
          ]}
        >
          <Text
            style={[
              styles.avatarText,
              { color: colors.avatarText },
              isSelected && styles.avatarTextSelected,
            ]}
          >
            {patient.fullname.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text
          style={[
            styles.name,
            { color: colors.name },
            isSelected && styles.nameSelected,
          ]}
        >
          {patient.fullname}
        </Text>

        {/* 3-dot button */}
        <TouchableOpacity
          ref={dotButtonRef}
          style={styles.dotButton}
          onPress={handleDotPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.dotIcon} />
        </TouchableOpacity>
      </View>

      {/* Info row */}
      <View style={[styles.infoRow, { backgroundColor: colors.infoRow }]}>
        <View style={styles.infoItem}>
          <Text
            style={[
              styles.infoLabel,
              { color: colors.infoLabel },
              isSelected && styles.infoLabelSelected,
            ]}
          >
            Age
          </Text>
          <Text
            style={[
              styles.infoValue,
              { color: colors.infoValue },
              isSelected && styles.infoValueSelected,
            ]}
          >
            {patient.age} yrs
          </Text>
        </View>
        <View
          style={[styles.infoDivider, { backgroundColor: colors.infoDivider }]}
        />
        <View style={styles.infoItem}>
          <Text
            style={[
              styles.infoLabel,
              { color: colors.infoLabel },
              isSelected && styles.infoLabelSelected,
            ]}
          >
            Height
          </Text>
          <Text
            style={[
              styles.infoValue,
              { color: colors.infoValue },
              isSelected && styles.infoValueSelected,
            ]}
          >
            {patient.height} cm
          </Text>
        </View>
        <View
          style={[styles.infoDivider, { backgroundColor: colors.infoDivider }]}
        />
        <View style={styles.infoItem}>
          <Text
            style={[
              styles.infoLabel,
              { color: colors.infoLabel },
              isSelected && styles.infoLabelSelected,
            ]}
          >
            Weight
          </Text>
          <Text
            style={[
              styles.infoValue,
              { color: colors.infoValue },
              isSelected && styles.infoValueSelected,
            ]}
          >
            {patient.weight} kg
          </Text>
        </View>
      </View>

      {/* Modal dropdown — renders outside card bounds */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.menuContainer,
                {
                  top: menuPosition.y + 24,
                  left: menuPosition.x - 120,
                  backgroundColor: colors.menuBg,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  onEdit(patient);
                }}
              >
                <Ionicons
                  name="create-outline"
                  size={18}
                  color={colors.menuText}
                />
                <Text style={[styles.menuText, { color: colors.menuText }]}>
                  Edit
                </Text>
              </TouchableOpacity>

              <View
                style={[
                  styles.menuDivider,
                  { backgroundColor: colors.menuDivider },
                ]}
              />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  onDelete(patient);
                }}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text style={styles.menuDeleteText}>Delete</Text>
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
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: {
    borderColor: "#4F7D81",
    backgroundColor: "#000000",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarSelected: {
    backgroundColor: "#4F7D81",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#808080",
  },
  avatarTextSelected: {
    color: "#FFFFFF",
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  nameSelected: {
    color: "#4F7D81",
  },
  dotButton: {
    paddingHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  menuContainer: {
    position: "absolute",
    borderRadius: 12,
    width: 150,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  menuDeleteText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#EF4444",
  },
  infoRow: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    paddingVertical: 10,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
  },
  infoDivider: {
    width: 1,
    backgroundColor: "#E5E5E5",
  },
  infoLabel: {
    fontSize: 11,
    color: "#808080",
    marginBottom: 2,
  },
  infoLabelSelected: {
    color: "#477E85",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  infoValueSelected: {
    color: "#4F7D81",
  },
});
