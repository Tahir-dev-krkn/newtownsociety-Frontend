"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
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

const ADMIN_TITLES = {
  dashboard: "Society overview",
  members: "Resident directory",
  addMember: "Add resident",
  editMember: "Edit resident",
  addDue: "Add maintenance charge",
  pending: "Overdue balances",
  history: "Payment records",
  excel: "Reports",
  complaints: "Service requests",
};

const OWNER_TITLES = {
  dashboard: "Account overview",
  payment: "Current dues",
  due: "Outstanding dues",
  history: "Receipts",
  profile: "Account",
  editProfile: "Edit account",
  support: "Support request",
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

function paymentLabel(payment) {
  const description = String(payment?.description || "").trim();
  const period = `${payment?.month || "Charge"} ${payment?.year || ""}`.trim();

  return description || period;
}

function paymentMethodLabel(payment) {
  if (payment?.status !== "paid") return "";
  if (payment?.paymentMethod === "cash") return "Cash";
  if (payment?.paymentMethod === "online") return "Online";

  return "Collected";
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
        <Image alt="" aria-hidden="true" src="/logo.png" width={48} height={48} priority />
      </div>
      <div>
        <p className="brand-name">New Town Society</p>
        <p className="brand-subtitle">Maintenance portal</p>
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
        <p className="muted">Preparing your account...</p>
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
          <h1>Dues, payments, and support.</h1>
          <p>
            Pay maintenance, review receipts, manage resident records, and handle
            service requests through one connected portal.
          </p>
        </div>

        <div className="landing-actions">
          <button className="primary-button" onClick={onStart} type="button">
            <ShieldCheck aria-hidden="true" size={18} strokeWidth={2.3} />
            Sign in
          </button>
          <a className="secondary-link-button" href="/privacy-policy">
            Privacy
          </a>
        </div>
      </section>

      <section className="landing-card-grid" aria-label="App highlights">
        <article className="landing-card">
          <WalletCards aria-hidden="true" size={28} strokeWidth={2.3} />
          <h2>Resident payments</h2>
          <p>Settle maintenance dues, view balances, and keep receipts in one place.</p>
        </article>
        <article className="landing-card">
          <Gauge aria-hidden="true" size={28} strokeWidth={2.3} />
          <h2>Society operations</h2>
          <p>Track collections, residents, overdue balances, requests, and reports.</p>
        </article>
        <article className="landing-card">
          <Smartphone aria-hidden="true" size={28} strokeWidth={2.3} />
          <h2>Mobile ready</h2>
          <p>Access the portal from web or Android with a focused app experience.</p>
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
    login: "Sign in",
    forgot: "Reset password",
    resetSent: "Check your email",
    resetLink: "Set new password",
    emailVerify: "Verify email",
  }[authMode] || "Sign in";

  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <Brand />
        <div className="auth-copy">
          <p className="eyebrow">Resident services portal</p>
          <h1>Maintenance payments, records, and support in one secure place.</h1>
          <p>
            Built for residents and society teams to manage dues, requests, and
            records with confidence.
          </p>
        </div>
        <div className="auth-visual" aria-hidden="true">
          <div className="visual-stat">
            <span>Collection</span>
            <strong>Tracked</strong>
          </div>
          <div className="visual-stat">
            <span>Receipts</span>
            <strong>Ready</strong>
          </div>
          <div className="visual-stat">
            <span>Reports</span>
            <strong>Export</strong>
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
          Welcome
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
              Sign in
            </button>
            <button
              className="text-button"
              onClick={() => setAuthMode("forgot")}
              type="button"
            >
              Reset password
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
              Verify and sign in
            </button>

            <button className="secondary-button" disabled={busy} onClick={login} type="button">
              <Send aria-hidden="true" size={18} strokeWidth={2.3} />
              Resend OTP
            </button>
          </>
        )}

        {authMode === "forgot" && (
          <>
            <TextField label="Registered email" value={resetEmail} onChange={setResetEmail} />
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
              Back to sign in
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
              Back to sign in
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
              Back to sign in
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
          Manage residents
        </button>
        <button className="secondary-button" onClick={openComplaints} type="button">
          <Bell aria-hidden="true" size={18} strokeWidth={2.3} />
          Service requests
        </button>
      </div>

      <section className="stats-grid">
        <StatCard label="Residents" value={owners.length} tone="blue" action={() => setPage("members")} />
        <StatCard label="Collected" value={money(totalPaid)} tone="green" />
        <StatCard label="Outstanding" value={money(totalPending)} tone="red" action={() => setPage("pending")} />
        <StatCard label="Overdue flats" value={pendingMembers} tone="amber" action={() => setPage("pending")} />
      </section>

      <section className="panel chart-panel">
        <div className="panel-heading">
          <h2>Collection summary</h2>
          {refreshing && <span className="status-pill">Refreshing</span>}
        </div>
        <Bar
          data={{
            labels: MONTHS.map((month) => month.slice(0, 3)),
            datasets: [
              { label: "Paid", data: monthlyPaid, backgroundColor: "#16a34a", borderRadius: 8 },
              { label: "Outstanding", data: monthlyPending, backgroundColor: "#dc2626", borderRadius: 8 },
            ],
          }}
          options={chartOptions}
        />
      </section>
    </>
  );
}

