// Tailwind color mapping to hex values
const tailwindColors = {
    // Emerald
    "emerald-500": "#10b981",
    "emerald-600": "#059669",
  
    // Teal
    "teal-500": "#14b8a6",
    "teal-600": "#0d9488",
  
    // Violet
    "violet-500": "#8b5cf6",
    "violet-600": "#7c3aed",
  
    // Purple
    "purple-500": "#a855f7",
    "purple-600": "#9333ea",
  
    // Rose
    "rose-500": "#f43f5e",
    "rose-600": "#e11d48",
  
    // Pink
    "pink-500": "#ec4899",
    "pink-600": "#db2777",
  
    // Blue
    "blue-500": "#3b82f6",
    "blue-600": "#2563eb",
  
    // Cyan
    "cyan-500": "#06b6d4",
    "cyan-600": "#0891b2",
  
    // Amber
    "amber-500": "#f59e0b",
    "amber-600": "#d97706",
  
    // Yellow
    "yellow-500": "#eab308",
    "yellow-600": "#ca8a04",
  
    // Gray
    "gray-100": "#f3f4f6",
    "gray-200": "#e5e7eb",
    "gray-300": "#d1d5db",
    "gray-400": "#9ca3af",
    "gray-500": "#6b7280",
    "gray-600": "#4b5563",
    "gray-700": "#374151",
    "gray-800": "#1f2937",
  
    // Add more emerald colors
    "emerald-100": "#d1fae5",
    "emerald-300": "#6ee7b7",
    "emerald-800": "#065f46",
    "emerald-900": "#064e3b",
  
    // Add more amber colors
    "amber-100": "#fef3c7",
    "amber-300": "#fcd34d",
    "amber-800": "#92400e",
    "amber-900": "#78350f",
  
    // Add more rose colors
    "rose-100": "#ffe4e6",
    "rose-300": "#fda4af",
    "rose-800": "#9f1239",
    "rose-900": "#881337",
  
    // Add more blue colors
    "blue-100": "#dbeafe",
    "blue-300": "#93c5fd",
    "blue-800": "#1e40af",
    "blue-900": "#1e3a8a",

    // add more purple colors
    "purple-100": "#f3e8ff",
    "purple-300": "#e9d5ff",
    "purple-600": "#7c3aed",

    // add more pink colors
    "pink-100": "#fdf2f8",
    "pink-300": "#fbcfe8",
    "pink-600": "#db2777",
  }
  
  // Function to extract primary color from Tailwind gradient class
  export const extractColorFromTailwindGradient = (gradientClass) => {
    if (!gradientClass) return "#6C47FF" // Default color if none provided
  
    // Parse the gradient class to extract the first color (from-color)
    const fromColorMatch = gradientClass.match(/from-([a-z]+-[0-9]+)/)
  
    if (fromColorMatch && fromColorMatch[1]) {
      const colorKey = fromColorMatch[1]
      return tailwindColors[colorKey] || "#6C47FF"
    }
  
    return "#6C47FF" // Default fallback color
  }
  
  // Function to create a lighter version of a color for backgrounds
  export const createLighterColor = (hexColor, opacity = 0.1) => {
    return (
      hexColor +
      Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0")
    )
  }
  