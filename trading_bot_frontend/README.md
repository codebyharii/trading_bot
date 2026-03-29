# Trading Bot — React Frontend

JP Morgan Chase–inspired trading dashboard for the Binance Futures Testnet bot.

---

## File Structure

```
trading_bot_frontend/
├── index.html
├── vite.config.js
├── package.json
├── .env.example
└── src/
    ├── App.jsx                     ← Root: layout + page routing (47 lines)
    ├── main.jsx                    ← ReactDOM mount
    │
    ├── styles/
    │   └── theme.css               ← CSS variables, reset, animations
    │
    ├── services/
    │   └── api.js                  ← All HTTP calls to FastAPI backend
    │
    ├── hooks/
    │   ├── useApiStatus.js         ← Polls /health every 15s
    │   ├── useLivePrice.js         ← Live mark price, refreshes every 10s
    │   └── useToast.js             ← Toast notification state
    │
    ├── components/
    │   ├── Header.jsx              ← Top bar: logo, API status, date
    │   ├── Sidebar.jsx             ← Left nav with active highlight
    │   ├── Badge.jsx               ← Colored pill badge (gold/blue/green/red)
    │   ├── FormControls.jsx        ← Input, Select, SideToggle, FieldGroup
    │   ├── Layout.jsx              ← Card, Divider, SectionHeader
    │   ├── PriceCard.jsx           ← Live price display + order type guide
    │   └── Toast.jsx               ← Slide-in success/error notification
    │
    └── pages/
        ├── TradePage.jsx           ← Order form + confirmation panel
        ├── OrdersPage.jsx          ← Open orders table + cancel
        └── AccountPage.jsx         ← Balance hero + assets + positions
```

---

## Setup

### 1. Configure API URL

```bash
cp .env.example .env
# Edit VITE_API_URL if your backend runs on a different port
```

`.env`:
```
VITE_API_URL=http://localhost:8000
```

### 2. Install & run

```bash
npm install
npm run dev        # → http://localhost:3000
```

### 3. Build for production

```bash
npm run build      # output in dist/
npm run preview    # preview the build locally
```

---

## Prerequisites

- The **Python FastAPI backend** (`api_server.py`) must be running on port 8000
- Node.js 18+

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--color-navy` | `#00254a` | Headings, logo, hero bg |
| `--color-blue` | `#005eb8` | Interactive elements, active states |
| `--color-blue-pale` | `#e6f0fb` | Hover backgrounds, focus rings |
| `--color-surface` | `#f7f8fa` | Page background |
| `--color-card` | `#ffffff` | Card backgrounds |
| `--font-serif` | Playfair Display | Section headings |
| `--font-mono` | IBM Plex Mono | Prices, order IDs, quantities |
| `--font-sans` | Inter | Body text, labels |

All tokens are defined in `src/styles/theme.css` and referenced via CSS variables throughout.