function DueActionButtons({ payment, recordCashPayment, deleteDue }) {
  return (
    <div className="due-actions">
      <button className="secondary-button slim" onClick={() => recordCashPayment(payment)} type="button">
        <CheckCircle2 aria-hidden="true" size={16} strokeWidth={2.3} />
        Cash
      </button>
      <button className="danger-button slim" onClick={() => deleteDue(payment)} type="button">
        <Trash2 aria-hidden="true" size={16} strokeWidth={2.3} />
        Delete
      </button>
    </div>
  );
}

function PendingDueList({ payments = [], recordCashPayment, deleteDue }) {
  const dues = payments.filter((payment) => payment.status !== "paid");

  if (dues.length === 0) return null;

  return (
    <div className="due-list">
      {dues.map((payment, index) => (
        <div className="due-item" key={payment._id || index}>
          <div>
            <strong>{paymentLabel(payment)}</strong>
            <span>{money(payment.amount)}</span>
          </div>
          <DueActionButtons payment={payment} recordCashPayment={recordCashPayment} deleteDue={deleteDue} />
        </div>
      ))}
    </div>
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
  recordCashPayment,
  deleteDue,
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
          <option value="pending">Outstanding</option>
          <option value="paid">Settled</option>
        </SelectField>
        <SelectField label="Sort" value={sortType} onChange={setSortType}>
          <option value="none">Default</option>
          <option value="high">High to low</option>
          <option value="low">Low to high</option>
        </SelectField>
        <button className="primary-button" onClick={() => setPage("addMember")} type="button">
          <Plus aria-hidden="true" size={18} strokeWidth={2.3} />
          New resident
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
                {member.pendingAmount > 0 ? `${money(member.pendingAmount)} outstanding` : "Settled"}
              </span>
              <span>{Number(member.area || 0)} sq ft</span>
            </div>

            <PendingDueList
              payments={member.payments}
              recordCashPayment={recordCashPayment}
              deleteDue={deleteDue}
            />

            <div className="button-row">
              <button className="secondary-button" onClick={() => openDue(member)} type="button">
                <ReceiptText aria-hidden="true" size={17} strokeWidth={2.3} />
                Add charge
              </button>
              <button className="secondary-button" onClick={() => openEdit(member)} type="button">
                <Edit3 aria-hidden="true" size={17} strokeWidth={2.3} />
                Edit
              </button>
              <button className="secondary-button" onClick={() => sendReminder(member._id)} type="button">
                <Send aria-hidden="true" size={17} strokeWidth={2.3} />
                Reminder
              </button>
              <button className="danger-button" onClick={() => deleteMember(member._id)} type="button">
                <Trash2 aria-hidden="true" size={17} strokeWidth={2.3} />
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>

      {filteredMembers.length === 0 && <EmptyState title="No residents found" />}
    </>
  );
}

