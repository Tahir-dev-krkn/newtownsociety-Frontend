"use client";

import { useState, useEffect } from "react";


import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";


ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Home() {
  
  const mainBtn = {
  width: "100%",
  padding: "12px",
  borderRadius: 12,
  background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
  color: "white",
  border: "none",
  cursor: "pointer",
  marginTop: 10
};

  const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "white",
  outline: "none"
};

  const btnStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  marginTop: "10px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(45deg, #6a11cb, #2575fc)",
  color: "white",
  cursor: "pointer"
};

const cardStyle = {
  padding: 20,
  borderRadius: 16,
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.08)",
  width: 200,
  textAlign: "center",
  cursor: "pointer",
  transition: "0.3s"
};



  // ================= LOGIN STATE =================
  const [flat, setFlat] = useState("");
  const [password, setPassword] = useState("");

  // ================= AUTH STATE =================
  const [token, setToken] = useState(null);
  const [page, setPage] = useState("landing");
  const [data, setData] = useState(null);
const [role, setRole] = useState(null);
const [loading, setLoading] = useState(true);
const [name, setName] = useState("");
const [flatNumber, setFlatNumber] = useState("");
const [area, setArea] = useState("");
const [phone, setPhone] = useState("");
const [email, setEmail] = useState("");
const [editData, setEditData] = useState(null);
const [dueMember, setDueMember] = useState(null);
const [fromMonth, setFromMonth] = useState("");
const [toMonth, setToMonth] = useState("");
const [year, setYear] = useState("");
const currentYear = new Date().getFullYear();
const [payments, setPayments] = useState([]);
const [historySearch, setHistorySearch] = useState("");
const [historyFilter, setHistoryFilter] = useState("all"); // all | paid | pending
const [historySort, setHistorySort] = useState("none"); // high | low
const [historyMonth, setHistoryMonth] = useState("");
const [historyYear, setHistoryYear] = useState("");
const [historyFromMonth, setHistoryFromMonth] = useState("");
const [historyToMonth, setHistoryToMonth] = useState("");
const [editPhone, setEditPhone] = useState("");
const [editEmail, setEditEmail] = useState("");
const [profileDue, setProfileDue] = useState(0);
const [complaint, setComplaint] = useState("");
const [complaints, setComplaints] = useState([]);




const years = [];
for (let i = 2000; i <= currentYear; i++) {
  years.push(i);
}

const [excelFlat, setExcelFlat] = useState("");
const [authMode, setAuthMode] = useState("login"); // login | forgot | otp

const [resetEmail, setResetEmail] = useState("");
const [otp, setOtp] = useState("");
const [newPassword, setNewPassword] = useState("");
const [search, setSearch] = useState("");
const [filter, setFilter] = useState("all"); 
const [sortType, setSortType] = useState("none");
const [toast, setToast] = useState("");
const [toastType, setToastType] = useState("success");

function showToast(message, type = "success") {

  setToast(message);
  setToastType(type);

  setTimeout(() => {
    setToast("");
  }, 3000);
}


  // ================= GET LOCAL STORAGE (FIX) =================
 useEffect(() => {
  const t = localStorage.getItem("token");
  const r = localStorage.getItem("role");

  console.log("TOKEN:", t);
  console.log("ROLE:", r);

  setToken(t);
  setRole(r);
  if (t && r) {
  setPage("dashboard");
}

  // ❗ NOT LOGGED IN
  if (!t) {
    setPage("landing");
    setLoading(false);
    return;
  }

  // ================= ADMIN =================
  if (r === "admin") {
    fetch("http://localhost:5000/members", {
      headers: { Authorization: t }
    })
      .then(res => res.json())
      .then(d => {
        console.log("ADMIN DATA:", d);
        setData(d);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }

  // ================= OWNER =================
  else if (r === "owner") {
    fetch("http://localhost:5000/my-dashboard", {
      headers: { Authorization: t }
    })
      .then(res => res.json())
      .then(d => {
        console.log("OWNER DATA:", d);
        setData(d);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }

  // ❗ UNKNOWN ROLE FIX
  else {
    console.log("Unknown role → forcing login");
    localStorage.clear();
    setLoading(false);
  }

}, []);

useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  document.body.appendChild(script);
}, []);

useEffect(() => {
  if (token && role && page !== "pending") {
    loadData();
  }
}, [token, role, page]);

  // ================= LOGIN FUNCTION =================
  async function login() {

  const res = await fetch("http://localhost:5000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      flatNumber: flat,
      password: password
    })
  });

  const data = await res.json();

  if (data.success) {

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);

    showToast("Login Successful 🎉");

    setToken(data.token);
    setRole(data.role);
    setPage("dashboard");

  } else {

    showToast("Wrong login ❌", "error");

  }
}

  function getMonthNumber(month){
  return new Date(Date.parse(month + " 1, 2020")).getMonth();
}

  async function sendReminder(memberId) {
  const res = await fetch("http://localhost:5000/send-reminder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ memberId })
  });

  const msg = await res.text();
  alert(msg);
}

  async function payNow(p) {
  const res = await fetch("http://localhost:5000/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ amount: p.amount })
  });

  const order = await res.json();

  const options = {
    key: "rzp_test_SbpWTRevaQRAeM",
    amount: order.amount,
    currency: "INR",
    order_id: order.id,

    handler: async function (response) {

      await fetch("http://localhost:5000/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          paymentId: p._id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature
        })
      });

      alert("Payment Success 🎉");

      loadData(); // 🔥 REFRESH
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}

async function loadData() {
  if (!token) return;

  if (role === "admin") {

  // MEMBERS DATA
  const res = await fetch("http://localhost:5000/members", {
    headers: { Authorization: token }
  });

  const d = await res.json();

  setData(d);

  // HISTORY PAGE
  if (page === "history") {

    const paymentRes = await fetch("http://localhost:5000/all-payments", {
      headers: { Authorization: token }
    });

    const paymentData = await paymentRes.json();

    setPayments(paymentData);
  }
}


  if (role === "owner") {
    const res = await fetch("http://localhost:5000/my-dashboard", {
      headers: { Authorization: token }
    });
    const d = await res.json();
    setData(d);
  }
}


async function downloadExcel() {

  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;

  let params = new URLSearchParams();

  if (from) params.append("from", from);
  if (to) params.append("to", to);
  if (excelFlat && excelFlat.trim() !== "") {
    params.append("flat", excelFlat.trim());
  }

  const url = `http://localhost:5000/export?${params.toString()}`;

  console.log("FINAL URL:", url); // 🔥 DEBUG

  const res = await fetch(url, {
    headers: { Authorization: token }
  });

  const blob = await res.blob();
  const urlBlob = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = urlBlob;
  a.download = "report.xlsx";
  a.click();
}

async function sendOtp() {
  if (!resetEmail) {
    alert("Enter email ❗");
    return;
  }

  await fetch("http://localhost:5000/send-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: resetEmail })
  });

  alert("OTP Sent ✅");
  setAuthMode("otp");
}

async function verifyOtp() {
  if (!otp || !newPassword) {
    alert("Fill all fields ❗");
    return;
  }

  const res = await fetch("http://localhost:5000/verify-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: resetEmail,
      otp,
      newPassword
    })
  });

  const msg = await res.text();
  alert(msg);

  setAuthMode("login");
}

async function exportHistory() {

  // 🔥 apply SAME filter logic
  let filtered = (payments || [])
    .filter(p => {

      if (historySearch) {
        const match =
          p.name?.toLowerCase().includes(historySearch.toLowerCase()) ||
          p.flat?.toLowerCase().includes(historySearch.toLowerCase());

        if (!match) return false;
      }

      if (historyFilter === "paid" && p.status !== "paid") return false;
      if (historyFilter === "pending" && p.status === "paid") return false;

      return true;
    })

    .sort((a, b) => {
      if (historySort === "high") return b.amount - a.amount;
      if (historySort === "low") return a.amount - b.amount;
      return 0;
    });

  // 🔥 send to backend
  const res = await fetch("http://localhost:5000/export-history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify(filtered)
  });

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "history.xlsx";
  a.click();
}

async function updateProfile() {

  console.log(data);
console.log(data?._id);
console.log(data?.user?._id);

  const res = await fetch("http://localhost:5000/update-profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
  userId: data?._id || data?.user?._id,
  phone: editPhone,
  email: editEmail
})
  });

  const msg = await res.text();

  alert(msg);

  // ✅ REFRESH OWNER DATA
  const refresh = await fetch("http://localhost:5000/my-dashboard", {
    headers: {
      Authorization: token
    }
  });

  const newData = await refresh.json();

  setData(newData);
  setEditPhone(newData.phone || "");
