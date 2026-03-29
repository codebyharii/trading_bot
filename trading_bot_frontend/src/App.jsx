// ── App.jsx ───────────────────────────────────────────────────────────────────
// Root component. Wires layout, page routing, and global state together.

import { useState } from "react";
import "./styles/theme.css";

import Header  from "./components/Header";
import Sidebar from "./components/Sidebar";
import Toast   from "./components/Toast";

import TradePage   from "./pages/TradePage";
import OrdersPage  from "./pages/OrdersPage";
import AccountPage from "./pages/AccountPage";

import { useApiStatus } from "./hooks/useApiStatus";
import { useToast }     from "./hooks/useToast";

export default function App() {
  const [currentTab, setTab] = useState("trade");
  const apiStatus            = useApiStatus();
  const { toast, showToast, clearToast } = useToast();

  const renderPage = () => {
    switch (currentTab) {
      case "trade":   return <TradePage   showToast={showToast} />;
      case "orders":  return <OrdersPage  showToast={showToast} />;
      case "account": return <AccountPage showToast={showToast} />;
      default:        return <TradePage   showToast={showToast} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-page)" }}>
      <Header apiStatus={apiStatus} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar activeTab={currentTab} onTabChange={setTab} />
        <main style={{ flex: 1, padding: 32, overflowY: "auto", background: "var(--color-surface)", minWidth: 0 }}>
          {renderPage()}
        </main>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  );
}
