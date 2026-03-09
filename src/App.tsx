import { useState, useEffect, useRef } from "react";

const TEMPLATES = {
  beauty: { name: "Бьюти-мастер", services: ["Маникюр", "Педикюр", "Брови", "Ресницы", "Стрижка"], color: "#e8a4c8" },
  tutor: { name: "Репетитор", services: ["Математика", "Английский", "Физика", "ЕГЭ", "ОГЭ"], color: "#a4c8e8" },
  photo: { name: "Фотограф", services: ["Портретная", "Семейная", "Love Story", "Репортаж", "Коммерческая"], color: "#c8e8a4" },
  repair: { name: "Ремонт", services: ["Сантехника", "Электрика", "Отделка", "Плитка", "Сборка мебели"], color: "#e8c8a4" },
  legal: { name: "Юрист", services: ["Консультация", "Договор", "Иск", "Претензия", "Регистрация ИП"], color: "#c8a4e8" },
  other: { name: "Другое", services: ["Услуга 1", "Услуга 2", "Услуга 3"], color: "#a4e8c8" },
};

const STATUS_CONFIG = {
  new: { label: "Новый", color: "#6366f1", bg: "#eef2ff" },
  active: { label: "Активный", color: "#059669", bg: "#ecfdf5" },
  done: { label: "Завершён", color: "#d97706", bg: "#fffbeb" },
  cancelled: { label: "Отменён", color: "#dc2626", bg: "#fef2f2" },
};

const PAY_STATUS = {
  pending: { label: "Ожидает", color: "#d97706" },
  partial: { label: "Частично", color: "#6366f1" },
  paid: { label: "Оплачено", color: "#059669" },
};

const initialClients = [
  { id: 1, name: "Анна Смирнова", phone: "+7 916 123-45-67", email: "anna@mail.ru", status: "active", notes: "Постоянный клиент, предпочитает утренние слоты", created: "2025-01-15", totalRevenue: 12500 },
  { id: 2, name: "Михаил Козлов", phone: "+7 925 987-65-43", email: "misha@gmail.com", status: "new", notes: "Пришёл по рекомендации", created: "2026-02-28", totalRevenue: 0 },
  { id: 3, name: "Елена Петрова", phone: "+7 903 456-78-90", email: "", status: "active", notes: "Аллергия на шеллак", created: "2025-11-20", totalRevenue: 34200 },
];

const initialOrders = [
  { id: 1, clientId: 1, service: "Маникюр", date: "2026-03-12", time: "10:00", price: 2500, payStatus: "paid", status: "active", notes: "" },
  { id: 2, clientId: 3, service: "Педикюр", date: "2026-03-10", time: "14:00", price: 3000, payStatus: "paid", status: "done", notes: "" },
  { id: 3, clientId: 2, service: "Брови", date: "2026-03-15", time: "16:00", price: 1800, payStatus: "pending", status: "new", notes: "Первое посещение" },
  { id: 4, clientId: 1, service: "Ресницы", date: "2026-03-18", time: "11:00", price: 3500, payStatus: "pending", status: "new", notes: "" },
];

const initialExpenses = [
  { id: 1, name: "Материалы для маникюра", amount: 4500, date: "2026-03-01", category: "Материалы" },
  { id: 2, name: "Аренда кресла", amount: 8000, date: "2026-03-01", category: "Аренда" },
  { id: 3, name: "Реклама ВКонтакте", amount: 2000, date: "2026-03-05", category: "Маркетинг" },
];

function Avatar({ name, size = 40, color = "#6366f1" }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 700, fontSize: size * 0.35, flexShrink: 0,
      fontFamily: "'Unbounded', sans-serif"
    }}>{initials}</div>
  );
}

function Badge({ label, color, bg }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      color, background: bg, whiteSpace: "nowrap"
    }}>{label}</span>
  );
}

