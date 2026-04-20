export const DISCLAIMER_TEXT =
  "⚠️ This information is for general guidance only and does not constitute legal advice. " +
  "Traffic laws may vary by state and are subject to change. Always verify with official " +
  "government sources or a qualified advocate before taking legal action.";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
] as const;

export const VEHICLE_TYPES = [
  { code: "2W", label: "Two Wheeler (Bike/Scooter)" },
  { code: "3W", label: "Three Wheeler (Auto Rickshaw)" },
  { code: "4W", label: "Four Wheeler (Car/SUV)" },
  { code: "LMV", label: "Light Motor Vehicle" },
  { code: "HMV", label: "Heavy Motor Vehicle (Truck/Bus)" },
  { code: "transport", label: "Transport Vehicle" },
  { code: "non_transport", label: "Non-Transport Vehicle" },
] as const;

export const INDIAN_STATES = [
  { code: "AN", name: "Andaman & Nicobar Islands" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CH", name: "Chandigarh" },
  { code: "CG", name: "Chhattisgarh" },
  { code: "DD", name: "Dadra & Nagar Haveli" },
  { code: "DL", name: "Delhi" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JK", name: "Jammu & Kashmir" },
  { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "LA", name: "Ladakh" },
  { code: "LD", name: "Lakshadweep" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" },
  { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OR", name: "Odisha" },
  { code: "PY", name: "Puducherry" },
  { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TS", name: "Telangana" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" },
] as const;

export const VIOLATION_CATEGORIES = [
  { code: "helmet", label: "Helmet", icon: "🪖" },
  { code: "seatbelt", label: "Seat Belt", icon: "🔒" },
  { code: "speed", label: "Speeding", icon: "🚀" },
  { code: "intoxication", label: "Drunk Driving", icon: "🍺" },
  { code: "signal_violation", label: "Signal Jumping", icon: "🚦" },
  { code: "mobile_use", label: "Mobile Use While Driving", icon: "📱" },
  { code: "documentation", label: "Documents", icon: "📄" },
  { code: "insurance", label: "Insurance", icon: "🛡️" },
  { code: "parking", label: "Parking", icon: "🅿️" },
  { code: "pollution", label: "Pollution", icon: "💨" },
  { code: "overloading", label: "Overloading", icon: "⚖️" },
  { code: "dangerous_driving", label: "Dangerous Driving", icon: "⚠️" },
  { code: "juvenile", label: "Juvenile Driving", icon: "👶" },
  { code: "licence", label: "Licence Issues", icon: "🪪" },
  { code: "registration", label: "Registration", icon: "📋" },
] as const;
