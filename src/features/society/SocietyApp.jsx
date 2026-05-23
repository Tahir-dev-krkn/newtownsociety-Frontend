"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Building2,
  CheckCircle2,
  CreditCard,
  Download,
  Edit3,
  FileSpreadsheet,
  Gauge,
  History,
  Home,
  LogOut,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  ReceiptText,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Trash2,
  User,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react";
import { apiRequest, downloadFile } from "./api";
import { ADMIN_NAV, MONTHS, OWNER_NAV, RAZORPAY_KEY, YEARS } from "./constants";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: "#334155", boxWidth: 12, font: { size: 12 } },
    },
  },
  scales: {
    x: {
      ticks: { color: "#64748b" },
      grid: { display: false },
    },
    y: {
      ticks: { color: "#64748b" },
      grid: { color: "rgba(148, 163, 184, 0.18)" },
    },
  },
};

const iconMap = {
  addMember: UserPlus,
  dashboard: Gauge,
  due: AlertCircle,
  export: FileSpreadsheet,
  history: History,
  home: Home,
  members: Users,
  payment: CreditCard,
  profile: User,
};

function Icon({ name, size = 18 }) {
  const IconComponent = iconMap[name] || ShieldCheck;

  return <IconComponent aria-hidden="true" size={size} strokeWidth={2.2} />;
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function monthIndex(month) {
  return MONTHS.indexOf(month);
}

function paymentTotal(payments = [], status) {
  return payments
    .filter((payment) =>
      status === "paid" ? payment.status === "paid" : payment.status !== "paid",
    )
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
}

function Toast({ toast }) {
  if (!toast.message) return null;

  return (
    <div className={`toast toast-${toast.type}`} role="status">
      {toast.type === "error" ? (
        <AlertCircle aria-hidden="true" size={18} strokeWidth={2.3} />
      ) : (
        <CheckCircle2 aria-hidden="true" size={18} strokeWidth={2.3} />
      )}
      {toast.message}
    </div>
  );
}

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">
        <Building2 aria-hidden="true" size={24} strokeWidth={2.4} />
      </div>
      <div>
        <p className="brand-name">New Town Society</p>
        <p className="brand-subtitle">Resident command center</p>
      </div>
    </div>
  );
}