setEditEmail(newData.email || "");

  // ✅ GO BACK PROFILE PAGE
  setPage("profile");
}

useEffect(() => {
  if (data) {
    setEditPhone(data.phone || "");
    setEditEmail(data.email || "");
  }
}, [data]);

  // ================= LOADING FIX =================
  if (loading) {
  return (
    <div style={{
      height: "100vh",
      background: "black",
      color: "white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      Loading... (if stuck → backend issue)
    </div>
  );
}

  // ================= ADMIN DASHBOARD =================
  if (token && role === "admin" && page === "dashboard") {

    const safeData = Array.isArray(data) ? data : [];

const totalPaid = safeData
  .filter(m => m.role === "owner")
  .flatMap(m => m.payments || [])
  .filter(p => p.status === "paid")
  .reduce((sum, p) => sum + (p.amount || 0), 0);

const totalPending = safeData
  .filter(m => m.role === "owner")
  .flatMap(m => m.payments || [])
  .filter(p => p.status !== "paid")
  .reduce((sum, p) => sum + (p.amount || 0), 0);

const chartData = {
  labels: ["Paid", "Pending"],
  datasets: [
    {
      label: "Amount ₹",
      data: [totalPaid || 0, totalPending || 0],
      backgroundColor: ["#00c853", "#ff5252"]
    }
  ]
};

const months = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

const monthlyPaid = new Array(12).fill(0);
const monthlyPending = new Array(12).fill(0);

(safeData || [])
  .filter(m => m.role === "owner")
  .forEach(m => {
    (m.payments || []).forEach(p => {
      const monthIndex = new Date(
        p.year,
        new Date(Date.parse(p.month + " 1, 2020")).getMonth()
      ).getMonth();

      if (p.status === "paid") {
        monthlyPaid[monthIndex] += p.amount || 0;
      } else {
        monthlyPending[monthIndex] += p.amount || 0;
      }
    });
  });

const monthlyChartData = {
  labels: months,
  datasets: [
    {
      label: "Paid ₹",
      data: monthlyPaid,
      backgroundColor: "#00c853"
    },
    {
      label: "Pending ₹",
      data: monthlyPending,
      backgroundColor: "#ff5252"
    }
  ]
};

const totalMembers = (safeData || []).filter(m => m.role === "owner").length;

const pendingMembers = (safeData || [])
  .filter(m => m.role === "owner" && m.pendingAmount > 0).length;

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      color: "white"
    }}>

      {/* ================= SIDEBAR ================= */}
      <div style={{
  width: "240px",
  padding: "25px 15px",
  borderRight: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(12px)"
}}>

  <h2 style={{
    textAlign: "center",
    marginBottom: "30px",
    fontWeight: "600",
    letterSpacing: "1px"
  }}>
    🏢 Admin
  </h2>

  {[
    {name:"members", label:"👥 Members"},
    {name:"addMember", label:"➕ Add Member"},
    {name:"pending", label:"❗ Pending"},
    {name:"excel", label:"📊 Excel"},
    {name:"history", label:"📜 Payments"}
  ].map(item => (
    <div
      key={item.name}
      onClick={()=>setPage(item.name)}
      style={{
        padding: "12px 15px",
        borderRadius: "10px",
        marginBottom: "10px",
        cursor: "pointer",
        background: page === item.name 
          ? "linear-gradient(45deg,#6a11cb,#2575fc)" 
          : "transparent",
        transition: "0.3s",
        opacity: page === item.name ? 1 : 0.8
      }}
    >
      {item.label}
    </div>
  ))}

  <div style={{marginTop: "30px"}} />

  <div
    onClick={()=>{
      localStorage.clear();
      setToken(null);
      setRole(null);
      setPage("landing");
    }}
    style={{
      padding: "12px",
      borderRadius: "10px",
      background: "rgba(255,0,0,0.2)",
      textAlign: "center",
      cursor: "pointer"
    }}
  >
    🚪 Logout
  </div>

</div>


      {/* ================= MAIN ================= */}
      <div style={{
        flex: 1,
        padding: 20
      }}>

        <div style={{
  position:"absolute",
  top:20,
  right:20,
  cursor:"pointer",
  fontSize:28
}}
onClick={async ()=>{

  const res = await fetch(
    "http://localhost:5000/complaints",
    {
      headers:{
        Authorization: token
      }
    }
  );

  const d = await res.json();

  setComplaints(d);

  setPage("complaints");
}}
>
  🔔
</div>

        <h2 style={{
  fontSize: "26px",
  marginBottom: "10px"
}}>
  📊 Dashboard Overview
</h2>

<p style={{
  opacity: 0.6,
  marginBottom: "20px"
}}>
  Welcome back 👋 Here's your system summary
</p>

        <div style={{
  marginTop: 40,
  background: "rgba(255,255,255,0.05)",
  padding: 20,
  borderRadius: 15
}}>
  <h3>📊 Collection Overview</h3>

  <Bar data={chartData} />
</div>

        {/* ================= CARDS ================= */}
        <div style={{
  display: "flex",
  gap: 20,
  marginTop: 25,
  flexWrap: "wrap"
}}>

  {/* MEMBERS */}
  <div 
  onClick={()=>setPage("members")}
  onMouseEnter={(e)=> e.currentTarget.style.transform="scale(1.05)"}
  onMouseLeave={(e)=> e.currentTarget.style.transform="scale(1)"}
  style={{
    ...cardStyle,
    background: "linear-gradient(135deg, rgba(106,17,203,0.3), rgba(37,117,252,0.2))"
  }}
>
  <h3 style={{opacity:0.7}}>👥 Members</h3>
  <h1 style={{fontSize:32, marginTop:10}}>{totalMembers}</h1>
</div>

  {/* PENDING ₹ */}
  <div 
  onClick={()=>setPage("pending")}
  onMouseEnter={(e)=> e.currentTarget.style.transform="scale(1.05)"}
  onMouseLeave={(e)=> e.currentTarget.style.transform="scale(1)"}
  style={{
    ...cardStyle,
    background: "linear-gradient(135deg, rgba(255,82,82,0.3), rgba(255,0,0,0.2))"
  }}
>
  <h3 style={{opacity:0.7}}>❗ Pending ₹</h3>
  <h1 style={{fontSize:32, marginTop:10}}>₹{totalPending}</h1>
</div>

  {/* PAID ₹ */}
  <div 
  onMouseEnter={(e)=> e.currentTarget.style.transform="scale(1.05)"}
  onMouseLeave={(e)=> e.currentTarget.style.transform="scale(1)"}
  style={{
    ...cardStyle,
    background: "linear-gradient(135deg, rgba(0,200,83,0.3), rgba(0,255,100,0.2))"
  }}
>
  <h3 style={{opacity:0.7}}>✅ Paid ₹</h3>
  <h1 style={{fontSize:32, marginTop:10}}>₹{totalPaid}</h1>
</div>

  {/* PENDING MEMBERS */}
  <div 
  onClick={()=>setPage("pending")}
  onMouseEnter={(e)=> e.currentTarget.style.transform="scale(1.05)"}
  onMouseLeave={(e)=> e.currentTarget.style.transform="scale(1)"}
  style={{
    ...cardStyle,
    background: "linear-gradient(135deg, rgba(255,0,0,0.3), rgba(255,82,82,0.2))"
  }}
>
  <h3 style={{opacity:0.7}}>🚨 Defaulters</h3>
  <h1 style={{fontSize:32, marginTop:10}}>{pendingMembers}</h1>
</div>

</div>

      </div>
    </div>
  );
}