function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "#fff", borderRadius: 16, padding: 20,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      border: "1px solid #f1f5f9", cursor: onClick ? "pointer" : "default",
      transition: "box-shadow 0.2s, transform 0.2s",
      ...style
    }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.boxShadow = "0 4px 24px rgba(99,102,241,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; } }}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; } }}
    >{children}</div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
      backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 1000, padding: 16
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: 28, width: "100%",
        maxWidth: 520, maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.15)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a", fontFamily: "'Unbounded', sans-serif" }}>{title}</h3>
          <button onClick={onClose} style={{
            border: "none", background: "#f1f5f9", borderRadius: 8, padding: "6px 10px",
            cursor: "pointer", fontSize: 16, color: "#64748b"
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>}
      <input {...props} style={{
        width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
        borderRadius: 10, fontSize: 14, color: "#0f172a", outline: "none",
        background: "#f8fafc", transition: "border-color 0.2s", boxSizing: "border-box",
        fontFamily: "inherit", ...props.style
      }}
        onFocus={e => e.target.style.borderColor = "#6366f1"}
        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
      />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>}
      <select {...props} style={{
        width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
        borderRadius: 10, fontSize: 14, color: "#0f172a", outline: "none",
        background: "#f8fafc", cursor: "pointer", fontFamily: "inherit", boxSizing: "border-box"
      }}>{children}</select>
    </div>
  );
}

