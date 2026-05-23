export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
export const RAZORPAY_KEY =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SbpWTRevaQRAeM";

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const YEARS = Array.from(
  { length: new Date().getFullYear() - 1999 },
  (_, index) => 2000 + index,
);

export const OWNER_NAV = [
  { name: "dashboard", label: "Home", icon: "home" },
  { name: "payment", label: "Pay", icon: "payment" },
  { name: "due", label: "Due", icon: "due" },
  { name: "history", label: "History", icon: "history" },
  { name: "profile", label: "Profile", icon: "profile" },
];

export const ADMIN_NAV = [
  { name: "dashboard", label: "Dashboard", icon: "dashboard" },
  { name: "members", label: "Members", icon: "members" },
  { name: "addMember", label: "Add", icon: "addMember" },
  { name: "pending", label: "Pending", icon: "due" },
  { name: "history", label: "Payments", icon: "history" },
  { name: "excel", label: "Export", icon: "export" },
];