function AppShell({
  title,
  subtitle,
  page,
  setPage,
  navItems,
  onLogout,
  headerActions,
  children,
}) {
  return (
    <main className="app-shell">
      <aside className="app-nav" aria-label="Primary">
        <Brand />

        <div className="nav-list">
          {navItems.map((item) => (
            <button
              className={`nav-button ${page === item.name ? "active" : ""}`}
              key={item.name}
              onClick={() => setPage(item.name)}
              type="button"
            >
              <span className="nav-icon">
                <Icon name={item.icon} />
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <button className="nav-button danger" onClick={onLogout} type="button">
          <span className="nav-icon">
            <LogOut aria-hidden="true" size={18} strokeWidth={2.2} />
          </span>
          <span>Logout</span>
        </button>
      </aside>

      <section className="app-main">
        <header className="screen-header">
          <div>
            <p className="eyebrow">NEW TOWN SOCIETY</p>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {headerActions && <div className="header-actions">{headerActions}</div>}
        </header>

        {children}
      </section>

      <nav className="bottom-nav" aria-label="Mobile primary">
        {navItems.map((item) => (
          <button
            className={`bottom-nav-button ${page === item.name ? "active" : ""}`}
            key={item.name}
            onClick={() => setPage(item.name)}
            type="button"
          >
            <span>
              <Icon name={item.icon} size={19} />
            </span>
            <small>{item.label}</small>
          </button>
        ))}
      </nav>
    </main>
  );
}

function StatCard({ label, value, tone = "neutral", action, caption }) {
  const Element = action ? "button" : "div";
  const actionProps = action ? { onClick: action, type: "button" } : {};

  return (
    <Element className={`stat-card tone-${tone}`} {...actionProps}>
      <span>{label}</span>
      <strong>{value}</strong>
      {caption && <small>{caption}</small>}
    </Element>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {text && <p>{text}</p>}
    </div>
  );
}

function TextField({ label, value, onChange, type = "text", placeholder }) {
  const isSearch = label.toLowerCase() === "search";

  return (
    <label className={`field ${isSearch ? "search-field" : ""}`}>
      <span>{label}</span>
      {isSearch && <Search aria-hidden="true" size={17} strokeWidth={2.3} />}
      <input
        placeholder={placeholder || label}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

function TextareaField({ label, value, onChange, placeholder }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea
        placeholder={placeholder || label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function BackButton({ onClick, label = "Back" }) {
  return (
    <button className="ghost-button" onClick={onClick} type="button">
      <ArrowLeft aria-hidden="true" size={17} strokeWidth={2.3} />
      {label}
    </button>
  );
}

function LoadingScreen() {
  return (
    <main className="auth-screen">
      <section className="auth-card compact">
        <Brand />
        <div className="loading-line" />
        <p className="muted">Opening your society app...</p>
      </section>
    </main>
  );
}

function OpeningScreen({ onStart }) {
  return (
    <main className="landing-screen">
      <section className="landing-hero">
        <Brand />
        <div className="landing-copy">
          <p className="eyebrow">NEW TOWN SOCIETY</p>
          <h1>Maintenance payments made simple for every flat owner.</h1>
          <p>
            Owners can pay dues, view history, update profiles, and raise support
            requests. Admins can manage members, reminders, complaints, and reports.
          </p>
        </div>

        <div className="landing-actions">
          <button className="primary-button" onClick={onStart} type="button">
            <ShieldCheck aria-hidden="true" size={18} strokeWidth={2.3} />
            Login securely
          </button>
          <a className="secondary-link-button" href="/privacy-policy">
            Privacy policy
          </a>
        </div>
      </section>

      <section className="landing-card-grid" aria-label="App highlights">
        <article className="landing-card">
          <WalletCards aria-hidden="true" size={28} strokeWidth={2.3} />
          <h2>Owner app</h2>
          <p>Pay maintenance, check dues, receipts, and support from phone.</p>
        </article>
        <article className="landing-card">
          <Gauge aria-hidden="true" size={28} strokeWidth={2.3} />
          <h2>Admin control</h2>
          <p>Track collection, members, pending dues, complaints, and exports.</p>
        </article>
        <article className="landing-card">
          <Smartphone aria-hidden="true" size={28} strokeWidth={2.3} />
          <h2>Installable</h2>
          <p>Works on web and can be installed like a mobile app.</p>
        </article>
      </section>
    </main>
  );
}

function AuthScreen({
  authMode,
  setAuthMode,
  setPage,
  flat,
  setFlat,
  password,
  setPassword,
  resetEmail,
  setResetEmail,
  newPassword,
  setNewPassword,
  verifyEmailOtp,
  setVerifyEmailOtp,
  verifyEmail,
  verificationEmail,
  login,
  sendResetLink,
  resetPasswordFromLink,
  busy,
}) {
  const authTitle = {
    login: "Login",
    forgot: "Reset password",
    resetSent: "Check your email",
    resetLink: "Set new password",
    emailVerify: "Verify email",
  }[authMode] || "Login";

  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <Brand />
        <div className="auth-copy">
          <p className="eyebrow">Web and mobile app</p>
          <h1>Smart dues, payments, reports, and support in one place.</h1>
          <p>
            A faster resident experience for owners, with a clean control room for
            society admins.
          </p>
        </div>
        <div className="auth-visual" aria-hidden="true">
          <div className="visual-stat">
            <span>Collection</span>
            <strong>Live</strong>
          </div>
          <div className="visual-stat">
            <span>Reminders</span>
            <strong>Auto</strong>
          </div>
          <div className="visual-stat">
            <span>Reports</span>
            <strong>XLSX</strong>
          </div>
        </div>
      </section>

      <section className="auth-card">
        <button
          className="text-button inline"
          onClick={() => setPage("landing")}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={2.3} />
          Opening page
        </button>

        <h2>{authTitle}</h2>

        {authMode === "login" && (
          <>
            <TextField label="Flat number" value={flat} onChange={setFlat} />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
            />
            <button
              className="primary-button"
              disabled={busy}
              onClick={login}
              type="button"
            >
              <ShieldCheck aria-hidden="true" size={18} strokeWidth={2.3} />
              Login
            </button>
            <button
              className="text-button"
              onClick={() => setAuthMode("forgot")}
              type="button"
            >
              Forgot password
            </button>
          </>
        )}

        {authMode === "emailVerify" && (
          <>
            <div className="verification-note">
              <Mail aria-hidden="true" size={20} strokeWidth={2.3} />
              <div>
                <strong>Email verification required</strong>
                <p>
                  Enter the OTP sent to {verificationEmail || "your registered email"}.
                </p>
              </div>
            </div>

            <TextField
              label="Email OTP"
              value={verifyEmailOtp}
              onChange={setVerifyEmailOtp}
              placeholder="6 digit OTP"
            />

            <button
              className="primary-button"
              disabled={busy}
              onClick={verifyEmail}
              type="button"
            >
              <ShieldCheck aria-hidden="true" size={18} strokeWidth={2.3} />
              Verify and login
            </button>

            <button className="secondary-button" disabled={busy} onClick={login} type="button">
              <Send aria-hidden="true" size={18} strokeWidth={2.3} />
              Resend OTP
            </button>
          </>
        )}

        {authMode === "forgot" && (
          <>
            <TextField label="Email" value={resetEmail} onChange={setResetEmail} />
            <button
              className="primary-button"
              disabled={busy}
              onClick={sendResetLink}
              type="button"
            >
              <Mail aria-hidden="true" size={18} strokeWidth={2.3} />
              Send reset link
            </button>
            <button
              className="secondary-button"
              onClick={() => setAuthMode("login")}
              type="button"
            >
              Back to login
            </button>
          </>
        )}

        {authMode === "resetSent" && (
          <>
            <div className="verification-note">
              <Mail aria-hidden="true" size={20} strokeWidth={2.3} />
              <div>
                <strong>Reset link sent</strong>
                <p>Open the password reset link sent to {resetEmail}.</p>
              </div>
            </div>
            <button
              className="secondary-button"
              disabled={busy}
              onClick={sendResetLink}
              type="button"
            >
              <Send aria-hidden="true" size={18} strokeWidth={2.3} />
              Send again
            </button>
            <button
              className="secondary-button"
              onClick={() => setAuthMode("login")}
              type="button"
            >
              Back to login
            </button>
          </>
        )}

        {authMode === "resetLink" && (
          <>
            <div className="verification-note">
              <ShieldCheck aria-hidden="true" size={20} strokeWidth={2.3} />
              <div>
                <strong>Secure reset link opened</strong>
                <p>Set a new password for {resetEmail || "your account"}.</p>
              </div>
            </div>
            <TextField
              label="New password"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
            />
            <button
              className="primary-button"
              disabled={busy}
              onClick={resetPasswordFromLink}
              type="button"
            >
              <ShieldCheck aria-hidden="true" size={18} strokeWidth={2.3} />
              Reset password
            </button>
            <button
              className="secondary-button"
              onClick={() => setAuthMode("login")}
              type="button"
            >
              Back to login
            </button>
          </>
        )}

        <div className="policy-links">
          <a href="/privacy-policy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/refund-policy">Refunds</a>
          <a href="/contact">Contact</a>
        </div>
      </section>
    </main>
  );
}

function AdminDashboard({ members, setPage, openComplaints, refreshing }) {
  const owners = members.filter((member) => member.role === "owner");
  const allPayments = owners.flatMap((member) => member.payments || []);
  const totalPaid = paymentTotal(allPayments, "paid");
  const totalPending = paymentTotal(allPayments, "pending");
  const pendingMembers = owners.filter((member) => member.pendingAmount > 0).length;

  const monthlyPaid = new Array(12).fill(0);
  const monthlyPending = new Array(12).fill(0);

  allPayments.forEach((payment) => {
    const index = monthIndex(payment.month);
    if (index < 0) return;

    if (payment.status === "paid") {
      monthlyPaid[index] += Number(payment.amount || 0);
    } else {
      monthlyPending[index] += Number(payment.amount || 0);
    }
  });

  return (
    <>
      <div className="quick-actions">
        <button className="primary-button" onClick={() => setPage("members")} type="button">
          <Users aria-hidden="true" size={18} strokeWidth={2.3} />
          Manage members
        </button>
        <button className="secondary-button" onClick={openComplaints} type="button">
          <Bell aria-hidden="true" size={18} strokeWidth={2.3} />
          Complaints
        </button>
      </div>

      <section className="stats-grid">
        <StatCard label="Members" value={owners.length} tone="blue" action={() => setPage("members")} />
        <StatCard label="Paid" value={money(totalPaid)} tone="green" />
        <StatCard label="Pending" value={money(totalPending)} tone="red" action={() => setPage("pending")} />
        <StatCard label="Defaulters" value={pendingMembers} tone="amber" action={() => setPage("pending")} />
      </section>

      <section className="panel chart-panel">
        <div className="panel-heading">
          <h2>Collection overview</h2>
          {refreshing && <span className="status-pill">Refreshing</span>}
        </div>
        <Bar
          data={{
            labels: MONTHS.map((month) => month.slice(0, 3)),
            datasets: [
              { label: "Paid", data: monthlyPaid, backgroundColor: "#16a34a", borderRadius: 8 },
              { label: "Pending", data: monthlyPending, backgroundColor: "#dc2626", borderRadius: 8 },
            ],
          }}
          options={chartOptions}
        />
      </section>
    </>
  );
}

function MembersScreen({
  members,
  search,
  setSearch,
  filter,
  setFilter,
  sortType,
  setSortType,
  setPage,
  openDue,
  openEdit,
  deleteMember,
  sendReminder,
}) {
  const filteredMembers = members
    .filter((member) => member.role === "owner")
    .filter((member) => {
      if (search) {
        const query = search.toLowerCase();
        const matches =
          member.name?.toLowerCase().includes(query) ||
          member.flatNumber?.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (filter === "pending" && Number(member.pendingAmount || 0) <= 0) return false;
      if (filter === "paid" && Number(member.pendingAmount || 0) > 0) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortType === "high") return Number(b.pendingAmount || 0) - Number(a.pendingAmount || 0);
      if (sortType === "low") return Number(a.pendingAmount || 0) - Number(b.pendingAmount || 0);
      return 0;
    });

  return (
    <>
      <div className="toolbar">
        <TextField label="Search" value={search} onChange={setSearch} placeholder="Name or flat" />
        <SelectField label="Status" value={filter} onChange={setFilter}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </SelectField>
        <SelectField label="Sort" value={sortType} onChange={setSortType}>
          <option value="none">Default</option>
          <option value="high">High to low</option>
          <option value="low">Low to high</option>
        </SelectField>
        <button className="primary-button" onClick={() => setPage("addMember")} type="button">
          <Plus aria-hidden="true" size={18} strokeWidth={2.3} />
          Add member
        </button>
      </div>

      <section className="list-grid">
        {filteredMembers.map((member) => (
          <article className="member-card" key={member._id}>
            <div>
              <p className="card-kicker">Flat {member.flatNumber}</p>
              <h2>{member.name}</h2>
              <p>{member.phone || "No phone"}</p>
              <p>{member.email || "No email"}</p>
            </div>

            <div className="member-meta">
              <span className={member.pendingAmount > 0 ? "status-pill danger" : "status-pill success"}>
                {member.pendingAmount > 0 ? `${money(member.pendingAmount)} pending` : "Clear"}
              </span>
              <span>{Number(member.area || 0)} sq ft</span>
            </div>

            <div className="button-row">
              <button className="secondary-button" onClick={() => openDue(member)} type="button">
                <ReceiptText aria-hidden="true" size={17} strokeWidth={2.3} />
                Add due
              </button>
              <button className="secondary-button" onClick={() => openEdit(member)} type="button">
                <Edit3 aria-hidden="true" size={17} strokeWidth={2.3} />
                Edit
              </button>
              <button className="secondary-button" onClick={() => sendReminder(member._id)} type="button">
                <Send aria-hidden="true" size={17} strokeWidth={2.3} />
                Remind
              </button>
              <button className="danger-button" onClick={() => deleteMember(member._id)} type="button">
                <Trash2 aria-hidden="true" size={17} strokeWidth={2.3} />
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>

      {filteredMembers.length === 0 && <EmptyState title="No members found" />}
    </>
  );
}

function MemberForm({ title, values, setValues, onSubmit, onBack, submitLabel }) {
  const update = (field, value) => setValues((current) => ({ ...current, [field]: value }));

  return (
    <section className="form-panel">
      <BackButton onClick={onBack} />
      <h2>{title}</h2>
      <TextField label="Name" value={values.name || ""} onChange={(value) => update("name", value)} />
      <TextField
        label="Flat number"
        value={values.flatNumber || ""}
        onChange={(value) => update("flatNumber", value)}
      />
      <TextField label="Area" value={values.area || ""} onChange={(value) => update("area", value)} />
      <TextField label="Phone" value={values.phone || ""} onChange={(value) => update("phone", value)} />
      <TextField label="Email" value={values.email || ""} onChange={(value) => update("email", value)} />
      <button className="primary-button" onClick={onSubmit} type="button">
        <CheckCircle2 aria-hidden="true" size={18} strokeWidth={2.3} />
        {submitLabel}
      </button>
    </section>
  );
}

function AddDueScreen({
  member,
  fromMonth,
  setFromMonth,
  toMonth,
  setToMonth,
  year,
  setYear,
  onSubmit,
  onBack,
}) {
  const start = monthIndex(fromMonth);
  const end = monthIndex(toMonth);
  const months = start >= 0 && end >= start ? end - start + 1 : 0;
  const monthly = Number(member?.monthlyMaintenance || member?.area * 1.5 || 0);
  const amount = months * monthly;

  return (
    <section className="form-panel">
      <BackButton onClick={onBack} />
      <p className="card-kicker">Flat {member?.flatNumber}</p>
      <h2>Add maintenance due</h2>
      <SelectField label="From month" value={fromMonth} onChange={setFromMonth}>
        <option value="">Select month</option>
        {MONTHS.map((month) => (
          <option key={month} value={month}>
            {month}
          </option>
        ))}
      </SelectField>
      <SelectField label="To month" value={toMonth} onChange={setToMonth}>
        <option value="">Select month</option>
        {MONTHS.map((month) => (
          <option key={month} value={month}>
            {month}
          </option>
        ))}
      </SelectField>
      <SelectField label="Year" value={year} onChange={setYear}>
        <option value="">Select year</option>
        {YEARS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </SelectField>

      <div className="calculation-card">
        <span>{months} month(s)</span>
        <strong>{money(amount)}</strong>
      </div>

      <button className="primary-button" disabled={!amount} onClick={onSubmit} type="button">
        <Plus aria-hidden="true" size={18} strokeWidth={2.3} />
        Add due
      </button>
    </section>
  );
}

function AdminHistory({
  payments,
  filters,
  setFilters,
  exportHistory,
}) {
  const filtered = payments
    .filter((payment) => {
      const query = filters.search.toLowerCase();
      if (query) {
        const matches =
          payment.name?.toLowerCase().includes(query) ||
          payment.flat?.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (filters.status === "paid" && payment.status !== "paid") return false;
      if (filters.status === "pending" && payment.status === "paid") return false;
      if (filters.month && payment.month !== filters.month) return false;
      if (filters.year && String(payment.year) !== String(filters.year)) return false;

      if (filters.fromMonth && filters.toMonth) {
        const current = monthIndex(payment.month);
        const from = monthIndex(filters.fromMonth);
        const to = monthIndex(filters.toMonth);
        if (current < from || current > to) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (filters.sort === "high") return Number(b.amount || 0) - Number(a.amount || 0);
      if (filters.sort === "low") return Number(a.amount || 0) - Number(b.amount || 0);
      return 0;
    });

  const paidTotal = paymentTotal(filtered, "paid");
  const pendingTotal = paymentTotal(filtered, "pending");

  return (
    <>
      <section className="panel chart-panel small">
        <div className="panel-heading">
          <h2>Payment mix</h2>
          <button className="primary-button slim" onClick={() => exportHistory(filtered)} type="button">
            <Download aria-hidden="true" size={17} strokeWidth={2.3} />
            Export
          </button>
        </div>
        <Bar
          data={{
            labels: ["Paid", "Pending"],
            datasets: [
              {
                label: "Amount",
                data: [paidTotal, pendingTotal],
                backgroundColor: ["#16a34a", "#dc2626"],
                borderRadius: 8,
              },
            ],
          }}
          options={chartOptions}
        />
      </section>

      <div className="toolbar">
        <TextField
          label="Search"
          value={filters.search}
          onChange={(value) => setFilters((current) => ({ ...current, search: value }))}
          placeholder="Name or flat"
        />
        <SelectField
          label="Status"
          value={filters.status}
          onChange={(value) => setFilters((current) => ({ ...current, status: value }))}
        >
          <option value="all">All</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </SelectField>
        <SelectField
          label="Month"
          value={filters.month}
          onChange={(value) => setFilters((current) => ({ ...current, month: value }))}
        >
          <option value="">All months</option>
          {MONTHS.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Year"
          value={filters.year}
          onChange={(value) => setFilters((current) => ({ ...current, year: value }))}
        >
          <option value="">All years</option>
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Sort"
          value={filters.sort}
          onChange={(value) => setFilters((current) => ({ ...current, sort: value }))}
        >
          <option value="none">Default</option>
          <option value="high">High to low</option>
          <option value="low">Low to high</option>
        </SelectField>
      </div>

      <section className="list-grid">
        {filtered.map((payment, index) => (
          <article className="payment-row" key={`${payment.flat}-${payment.month}-${index}`}>
            <div>
              <strong>{payment.name}</strong>
              <span>Flat {payment.flat}</span>
              <span>
                {payment.month} {payment.year}
              </span>
            </div>
            <div>
              <strong>{money(payment.amount)}</strong>
              <span className={payment.status === "paid" ? "status-pill success" : "status-pill danger"}>
                {payment.status}
              </span>
            </div>
          </article>
        ))}
      </section>

      {filtered.length === 0 && <EmptyState title="No payments found" />}
    </>
  );
}

function ExportScreen({ excelFlat, setExcelFlat, dates, setDates, downloadExcel }) {
  return (
    <section className="form-panel">
      <h2>Export payment report</h2>
      <TextField label="Flat number" value={excelFlat} onChange={setExcelFlat} placeholder="Optional" />
      <TextField
        label="From"
        type="month"
        value={dates.from}
        onChange={(value) => setDates((current) => ({ ...current, from: value }))}
      />
      <TextField
        label="To"
        type="month"
        value={dates.to}
        onChange={(value) => setDates((current) => ({ ...current, to: value }))}
      />
      <button className="primary-button" onClick={downloadExcel} type="button">
        <Download aria-hidden="true" size={18} strokeWidth={2.3} />
        Download Excel
      </button>
    </section>
  );
}

function PendingScreen({ members }) {
  const pending = members
    .filter((member) => member.role === "owner")
    .flatMap((member) =>
      (member.payments || [])
        .filter((payment) => payment.status !== "paid")
        .map((payment) => ({ ...payment, member })),
    );

  return (
    <section className="list-grid">
      {pending.map((item, index) => (
        <article className="payment-row" key={`${item.member._id}-${item._id || index}`}>
          <div>
            <strong>{item.member.name}</strong>
            <span>Flat {item.member.flatNumber}</span>
            <span>
              {item.month} {item.year}
            </span>
          </div>
          <div>
            <strong>{money(item.amount)}</strong>
            <span className="status-pill danger">Pending</span>
          </div>
        </article>
      ))}
      {pending.length === 0 && <EmptyState title="No pending dues" />}
    </section>
  );
}

function ComplaintsScreen({ complaints, loadComplaints }) {
  return (
    <>
      <div className="quick-actions">
        <button className="secondary-button" onClick={loadComplaints} type="button">
          <Bell aria-hidden="true" size={18} strokeWidth={2.3} />
          Refresh complaints
        </button>
      </div>
      <section className="list-grid">
        {complaints.map((complaint) => (
          <article className="member-card" key={complaint._id}>
            <p className="card-kicker">
              Flat {complaint.flat} · {new Date(complaint.date).toLocaleDateString()}
            </p>
            <h2>{complaint.name}</h2>
            <p>{complaint.phone}</p>
            <p className="complaint-message">{complaint.message}</p>
          </article>
        ))}
        {complaints.length === 0 && <EmptyState title="No complaints" />}
      </section>
    </>
  );
}

function OwnerDashboard({ data, setPage }) {
  const pendingTotal = paymentTotal(data?.due || [], "pending");
  const paidTotal = paymentTotal(data?.paid || [], "paid");
  const currentCount = (data?.current || []).filter((payment) => payment.status !== "paid").length;

  return (
    <>
      <section className="owner-hero">
        <div>
          <p className="eyebrow">Flat {data?.flatNumber || "--"}</p>
          <h2>{data?.name || "Owner"}</h2>
          <p>{pendingTotal > 0 ? `${money(pendingTotal)} pending` : "All dues are clear"}</p>
        </div>
        <button className="primary-button" onClick={() => setPage("payment")} type="button">
          <WalletCards aria-hidden="true" size={18} strokeWidth={2.3} />
          Pay now
        </button>
      </section>

      <section className="stats-grid">
        <StatCard label="Total due" value={money(pendingTotal)} tone="red" action={() => setPage("due")} />
        <StatCard label="Current bills" value={currentCount} tone="blue" action={() => setPage("payment")} />
        <StatCard label="Paid total" value={money(paidTotal)} tone="green" action={() => setPage("history")} />
        <StatCard label="Profile" value="Open" tone="amber" action={() => setPage("profile")} />
      </section>

      <section className="panel chart-panel small">
        <div className="panel-heading">
          <h2>Payment overview</h2>
        </div>
        <Bar
          data={{
            labels: ["Paid", "Pending"],
            datasets: [
              {
                label: "Amount",
                data: [paidTotal, pendingTotal],
                backgroundColor: ["#16a34a", "#dc2626"],
                borderRadius: 8,
              },
            ],
          }}
          options={chartOptions}
        />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Recent payments</h2>
          <button className="text-button inline" onClick={() => setPage("history")} type="button">
            <History aria-hidden="true" size={16} strokeWidth={2.3} />
            View all
          </button>
        </div>
        {(data?.paid || []).slice(0, 5).map((payment) => (
          <article className="payment-row compact" key={payment._id}>
            <div>
              <strong>
                {payment.month} {payment.year}
              </strong>
              <span>Paid</span>
            </div>
            <strong>{money(payment.amount)}</strong>
          </article>
        ))}
        {(data?.paid || []).length === 0 && <EmptyState title="No payments yet" />}
      </section>
    </>
  );
}

function OwnerPayments({ payments, title, emptyTitle, payNow, setPage }) {
  const payable = payments.filter((payment) => payment.status !== "paid");

  return (
    <>
      <div className="quick-actions">
        <BackButton onClick={() => setPage("dashboard")} />
      </div>
      <section className="list-grid">
        {payable.map((payment) => (
          <article className="bill-card" key={payment._id}>
            <p className="card-kicker">
              {payment.month} {payment.year}
            </p>
            <h2>{money(payment.amount)}</h2>
            <p>{title}</p>
            <button className="primary-button" onClick={() => payNow(payment)} type="button">
              <CreditCard aria-hidden="true" size={18} strokeWidth={2.3} />
              Pay now
            </button>
          </article>
        ))}
      </section>
      {payable.length === 0 && <EmptyState title={emptyTitle} />}
    </>
  );
}

function OwnerHistory({ paid, setPage }) {
  return (
    <>
      <div className="quick-actions">
        <BackButton onClick={() => setPage("dashboard")} />
      </div>
      <section className="list-grid">
        {(paid || []).map((payment) => (
          <article className="payment-row" key={payment._id}>
            <div>
              <strong>
                {payment.month} {payment.year}
              </strong>
              <span>Paid maintenance</span>
            </div>
            <div>
              <strong>{money(payment.amount)}</strong>
              <span className="status-pill success">Paid</span>
            </div>
          </article>
        ))}
      </section>
      {(paid || []).length === 0 && <EmptyState title="No payment history" />}
    </>
  );
}

function OwnerProfile({ data, profileDue, setPage, logout }) {
  return (
    <>
      <div className="profile-card">
        <div className="avatar">{(data?.name || "N").slice(0, 1).toUpperCase()}</div>
        <h2>{data?.name || "Owner"}</h2>
        <p>Flat {data?.flatNumber || "--"}</p>
        <div className="profile-lines">
          <span>
            <Phone aria-hidden="true" size={15} strokeWidth={2.3} />
            {data?.phone || "Phone not added"}
          </span>
          <span>
            <Mail aria-hidden="true" size={15} strokeWidth={2.3} />
            {data?.email || "Email not added"}
          </span>
        </div>
        <div className="button-row center">
          <button className="primary-button" onClick={() => setPage("editProfile")} type="button">
            <Edit3 aria-hidden="true" size={18} strokeWidth={2.3} />
            Edit profile
          </button>
          <button className="secondary-button" onClick={() => setPage("support")} type="button">
            <MessageCircle aria-hidden="true" size={18} strokeWidth={2.3} />
            Help and support
          </button>
        </div>
      </div>

      <section className="stats-grid">
        <StatCard label="Due status" value={profileDue > 0 ? "Pending" : "Clear"} tone={profileDue > 0 ? "red" : "green"} />
        <StatCard label="Total due" value={money(profileDue)} tone="blue" />
      </section>

      <button className="danger-button full" onClick={logout} type="button">
        <LogOut aria-hidden="true" size={18} strokeWidth={2.3} />
        Logout
      </button>
    </>
  );
}

function EditProfile({ phone, setPhone, email, setEmail, updateProfile, setPage }) {
  return (
    <section className="form-panel">
      <BackButton onClick={() => setPage("profile")} />
      <h2>Edit profile</h2>
      <TextField label="Phone" value={phone} onChange={setPhone} />
      <TextField label="Email" value={email} onChange={setEmail} />
      <button className="primary-button" onClick={updateProfile} type="button">
        <CheckCircle2 aria-hidden="true" size={18} strokeWidth={2.3} />
        Save changes
      </button>
    </section>
  );
}

function SupportScreen({ complaint, setComplaint, submitComplaint, setPage }) {
  return (
    <section className="form-panel">
      <BackButton onClick={() => setPage("profile")} />
      <h2>Help and support</h2>
      <TextareaField
        label="Complaint message"
        value={complaint}
        onChange={setComplaint}
        placeholder="Write your issue"
      />
      <button className="primary-button" onClick={submitComplaint} type="button">
        <Send aria-hidden="true" size={18} strokeWidth={2.3} />
        Submit complaint
      </button>
    </section>
  );
}

export default function SocietyApp() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [page, setPage] = useState("landing");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const [authMode, setAuthMode] = useState("login");
  const [flat, setFlat] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verifyEmailOtp, setVerifyEmailOtp] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");

  const [memberDraft, setMemberDraft] = useState({
    name: "",
    flatNumber: "",
    area: "",
    phone: "",
    email: "",
  });
  const [editMemberData, setEditMemberData] = useState(null);
  const [dueTarget, setDueTarget] = useState(null);
  const [fromMonth, setFromMonth] = useState("");
  const [toMonth, setToMonth] = useState("");
  const [year, setYear] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortType, setSortType] = useState("none");
  const [historyFilters, setHistoryFilters] = useState({
    search: "",
    status: "all",
    sort: "none",
    month: "",
    year: "",
    fromMonth: "",
    toMonth: "",
  });
  const [excelFlat, setExcelFlat] = useState("");
  const [exportDates, setExportDates] = useState({ from: "", to: "" });

  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [complaint, setComplaint] = useState("");

  const notify = useCallback((message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast({ message: "", type: "success" }), 3200);
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setData(null);
    setPage("landing");
    setAuthMode("login");
  }, []);

  const loadComplaints = useCallback(async () => {
    if (!token) return;
    const response = await apiRequest("/complaints", { token });
    setComplaints(Array.isArray(response) ? response : []);
  }, [token]);

  const loadData = useCallback(async () => {
    if (!token || !role) return;

    setRefreshing(true);
    try {
      if (role === "admin") {
        const members = await apiRequest("/members", { token });
        setData(Array.isArray(members) ? members : []);

        if (page === "history") {
          const paymentData = await apiRequest("/all-payments", { token });
          setPayments(Array.isArray(paymentData) ? paymentData : []);
        }

        if (page === "complaints") {
          await loadComplaints();
        }
      }

      if (role === "owner") {
        const dashboard = await apiRequest("/my-dashboard", { token });
        setData(dashboard);
        setEditPhone(dashboard?.phone || "");
        setEditEmail(dashboard?.email || "");
      }
    } catch (error) {
      notify(error.message || "Unable to load data", "error");
    } finally {
      setRefreshing(false);
    }
  }, [loadComplaints, notify, page, role, token]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const linkResetToken = searchParams.get("resetToken");
    const linkResetEmail = searchParams.get("email");

    if (linkResetToken && linkResetEmail) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      setToken(null);
      setRole(null);
      setResetToken(linkResetToken);
      setResetEmail(linkResetEmail);
      setNewPassword("");
      setAuthMode("resetLink");
      setPage("login");
      setLoading(false);
      return;
    }

    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");

    if (savedToken && savedRole) {
      setToken(savedToken);
      setRole(savedRole);
      setPage("dashboard");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token || !role) return;
    loadData();
  }, [loadData, role, token]);

  useEffect(() => {
    if (document.getElementById("razorpay-checkout")) return;

    const script = document.createElement("script");
    script.id = "razorpay-checkout";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const login = async () => {
    if (!flat.trim() || !password) {
      notify("Enter flat number and password", "error");
      return;
    }

    setBusy(true);
    try {
      const response = await apiRequest("/login", {
        method: "POST",
        body: { flatNumber: flat.trim(), password },
      });

      if (!response?.success) {
        if (response?.verificationRequired) {
          setVerificationEmail(response.email || "");
          setVerifyEmailOtp("");
          setAuthMode("emailVerify");
          notify(response.message || "Verify your email before login");
          return;
        }

        notify("Wrong flat number or password", "error");
        return;
      }

      localStorage.setItem("token", response.token);
      localStorage.setItem("role", response.role);
      setToken(response.token);
      setRole(response.role);
      setPage("dashboard");
      notify("Login successful");
    } catch (error) {
      notify(error.message || "Login failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const verifyEmail = async () => {
    if (!flat.trim() || !verifyEmailOtp.trim()) {
      notify("Enter the email OTP", "error");
      return;
    }

    setBusy(true);
    try {
      const response = await apiRequest("/verify-email", {
        method: "POST",
        body: {
          flatNumber: flat.trim(),
          otp: verifyEmailOtp.trim(),
        },
      });

      if (!response?.success) {
        notify(response?.message || "Email verification failed", "error");
        return;
      }

      notify(response.message || "Email verified");
      setAuthMode("login");
      await login();
    } catch (error) {
      notify(error.message || "Email verification failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const sendResetLink = async () => {
    if (!resetEmail.trim()) {
      notify("Enter email", "error");
      return;
    }

    setBusy(true);
    try {
      const message = await apiRequest("/send-reset-link", {
        method: "POST",
        responseType: "text",
        body: { email: resetEmail.trim() },
      });
      notify(message || "Password reset link sent");
      setAuthMode("resetSent");
    } catch (error) {
      notify(error.message || "Could not send reset link", "error");
    } finally {
      setBusy(false);
    }
  };

  const resetPasswordFromLink = async () => {
    if (!resetEmail.trim() || !resetToken || !newPassword) {
      notify("Open the reset link and enter a new password", "error");
      return;
    }

    setBusy(true);
    try {
      const message = await apiRequest("/reset-password", {
        method: "POST",
        responseType: "text",
        body: {
          email: resetEmail.trim(),
          token: resetToken,
          newPassword,
        },
      });
      notify(message || "Password updated");
      setResetToken("");
      setNewPassword("");
      setAuthMode("login");
      window.history.replaceState({}, "", window.location.pathname);
    } catch (error) {
      notify(error.message || "Could not reset password", "error");
    } finally {
      setBusy(false);
    }
  };

  const payNow = async (payment) => {
    if (!window.Razorpay) {
      notify("Payment system is still loading", "error");
      return;
    }

    try {
      const order = await apiRequest("/create-order", {
        method: "POST",
        body: { amount: payment.amount },
      });

      const checkout = new window.Razorpay({
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "New Town Society",
        description: `${payment.month} ${payment.year} maintenance`,
        order_id: order.id,
        prefill: {
          name: data?.name || "",
          email: data?.email || "",
          contact: data?.phone || "",
        },
        theme: { color: "#0f766e" },
        handler: async (response) => {
          await apiRequest("/verify-payment", {
            method: "POST",
            body: {
              paymentId: payment._id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            },
          });
          notify("Payment successful");
          await loadData();
        },
      });

      checkout.open();
    } catch (error) {
      notify(error.message || "Payment failed", "error");
    }
  };

  const sendReminder = async (memberId) => {
    try {
      const message = await apiRequest("/send-reminder", {
        method: "POST",
        token,
        responseType: "text",
        body: { memberId },
      });
      notify(message || "Reminder sent");
    } catch (error) {
      notify(error.message || "Reminder failed", "error");
    }
  };

  const addMember = async () => {
    const cleanDraft = {
      name: memberDraft.name.trim(),
      flatNumber: memberDraft.flatNumber.trim(),
      area: String(memberDraft.area).trim(),
      phone: memberDraft.phone.trim(),
      email: memberDraft.email.trim().toLowerCase(),
    };

    if (
      !cleanDraft.name ||
      !cleanDraft.flatNumber ||
      !cleanDraft.area ||
      !cleanDraft.phone ||
      !cleanDraft.email
    ) {
      notify("Please fill all member details", "error");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(cleanDraft.email)) {
      notify("Please enter a valid email address", "error");
      return;
    }

    try {
      const message = await apiRequest("/add-member", {
        method: "POST",
        token,
        responseType: "text",
        body: cleanDraft,
      });
      notify(message || "Member added");
      setMemberDraft({ name: "", flatNumber: "", area: "", phone: "", email: "" });
      await loadData();
      setPage("members");
    } catch (error) {
      notify(error.message || "Member could not be added", "error");
    }
  };

  const openEditMember = (member) => {
    setEditMemberData({
      _id: member._id,
      name: member.name || "",
      flatNumber: member.flatNumber || "",
      area: member.area || "",
      phone: member.phone || "",
      email: member.email || "",
    });
    setPage("editMember");
  };

  const updateMember = async () => {
    if (!editMemberData?._id) return;

    try {
      await apiRequest(`/member/${editMemberData._id}`, {
        method: "PUT",
        token,
        responseType: "text",
        body: editMemberData,
      });
      notify("Member updated");
      await loadData();
      setPage("members");
    } catch (error) {
      notify(error.message || "Member update failed", "error");
    }
  };

  const deleteMember = async (memberId) => {
    if (!window.confirm("Delete this member?")) return;

    try {
      await apiRequest(`/member/${memberId}`, {
        method: "DELETE",
        token,
        responseType: "text",
      });
      notify("Member deleted");
      await loadData();
    } catch (error) {
      notify(error.message || "Delete failed", "error");
    }
  };

  const openDue = (member) => {
    setDueTarget(member);
    setFromMonth("");
    setToMonth("");
    setYear("");
    setPage("addDue");
  };

  const addDue = async () => {
    const start = monthIndex(fromMonth);
    const end = monthIndex(toMonth);
    const months = start >= 0 && end >= start ? end - start + 1 : 0;
    const amount = months * Number(dueTarget?.monthlyMaintenance || dueTarget?.area * 1.5 || 0);

    if (!dueTarget?._id || !amount || !year) {
      notify("Select a valid due range", "error");
      return;
    }

    try {
      await apiRequest("/add-due", {
        method: "POST",
        token,
        responseType: "text",
        body: {
          memberId: dueTarget._id,
          month: `${fromMonth} to ${toMonth}`,
          year,
          amount,
        },
      });
      notify("Due added");
      await loadData();
      setPage("members");
    } catch (error) {
      notify(error.message || "Due could not be added", "error");
    }
  };

  const exportHistory = async (filteredPayments) => {
    try {
      const blob = await apiRequest("/export-history", {
        method: "POST",
        token,
        responseType: "blob",
        body: filteredPayments,
      });
      downloadFile(blob, "history.xlsx");
    } catch (error) {
      notify(error.message || "Export failed", "error");
    }
  };

  const downloadExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (exportDates.from) params.append("from", exportDates.from);
      if (exportDates.to) params.append("to", exportDates.to);
      if (excelFlat.trim()) params.append("flat", excelFlat.trim());

      const blob = await apiRequest(`/export?${params.toString()}`, {
        token,
        responseType: "blob",
      });
      downloadFile(blob, "report.xlsx");
    } catch (error) {
      notify(error.message || "Report export failed", "error");
    }
  };

  const updateProfile = async () => {
    try {
      await apiRequest("/update-profile", {
        method: "PUT",
        token,
        responseType: "text",
        body: {
          userId: data?._id || data?.user?._id,
          phone: editPhone,
          email: editEmail,
        },
      });
      notify("Profile updated");
      await loadData();
      setPage("profile");
    } catch (error) {
      notify(error.message || "Profile update failed", "error");
    }
  };

  const submitComplaint = async () => {
    if (!complaint.trim()) {
      notify("Write complaint message", "error");
      return;
    }

    try {
      const message = await apiRequest("/add-complaint", {
        method: "POST",
        token,
        responseType: "text",
        body: { message: complaint.trim() },
      });
      notify(message || "Complaint submitted");
      setComplaint("");
    } catch (error) {
      notify(error.message || "Complaint failed", "error");
    }
  };

  const openComplaints = async () => {
    setPage("complaints");
    try {
      await loadComplaints();
    } catch (error) {
      notify(error.message || "Could not load complaints", "error");
    }
  };

  const adminMembers = Array.isArray(data) ? data : [];
  const ownerData = !Array.isArray(data) ? data : null;
  const profileDue = useMemo(
    () => paymentTotal(ownerData?.due || [], "pending"),
    [ownerData],
  );

  if (loading) {
    return <LoadingScreen />;
  }

  if (!token) {
    return (
      <>
        {page === "landing" ? (
          <OpeningScreen onStart={() => setPage("login")} />
        ) : (
          <AuthScreen
            authMode={authMode}
            setAuthMode={setAuthMode}
            setPage={setPage}
            flat={flat}
            setFlat={setFlat}
            password={password}
            setPassword={setPassword}
            resetEmail={resetEmail}
            setResetEmail={setResetEmail}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            verifyEmailOtp={verifyEmailOtp}
            setVerifyEmailOtp={setVerifyEmailOtp}
            verifyEmail={verifyEmail}
            verificationEmail={verificationEmail}
            login={login}
            sendResetLink={sendResetLink}
            resetPasswordFromLink={resetPasswordFromLink}
            busy={busy}
          />
        )}
        <Toast toast={toast} />
      </>
    );
  }

  const navItems = role === "admin" ? ADMIN_NAV : OWNER_NAV;
  const title =
    role === "admin"
      ? page === "dashboard"
        ? "Admin dashboard"
        : ADMIN_NAV.find((item) => item.name === page)?.label || "Admin"
      : page === "dashboard"
        ? "Owner dashboard"
        : OWNER_NAV.find((item) => item.name === page)?.label || "Owner";

  return (
    <>
      <AppShell
        title={title}
        subtitle={role === "admin" ? "Collections, members, reports, and complaints" : "Maintenance, dues, profile, and support"}
        page={page}
        setPage={setPage}
        navItems={navItems}
        onLogout={logout}
        headerActions={
          role === "admin" ? (
            <button className="secondary-button slim" onClick={openComplaints} type="button">
              Complaints
            </button>
          ) : null
        }
      >
        {role === "admin" && page === "dashboard" && (
          <AdminDashboard
            members={adminMembers}
            setPage={setPage}
            openComplaints={openComplaints}
            refreshing={refreshing}
          />
        )}

        {role === "admin" && page === "members" && (
          <MembersScreen
            members={adminMembers}
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            sortType={sortType}
            setSortType={setSortType}
            setPage={setPage}
            openDue={openDue}
            openEdit={openEditMember}
            deleteMember={deleteMember}
            sendReminder={sendReminder}
          />
        )}

        {role === "admin" && page === "addMember" && (
          <MemberForm
            title="Add member"
            values={memberDraft}
            setValues={setMemberDraft}
            onSubmit={addMember}
            onBack={() => setPage("members")}
            submitLabel="Add member"
          />
        )}

        {role === "admin" && page === "editMember" && (
          <MemberForm
            title="Edit member"
            values={editMemberData || {}}
            setValues={setEditMemberData}
            onSubmit={updateMember}
            onBack={() => setPage("members")}
            submitLabel="Save changes"
          />
        )}

        {role === "admin" && page === "addDue" && (
          <AddDueScreen
            member={dueTarget}
            fromMonth={fromMonth}
            setFromMonth={setFromMonth}
            toMonth={toMonth}
            setToMonth={setToMonth}
            year={year}
            setYear={setYear}
            onSubmit={addDue}
            onBack={() => setPage("members")}
          />
        )}

        {role === "admin" && page === "pending" && <PendingScreen members={adminMembers} />}

        {role === "admin" && page === "history" && (
          <AdminHistory
            payments={payments}
            filters={historyFilters}
            setFilters={setHistoryFilters}
            exportHistory={exportHistory}
          />
        )}

        {role === "admin" && page === "excel" && (
          <ExportScreen
            excelFlat={excelFlat}
            setExcelFlat={setExcelFlat}
            dates={exportDates}
            setDates={setExportDates}
            downloadExcel={downloadExcel}
          />
        )}

        {role === "admin" && page === "complaints" && (
          <ComplaintsScreen complaints={complaints} loadComplaints={loadComplaints} />
        )}

        {role === "owner" && page === "dashboard" && <OwnerDashboard data={ownerData} setPage={setPage} />}

        {role === "owner" && page === "payment" && (
          <OwnerPayments
            payments={ownerData?.current || []}
            title="Current bill"
            emptyTitle="No current payments"
            payNow={payNow}
            setPage={setPage}
          />
        )}

        {role === "owner" && page === "due" && (
          <OwnerPayments
            payments={ownerData?.due || []}
            title="Pending due"
            emptyTitle="No pending dues"
            payNow={payNow}
            setPage={setPage}
          />
        )}

        {role === "owner" && page === "history" && (
          <OwnerHistory paid={ownerData?.paid || []} setPage={setPage} />
        )}

        {role === "owner" && page === "profile" && (
          <OwnerProfile data={ownerData} profileDue={profileDue} setPage={setPage} logout={logout} />
        )}

        {role === "owner" && page === "editProfile" && (
          <EditProfile
            phone={editPhone}
            setPhone={setEditPhone}
            email={editEmail}
            setEmail={setEditEmail}
            updateProfile={updateProfile}
            setPage={setPage}
          />
        )}

        {role === "owner" && page === "support" && (
          <SupportScreen
            complaint={complaint}
            setComplaint={setComplaint}
            submitComplaint={submitComplaint}
            setPage={setPage}
          />
        )}
      </AppShell>
      <Toast toast={toast} />
    </>
  );
}
