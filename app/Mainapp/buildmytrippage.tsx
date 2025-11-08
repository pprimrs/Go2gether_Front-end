import React, { useMemo, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { styles } from "./styles/buildmytripstyles";

function formatDate(d?: Date) {
  if (!d) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

const isEmail = (s: string) =>
  !!s.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim().toLowerCase());

export default function MyTripPage() {
  const [tripName, setTripName] = useState("");
  const [address, setAddress] = useState("");

  // ---------- Cover image ----------
  const [coverUri, setCoverUri] = useState<string | undefined>(undefined);

  const pickCover = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow photo library access.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
      aspect: [4, 4],
    });
    if (!res.canceled && res.assets?.length) {
      setCoverUri(res.assets[0].uri);
    }
  };

  // ---------- Date range ----------
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Modal bottom sheet for DateTimePicker
  const [pickerVisible, setPickerVisible] = useState(false);
  const [picking, setPicking] = useState<"start" | "end">("start");
  const [tempDate, setTempDate] = useState<Date>(new Date());

  // ---------- Friends ----------
  const [friendEmail, setFriendEmail] = useState("");
  const [friends, setFriends] = useState<string[]>([]);

  const addFriend = () => {
    const email = friendEmail.trim().toLowerCase();
    if (!isEmail(email)) {
      Alert.alert("Invalid email", "Please enter a valid email.");
      return;
    }
    if (friends.includes(email)) {
      Alert.alert("Duplicate", "This email has already been added.");
      return;
    }
    setFriends((prev) => [...prev, email]);
    setFriendEmail("");
    Keyboard.dismiss();
  };
  const removeFriend = (email: string) =>
    setFriends((prev) => prev.filter((e) => e !== email));

  // ---------- Budget ----------
  const [budget, setBudget] = useState({
    food: "",
    hotel: "",
    shopping: "",
    transport: "",
  });

  const canPublish = useMemo(
    () => !!tripName.trim() && !!startDate && !!endDate && endDate >= startDate,
    [tripName, startDate, endDate]
  );

  // ---------- Date pickers ----------
  const openStartPicker = () => {
    Keyboard.dismiss();
    setPicking("start");
    setTempDate(startDate || new Date());
    setPickerVisible(true);
  };
  const openEndPicker = () => {
    if (!startDate) {
      Alert.alert("Select start date first");
      return;
    }
    Keyboard.dismiss();
    setPicking("end");
    setTempDate(endDate || startDate || new Date());
    setPickerVisible(true);
  };

  const confirmPick = () => {
    if (picking === "start") {
      setStartDate(tempDate);
      if (endDate && endDate < tempDate) setEndDate(undefined);
    } else {
      if (startDate && tempDate < startDate) {
        Alert.alert("Invalid range", "End date must be after the start date.");
        return;
      }
      setEndDate(tempDate);
    }
    setPickerVisible(false);
  };

  const onAndroidChange = (e: DateTimePickerEvent, d?: Date) => {
    if (e.type === "dismissed") return;
    if (d) setTempDate(d);
  };
  const onIOSChange = (_: any, d?: Date) => {
    if (d) setTempDate(d);
  };

  const onDraft = () =>
    Alert.alert("Saved to Draft", "Your trip has been saved as a draft.");
  const onPublish = () => {
    if (!canPublish) {
      Alert.alert("Incomplete", "Please fill in trip name and date range.");
      return;
    }
    Alert.alert("Published", "Your trip has been published!");
    if (router.canGoBack()) router.back();
    else router.replace("/Mainapp/homepage");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FFF" }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      {/* Header */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/Mainapp/homepage");
          }}
          hitSlop={10}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="chevron-back" size={24} color="#111" />
        </Pressable>

        <Text style={styles.title}>Edit Your Trip</Text>

        <Pressable
          onPress={() => Alert.alert("Favorite", "Coming soon")}
          hitSlop={10}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="star-outline" size={24} color="#C9C9C9" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.pageContent, { paddingBottom: 260 }]} // ✅ ยืดพอให้เลื่อน
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled
        bounces
        showsVerticalScrollIndicator
      >
        {/* Cover image */}
        <View style={styles.coverWrap}>
          <Image
            source={
              coverUri
                ? { uri: coverUri }
                : require("../../assets/images/japan.png")
            }
            style={styles.coverImg}
            contentFit="cover"
          />
          <Pressable style={styles.coverAction} onPress={pickCover}>
            <Ionicons name="image-outline" size={18} color="#fff" />
          </Pressable>
        </View>

        {/* Trip Name */}
        <Text style={styles.label}>Your Trip Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Trip Name"
          value={tripName}
          onChangeText={setTripName}
          returnKeyType="next"
        />

        {/* Address */}
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Address"
          value={address}
          onChangeText={setAddress}
          returnKeyType="next"
        />

        {/* Period */}
        <Text style={[styles.label, { marginBottom: 6 }]}>Period</Text>
        <Text style={styles.helper}>Please select the period (From - To)</Text>

        <View style={styles.row}>
          <Pressable
            style={[styles.dateBox, !startDate && styles.dateBoxPlaceholder]}
            onPress={openStartPicker}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={startDate ? "#2F5064" : "#9BA4AE"}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.dateText, !startDate && styles.datePlaceholder]}>
              {startDate ? formatDate(startDate) : "From"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.dateBox, !endDate && styles.dateBoxPlaceholder]}
            onPress={openEndPicker}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={endDate ? "#2F5064" : "#9BA4AE"}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.dateText, !endDate && styles.datePlaceholder]}>
              {endDate ? formatDate(endDate) : "To"}
            </Text>
          </Pressable>
        </View>

        {/* Add Friends */}
        <Text style={styles.label}>Add Friends</Text>
        <View style={styles.addFriendRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Enter Your Friends Email"
            keyboardType="email-address"
            value={friendEmail}
            onChangeText={setFriendEmail}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={addFriend}
          />
          <Pressable onPress={addFriend} style={styles.addBtn}>
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>

        {friends.length > 0 && (
          <View style={styles.chipsWrap}>
            {friends.map((em) => (
              <View key={em} style={styles.chip}>
                <Text style={styles.chipText}>{em}</Text>
                <Pressable onPress={() => removeFriend(em)} hitSlop={10}>
                  <Ionicons name="close-circle" size={16} color="#97A6B1" />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Budget */}
        <Text style={styles.label}>Budget</Text>
        {["Food", "Hotel", "Shopping", "Transportation"].map((type) => {
          const key = type.toLowerCase() as keyof typeof budget;
          const icon =
            type === "Food"
              ? "cafe-outline"
              : type === "Hotel"
              ? "bed-outline"
              : type === "Shopping"
              ? "bag-outline"
              : "bus-outline";
          return (
            <View key={key} style={styles.budgetRow}>
              <Ionicons name={icon} size={16} color="#B2B2B2" />
              <Text style={styles.budgetText}>{type}</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="numeric"
                value={budget[key]}
                onChangeText={(v) =>
                  setBudget((b) => ({ ...b, [key]: v.replace(/[^\d]/g, "") }))
                }
              />
              <Text style={styles.currency}>฿</Text>
            </View>
          );
        })}

        <View style={{ height: 12 }} />

        {/* Buttons */}
        <View style={styles.bottomButtons}>
          <Pressable style={styles.btnGhost} onPress={onDraft}>
            <Text style={styles.btnGhostText}>Draft</Text>
          </Pressable>

          <Pressable
            style={[styles.btnPrimary, !canPublish && styles.btnPrimaryDisabled]}
            disabled={!canPublish}
            onPress={onPublish}
          >
            <Text
              style={[
                styles.btnPrimaryText,
                !canPublish && styles.btnPrimaryTextDisabled,
              ]}
            >
              Publish
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ===== Date Picker Modal ===== */}
      <Modal
        visible={pickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setPickerVisible(false)} hitSlop={10}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalTitle}>
                {picking === "start" ? "Select Start Date" : "Select End Date"}
              </Text>
              <Pressable onPress={confirmPick} hitSlop={10}>
                <Text style={styles.modalDone}>Done</Text>
              </Pressable>
            </View>

            <DateTimePicker
              value={tempDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "calendar"}
              onChange={Platform.OS === "ios" ? onIOSChange : onAndroidChange}
              minimumDate={picking === "end" ? (startDate || new Date()) : new Date()}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
