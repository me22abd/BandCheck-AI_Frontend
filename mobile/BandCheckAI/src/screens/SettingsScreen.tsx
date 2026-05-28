import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { PaperBackground } from "../components/editorial/PaperBackground";
import { TopBar } from "../components/editorial/TopBar";
import { Wordmark } from "../components/editorial/Wordmark";
import { Hairline } from "../components/editorial/Hairline";
import { useAppContext } from "../context/AppContext";
import { editorial } from "../theme/editorial";

const APP_VERSION = "1.0.0";

function SettingsRow({
  label,
  value,
  onPress,
  right,
  muted,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  muted?: boolean;
}) {
  const { fonts } = useAppContext();
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && onPress && styles.rowPressed]}
      onPress={onPress}
      disabled={!onPress && !right}
    >
      <Text
        style={[
          styles.rowLabel,
          { fontFamily: fonts.sans },
          muted && styles.rowLabelMuted,
        ]}
      >
        {label}
      </Text>
      {right ?? (
        value ? (
          <Text style={[styles.rowValue, { fontFamily: fonts.mono }]}>{value}</Text>
        ) : (
          onPress ? <Text style={styles.rowArrow}>→</Text> : null
        )
      )}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  const { fonts } = useAppContext();
  return (
    <Text style={[styles.sectionHeader, { fontFamily: fonts.sansBold }]}>{title}</Text>
  );
}

export function SettingsScreen() {
  const { fonts } = useAppContext();

  return (
    <PaperBackground>
      <TopBar fonts={fonts} left={<Wordmark fonts={fonts} />} title="Settings" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications */}
        <View style={styles.section}>
          <SectionHeader title="Notifications" />
          <View style={styles.card}>
            <SettingsRow
              label="Appeal status reminders"
              right={<Switch value={false} onValueChange={() => {}} thumbColor={editorial.colors.paper} trackColor={{ false: editorial.colors.paper2, true: editorial.colors.forest }} />}
            />
            <Hairline />
            <SettingsRow
              label="New area stats available"
              right={<Switch value={false} onValueChange={() => {}} thumbColor={editorial.colors.paper} trackColor={{ false: editorial.colors.paper2, true: editorial.colors.forest }} />}
            />
          </View>
          <Text style={[styles.sectionNote, { fontFamily: fonts.sans }]}>
            Push notifications require a development build.
          </Text>
        </View>

        {/* About */}
        <View style={styles.section}>
          <SectionHeader title="About" />
          <View style={styles.card}>
            <SettingsRow label="Version" value={APP_VERSION} />
            <Hairline />
            <SettingsRow
              label="How BandCheck AI works"
              onPress={() => Linking.openURL("https://www.bandcheckai.co.uk/how-it-works")}
            />
            <Hairline />
            <SettingsRow
              label="About us"
              onPress={() => Linking.openURL("https://www.bandcheckai.co.uk/about")}
            />
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <SectionHeader title="Legal" />
          <View style={styles.card}>
            <SettingsRow
              label="Privacy policy"
              onPress={() => Linking.openURL("https://www.bandcheckai.co.uk/privacy")}
            />
            <Hairline />
            <SettingsRow
              label="Terms of service"
              onPress={() => Linking.openURL("https://www.bandcheckai.co.uk/terms")}
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <SectionHeader title="Support" />
          <View style={styles.card}>
            <SettingsRow
              label="Contact support"
              onPress={() => Linking.openURL("mailto:support@bandcheckai.co.uk")}
            />
            <Hairline />
            <SettingsRow
              label="Report a bug"
              onPress={() => Linking.openURL("mailto:bugs@bandcheckai.co.uk?subject=Bug report")}
            />
          </View>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <SectionHeader title="Data" />
          <View style={styles.card}>
            <SettingsRow
              label="Council tax data source"
              value="GOV.UK / VOA"
            />
            <Hairline />
            <SettingsRow
              label="Check official band at GOV.UK"
              onPress={() => Linking.openURL("https://www.gov.uk/council-tax-bands")}
            />
          </View>
        </View>

        <Text style={[styles.footer, { fontFamily: fonts.mono }]}>
          BandCheck AI · v{APP_VERSION} · Not affiliated with HMRC or VOA
        </Text>
      </ScrollView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: 80 },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHeader: {
    fontSize: 11,
    color: editorial.colors.ink3,
    letterSpacing: 0.88,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  sectionNote: {
    fontSize: 11,
    color: editorial.colors.ink3,
    marginTop: 6,
    lineHeight: 16,
  },
  card: {
    backgroundColor: editorial.colors.paperCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowPressed: { backgroundColor: editorial.colors.paper2 },
  rowLabel: { fontSize: 14, color: editorial.colors.ink, flex: 1 },
  rowLabelMuted: { color: editorial.colors.ink3 },
  rowValue: { fontSize: 13, color: editorial.colors.ink3 },
  rowArrow: { fontSize: 16, color: editorial.colors.ink3 },
  footer: {
    fontSize: 11,
    color: editorial.colors.ink3,
    textAlign: "center",
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 24,
    lineHeight: 18,
  },
});
