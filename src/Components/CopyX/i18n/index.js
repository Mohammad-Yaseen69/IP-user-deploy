import i18n from "../../../i18n"
import fr from "./fr"

/* Keys are the English strings (the app's convention), so English needs no bundle; French is merged into the shared namespace. */
i18n.addResourceBundle("fr", "translations", fr, true, false)