function MemberForm({ title, values, setValues, onSubmit, onBack, submitLabel }) {
  const update = (field, value) => setValues((current) => ({ ...current, [field]: value }));

  return (
    <section className="form-panel">
      <BackButton onClick={onBack} />
      <h2>{title}</h2>
      <TextField label="Resident name" value={values.name || ""} onChange={(value) => update("name", value)} />
      <TextField
        label="Flat number"
        value={values.flatNumber || ""}
        onChange={(value) => update("flatNumber", value)}
      />
      <TextField label="Area (sq ft)" value={values.area || ""} onChange={(value) => update("area", value)} />
      <TextField label="Phone number" value={values.phone || ""} onChange={(value) => update("phone", value)} />
      <TextField label="Email address" value={values.email || ""} onChange={(value) => update("email", value)} />
      <button className="primary-button" onClick={onSubmit} type="button">
        <CheckCircle2 aria-hidden="true" size={18} strokeWidth={2.3} />
        {submitLabel}
      </button>
    </section>
  );
}

function AddDueScreen({
  member,
  chargeMode,
  setChargeMode,
  fromMonth,
  setFromMonth,
  toMonth,
  setToMonth,
  year,
  setYear,
  customAmount,
  setCustomAmount,
  customRemark,
  setCustomRemark,
  onSubmit,
  onBack,
}) {
  const start = monthIndex(fromMonth);
  const end = monthIndex(toMonth);
  const months = start >= 0 && end >= start ? end - start + 1 : 0;
  const monthly = Number(member?.monthlyMaintenance || member?.area * 1.5 || 0);
  const monthlyAmount = months * monthly;
  const directAmount = Number(customAmount || 0);
  const isCustom = chargeMode === "custom";
  const amount = isCustom ? directAmount : monthlyAmount;
  const canSubmit = isCustom
    ? directAmount > 0 && Boolean(customRemark.trim())
    : monthlyAmount > 0 && Boolean(year);

  return (
    <section className="form-panel">
      <BackButton onClick={onBack} />
      <p className="card-kicker">Flat {member?.flatNumber}</p>
      <h2>Add maintenance charge</h2>

      <div className="charge-mode-toggle" role="group" aria-label="Charge type">
        <button
          className={chargeMode === "monthly" ? "active" : ""}
          onClick={() => setChargeMode("monthly")}
          type="button"
        >
          <ReceiptText aria-hidden="true" size={17} strokeWidth={2.3} />
          Monthly range
        </button>
        <button
          className={chargeMode === "custom" ? "active" : ""}
          onClick={() => setChargeMode("custom")}
          type="button"
        >
          <WalletCards aria-hidden="true" size={17} strokeWidth={2.3} />
          Custom amount
        </button>
      </div>

      {isCustom ? (
        <>
          <TextField
            label="Amount"
            placeholder="Enter charge amount"
            type="number"
            value={customAmount}
            onChange={setCustomAmount}
          />
          <TextareaField
            label="Remarks"
            placeholder="Example: Lift repair, parking charge, water tanker"
            value={customRemark}
            onChange={setCustomRemark}
          />
        </>
      ) : (
        <>
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
        </>
      )}

      <div className="calculation-card">
        <span>{isCustom ? "Custom charge" : `${months} billing month(s)`}</span>
        <strong>{money(amount)}</strong>
      </div>

      <button className="primary-button" disabled={!canSubmit} onClick={onSubmit} type="button">
        <Plus aria-hidden="true" size={18} strokeWidth={2.3} />
        Add charge
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
          <h2>Payment status</h2>
          <button className="primary-button slim" onClick={() => exportHistory(filtered)} type="button">
            <Download aria-hidden="true" size={17} strokeWidth={2.3} />
            Download
          </button>
        </div>
        <Bar
          data={{
            labels: ["Collected", "Outstanding"],
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
          <option value="paid">Collected</option>
          <option value="pending">Outstanding</option>
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
                {paymentLabel(payment)}
              </span>
            </div>
            <div>
              <strong>{money(payment.amount)}</strong>
              <span className={payment.status === "paid" ? "status-pill success" : "status-pill danger"}>
                {payment.status === "paid"
                  ? `Collected${paymentMethodLabel(payment) ? ` · ${paymentMethodLabel(payment)}` : ""}`
                  : "Outstanding"}
              </span>
            </div>
          </article>
        ))}
      </section>

      {filtered.length === 0 && <EmptyState title="No payment records found" />}
    </>
  );
}