if (token && role === "admin" && page === "history") {

const filteredPayments = (payments || [])
  .filter(p => {

    if (historySearch) {
      const match =
        p.name?.toLowerCase().includes(historySearch.toLowerCase()) ||
        p.flat?.toLowerCase().includes(historySearch.toLowerCase());

      if (!match) return false;
    }

    if (historyFilter === "paid" && p.status !== "paid") return false;
    if (historyFilter === "pending" && p.status === "paid") return false;

    if (historyFromMonth && historyToMonth) {
      const m = getMonthNumber(p.month);
      const from = getMonthNumber(historyFromMonth);
      const to = getMonthNumber(historyToMonth);

      if (m < from || m > to) return false;
    }

    return true;
  });

const paidTotal = filteredPayments
  .filter(p => p.status === "paid")
  .reduce((sum, p) => sum + (p.amount || 0), 0);

const pendingTotal = filteredPayments
  .filter(p => p.status !== "paid")
  .reduce((sum, p) => sum + (p.amount || 0), 0);

const historyChart = {
  labels: ["Paid", "Pending"],
  datasets: [
    {
      label: "Amount ₹",
      data: [paidTotal, pendingTotal],
      backgroundColor: ["#00c853", "#ff5252"]
    }
  ]
};


  return (
    <div style={{
  minHeight: "100vh",
  background: "linear-gradient(135deg, #141e30, #243b55)",
  color: "white",
  padding: "80px 20px 20px 20px"
}}>

<button
  onClick={()=>setPage("dashboard")}

onMouseEnter={(e)=> e.currentTarget.style.transform="scale(1.05)"}
onMouseLeave={(e)=> e.currentTarget.style.transform="scale(1)"}

  style={{
    position: "fixed",
    top: "20px",
    left: "20px",
    zIndex: 1000,
    padding: "10px 18px",
    borderRadius: "25px",
    border: "none",
    background: "linear-gradient(45deg,#6a11cb,#2575fc)",
    color: "white",
    cursor: "pointer",
    transition: "0.3s"
  }}
>
  ⬅ Back
</button>

      <div style={{
  background: "rgba(255,255,255,0.05)",
  padding: 20,
  borderRadius: 15,
  marginBottom: 25,
  backdropFilter: "blur(10px)"
}}>
  <h3 style={{marginBottom:15}}>📊 History Overview</h3>
  <Bar 
  data={{
    labels: ["Paid", "Pending"],
    datasets: [{
      label: "₹",
      data: [10000, profileDue],
      backgroundColor: ["#22c55e", "#ef4444"],
      borderRadius: 10
    }]
  }}
  options={{
    responsive:true,
    plugins:{
      legend:{display:false}
    },
    animation:{
      duration:1500,
      easing:"easeOutQuart"
    },
    scales:{
      x:{
        ticks:{color:"white"},
        grid:{color:"rgba(255,255,255,0.05)"}
      },
      y:{
        ticks:{color:"white"},
        grid:{color:"rgba(255,255,255,0.05)"}
      }
    }
  }}
/>
</div>

<br/>
      
      <h2>📜 Payment History</h2>

      {/* 🔍 SEARCH + FILTER UI */}

<div style={{
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginBottom: 20
}}>

  <input
    placeholder="🔍 Search name or flat..."
    value={historySearch}
    onChange={(e)=>setHistorySearch(e.target.value)}
    style={{
      padding: "10px",
      borderRadius: "10px",
      border: "none",
      minWidth: "200px"
    }}
  />

  <select
    value={historyFilter}
    onChange={(e)=>setHistoryFilter(e.target.value)}
    style={{
      padding: "10px",
      borderRadius: "10px",
      border: "none",
      color: "black"
    }}
  >
    <option value="all">All</option>
    <option value="paid">Paid</option>
    <option value="pending">Pending</option>
  </select>

  <select
    value={historySort}
    onChange={(e)=>setHistorySort(e.target.value)}
    style={{
      padding: "10px",
      borderRadius: "10px",
      border: "none",
      color: "black"
    }}
  >
    <option value="none">Sort</option>
    <option value="high">High → Low</option>
    <option value="low">Low → High</option>
  </select>

</div>

      <br/><br/>

      <button
  onClick={exportHistory}
  style={{
    padding: "10px 18px",
    borderRadius: "20px",
    border: "none",
    background: "linear-gradient(45deg,#00c853,#64dd17)",
    color: "white",
    cursor: "pointer",
    marginBottom: 20
  }}
>
  📥 Export History
</button>

<select onChange={(e)=>setHistoryMonth(e.target.value)}>
  <option value="">All Months</option>
  <option>January</option>
  <option>February</option>
  <option>March</option>
  <option>April</option>
  <option>May</option>
  <option>June</option>
  <option>July</option>
  <option>August</option>
  <option>September</option>
  <option>October</option>
  <option>November</option>
  <option>December</option>
</select>

<select onChange={(e)=>setHistoryYear(e.target.value)}>
  <option value="">All Years</option>
  {years.map(y => (
    <option key={y} value={y}>{y}</option>
  ))}
</select>

<br/><br/>

<p>📅 Range Filter</p>

<select onChange={(e)=>setHistoryFromMonth(e.target.value)}>
  <option value="">From Month</option>
  <option>January</option>
  <option>February</option>
  <option>March</option>
  <option>April</option>
  <option>May</option>
  <option>June</option>
  <option>July</option>
  <option>August</option>
  <option>September</option>
  <option>October</option>
  <option>November</option>
  <option>December</option>
</select>

<select onChange={(e)=>setHistoryToMonth(e.target.value)}>
  <option value="">To Month</option>
  <option>January</option>
  <option>February</option>
  <option>March</option>
  <option>April</option>
  <option>May</option>
  <option>June</option>
  <option>July</option>
  <option>August</option>
  <option>September</option>
  <option>October</option>
  <option>November</option>
  <option>December</option>
</select>

<br/><br/>

      {/* ❗ SAFE NO DATA CHECK */}
      {(!payments || payments.length === 0) && <p>No data</p>}

      {/* ✅ FILTER + SORT + MAP */}
      {(payments || [])
        .filter(p => {
          // 📅 DATE FILTER
if (historyMonth && p.month !== historyMonth) return false;
if (historyYear && String(p.year) !== String(historyYear)) return false;

          if (historySearch) {
            const match =
              p.name?.toLowerCase().includes(historySearch.toLowerCase()) ||
              p.flat?.toLowerCase().includes(historySearch.toLowerCase());

            if (!match) return false;
          }

          // 📅 RANGE FILTER
if (historyFromMonth && historyToMonth) {
  const m = getMonthNumber(p.month);
  const from = getMonthNumber(historyFromMonth);
  const to = getMonthNumber(historyToMonth);

  if (m < from || m > to) return false;
}

          if (historyFilter === "paid" && p.status !== "paid") return false;
          if (historyFilter === "pending" && p.status === "paid") return false;

          return true;
        })

        .sort((a, b) => {
          if (historySort === "high") return b.amount - a.amount;
          if (historySort === "low") return a.amount - b.amount;
          return 0;
        })

        .map((p, i) => (
  <div
    key={i}
    style={{
      padding: 15,
      borderRadius: 12,
      marginBottom: 12,
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)"
    }}
  >
    <p><b>{p.name}</b> ({p.flat})</p>
    <p style={{opacity:0.7}}>
      📅 {p.month} {p.year}
    </p>

    <p style={{fontSize:18}}>₹{p.amount}</p>

    <span style={{
      padding: "5px 10px",
      borderRadius: 20,
      fontSize: 12,
      background:
        p.status === "paid"
          ? "rgba(0,200,83,0.2)"
          : "rgba(255,82,82,0.2)",
      color:
        p.status === "paid"
          ? "#00c853"
          : "#ff5252"
    }}>
      {p.status}
    </span>
  </div>
))
      }

      
    </div>
  );
}

if (token && role === "admin" && page === "complaints") {

  return (
    <div style={{
      minHeight:"100vh",
      padding:20,
      color:"white",
      background:
        "linear-gradient(135deg,#141e30,#243b55)"
    }}>

      <button
        onClick={()=>setPage("dashboard")}
        style={{
          padding:"8px 16px",
          borderRadius:20,
          border:"none",
          background:
            "linear-gradient(45deg,#6366f1,#8b5cf6)",
          color:"white",
          cursor:"pointer",
          marginBottom:20
        }}
      >
        ← Back
      </button>

      <h2>🔔 Complaints</h2>

      {(complaints || []).length === 0 && (
        <p>No complaints 🎉</p>
      )}

      {(complaints || []).map((c,i)=>(

        <div
          key={i}
          style={{
            padding:20,
            borderRadius:20,
            marginTop:15,
            background:"rgba(255,255,255,0.05)",
            border:
              "1px solid rgba(255,255,255,0.08)"
          }}
        >

          <h3>{c.name}</h3>

          <p style={{opacity:0.7}}>
            🏠 {c.flat}
          </p>

          <p style={{opacity:0.7}}>
            📞 {c.phone}
          </p>

          <div style={{
            marginTop:15,
            padding:15,
            borderRadius:15,
            background:"rgba(255,255,255,0.04)"
          }}>
            {c.message}
          </div>

          <p style={{
            marginTop:10,
            opacity:0.5,
            fontSize:12
          }}>
            {new Date(c.date).toLocaleString()}
          </p>

        </div>
      ))}

    </div>
  );
}

  // ================= ADMIN MEMBERS =================
