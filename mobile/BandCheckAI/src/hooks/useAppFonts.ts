import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
  useFonts as useInstrumentSerif,
} from "@expo-google-fonts/instrument-serif";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  useFonts as useJetBrainsMono,
} from "@expo-google-fonts/jetbrains-mono";
import { useFonts as useExpoFonts } from "expo-font";
import type { EditorialFonts } from "../theme/editorial";

export function useAppFonts(): { ready: boolean; fonts: EditorialFonts } {
  const [serifLoaded] = useInstrumentSerif({
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
  });
  const [monoLoaded] = useJetBrainsMono({
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });
  const [geistLoaded] = useExpoFonts({
    GeistRegular: require("../../assets/fonts/Geist-Regular.ttf"),
    GeistSemiBold: require("../../assets/fonts/Geist-SemiBold.ttf"),
    GeistBold: require("../../assets/fonts/Geist-Bold.ttf"),
  });

  const ready = serifLoaded && monoLoaded && geistLoaded;

  const fonts: EditorialFonts = {
    serif: "InstrumentSerif_400Regular",
    serifItalic: "InstrumentSerif_400Regular_Italic",
    sans: "GeistRegular",
    sansSemiBold: "GeistSemiBold",
    sansBold: "GeistBold",
    mono: "JetBrainsMono_400Regular",
    monoMedium: "JetBrainsMono_500Medium",
  };

  return { ready, fonts };
}