function ExportScreen({ excelFlat, setExcelFlat, dates, setDates, downloadExcel }) {
  return (
    <section className="form-panel">
      <h2>Download payment report</h2>
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
        Download report
      </button>
    </section>
  );
}

function PendingScreen({ members, recordCashPayment, deleteDue }) {
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
              {paymentLabel(item)}
            </span>
          </div>
          <div>
            <strong>{money(item.amount)}</strong>
            <span className="status-pill danger">Outstanding</span>
            <DueActionButtons payment={item} recordCashPayment={recordCashPayment} deleteDue={deleteDue} />
          </div>
        </article>
      ))}
      {pending.length === 0 && <EmptyState title="No outstanding dues" />}
    </section>
  );
}

function ComplaintsScreen({ complaints, loadComplaints }) {
  return (
    <>
      <div className="quick-actions">
        <button className="secondary-button" onClick={loadComplaints} type="button">
          <Bell aria-hidden="true" size={18} strokeWidth={2.3} />
          Refresh requests
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
        {complaints.length === 0 && <EmptyState title="No service requests" />}
      </section>
    </>
  );
}

function PaymentAmountControl({ payment, maxAmount, payNow }) {
  const [amount, setAmount] = useState("");
  const numericAmount = Number(amount);
  const amountLimit = Number(maxAmount || 0);
  const hasAmount = amount.trim() !== "";
  const isValidAmount = Number.isFinite(numericAmount) && numericAmount > 0 && numericAmount <= amountLimit;

  return (
    <div className="payment-control">
      <label className="field payment-amount-field">
        <span>Payment amount</span>
        <input
          inputMode="numeric"
          max={amountLimit || undefined}
          min="1"
          onChange={(event) => setAmount(event.target.value)}
          placeholder={amountLimit > 0 ? `Maximum ${money(amountLimit)}` : "Amount"}
          step="1"
          type="number"
          value={amount}
        />
      </label>
      <button
        className="primary-button"
        disabled={!isValidAmount}
        onClick={() => payNow(payment, numericAmount)}
        type="button"
      >
        <CreditCard aria-hidden="true" size={18} strokeWidth={2.3} />
        Pay now
      </button>
      {hasAmount && !isValidAmount && (
        <small className="payment-control-note">Amount must be {money(amountLimit)} or less</small>
      )}
    </div>
  );
}