if (token && role === "admin" && page === "members") {
  return (
    <div style={{
      color: "white",
      minHeight: "100vh",
padding: "25px",
background: "linear-gradient(135deg, #141e30, #243b55)"
    }}>
      
      <h2 style={{fontSize:26}}>👥 Members</h2>

<p style={{opacity:0.6, marginBottom:20}}>
Manage all society members here
</p>

{/* 🔙 BACK BUTTON */}
    <button
      onClick={()=>setPage("dashboard")}

    onMouseEnter={(e)=> e.currentTarget.style.transform="scale(1.05)"}
onMouseLeave={(e)=> e.currentTarget.style.transform="scale(1)"}

      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 1000,
        padding: "10px 18px",
        borderRadius: "25px",
        border: "none",
        background: "linear-gradient(45deg,#6a11cb,#2575fc)",
        color: "white",
        cursor: "pointer",
        transition: "0.1s"
      }}
    >
      ⬅ Back
    </button>

      {/* 🔍 SEARCH */}
      <input
        placeholder="🔍 Search by name or flat..."
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        style={{
  padding: "12px",
  width: "280px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  outline: "none"
}}
      />

      <br/><br/>

      <br/>

{/* 🎯 FILTER + SORT WRAPPER */}
<div style={{
  display: "flex",
  gap: 10,
  marginTop: 15,
  marginBottom: 20,
  flexWrap: "wrap"
}}>

  {/* 🎯 FILTER */}
  <select 
    value={filter} 
    onChange={(e)=>setFilter(e.target.value)}
    style={{
      padding: "10px",
      borderRadius: "10px",
      background: "rgba(255,255,255,0.05)",
      color: "black",
      border: "1px solid rgba(255,255,255,0.1)"
    }}
  >
    <option value="all">All</option>
    <option value="pending">Pending</option>
    <option value="paid">Paid</option>
  </select>

  {/* 🔽 SORT */}
  <select 
    value={sortType} 
    onChange={(e)=>setSortType(e.target.value)}
    style={{
      padding: "10px",
      borderRadius: "10px",
      background: "rgba(209, 179, 179, 0.05)",
      color: "black",
      border: "1px solid rgba(255,255,255,0.1)"
    }}
  >
    <option value="none">No Sort</option>
    <option value="high">Amount High → Low</option>
    <option value="low">Amount Low → High</option>
  </select>

</div>

      {/* 📋 MEMBERS LIST */}
{(data || [])
  .filter(m => {

    // 🔍 SEARCH
    if (search) {
      const match =
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.flatNumber?.toLowerCase().includes(search.toLowerCase());

      if (!match) return false;
    }

    // 🎯 FILTER
    if (filter === "pending" && m.pendingAmount <= 0) return false;
    if (filter === "paid" && m.pendingAmount > 0) return false;

    return true;
  })

  // 🔽 SORT
  .sort((a, b) => {
    if (sortType === "high") return b.pendingAmount - a.pendingAmount;
    if (sortType === "low") return a.pendingAmount - b.pendingAmount;
    return 0;
  })

  .map((m, i) => (
  <div 
    key={m._id || i}

    onMouseEnter={(e)=> e.currentTarget.style.transform="scale(1.02)"}
    onMouseLeave={(e)=> e.currentTarget.style.transform="scale(1)"}

    style={{
      padding: 20,
      borderRadius: 16,
      marginBottom: 18,
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.08)",
      transition: "0.3s"
    }}
  >

    {/* MEMBER INFO */}
    <p style={{fontSize:18, fontWeight:"600"}}>
      {m.name}
    </p>

    <p style={{opacity:0.7}}>🏠 {m.flatNumber}</p>
    <p style={{opacity:0.7}}>📞 {m.phone}</p>
    <p style={{opacity:0.6, fontSize:13}}>{m.email}</p>

    {/* ✅ PENDING BADGE FIXED */}
    {m.pendingAmount > 0 && (
      <div style={{
        marginTop:10,
        display:"inline-block",
        padding:"6px 12px",
        borderRadius:20,
        background:"rgba(255,82,82,0.15)",
        color:"#ff5252",
        fontSize:13
      }}>
        ⚠ ₹{m.pendingAmount} Pending
      </div>
    )}

    {/* ✅ BUTTON ROW FIXED */}
    <div style={{
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      marginTop: "15px"
    }}>

      <button onClick={()=>openDue(m)} style={btnStyle}>
        📅 Due
      </button>

      <button onClick={()=>{
        setEditData(m);
        setPage("editMember");
      }} style={btnStyle}>
        ✏ Edit
      </button>

      <button onClick={()=>deleteMember(m._id)} style={btnStyle}>
        ❌ Delete
      </button>

      <button 
        onClick={()=>sendReminder(m._id)} 
        style={{
          ...btnStyle,
          background: "linear-gradient(45deg,#00c853,#64dd17)"
        }}
      >
        📲 Remind
      </button>

    </div>

  </div>
))}
      {/* ❗ NO DATA MESSAGE */}
      {(data || []).length === 0 && (
        <p>No members found</p>
      )}

      <br/>

      

    </div>
  );
}

// ================= ADD MEMBER =================
if (token && role === "admin" && page === "addMember") {
  return (
  <div style={{
    minHeight: "100vh",
    background: "linear-gradient(135deg, #141e30, #243b55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white"
  }}>

    {/* 🔙 BACK BUTTON */}
    <button
      onClick={()=>setPage("members")}

onMouseEnter={(e)=> e.currentTarget.style.transform="scale(1.05)"}
onMouseLeave={(e)=> e.currentTarget.style.transform="scale(1)"}

      style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        zIndex: 1000,
        padding: "10px 18px",
        borderRadius: "25px",
        border: "none",
        background: "linear-gradient(45deg,#6a11cb,#2575fc)",
        color: "white",
        cursor: "pointer",
        transition: "0.3s"
      }}
    >
      ⬅ Back
    </button>

    {/* 🧾 FORM CARD */}
    <div style={{
      width: 350,
      padding: 30,
      borderRadius: 15,
      background: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 0 30px rgba(0,0,0,0.3)"
    }}>

      <h2 style={{
        textAlign: "center",
        marginBottom: 20
      }}>
        ➕ Add Member
      </h2>

      {/* INPUT STYLE */}
      {[
        {placeholder:"Name", setter:setName},
        {placeholder:"Flat Number", setter:setFlatNumber},
        {placeholder:"Area", setter:setArea},
        {placeholder:"Phone", setter:setPhone},
        {placeholder:"Email", setter:setEmail}
      ].map((field, i) => (
        <input
          key={i}
          placeholder={field.placeholder}
          onChange={(e)=>field.setter(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "12px",
            borderRadius: "8px",
            border: "none",
            outline: "none"
          }}
        />
      ))}

      {/* SUBMIT BUTTON */}
      <button
        onClick={addMember}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "none",
          background: "linear-gradient(45deg,#00c853,#64dd17)",
          color: "white",
          cursor: "pointer",
          marginTop: "10px"
        }}
      >
        Add Member 🚀
      </button>

    </div>
  </div>
);
}

async function addMember() {
  const res = await fetch("http://localhost:5000/add-member", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({
      name,
      flatNumber,
      area,
      phone,
      email
    })
  });

  const data = await res.text();
  alert(data);

 await loadData();

setTimeout(() => {
  setPage("members");
}, 100);
}

async function deleteMember(id) {
  const confirmDelete = confirm("Delete this member?");
  if (!confirmDelete) return;

  await fetch(`http://localhost:5000/member/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: token
    }
  });

 await loadData();

setTimeout(() => {
  setPage("members");
}, 100);
}

function editMember(m) {
  setEditData({
  name: m.name || "",
  flatNumber: m.flatNumber || "",
  area: m.area || "",
  phone: m.phone || "",
  email: m.email || ""
});
  setPage("editMember");
}

async function updateMember() {
  await fetch(`http://localhost:5000/member/${editData._id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({
  name: editData.name,
  area: editData.area,
  phone: editData.phone,
  email: editData.email,
  flatNumber: editData.flatNumber
})
  });

  alert("Updated ✅");
await loadData();

setTimeout(() => {
  setPage("members");
}, 100);
}

function openDue(member) {
  setDueMember(member);
  setPage("addDue");
}

function monthToNumber(month){
  return new Date(Date.parse(month +" 1, 2020")).getMonth() + 1;
}

async function addDue() {

  // ❌ Empty check
  if (!fromMonth || !toMonth || !year) {
    alert("Please select all fields ❗");
    return;
  }

  const months = calculateMonths();

  // ❌ Invalid range
  if (months <= 0) {
    alert("Invalid month selection ❌");
    return;
  }

  const monthlyMaintenance = Number(dueMember?.area || 0) * 1.5;

const amount = months * monthlyMaintenance;

  // ❌ Safety check
  if (amount <= 0) {
    alert("Amount calculation error ❌");
    return;
  }

  // ✅ API call continues below

  await fetch("http://localhost:5000/add-due", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({
      memberId: dueMember._id,
      month: `${fromMonth} to ${toMonth}`,
      year,
      amount
    })
  });

  alert("Due Added");
  await loadData();

  setTimeout(() => {
    setPage("members");
  }, 100);
}

