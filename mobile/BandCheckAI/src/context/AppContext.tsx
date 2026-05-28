import { createContext, useContext } from "react";
import type { EditorialFonts } from "../theme/editorial";

type AppContextValue = {
  fonts: EditorialFonts;
  apiBaseUrl: string;
};

export const AppContext = createContext<AppContextValue>({
  fonts: {
    serif: "serif",
    serifItalic: "serif",
    sans: "sans-serif",
    sansSemiBold: "sans-serif",
    sansBold: "sans-serif",
    mono: "monospace",
    monoMedium: "monospace",
  },
  apiBaseUrl: "",
});

export function useAppContext(): AppContextValue {
  return useContext(AppContext);
}
