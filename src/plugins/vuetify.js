import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from "vuetify";

export default createVuetify({
  icons: {
    defaultSet: "mdi",
  },
  defaults: {
    VTextField: {
      variant: "underlined",
    },
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: "#1976D2",
        },
      },
      dark: {
        colors: {
          primary: "#1976D2",
        },
      },
    },
  },
});