function calculateMonths() {
  if (!fromMonth || !toMonth) return 0;

  const start = monthToNumber(fromMonth);
  const end = monthToNumber(toMonth);

  if (end < start) return 0;

  return end - start + 1;
}

const totalMonths = calculateMonths();
const monthlyMaintenance = Number(dueMember?.area || 0) * 1.5;

const totalAmount = totalMonths * monthlyMaintenance;
// ================= EDIT MEMBER =================
if (token && role === "admin" && page === "editMember") {
 return (
  <div style={{
    minHeight: "100vh",
    background: "linear-gradient(135deg, #141e30, #243b55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white"
  }}>

    {/* 🔙 BACK */}
    <button
      onClick={()=>setPage("members")}
      style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        zIndex: 1000,
        padding: "10px 18px",
        borderRadius: "25px",
        border: "none",
        background: "linear-gradient(45deg,#6a11cb,#2575fc)",
        color: "white",
        cursor: "pointer"
      }}
    >
      ⬅ Back
    </button>

    <div style={{
      width: 350,
      padding: 30,
      borderRadius: 15,
      background: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.1)"
    }}>

      <h2 style={{textAlign:"center", marginBottom:20}}>
        ✏ Edit Member
      </h2>

      {["name","flatNumber","area","phone","email"].map((field, i)=>(
        <input
          key={i}
          value={editData?.[field] || ""}
          onChange={(e)=>setEditData({...editData, [field]:e.target.value})}
          placeholder={field}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "12px",
            borderRadius: "8px",
            border: "none"
          }}
        />
      ))}

      <button
        onClick={updateMember}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "none",
          background: "linear-gradient(45deg,#00c853,#64dd17)",
          color: "white",
          cursor: "pointer",
          transition: "0.3s"
        }}
        onMouseEnter={(e)=> e.currentTarget.style.transform="scale(1.05)"}
        onMouseLeave={(e)=> e.currentTarget.style.transform="scale(1)"}
      >
        Update ✅
      </button>

    </div>
  </div>
);
}

// ================= ADD DUE =================
if (token && role === "admin" && page === "addDue") {

const selectStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "10px",
  borderRadius: "8px",
  background: "#1e293b",
  color: "white",
  border: "none"
};

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

  return (
  <div style={{
    minHeight: "100vh",
    background: "linear-gradient(135deg, #141e30, #243b55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white"
  }}>

    {/* 🔙 BACK */}
    <button
      onClick={()=>setPage("members")}
      style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        zIndex: 1000,
        padding: "10px 18px",
        borderRadius: "25px",
        border: "none",
        background: "linear-gradient(45deg,#6a11cb,#2575fc)",
        color: "white",
        cursor: "pointer"
      }}
    >
      ⬅ Back
    </button>

    <div style={{
      width: 360,
      padding: 30,
      borderRadius: 15,
      background: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.1)"
    }}>

      <h2 style={{textAlign:"center", marginBottom:15}}>
        📅 Add Due
      </h2>

      <p style={{textAlign:"center", opacity:0.7}}>
        {dueMember?.name}
      </p>

      {/* FROM */}
      <select onChange={(e)=>setFromMonth(e.target.value)} style={selectStyle}>
        <option>Select From Month</option>
        {months.map(m=><option key={m}>{m}</option>)}
      </select>

      {/* TO */}
      <select onChange={(e)=>setToMonth(e.target.value)} style={selectStyle}>
        <option>Select To Month</option>
        {months.map(m=><option key={m}>{m}</option>)}
      </select>

      {/* YEAR */}
      <select onChange={(e)=>setYear(e.target.value)} style={selectStyle}>
        <option>Select Year</option>
        {years.map(y => <option key={y}>{y}</option>)}
      </select>

      {/* RESULT */}
      {totalMonths > 0 && (
        <div style={{
          marginTop:15,
          padding:10,
          borderRadius:10,
          background:"rgba(0,200,83,0.1)"
        }}>
          <p>📊 {totalMonths} months</p>
          <h3>₹{totalAmount}</h3>
        </div>
      )}

      <button
        onClick={addDue}
        disabled={!fromMonth || !toMonth || !year}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "15px",
          borderRadius: "8px",
          border: "none",
          background: "linear-gradient(45deg,#00c853,#64dd17)",
          color: "white",
          cursor: "pointer"
        }}
      >
        Add Due 🚀
      </button>

    </div>
  </div>
);
}

if (token && role === "admin" && page === "excel") {
  return (
  <div style={{
    minHeight: "100vh",
    background: "linear-gradient(135deg, #141e30, #243b55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white"
  }}>

    {/* 🔙 BACK BUTTON */}
    <button
      onClick={()=>setPage("dashboard")}
      style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        zIndex: 1000,
        padding: "10px 18px",
        borderRadius: "25px",
        border: "none",
        background: "linear-gradient(45deg,#6a11cb,#2575fc)",
        color: "white",
        cursor: "pointer",
        transition: "0.3s"
      }}
      onMouseEnter={(e)=> e.currentTarget.style.transform="scale(1.05)"}
      onMouseLeave={(e)=> e.currentTarget.style.transform="scale(1)"}
    >
      ⬅ Back
    </button>

    {/* 📊 CARD */}
    <div style={{
      width: 360,
      padding: 30,
      borderRadius: 15,
      background: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 0 30px rgba(0,0,0,0.3)"
    }}>

      <h2 style={{textAlign:"center", marginBottom:20}}>
        📊 Export Report
      </h2>

      {/* 🏠 FLAT */}
      <p style={{opacity:0.7}}>Flat Number (optional)</p>
      <input
        placeholder="e.g. A101"
        value={excelFlat}
        onChange={(e)=>setExcelFlat(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "12px",
          borderRadius: "8px",
          border: "none",
          outline: "none"
        }}
      />

      {/* 📅 FROM */}
      <p style={{opacity:0.7}}>From</p>
      <input
        type="month"
        id="from"
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "12px",
          borderRadius: "8px",
          border: "none"
        }}
      />

      {/* 📅 TO */}
      <p style={{opacity:0.7}}>To</p>
      <input
        type="month"
        id="to"
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "8px",
          border: "none"
        }}
      />

      {/* 📥 DOWNLOAD */}
      <button
        onClick={downloadExcel}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "none",
          background: "linear-gradient(45deg,#00c853,#64dd17)",
          color: "white",
          cursor: "pointer",
          transition: "0.3s"
        }}
        onMouseEnter={(e)=> e.currentTarget.style.transform="scale(1.05)"}
        onMouseLeave={(e)=> e.currentTarget.style.transform="scale(1)"}
      >
        Download Excel 📥
      </button>

    </div>
  </div>
);
}

// ================= ADMIN PENDING =================
if (token && role === "admin" && page === "pending") {
  return (
  <div style={{
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    color: "white",
    padding: "80px 20px 20px"
  }}>

    {/* 🔙 BACK BUTTON */}
    <button
      onClick={()=>setPage("dashboard")}
      style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        zIndex: 1000,
        padding: "10px 18px",
        borderRadius: "25px",
        border: "none",
        background: "linear-gradient(45deg,#6a11cb,#2575fc)",
        color: "white",
        cursor: "pointer",
        transition: "0.3s"
      }}
      onMouseEnter={(e)=> e.currentTarget.style.transform="scale(1.05)"}
      onMouseLeave={(e)=> e.currentTarget.style.transform="scale(1)"}
    >
      ⬅ Back
    </button>

    <h2 style={{marginBottom:20}}>❗ Pending Dues</h2>

    {/* 📋 LIST */}
    {data
      ?.filter(m => m.role === "owner")
      ?.flatMap(m =>
        (m.payments || [])
          .filter(p => p.status !== "paid")
          .map(p => ({...p, member: m}))
      )
      .map((item, i) => (
        <div
          key={i}
          onMouseEnter={(e)=> e.currentTarget.style.transform="scale(1.02)"}
          onMouseLeave={(e)=> e.currentTarget.style.transform="scale(1)"}
          style={{
            padding: 18,
            marginBottom: 15,
            borderRadius: 15,
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.08)",
            transition: "0.3s"
          }}
        >

          <p style={{fontSize:18, fontWeight:"600"}}>
            {item.member.name}
          </p>

          <p style={{opacity:0.7}}>
            🏠 {item.member.flatNumber}
          </p>

          <p style={{opacity:0.7}}>
            📅 {item.month} {item.year}
          </p>

          <div style={{
            marginTop:10,
            display:"inline-block",
            padding:"6px 12px",
            borderRadius:20,
            background:"rgba(255,82,82,0.15)",
            color:"#ff5252",
            fontSize:14
          }}>
            ⚠ ₹{item.amount} Pending
          </div>

        </div>
      ))
    }

    {/* ❗ NO DATA */}
    {(!data || data.length === 0) && (
      <p>No pending dues 🎉</p>
    )}

  </div>
);
}

  // ================= OWNER PAYMENT =================
