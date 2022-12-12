export const theme = {
  colors: {
    text: "#000000",
    primary: "#FF851B",
    secondary: "#414757",
    error: "#f13a59",
    elevation: {
      level0: "transparent",
      level1: "rgb(250, 241, 250)",
      level2: "rgb(250, 241, 247)",
      level3: "rgb(250, 241,245)",
      level4: "rgb(250, 241, 242)",
      level5: "rgb(250, 241, 239)",
    },
  },
};

export const successToast = (message) => {
  return {
    message: message,
    iconSize: 25,
    iconColor: "green",
    toastStyles: {
      borderRadius: 16,
      borderWidth: 0,
      borderLeftColor: "green",
      borderLeftWidth: 8,
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
      bg: theme.colors.elevation.level2,
    },
  };
};

export const errorToast = (message) => {
  return {
    message: message,
    iconSize: 36,
    iconColor: "red",
    iconName: "alert-circle-outline",
    iconFamily: "mdi",
    toastStyles: {
      borderRadius: 16,
      borderWidth: 0,
      borderLeftColor: "red",
      borderLeftWidth: 8,
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
      bg: theme.colors.elevation.level2,
    },
  };
};
