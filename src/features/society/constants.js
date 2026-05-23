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
  { name: "dashboard", label: "Home", icon: "Home" },
  { name: "payment", label: "Pay", icon: "Pay" },
  { name: "due", label: "Due", icon: "Due" },
  { name: "history", label: "History", icon: "Hist" },
  { name: "profile", label: "Profile", icon: "Me" },
];

export const ADMIN_NAV = [
  { name: "dashboard", label: "Dashboard", icon: "Dash" },
  { name: "members", label: "Members", icon: "Mem" },
  { name: "addMember", label: "Add", icon: "Add" },
  { name: "pending", label: "Pending", icon: "Due" },
  { name: "history", label: "Payments", icon: "Pay" },
  { name: "excel", label: "Export", icon: "Xls" },
];