if (token && role === "owner" && page === "payment") {
  return (
    <div style={{
  padding: "20px 20px 80px 20px",
  color:"white",
  minHeight:"100vh",
  background:"linear-gradient(135deg, #0f172a, #1e293b)",
  
}}>

  {/* BACK */}
  <button onClick={()=>setPage("dashboard")} style={{
    padding:"8px 16px",
    borderRadius:20,
    marginBottom:15,
    background:"linear-gradient(45deg,#6366f1,#3b82f6)",
    color:"white",
    border:"none"
  }}>
    ← Back
  </button>

  <h2>💳 Current Payments</h2>
  <p style={{opacity:0.6, marginBottom:20}}>Active bills</p>

  {data?.current?.filter(p => p.status !== "paid").length === 0 && (
    <p>No current payments 🎉</p>
  )}

  {data?.current
    ?.filter(p => p.status !== "paid")
    .map(p => (
      <div key={p._id} style={{
        padding:20,
        borderRadius:20,
        marginBottom:15,
        background:"rgba(255,255,255,0.04)",
        border:"1px solid rgba(255,255,255,0.05)",
        backdropFilter:"blur(12px)"
      }}>

        <p>📅 {p.month} {p.year}</p>
        <h2>₹{p.amount}</h2>

        <button onClick={()=>payNow(p)} style={{
          padding:"10px 20px",
          borderRadius:10,
          border:"none",
          background:"linear-gradient(45deg,#3b82f6,#60a5fa)",
          color:"white"
        }}>
          Pay Now 💳
        </button>

      </div>
    ))
  }

</div>
  );
}

// ================= OWNER DUE =================
if (token && role === "owner" && page === "due") {
  return (
    <div style={{
  padding: "20px 20px 80px 20px",
  color:"white",
  minHeight:"100vh",
  background:"linear-gradient(135deg, #0f172a, #1e293b)",

}}>

  {/* BACK */}
  <div style={{
    position:"sticky", top:0, zIndex:10, marginBottom:15
  }}>
    <button onClick={()=>setPage("dashboard")} style={{
      padding:"8px 16px",
      borderRadius:20,
      background:"linear-gradient(45deg,#6366f1,#3b82f6)",
      color:"white",
      border:"none"
    }}>
      ← Back
    </button>
  </div>

  <h1 style={{
  fontSize:"32px",
  marginBottom:"5px"
}}>
  Pending Payments
</h1>

<p style={{
  opacity:0.6,
  marginBottom:25
}}>
  Review and settle your outstanding bills
</p>

  {(data?.due || []).length === 0 && <p>No dues 🎉</p>}

  {(data?.due || []).map(p => (
    <div key={p._id} style={{
      padding:20,
      borderRadius:20,
      marginBottom:15,
      background:"rgba(255,255,255,0.04)",
      border:"1px solid rgba(255,255,255,0.05)",
      backdropFilter:"blur(12px)",
      transition:"0.3s"
    }}
    onMouseEnter={(e)=>e.currentTarget.style.transform="scale(1.02)"}
    onMouseLeave={(e)=>e.currentTarget.style.transform="scale(1)"}
    >

      <p style={{
  opacity:0.65,
  marginBottom:8
}}>
  📅 {p.month} {p.year}
</p>

<h1 style={{
  fontSize:"42px",
  margin:"10px 0"
}}>
  ₹{p.amount}
</h1>

<p style={{
  opacity:0.5,
  fontSize:"13px"
}}>
  Due Amount
</p>

      <button onClick={()=>payNow(p)} style={{
        padding:"10px 20px",
        borderRadius:10,
        border:"none",
        background:"linear-gradient(45deg,#22c55e,#4ade80)",
        color:"black",
        cursor:"pointer"
      }}>
        Pay Now 💳
      </button>

    </div>
  ))}

</div>
  );
}

// ================= OWNER HISTORY =================
if (token && role === "owner" && page === "history") {
  return (
    <div style={{
  padding: "20px 20px 80px 20px",
  color:"white",
  minHeight:"100vh",
  background:"linear-gradient(135deg, #0f172a, #1e293b)",

}}>

  {/* BACK */}
  <button onClick={()=>setPage("dashboard")} style={{
    padding:"8px 16px",
    borderRadius:20,
    marginBottom:15,
    background:"linear-gradient(45deg,#6366f1,#3b82f6)",
    color:"white",
    border:"none"
  }}>
    ← Back
  </button>

  <h2>📜 Payment History</h2>
  <p style={{opacity:0.6, marginBottom:20}}>All your transactions</p>

  {(data?.paid || []).length === 0 && <p>No history</p>}

  {(data?.paid || []).map(p => (
    <div key={p._id} style={{
      padding:18,
      borderRadius:18,
      marginBottom:12,
      background:"rgba(255,255,255,0.04)",
      border:"1px solid rgba(255,255,255,0.05)",
      display:"flex",
      justifyContent:"space-between",
      alignItems:"center"
    }}>

      <div>
        <p style={{margin:0}}>📅 {p.month} {p.year}</p>
        <p style={{fontSize:12, opacity:0.6}}>Paid</p>
      </div>

      <div style={{
        color:"#22c55e",
        fontWeight:"bold"
      }}>
        ₹{p.amount}
      </div>

    </div>
  ))}

</div>
  );
}


// ================= OWNER PROFILE =================
if (token && role === "owner" && page === "profile") {

  const actionCard = {
    padding: "14px 16px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.05)",
    cursor: "pointer",
    transition: "0.3s"
  };

  const backBtn = {
    padding: "8px 16px",
    borderRadius: 20,
    border: "none",
    background: "linear-gradient(45deg,#6366f1,#8b5cf6)",
    color: "white",
    cursor: "pointer",
    marginBottom: 10
  };

  const user = data?.user || data;


  return (
    <div style={{
      padding: "20px 20px 80px 20px",
      color: "white",
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0f172a,#1e293b)",
    }}>

      {/* 🔙 BACK */}
      <button onClick={()=>setPage("dashboard")} style={backBtn}>
        ← Back
      </button>

      {/* 🟣 PROFILE CARD */}
      <div style={{
        marginTop: 20,
        padding: 25,
        borderRadius: 20,
        background: "linear-gradient(135deg,#1e293b,#0f172a)",
        border: "1px solid rgba(255,255,255,0.05)",
        textAlign: "center"
      }}>

        {/* AVATAR */}
        <div style={{
          width: 90,
          height: 90,
          borderRadius: "50%",
          margin: "auto",
          marginBottom: 15,
          background: "linear-gradient(45deg,#6366f1,#8b5cf6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 30,
          fontWeight: "bold"
        }}>
          {(user?.name || "U")[0]}
        </div>

        {/* NAME */}
        <h2>{user?.name || "No Name"}</h2>
        <p style={{opacity:0.6}}>
          🏠 Flat {user?.flatNumber || "--"}
        </p>

        {/* CONTACT */}
        <div style={{
          marginTop: 15,
          fontSize: 14,
          opacity: 0.8
        }}>
          <p>📞 {user?.phone || "Not added"}</p>
          <p>✉ {user?.email || "Not added"}</p>
        </div>

        {/* EDIT BUTTON */}
        <button
          onClick={()=>setPage("editProfile")}
          style={{
            marginTop: 15,
            padding: "8px 20px",
            borderRadius: 20,
            border: "none",
            background: "linear-gradient(45deg,#22c55e,#16a34a)",
            color: "white",
            cursor: "pointer"
          }}
        >
          ✏ Edit Profile
        </button>

      </div>

      {/* 📊 STATS SECTION */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2,1fr)",
        gap: 15,
        marginTop: 20
      }}>

        <div style={{
          padding: 20,
          borderRadius: 16,
          background: "rgba(255,255,255,0.05)"
        }}>
          <p style={{opacity:0.6}}>Total Due</p>
          <h2>₹₹{profileDue}</h2>
        </div>

        <div style={{
          padding: 20,
          borderRadius: 16,
          background: "rgba(255,255,255,0.05)"
        }}>
          <p style={{opacity:0.6}}>Status</p>
          <h2 style={{
            color: profileDue > 0 ? "#ef4444" : "#22c55e"
          }}>
            {profileDue > 0 ? "Pending" : "Clear"}
          </h2>
        </div>

      </div>

      {/* ⚙ ACTIONS */}
      <div style={{
        marginTop: 25,
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}>

        <div style={actionCard}>
  📞 Contact Office
  <p style={{
    marginTop:5,
    opacity:0.6,
    fontSize:13
  }}>
    support@society.com
  </p>
</div>

<div 
  style={actionCard}
  onClick={()=>setPage("support")}
>
  🛠 Help & Support

  <p style={{
    marginTop:5,
    opacity:0.6,
    fontSize:13
  }}>
    Raise complaints or payment issues
  </p>
</div>

      </div>

      {/* 🚪 LOGOUT */}
      <button
        onClick={()=>{
          localStorage.clear();
          setToken(null);
          setRole(null);
          setPage("landing");
        }}
        style={{
          marginTop: 30,
          width: "100%",
          padding: "12px",
          borderRadius: 20,
          border: "none",
          background: "linear-gradient(45deg,#ef4444,#dc2626)",
          color: "white",
          cursor: "pointer"
        }}
      >
        🚪 Logout
      </button>

    </div>
  );
}