function OwnerDashboard({ data, setPage, payNow }) {
  const payablePayments = [...(data?.current || []), ...(data?.due || [])].filter(
    (payment) => payment.status !== "paid" && Number(payment.amount || 0) > 0,
  );
  const pendingTotal = paymentTotal(payablePayments, "pending");
  const paidTotal = paymentTotal(data?.paid || [], "paid");
  const currentCount = (data?.current || []).filter((payment) => payment.status !== "paid").length;
  const dashboardPayment = payablePayments[0]
    ? {
        ...payablePayments[0],
        amount: pendingTotal,
        description: "Maintenance due payment",
      }
    : null;

  return (
    <>
      <section className="owner-hero">
        <div>
          <p className="eyebrow">Flat {data?.flatNumber || "--"}</p>
          <h2>{data?.name || "Owner"}</h2>
          <p>{pendingTotal > 0 ? `${money(pendingTotal)} outstanding` : "All dues are settled"}</p>
        </div>
        {dashboardPayment ? (
          <PaymentAmountControl maxAmount={pendingTotal} payNow={payNow} payment={dashboardPayment} />
        ) : (
          <button className="primary-button" onClick={() => setPage("payment")} type="button">
            <WalletCards aria-hidden="true" size={18} strokeWidth={2.3} />
            Pay now
          </button>
        )}
      </section>

      <section className="stats-grid">
        <StatCard label="Outstanding" value={money(pendingTotal)} tone="red" action={() => setPage("due")} />
        <StatCard label="Current dues" value={currentCount} tone="blue" action={() => setPage("payment")} />
        <StatCard label="Paid amount" value={money(paidTotal)} tone="green" action={() => setPage("history")} />
        <StatCard label="Account" value="View" tone="amber" action={() => setPage("profile")} />
      </section>

      <section className="panel chart-panel small">
        <div className="panel-heading">
          <h2>Account summary</h2>
        </div>
        <Bar
          data={{
            labels: ["Paid", "Outstanding"],
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
          <h2>Recent receipts</h2>
          <button className="text-button inline" onClick={() => setPage("history")} type="button">
            <History aria-hidden="true" size={16} strokeWidth={2.3} />
            View all
          </button>
        </div>
        {(data?.paid || []).slice(0, 5).map((payment) => (
          <article className="payment-row compact" key={payment._id}>
            <div>
              <strong>
                {paymentLabel(payment)}
              </strong>
              <span>Receipt recorded</span>
            </div>
            <strong>{money(payment.amount)}</strong>
          </article>
        ))}
        {(data?.paid || []).length === 0 && <EmptyState title="No receipts yet" />}
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
              {paymentLabel(payment)}
            </p>
            <h2>{money(payment.amount)}</h2>
            <p>{title}</p>
            <PaymentAmountControl maxAmount={Number(payment.amount || 0)} payNow={payNow} payment={payment} />
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
        {(paid || []).map((payment) => {
          const methodLabel = paymentMethodLabel(payment);

          return (
            <article className="payment-row" key={payment._id}>
              <div>
                <strong>
                  {paymentLabel(payment)}
                </strong>
                <span>Maintenance receipt</span>
              </div>
              <div>
                <strong>{money(payment.amount)}</strong>
                <span className="status-pill success">{methodLabel ? `Paid · ${methodLabel}` : "Paid"}</span>
              </div>
            </article>
          );
        })}
      </section>
      {(paid || []).length === 0 && <EmptyState title="No receipts available" />}
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
            Edit account
          </button>
          <button className="secondary-button" onClick={() => setPage("support")} type="button">
            <MessageCircle aria-hidden="true" size={18} strokeWidth={2.3} />
            Support
          </button>
        </div>
      </div>

      <section className="stats-grid">
        <StatCard label="Balance status" value={profileDue > 0 ? "Outstanding" : "Settled"} tone={profileDue > 0 ? "red" : "green"} />
        <StatCard label="Outstanding" value={money(profileDue)} tone="blue" />
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
      <h2>Edit account</h2>
      <TextField label="Phone number" value={phone} onChange={setPhone} />
      <TextField label="Email address" value={email} onChange={setEmail} />
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
      <h2>Support request</h2>
      <TextareaField
        label="Request details"
        value={complaint}
        onChange={setComplaint}
        placeholder="Describe what you need help with"
      />
      <button className="primary-button" onClick={submitComplaint} type="button">
        <Send aria-hidden="true" size={18} strokeWidth={2.3} />
        Submit request
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
  const [runtimeRazorpayKey, setRuntimeRazorpayKey] = useState("");

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
  const [chargeMode, setChargeMode] = useState("monthly");
  const [fromMonth, setFromMonth] = useState("");
  const [toMonth, setToMonth] = useState("");
  const [year, setYear] = useState("");
  const [customChargeAmount, setCustomChargeAmount] = useState("");
  const [customChargeRemark, setCustomChargeRemark] = useState("");

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
          notify(response.message || "Verify your email before signing in");
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
      notify("Signed in successfully");
    } catch (error) {
      notify(error.message || "Sign in failed", "error");
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

  const getRazorpayKey = async () => {
    if (runtimeRazorpayKey) return runtimeRazorpayKey;

    try {
      const config = await apiRequest("/payment-config", { token });
      const backendKey = config?.razorpayKeyId || "";

      if (backendKey) {
        setRuntimeRazorpayKey(backendKey);
        return backendKey;
      }
    } catch (error) {
      console.warn("Could not load backend payment config", error);
    }

    return RAZORPAY_KEY;
  };

  const payNow = async (payment, customAmount) => {
    const dueAmount = Number(payment?.amount || 0);
    const amountToPay = Number(customAmount ?? dueAmount);

    if (!payment?._id || !Number.isFinite(amountToPay) || amountToPay <= 0) {
      notify("Enter a valid payment amount", "error");
      return;
    }

    if (amountToPay > dueAmount) {
      notify(`Amount cannot exceed ${money(dueAmount)}`, "error");
      return;
    }

    if (!window.Razorpay) {
      notify("Payment system is still loading", "error");
      return;
    }

    try {
      const checkoutKey = await getRazorpayKey();

      if (!checkoutKey) {
        notify("Payment key is not configured", "error");
        return;
      }

      const order = await apiRequest("/create-order", {
        method: "POST",
        token,
        body: { amount: amountToPay, paymentId: payment._id },
      });

      const checkout = new window.Razorpay({
        key: checkoutKey,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "New Town Society",
        description: payment.description || `${payment.month} ${payment.year} maintenance`,
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
              paidAmount: amountToPay,
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
      notify("Please fill all resident details", "error");
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
      notify(message || "Resident added");
      setMemberDraft({ name: "", flatNumber: "", area: "", phone: "", email: "" });
      await loadData();
      setPage("members");
    } catch (error) {
      notify(error.message || "Resident could not be added", "error");
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
      notify("Resident updated");
      await loadData();
      setPage("members");
    } catch (error) {
      notify(error.message || "Resident update failed", "error");
    }
  };

  const deleteMember = async (memberId) => {
    if (!window.confirm("Delete this resident?")) return;

    try {
      await apiRequest(`/member/${memberId}`, {
        method: "DELETE",
        token,
        responseType: "text",
      });
      notify("Resident deleted");
      await loadData();
    } catch (error) {
      notify(error.message || "Delete failed", "error");
    }
  };

  const recordCashPayment = async (payment) => {
    if (!payment?._id) {
      notify("Due not found", "error");
      return;
    }

    const dueAmount = Number(payment.amount || 0);
    const enteredAmount = window.prompt(
      `Cash received for ${paymentLabel(payment)}. Maximum ${money(dueAmount)}`,
      String(dueAmount)
    );

    if (enteredAmount === null) return;

    const cashAmount = Number(String(enteredAmount).replace(/,/g, "").trim());

    if (!Number.isFinite(cashAmount) || cashAmount <= 0) {
      notify("Enter a valid cash amount", "error");
      return;
    }

    if (cashAmount > dueAmount) {
      notify("Cash amount cannot exceed the due amount", "error");
      return;
    }

    if (!window.confirm(`Record cash received: ${money(cashAmount)} for ${paymentLabel(payment)}?`)) return;

    try {
      const message = await apiRequest("/record-cash-payment", {
        method: "POST",
        token,
        responseType: "text",
        body: { paymentId: payment._id, amount: cashAmount },
      });
      notify(message || "Cash payment recorded");
      await loadData();
    } catch (error) {
      notify(error.message || "Cash payment could not be recorded", "error");
    }
  };

  const deleteDue = async (payment) => {
    if (!payment?._id) {
      notify("Due not found", "error");
      return;
    }

    if (!window.confirm(`Delete ${paymentLabel(payment)} due for ${money(payment.amount)}?`)) return;

    try {
      const message = await apiRequest(`/due/${payment._id}`, {
        method: "DELETE",
        token,
        responseType: "text",
      });
      notify(message || "Due deleted");
      await loadData();
    } catch (error) {
      notify(error.message || "Due could not be deleted", "error");
    }
  };

  const openDue = (member) => {
    setDueTarget(member);
    setChargeMode("monthly");
    setFromMonth("");
    setToMonth("");
    setYear("");
    setCustomChargeAmount("");
    setCustomChargeRemark("");
    setPage("addDue");
  };

  const addDue = async () => {
    const isCustomCharge = chargeMode === "custom";

    if (isCustomCharge) {
      const amount = Number(customChargeAmount || 0);
      const description = customChargeRemark.trim();

      if (!dueTarget?._id || !Number.isFinite(amount) || amount <= 0 || !description) {
        notify("Enter a valid amount and remarks", "error");
        return;
      }

      try {
        await apiRequest("/add-due", {
          method: "POST",
          token,
          responseType: "text",
          body: {
            memberId: dueTarget._id,
            amount,
            description,
            chargeType: "custom",
          },
        });
        notify("Custom charge added");
        setCustomChargeAmount("");
        setCustomChargeRemark("");
        await loadData();
        setPage("members");
      } catch (error) {
        notify(error.message || "Custom charge could not be added", "error");
      }

      return;
    }

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
      notify("Maintenance charge added");
      await loadData();
      setPage("members");
    } catch (error) {
      notify(error.message || "Maintenance charge could not be added", "error");
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
      notify("Account updated");
      await loadData();
      setPage("profile");
    } catch (error) {
      notify(error.message || "Account update failed", "error");
    }
  };

  const submitComplaint = async () => {
    if (!complaint.trim()) {
      notify("Write your request details", "error");
      return;
    }

    try {
      const message = await apiRequest("/add-complaint", {
        method: "POST",
        token,
        responseType: "text",
        body: { message: complaint.trim() },
      });
      notify(message || "Request submitted");
      setComplaint("");
    } catch (error) {
      notify(error.message || "Request could not be submitted", "error");
    }
  };

  const openComplaints = async () => {
    setPage("complaints");
    try {
      await loadComplaints();
    } catch (error) {
      notify(error.message || "Could not load service requests", "error");
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
  const title = role === "admin"
    ? ADMIN_TITLES[page] || "Management"
    : OWNER_TITLES[page] || "Resident account";

  return (
    <>
      <AppShell
        title={title}
        subtitle={
          role === "admin"
            ? "Collections, residents, reports, and service requests"
            : "Maintenance, payments, receipts, and account support"
        }
        page={page}
        setPage={setPage}
        navItems={navItems}
        onLogout={logout}
        headerActions={
          role === "admin" ? (
            <button className="secondary-button slim" onClick={openComplaints} type="button">
              Requests
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
            recordCashPayment={recordCashPayment}
            deleteDue={deleteDue}
          />
        )}

        {role === "admin" && page === "addMember" && (
          <MemberForm
            title="Add resident"
            values={memberDraft}
            setValues={setMemberDraft}
            onSubmit={addMember}
            onBack={() => setPage("members")}
            submitLabel="Create resident"
          />
        )}

        {role === "admin" && page === "editMember" && (
          <MemberForm
            title="Edit resident"
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
            chargeMode={chargeMode}
            setChargeMode={setChargeMode}
            fromMonth={fromMonth}
            setFromMonth={setFromMonth}
            toMonth={toMonth}
            setToMonth={setToMonth}
            year={year}
            setYear={setYear}
            customAmount={customChargeAmount}
            setCustomAmount={setCustomChargeAmount}
            customRemark={customChargeRemark}
            setCustomRemark={setCustomChargeRemark}
            onSubmit={addDue}
            onBack={() => setPage("members")}
          />
        )}

        {role === "admin" && page === "pending" && (
          <PendingScreen members={adminMembers} recordCashPayment={recordCashPayment} deleteDue={deleteDue} />
        )}

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

        {role === "owner" && page === "dashboard" && (
          <OwnerDashboard data={ownerData} payNow={payNow} setPage={setPage} />
        )}

        {role === "owner" && page === "payment" && (
          <OwnerPayments
            payments={ownerData?.current || []}
            title="Current maintenance due"
            emptyTitle="No current dues"
            payNow={payNow}
            setPage={setPage}
          />
        )}

        {role === "owner" && page === "due" && (
          <OwnerPayments
            payments={ownerData?.due || []}
            title="Outstanding balance"
            emptyTitle="No outstanding dues"
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