function Btn({ children, variant = "primary", onClick, style = {}, disabled }) {
  const base = {
    padding: "10px 20px", borderRadius: 10, border: "none", cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600, fontSize: 14, transition: "all 0.2s", fontFamily: "inherit",
    opacity: disabled ? 0.6 : 1, ...style
  };
  const variants = {
    primary: { background: "#6366f1", color: "#fff" },
    secondary: { background: "#f1f5f9", color: "#475569" },
    danger: { background: "#fee2e2", color: "#dc2626" },
    success: { background: "#dcfce7", color: "#166534" },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>{children}</button>;
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ clients, orders, expenses, template, onNavigate }) {
  const today = new Date().toISOString().split("T")[0];
  const thisMonth = today.slice(0, 7);

  const monthRevenue = orders
    .filter(o => o.date.startsWith(thisMonth) && o.payStatus === "paid")
    .reduce((s, o) => s + o.price, 0);

  const monthExpenses = expenses
    .filter(e => e.date.startsWith(thisMonth))
    .reduce((s, e) => s + e.amount, 0);

  const todayOrders = orders.filter(o => o.date === today);
  const pendingPayments = orders.filter(o => o.payStatus === "pending" || o.payStatus === "partial");
  const activeClients = clients.filter(c => c.status === "active").length;

  const upcomingOrders = orders
    .filter(o => o.date >= today && o.status !== "cancelled")
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 5);

  const stats = [
    { label: "Выручка за месяц", value: `${monthRevenue.toLocaleString("ru")} ₽`, icon: "💰", color: "#059669", bg: "#ecfdf5", trend: "+12%" },
    { label: "Расходы за месяц", value: `${monthExpenses.toLocaleString("ru")} ₽`, icon: "📉", color: "#dc2626", bg: "#fef2f2", trend: "-3%" },
    { label: "Прибыль", value: `${(monthRevenue - monthExpenses).toLocaleString("ru")} ₽`, icon: "📈", color: "#6366f1", bg: "#eef2ff", trend: "+18%" },
    { label: "Активных клиентов", value: activeClients, icon: "👥", color: "#d97706", bg: "#fffbeb", trend: `+${clients.filter(c => c.created.startsWith(thisMonth)).length} новых` },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a", fontFamily: "'Unbounded', sans-serif" }}>
          Дашборд
        </h2>
        <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>
          {new Date().toLocaleDateString("ru-RU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        {stats.map((s, i) => (
          <Card key={i} style={{ background: s.bg, border: `1px solid ${s.color}22` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: s.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
                <p style={{ margin: "8px 0 4px", fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "'Unbounded', sans-serif", lineHeight: 1 }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: 12, color: s.color }}>{s.trend}</p>
              </div>
              <span style={{ fontSize: 28 }}>{s.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
            <span>📅</span> Предстоящие записи
          </h3>
          {upcomingOrders.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "20px 0" }}>Нет предстоящих записей</p>
          ) : upcomingOrders.map(o => {
            const client = clients.find(c => c.id === o.clientId);
            return (
              <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ background: "#eef2ff", borderRadius: 8, padding: "6px 10px", textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: "#6366f1", fontWeight: 700 }}>{o.date.slice(8)}.{o.date.slice(5, 7)}</div>
                  <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 600 }}>{o.time}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{client?.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>{o.service}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{o.price.toLocaleString("ru")} ₽</p>
                  <Badge {...PAY_STATUS[o.payStatus]} />
                </div>
              </div>
            );
          })}
          {upcomingOrders.length > 0 && (
            <button onClick={() => onNavigate("orders")} style={{ marginTop: 12, width: "100%", padding: "8px", border: "1.5px dashed #c7d2fe", borderRadius: 8, background: "none", color: "#6366f1", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Все записи →
            </button>
          )}
        </Card>

        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
            <span>⚠️</span> Ожидают оплаты
          </h3>
          {pendingPayments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <p style={{ color: "#059669", fontSize: 13, fontWeight: 600 }}>Все оплачено!</p>
            </div>
          ) : pendingPayments.slice(0, 5).map(o => {
            const client = clients.find(c => c.id === o.clientId);
            return (
              <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                <Avatar name={client?.name || "?"} size={32} color="#f59e0b" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{client?.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>{o.service} · {o.date}</p>
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#d97706" }}>{o.price.toLocaleString("ru")} ₽</span>
              </div>
            );
          })}
          {pendingPayments.length > 5 && (
            <p style={{ margin: "12px 0 0", color: "#64748b", fontSize: 13, textAlign: "center" }}>и ещё {pendingPayments.length - 5}...</p>
          )}
        </Card>
      </div>

      <Card style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", border: "none" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600 }}>✨ PRO-версия</p>
            <h3 style={{ margin: "4px 0 6px", color: "#fff", fontSize: 18, fontFamily: "'Unbounded', sans-serif" }}>Зарабатывай больше без хаоса</h3>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Интеграция с Telegram, автоматические напоминания, договоры и акты одним кликом</p>
          </div>
          <button style={{ background: "#fff", color: "#6366f1", border: "none", borderRadius: 12, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
            Попробовать PRO →
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── CLIENTS ─────────────────────────────────────────────────────────────────
function Clients({ clients, setClients, orders, template }) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", status: "new", notes: "" });

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const openAdd = () => { setForm({ name: "", phone: "", email: "", status: "new", notes: "" }); setEditClient(null); setShowModal(true); };
  const openEdit = (c) => { setForm({ ...c }); setEditClient(c.id); setShowModal(true); };

  const save = () => {
    if (!form.name.trim()) return;
    if (editClient) {
      setClients(cs => cs.map(c => c.id === editClient ? { ...c, ...form } : c));
    } else {
      setClients(cs => [...cs, { ...form, id: Date.now(), created: new Date().toISOString().split("T")[0], totalRevenue: 0 }]);
    }
    setShowModal(false);
  };

  const del = (id) => {
    if (confirm("Удалить клиента?")) setClients(cs => cs.filter(c => c.id !== id));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a", fontFamily: "'Unbounded', sans-serif" }}>Клиенты</h2>
        <Btn onClick={openAdd}>+ Добавить клиента</Btn>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="🔍 Поиск по имени или телефону..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "12px 16px", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 14, outline: "none", background: "#f8fafc", boxSizing: "border-box", fontFamily: "inherit" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {filtered.map(c => {
          const clientOrders = orders.filter(o => o.clientId === c.id);
          const revenue = clientOrders.filter(o => o.payStatus === "paid").reduce((s, o) => s + o.price, 0);
          const cfg = STATUS_CONFIG[c.status];
          return (
            <Card key={c.id} onClick={() => openEdit(c)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Avatar name={c.name} color={template.color} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{c.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>{c.phone}</p>
                  </div>
                </div>
                <Badge {...cfg} />
              </div>
              {c.notes && <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b", background: "#f8fafc", borderRadius: 8, padding: "8px 12px" }}>{c.notes}</p>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>ЗАКАЗЫ</p>
                    <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{clientOrders.length}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>ВЫРУЧКА</p>
                    <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 700, color: "#059669" }}>{revenue.toLocaleString("ru")} ₽</p>
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); del(c.id); }} style={{ background: "#fee2e2", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#dc2626", fontSize: 12 }}>
                  Удалить
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <p style={{ color: "#64748b", fontSize: 16 }}>{search ? "Ничего не найдено" : "Добавьте первого клиента"}</p>
        </div>
      )}

      {showModal && (
        <Modal title={editClient ? "Редактировать клиента" : "Новый клиент"} onClose={() => setShowModal(false)}>
          <Input label="Имя *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Анна Смирнова" />
          <Input label="Телефон" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+7 900 000-00-00" />
          <Input label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="client@email.ru" />
          <Select label="Статус" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Заметки</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", background: "#f8fafc", minHeight: 80, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
              placeholder="Предпочтения, особенности..." />
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Отмена</Btn>
            <Btn onClick={save} disabled={!form.name.trim()}>Сохранить</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────
function Orders({ orders, setOrders, clients, template }) {
  const [showModal, setShowModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ clientId: "", service: "", date: "", time: "", price: "", payStatus: "pending", status: "new", notes: "" });

  const today = new Date().toISOString().split("T")[0];

  const filtered = orders
    .filter(o => filter === "all" ? true : filter === "today" ? o.date === today : o.payStatus === filter)
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));

  const openAdd = () => {
    setForm({ clientId: clients[0]?.id || "", service: template.services[0], date: today, time: "10:00", price: "", payStatus: "pending", status: "new", notes: "" });
    setEditOrder(null);
    setShowModal(true);
  };

  const openEdit = (o) => { setForm({ ...o }); setEditOrder(o.id); setShowModal(true); };

  const save = () => {
    if (!form.clientId || !form.service || !form.date) return;
    const order = { ...form, price: Number(form.price) || 0 };
    if (editOrder) {
      setOrders(os => os.map(o => o.id === editOrder ? { ...o, ...order } : o));
    } else {
      setOrders(os => [...os, { ...order, id: Date.now() }]);
    }
    setShowModal(false);
  };

  const del = (id) => { if (confirm("Удалить заказ?")) setOrders(os => os.filter(o => o.id !== id)); };

  const markPaid = (id) => setOrders(os => os.map(o => o.id === id ? { ...o, payStatus: "paid" } : o));

  const tabs = [
    { key: "all", label: "Все" },
    { key: "today", label: "Сегодня" },
    { key: "pending", label: "Не оплачено" },
    { key: "paid", label: "Оплачено" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a", fontFamily: "'Unbounded', sans-serif" }}>Заказы</h2>
        <Btn onClick={openAdd}>+ Новый заказ</Btn>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{
            padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
            background: filter === t.key ? "#6366f1" : "#f1f5f9",
            color: filter === t.key ? "#fff" : "#64748b",
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(o => {
          const client = clients.find(c => c.id === o.clientId);
          const payCfg = PAY_STATUS[o.payStatus];
          const statusCfg = STATUS_CONFIG[o.status];
          return (
            <Card key={o.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ background: "#eef2ff", borderRadius: 10, padding: "8px 14px", textAlign: "center", flexShrink: 0, minWidth: 56 }}>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#6366f1", fontFamily: "'Unbounded', sans-serif", lineHeight: 1 }}>{o.date.slice(8)}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6366f1", fontWeight: 600 }}>{["ЯНВ","ФЕВ","МАР","АПР","МАЙ","ИЮН","ИЮЛ","АВГ","СЕН","ОКТ","НОЯ","ДЕК"][parseInt(o.date.slice(5,7))-1]}</p>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{client?.name || "—"}</p>
                    <Badge {...statusCfg} />
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>{o.service} · {o.time}</p>
                  {o.notes && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>{o.notes}</p>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: "#0f172a" }}>{o.price.toLocaleString("ru")} ₽</p>
                    <Badge label={payCfg.label} color={payCfg.color} bg={payCfg.color + "18"} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {o.payStatus !== "paid" && (
                      <button onClick={() => markPaid(o.id)} style={{ background: "#dcfce7", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", color: "#166534", fontSize: 12, fontWeight: 600 }}>
                        ✓ Оплачено
                      </button>
                    )}
                    <button onClick={() => openEdit(o)} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", color: "#64748b", fontSize: 12 }}>✏️</button>
                    <button onClick={() => del(o.id)} style={{ background: "#fee2e2", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", color: "#dc2626", fontSize: 12 }}>✕</button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <p style={{ color: "#64748b", fontSize: 16 }}>Нет заказов в этой категории</p>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editOrder ? "Редактировать заказ" : "Новый заказ"} onClose={() => setShowModal(false)}>
          <Select label="Клиент *" value={form.clientId} onChange={e => setForm({ ...form, clientId: Number(e.target.value) })}>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select label="Услуга" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
            {template.services.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Дата" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <Input label="Время" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
          </div>
          <Input label="Сумма, ₽" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="2500" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Select label="Статус оплаты" value={form.payStatus} onChange={e => setForm({ ...form, payStatus: e.target.value })}>
              {Object.entries(PAY_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
            <Select label="Статус заказа" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Примечание</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", background: "#f8fafc", minHeight: 60, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
              placeholder="Дополнительная информация..." />
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Отмена</Btn>
            <Btn onClick={save}>Сохранить</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── FINANCE ─────────────────────────────────────────────────────────────────
function Finance({ orders, expenses, setExpenses }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", date: "", category: "Материалы" });
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));

  const categories = ["Материалы", "Аренда", "Маркетинг", "Оборудование", "Налоги", "Прочее"];

  const periodRevenue = orders.filter(o => o.date.startsWith(period) && o.payStatus === "paid").reduce((s, o) => s + o.price, 0);
  const periodExpenses = expenses.filter(e => e.date.startsWith(period)).reduce((s, e) => s + e.amount, 0);
  const profit = periodRevenue - periodExpenses;

  const expByCategory = categories.map(cat => ({
    cat,
    amount: expenses.filter(e => e.date.startsWith(period) && e.category === cat).reduce((s, e) => s + e.amount, 0)
  })).filter(x => x.amount > 0);

  const saveExpense = () => {
    if (!form.name || !form.amount) return;
    setExpenses(es => [...es, { ...form, id: Date.now(), amount: Number(form.amount) }]);
    setShowModal(false);
    setForm({ name: "", amount: "", date: new Date().toISOString().split("T")[0], category: "Материалы" });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a", fontFamily: "'Unbounded', sans-serif" }}>Финансы</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input type="month" value={period} onChange={e => setPeriod(e.target.value)}
            style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
          <Btn onClick={() => { setForm({ name: "", amount: "", date: new Date().toISOString().split("T")[0], category: "Материалы" }); setShowModal(true); }}>
            + Расход
          </Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Выручка", value: periodRevenue, color: "#059669", bg: "#ecfdf5", icon: "💰" },
          { label: "Расходы", value: periodExpenses, color: "#dc2626", bg: "#fef2f2", icon: "📉" },
          { label: "Прибыль", value: profit, color: profit >= 0 ? "#6366f1" : "#dc2626", bg: profit >= 0 ? "#eef2ff" : "#fef2f2", icon: profit >= 0 ? "📈" : "⚠️" },
        ].map((s, i) => (
          <Card key={i} style={{ background: s.bg, border: `1px solid ${s.color}22` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: s.color, fontWeight: 600, textTransform: "uppercase" }}>{s.label}</p>
                <p style={{ margin: "8px 0 0", fontSize: 24, fontWeight: 800, color: "#0f172a", fontFamily: "'Unbounded', sans-serif" }}>{s.value.toLocaleString("ru")} ₽</p>
              </div>
              <span style={{ fontSize: 28 }}>{s.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {expByCategory.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Расходы по категориям</h3>
          {expByCategory.map(({ cat, amount }) => (
            <div key={cat} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{cat}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{amount.toLocaleString("ru")} ₽</span>
              </div>
              <div style={{ background: "#f1f5f9", borderRadius: 4, height: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#6366f1", borderRadius: 4, width: `${Math.min(100, (amount / periodExpenses) * 100)}%`, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
        </Card>
      )}

      <Card>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Расходы за период</h3>
        {expenses.filter(e => e.date.startsWith(period)).length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px 0", fontSize: 14 }}>Нет расходов за выбранный период</p>
        ) : expenses.filter(e => e.date.startsWith(period)).sort((a, b) => b.date.localeCompare(a.date)).map(e => (
          <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{e.name}</p>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>{e.category} · {e.date}</p>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#dc2626" }}>−{e.amount.toLocaleString("ru")} ₽</span>
              <button onClick={() => setExpenses(es => es.filter(x => x.id !== e.id))}
                style={{ background: "#fee2e2", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#dc2626", fontSize: 12 }}>✕</button>
            </div>
          </div>
        ))}
      </Card>

      {showModal && (
        <Modal title="Новый расход" onClose={() => setShowModal(false)}>
          <Input label="Название *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Материалы для работы" />
          <Input label="Сумма, ₽ *" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="1500" />
          <Input label="Дата" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <Select label="Категория" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Отмена</Btn>
            <Btn onClick={saveExpense} disabled={!form.name || !form.amount}>Сохранить</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
function Calendar({ orders, clients }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today.toISOString().split("T")[0]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay + 6) % 7;

  const days = Array.from({ length: 42 }, (_, i) => {
    const day = i - startOffset + 1;
    if (day < 1 || day > daysInMonth) return null;
    return new Date(year, month, day).toISOString().split("T")[0];
  });

  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  const selectedDayOrders = orders
    .filter(o => o.date === selected && o.status !== "cancelled")
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div>
      <h2 style={{ margin: "0 0 24px", fontSize: 24, fontWeight: 700, color: "#0f172a", fontFamily: "'Unbounded', sans-serif" }}>Календарь</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <button onClick={() => setViewDate(new Date(year, month - 1, 1))} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 700, color: "#475569" }}>←</button>
            <h3 style={{ margin: 0, fontFamily: "'Unbounded', sans-serif", fontSize: 16, color: "#0f172a" }}>{monthNames[month]} {year}</h3>
            <button onClick={() => setViewDate(new Date(year, month + 1, 1))} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 700, color: "#475569" }}>→</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
            {dayNames.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#94a3b8", padding: "4px 0" }}>{d}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {days.map((date, i) => {
              if (!date) return <div key={i} />;
              const dayOrders = orders.filter(o => o.date === date && o.status !== "cancelled");
              const isToday = date === today.toISOString().split("T")[0];
              const isSelected = date === selected;
              const isPast = date < today.toISOString().split("T")[0];
              return (
                <div key={i} onClick={() => setSelected(date)}
                  style={{
                    borderRadius: 10, padding: "8px 4px", textAlign: "center", cursor: "pointer", position: "relative",
                    background: isSelected ? "#6366f1" : isToday ? "#eef2ff" : "transparent",
                    transition: "background 0.15s",
                  }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: isToday || isSelected ? 700 : 400, color: isSelected ? "#fff" : isPast ? "#c7d2fe" : "#0f172a" }}>
                    {date.slice(-2).replace(/^0/, "")}
                  </p>
                  {dayOrders.length > 0 && (
                    <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 3 }}>
                      {dayOrders.slice(0, 3).map((_, j) => (
                        <div key={j} style={{ width: 5, height: 5, borderRadius: "50%", background: isSelected ? "rgba(255,255,255,0.7)" : "#6366f1" }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
            {selected ? new Date(selected + "T12:00").toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" }) : "Выберите дату"}
          </h3>
          {selectedDayOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🗓️</div>
              <p style={{ color: "#94a3b8", fontSize: 13 }}>Нет записей</p>
            </div>
          ) : selectedDayOrders.map(o => {
            const client = clients.find(c => c.id === o.clientId);
            const pay = PAY_STATUS[o.payStatus];
            return (
              <div key={o.id} style={{ padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ background: "#6366f1", color: "#fff", borderRadius: 8, padding: "6px 8px", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{o.time}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{client?.name}</p>
                    <p style={{ margin: "3px 0", fontSize: 12, color: "#64748b" }}>{o.service}</p>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{o.price.toLocaleString("ru")} ₽</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: pay.color }}>● {pay.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {selectedDayOrders.length > 0 && (
            <div style={{ marginTop: 16, padding: "12px 16px", background: "#f8fafc", borderRadius: 10 }}>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Итого за день:</p>
              <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                {selectedDayOrders.reduce((s, o) => s + o.price, 0).toLocaleString("ru")} ₽
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function Settings({ templateKey, setTemplateKey }) {
  return (
    <div>
      <h2 style={{ margin: "0 0 24px", fontSize: 24, fontWeight: 700, color: "#0f172a", fontFamily: "'Unbounded', sans-serif" }}>Настройки</h2>

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Шаблон для вашей сферы</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {Object.entries(TEMPLATES).map(([key, tpl]) => (
            <div key={key} onClick={() => setTemplateKey(key)}
              style={{
                padding: "16px", borderRadius: 12, cursor: "pointer", textAlign: "center",
                border: `2px solid ${templateKey === key ? tpl.color : "#e2e8f0"}`,
                background: templateKey === key ? tpl.color + "18" : "#f8fafc",
                transition: "all 0.2s"
              }}>
              <p style={{ margin: "0 0 6px", fontSize: 22 }}>
                {{ beauty: "💅", tutor: "📚", photo: "📸", repair: "🔧", legal: "⚖️", other: "💼" }[key]}
              </p>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{tpl.name}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>PRO-функции</h3>
        {[
          { icon: "🤖", name: "Интеграция с Telegram-ботом", desc: "Клиенты записываются сами" },
          { icon: "📄", name: "Договоры и акты", desc: "Генерация одним кликом" },
          { icon: "🔔", name: "Автонапоминания", desc: "SMS и push за 24 часа до визита" },
          { icon: "📊", name: "Расширенная аналитика", desc: "Воронка, LTV, средний чек" },
          { icon: "🗂️", name: "Шаблоны документов", desc: "Счета, акты, договоры" },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ fontSize: 24 }}>{f.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{f.name}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>{f.desc}</p>
            </div>
            <span style={{ background: "#fef3c7", color: "#d97706", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>PRO</span>
          </div>
        ))}
        <button style={{ marginTop: 16, width: "100%", padding: "14px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
          Подключить PRO — 590 ₽/мес →
        </button>
      </Card>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [templateKey, setTemplateKey] = useState("beauty");
  const [clients, setClients] = useState(initialClients);
  const [orders, setOrders] = useState(initialOrders);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const template = TEMPLATES[templateKey];

  const navItems = [
    { key: "dashboard", icon: "⚡", label: "Дашборд" },
    { key: "clients", icon: "👥", label: "Клиенты" },
    { key: "orders", icon: "📋", label: "Заказы" },
    { key: "calendar", icon: "📅", label: "Календарь" },
    { key: "finance", icon: "💰", label: "Финансы" },
    { key: "settings", icon: "⚙️", label: "Настройки" },
  ];

  const todayOrders = orders.filter(o => o.date === new Date().toISOString().split("T")[0]);
  const pendingCount = orders.filter(o => o.payStatus === "pending").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <aside style={{
        width: 220, background: "#fff", borderRight: "1px solid #f1f5f9",
        display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh",
        flexShrink: 0
      }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              ✦
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: "#0f172a", fontFamily: "'Unbounded', sans-serif", lineHeight: 1.2 }}>SelfCRM</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>{template.name}</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 12px" }}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => setPage(item.key)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                background: page === item.key ? "#eef2ff" : "transparent",
                color: page === item.key ? "#6366f1" : "#64748b",
                fontWeight: page === item.key ? 700 : 500, fontSize: 14,
                marginBottom: 2, textAlign: "left", fontFamily: "inherit",
                transition: "all 0.15s", position: "relative"
              }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
              {item.key === "orders" && pendingCount > 0 && (
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 20, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px", borderTop: "1px solid #f1f5f9" }}>
          <div style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 12, padding: "14px", color: "#fff" }}>
            <p style={{ margin: "0 0 4px", fontSize: 12, opacity: 0.85 }}>Сегодня записей:</p>
            <p style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, fontFamily: "'Unbounded', sans-serif" }}>{todayOrders.length}</p>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.75 }}>
              {todayOrders.reduce((s, o) => s + o.price, 0).toLocaleString("ru")} ₽ выручка
            </p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: 32, minWidth: 0, overflowX: "hidden" }}>
        {page === "dashboard" && <Dashboard clients={clients} orders={orders} expenses={expenses} template={template} onNavigate={setPage} />}
        {page === "clients" && <Clients clients={clients} setClients={setClients} orders={orders} template={template} />}
        {page === "orders" && <Orders orders={orders} setOrders={setOrders} clients={clients} template={template} />}
        {page === "calendar" && <Calendar orders={orders} clients={clients} />}
        {page === "finance" && <Finance orders={orders} expenses={expenses} setExpenses={setExpenses} />}
        {page === "settings" && <Settings templateKey={templateKey} setTemplateKey={setTemplateKey} />}
      </main>
    </div>
  );
}