// ================= OWNER PROFILE EDIT =================
if (token && role === "owner" && page === "editProfile") {

  const backBtn = {
    position: "fixed",
    top: 20,
    left: 20,
    padding: "8px 16px",
    borderRadius: 20,
    background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
    color: "white",
    border: "none",
    cursor: "pointer",
    zIndex: 1000
  };

  const user = data?.user || data;
  const profileDue = (data?.due || [])
  .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div style={{
      padding: 20,
      color: "white",
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0f172a,#1e293b)"
    }}>

      {/* 🔙 BACK */}
      <button onClick={()=>setPage("profile")} style={backBtn}>
        ← Back
      </button>

      <h2>Edit Profile</h2>

      {/* PHONE */}
      <input
        placeholder="Phone"
        value={editPhone}
        onChange={(e)=>setEditPhone(e.target.value)}
        style={inputStyle}
      />

      {/* EMAIL */}
      <input
        placeholder="Email"
        value={editEmail}
        onChange={(e)=>setEditEmail(e.target.value)}
        style={inputStyle}
      />

      {/* ✅ SAVE BUTTON (REPLACED OTP BUTTON) */}
      <button onClick={updateProfile} style={mainBtn}>
        Save Changes
      </button>

    </div>
  );
}

  // ================= OWNER DASHBOARD =================
  if (token && role === "owner" && page === "dashboard") {

 {/* CARD STYLE */}
  // ===== styles (put ABOVE return, inside this block) =====
const card = {
  padding: 18,
  borderRadius: 18,
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.1)",
  transition: "0.3s",
  cursor: "pointer",
  position: "relative"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 15
};

const hour = new Date().getHours();
let greeting = "Hello";
if (hour < 12) greeting = "Good Morning ☀️";
else if (hour < 18) greeting = "Good Afternoon 🌤";
else greeting = "Good Evening 🌙";

const pendingCount = data?.due?.length || 0;

const profileDue = (data?.due || []).reduce(
  (sum, p) => sum + (p.amount || 0),
  0
);

const pendingTotal = (data?.due || [])
  .reduce((sum, p) => sum + (p.amount || 0), 0);


// ===== RETURN UI =====
return (
  <div style={{
    minHeight: "100vh",
    padding: "20px 20px 80px 20px",
    background: "linear-gradient(270deg, #141e30, #243b55, #1d2b3a)",
    backgroundSize: "400% 400%",
    animation: "gradientMove 10s ease infinite",
    color: "white"
  }}>

    {/* animation */}
    <style>{`
      @keyframes gradientMove {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
        @keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  50% { transform: translateX(4px); }
  75% { transform: translateX(-4px); }
  100% { transform: translateX(0); }
}
    `}</style>

    {/* HEADER */}
    <h2 style={{fontSize:22}}>{greeting}</h2>
    <p style={{opacity:0.6, marginBottom:20}}>
      Welcome back 👋
    </p>

    {/* GRID */}
   <div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: 20,
  marginTop: 20
}}>

<div style={{
  marginTop: 30,
  padding: 20,
  borderRadius: 20,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  backdropFilter: "blur(10px)"
}}>
  <h3 style={{marginBottom:15}}>📊 Recent Activity</h3>

  {(data?.paid || []).slice(0,5).map((p,i)=>(
    <div key={i} style={{
      display:"flex",
      justifyContent:"space-between",
      alignItems:"center",
      padding:"10px 0",
      borderBottom:"1px solid rgba(255,255,255,0.05)"
    }}>
      <div>
        <p style={{margin:0}}>{p.month} {p.year}</p>
        <p style={{opacity:0.6, fontSize:12}}>Payment</p>
      </div>

      <div style={{color:"#00c853"}}>
        ₹{p.amount}
      </div>
    </div>
  ))}

</div>

  {/* 💰 TOTAL DUE */}
  <div 
  onClick={()=>setPage("due")}
  style={{
    padding: 22,
    borderRadius: 20,
    background: "linear-gradient(135deg, #130202, #a10f0f)",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(59,130,246,0.3)",
    transition: "0.3s"
  }}

  onMouseEnter={(e)=> {
    e.currentTarget.style.transform="scale(1.04)";
    e.currentTarget.style.boxShadow="0 20px 40px rgba(59,130,246,0.5)";
  }}

  onMouseLeave={(e)=> {
    e.currentTarget.style.transform="scale(1)";
    e.currentTarget.style.boxShadow="0 10px 30px rgba(59,130,246,0.3)";
  }}
>

  {/* Glow overlay */}
  <div style={{
    position:"absolute",
    width:120,
    height:120,
    background:"rgb(211, 125, 125)",
    borderRadius:"50%",
    top:-30,
    right:-30,
    filter:"blur(40px)"
  }} />

  <p style={{opacity:0.85, fontSize:14}}>
    Total Due <span style={{fontSize:12, opacity:0.7}}>(Tap)</span>
  </p>

  <h1 style={{fontSize:32, marginTop:10}}>
    ₹{profileDue}
  </h1>

</div>

  {/* 📊 PENDING */}
  <div 
  onClick={()=>setPage("due")}
  style={{
    padding: 20,
    borderRadius: 20,
    background: "linear-gradient(135deg, #1e293b, #8b3044)",
    border: "1px solid rgba(255,255,255,0.05)",
    cursor: "pointer",
    transition: "0.3s"
  }}
  onMouseEnter={(e)=> e.currentTarget.style.transform="scale(1.03)"}
  onMouseLeave={(e)=> e.currentTarget.style.transform="scale(1)"}
>
  <p style={{opacity:0.6}}>Pending Bills</p>
  <h1>{pendingCount}</h1>
</div>

  {/* 💳 PAY */}
  <div
  onClick={()=>setPage("payment")}
  style={{
    padding: 20,
    borderRadius: 20,
    background: "linear-gradient(135deg, #0f172a, #16663e)",
    border: "1px solid rgba(255,255,255,0.05)",
    cursor: "pointer",
    transition: "0.3s"
  }}
  onMouseEnter={(e)=> e.currentTarget.style.transform="scale(1.03)"}
  onMouseLeave={(e)=> e.currentTarget.style.transform="scale(1)"}
>
  <h3>💳 Pay</h3>
  <p style={{opacity:0.6}}>Quick payment</p>
</div>

  {/* 📜 HISTORY */}
  <div
  onClick={()=>setPage("history")}
  style={{
    padding: 20,
    borderRadius: 20,
    background: "linear-gradient(135deg, #141d33, #71c4cf)",
    border: "1px solid rgba(255,255,255,0.05)",
    cursor: "pointer",
    transition: "0.3s"
  }}
  onMouseEnter={(e)=> e.currentTarget.style.transform="scale(1.03)"}
  onMouseLeave={(e)=> e.currentTarget.style.transform="scale(1)"}
>
  <h3>📜 History</h3>
  <p style={{opacity:0.6}}>Transactions</p>
</div>

      {/* PROFILE */}
      <div
  onClick={()=>{
  setProfileDue(profileDue);
  setPage("profile");
}}
  style={{
    padding: 20,
    borderRadius: 20,
    background: "linear-gradient(135deg, #042164, #2c6eda)",
    border: "1px solid rgba(255,255,255,0.05)",
    cursor: "pointer",
    transition: "0.3s"
  }}
  onMouseEnter={(e)=> e.currentTarget.style.transform="scale(1.03)"}
  onMouseLeave={(e)=> e.currentTarget.style.transform="scale(1)"}
>
  <h3>👤 Profile</h3>
  <p style={{opacity:0.6}}>View your details</p>
</div>
    </div>

