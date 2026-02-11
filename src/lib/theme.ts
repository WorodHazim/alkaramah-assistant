export const theme = {
    colors: {
        primary: {
            DEFAULT: "#63AFA5", // Muted Teal
            light: "#8AC4BC",
            dark: "#4A8F86",
        },
        secondary: {
            DEFAULT: "#A9D6F5", // Soft Baby Blue
            light: "#C8E6FA",
            dark: "#87BDE0",
        },
        background: {
            page: "bg-gradient-to-br from-mint-50 to-blue-50", // Mint/Blue gradient
            card: "bg-white",
        },
        text: {
            primary: "text-slate-900",
            secondary: "text-slate-500",
            muted: "text-slate-400",
        },
        border: "border-slate-100",
    },
    spacing: {
        container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        section: "py-6 space-y-6",
    },
    borderRadius: {
        card: "rounded-2xl",
        button: "rounded-full",
    },
    shadows: {
        card: "shadow-sm hover:shadow-md transition-shadow duration-200",
    },
};