<div style={{
  marginTop: 25,
  padding: 20,
  borderRadius: 20,
  background: "#1e293b"
}}>
  <h3>📊 Overview</h3>

  <Bar 
  data={{
    labels: ["Paid", "Pending"],
    datasets: [{
      label: "₹",
      data: [10000, profileDue],
      backgroundColor: ["#22c55e", "#ef4444"],
      borderRadius: 10
    }]
  }}

  options={{
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    animation: {
      duration: 1500,
      easing: "easeOutQuart"
    },
    scales: {
      x: {
        ticks: { color: "white" },
        grid: { color: "rgba(255,255,255,0.05)" }
      },
      y: {
        ticks: { color: "white" },
        grid: { color: "rgba(255,255,255,0.05)" }
      }
    }
  }}
/>
</div>

    {/* LOGOUT */}
    <div
      onClick={()=>{
        localStorage.clear();
        setToken(null);
        setRole(null);
        setPage("landing");
      }}
      style={{
        marginTop: 25,
        padding: 14,
        borderRadius: 15,
        textAlign: "center",
        background: "rgba(255,0,0,0.2)"
      }}
    >
      🚪 Logout
    </div>

    {/* 📱 BOTTOM NAV */}
    <div style={{
  position:"fixed",
  bottom:0,
  left:0,
  width:"100%",
  background:"rgba(15,23,42,0.85)",
  backdropFilter:"blur(12px)",
  display:"flex",
  justifyContent:"space-around",
  padding:"12px 0",
  borderTop:"1px solid rgba(255,255,255,0.05)",
  zIndex:999
}}>

  {[
    {name:"dashboard", icon:"🏠", label:"Home"},
    {name:"payment", icon:"💳", label:"Pay"},
    {name:"due", icon:"❗", label:"Due"},
    {name:"history", icon:"📜", label:"History"},
    {name:"profile", icon:"👤", label:"Profile"}
  ].map(item => {

    const active = page === item.name;

    return (
      <div 
        key={item.name}
        onClick={()=>setPage(item.name)}
        style={{
          display:"flex",
          flexDirection:"column",
          alignItems:"center",
          fontSize:12,
          cursor:"pointer",
          color: active ? "#3b82f6" : "white",
          transition:"0.3s"
        }}
      >

        {/* ICON */}
        <div style={{
          fontSize:20,
          padding:"6px 10px",
          borderRadius:10,
          background: active 
            ? "rgba(59,130,246,0.15)" 
            : "transparent"
        }}>
          {item.icon}
        </div>

        {/* LABEL */}
        <span style={{
          marginTop:4,
          opacity: active ? 1 : 0.6
        }}>
          {item.label}
        </span>

      </div>
    );
  })}

</div>

  </div>
);
}

if (token && role === "owner" && page === "support") {

  async function submitComplaint() {

    if (!complaint.trim()) {
      alert("Write complaint first");
      return;
    }

    const res = await fetch(
      "http://localhost:5000/add-complaint",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({
          message: complaint
        })
      }
    );

    const msg = await res.text();

    alert(msg);

    setComplaint("");
  }

  return (
    <div style={{
      minHeight: "100vh",
      padding: 20,
      color: "white",
      background:
        "linear-gradient(135deg,#0f172a,#1e293b)"
    }}>

      <button
        onClick={()=>setPage("profile")}
        style={{
          padding:"8px 16px",
          borderRadius:20,
          border:"none",
          background:
            "linear-gradient(45deg,#6366f1,#8b5cf6)",
          color:"white",
          cursor:"pointer"
        }}
      >
        ← Back
      </button>

      <h2 style={{marginTop:20}}>
        🛠 Help & Support
      </h2>

      <p style={{
        opacity:0.6,
        marginBottom:20
      }}>
        Describe your issue below
      </p>

      <textarea
        value={complaint}
        onChange={(e)=>setComplaint(e.target.value)}
        placeholder="Write your complaint..."
        style={{
          width:"100%",
          height:180,
          borderRadius:20,
          padding:20,
          background:"rgba(255,255,255,0.05)",
          border:"1px solid rgba(255,255,255,0.08)",
          color:"white",
          resize:"none",
          outline:"none"
        }}
      />

      <button
        onClick={submitComplaint}
        style={{
          width:"100%",
          padding:"14px",
          marginTop:20,
          borderRadius:20,
          border:"none",
          background:
            "linear-gradient(45deg,#22c55e,#16a34a)",
          color:"white",
          cursor:"pointer"
        }}
      >
        Submit Complaint 🚀
      </button>

    </div>
  );
}
 
  // ================= LOGIN / FORGOT / OTP =================

const secondaryBtn = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "transparent",
  color: "white",
  cursor: "pointer"
};

const linkStyle = {
  marginTop: "12px",
  textAlign: "center",
  cursor: "pointer",
  opacity: 0.8
};

// ================= LOGIN UI =================
if (!token && page === "login") {
  return (
    <div style={{
      height: "100vh",
      background: "linear-gradient(135deg, #141e30, #243b55)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "white"
    }}>

      <div style={{
        width: 340,
        padding: 30,
        borderRadius: 15,
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 0 30px rgba(0,0,0,0.3)"
      }}>

        <h2 style={{textAlign:"center", marginBottom:20}}>
          🏢 Society Login
        </h2>

        {authMode === "login" && (
          <>
            <input
              placeholder="Flat Number"
              value={flat}
              onChange={(e) => setFlat(e.target.value)}
              onKeyDown={(e)=>{
  if(e.key==="Enter"){
    login();
  }
}}
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e)=>{
  if(e.key==="Enter"){
    login();
  }
}}
              style={inputStyle}
            />

            <button onClick={login} style={mainBtn}>
              Login
            </button>

            <button onClick={()=>setPage("landing")} style={secondaryBtn}>
              ⬅ Back
            </button>

            <p style={linkStyle} onClick={()=>setAuthMode("forgot")}>
              Forgot Password?
            </p>
            {toast && (
  <div style={{
    marginTop: 15,
    padding: "12px",
    borderRadius: "10px",
    textAlign: "center",
    background:
      toastType === "success"
        ? "rgba(0,200,83,0.15)"
        : "rgba(255,82,82,0.15)",
    color:
      toastType === "success"
        ? "#00e676"
        : "#ff5252",
    border:
      toastType === "success"
        ? "1px solid rgba(0,230,118,0.3)"
        : "1px solid rgba(255,82,82,0.3)",

    animation: "shake 0.4s ease"
  }}>
    {toast}
  </div>
)}
          </>
        )}

        {authMode === "forgot" && (
          <>
            <input
              placeholder="Enter Email"
              value={resetEmail}
              onChange={(e)=>setResetEmail(e.target.value)}
              style={inputStyle}
            />

            <button onClick={sendOtp} style={mainBtn}>
              Send OTP
            </button>

            <button onClick={()=>setAuthMode("login")} style={secondaryBtn}>
              ⬅ Back
            </button>
          </>
        )}

        {authMode === "otp" && (
          <>
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e)=>setOtp(e.target.value)}
              style={inputStyle}
            />

            <input
              placeholder="New Password"
              value={newPassword}
              onChange={(e)=>setNewPassword(e.target.value)}
              style={inputStyle}
            />

            <button onClick={verifyOtp} style={mainBtn}>
              Reset Password
            </button>

            <button onClick={()=>setAuthMode("login")} style={secondaryBtn}>
              ⬅ Back
            </button>
          </>
        )}

      </div>
    </div>
  );
}


// ================= LANDING =================
if (!token && page === "landing") {
  return (
    <div style={{
      height: "100vh",
      background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      textAlign: "center",
      padding: 20
    }}>

      <h1 style={{
        fontSize: "42px",
        fontWeight: "700"
      }}>
        🏢 NEW TOWN SOCIETY
      </h1>

      <p style={{
        opacity: 0.7,
        marginTop: 10,
        maxWidth: 400
      }}>
        Smart maintenance tracking, payments & automation for modern societies.
      </p>

      <button
        onClick={() => setPage("login")}
        style={{
          marginTop: 30,
          padding: "14px 30px",
          borderRadius: "30px",
          border: "none",
          background: "linear-gradient(45deg,#6a11cb,#2575fc)",
          color: "white",
          fontSize: "16px",
          cursor: "pointer",
          transition: "0.3s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        🚀 Get Started
      </button>

      <div style={{
        marginTop: 40,
        display: "flex",
        gap: 20,
        flexWrap: "wrap",
        justifyContent: "center",
        opacity: 0.8,
        fontSize: 14
      }}>
        <a href="#" style={{ color: "white", textDecoration: "none" }}>Privacy Policy</a>
        <a href="#" style={{ color: "white", textDecoration: "none" }}>Terms</a>
        <a href="#" style={{ color: "white", textDecoration: "none" }}>Refund Policy</a>
        <a href="#" style={{ color: "white", textDecoration: "none" }}>Contact</a>
      </div>

    </div>
  );
}}