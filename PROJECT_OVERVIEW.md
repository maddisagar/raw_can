# CAN Dashboard Project Overview and Architecture

## Project Folder Structure Diagram

```
raw_can/
├── components/
│   ├── data-context.js            # React context managing CAN data and WebSocket connection
│   ├── dashboard.js               # Main dashboard UI component
│   ├── header.js                  # Header with navigation and theme toggle
│   ├── status-cards.js            # Vehicle status display components
│   ├── enhanced-status-cards.js   # Detailed categorized status cards
│   ├── system-alerts.js           # Alert generation and display
│   ├── history-view.js            # Historical CAN data browsing and export
│   ├── graph-container.js         # CAN data visualization charts
│   ├── performance-metrics.js     # Key performance metrics display
│   ├── canDecoder.js              # CAN frame decoding logic
│   ├── websocketurl.js            # WebSocket URL creation utility
│   ├── critical-alerts-list.js    # List of critical alert definitions
│   ├── warning-alerts-list.js     # List of warning alert definitions
│   ├── metrics/                   # Individual metric components (e.g., CtlrTemp, MtrSpd)
│   └── ui/                       # UI helper components (e.g., card.js)
├── public/                       # Static assets (icons, logos, SVGs)
├── src/
│   └── app/
│       ├── layout.tsx            # Root layout wrapping the app with providers
│       ├── page.tsx              # Main page rendering Dashboard inside DataProvider
│       └── ClientLayoutContent.tsx # Client-side layout wrapper component
├── DOCUMENTATION.md              # Project documentation and overview
├── README.md                    # Next.js project bootstrap info
├── package.json                 # Project dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── ...                         # Other config and utility files
```

---

## Technology Stack

- **Framework:** Next.js 13 with React 18 for server/client rendering and routing
- **Styling:** Tailwind CSS for utility-first styling, custom CSS modules
- **Animations:** GSAP (GreenSock Animation Platform) for smooth UI animations
- **Icons:** lucide-react icon library for crisp SVG icons
- **Data Handling:** WebSocket connection to ESP32 device for real-time CAN bus data
- **PDF Export:** jsPDF for exporting historical data reports
- **Language:** JavaScript and TypeScript mix for components and metrics

---

## Application Structure and Integration

- **Root Layout (`src/app/layout.tsx`):**  
  Sets global metadata (title, description, icons) and wraps the app content inside a `FooterProvider` context and `ClientLayoutContent` component. Applies global CSS styles.

- **Main Page (`src/app/page.tsx`):**  
  Renders the `Dashboard` component wrapped inside the `DataProvider` context, which supplies CAN data and alerts.

- **Data Context (`components/data-context.js`):**  
  Core data management layer. Establishes a WebSocket connection to receive live CAN bus frames, decodes them using `canDecoder.js`, and merges signals into categorized state slices (`status615`, `temp616`, `measurement617`, `faults`). Maintains current data, history buffer, daily reports, and calculates alerts based on critical and warning alert lists. Provides data and alert state via React Context to the entire app.

- **Dashboard and Child Components:**  
  The `Dashboard` component orchestrates UI state (dark mode, current view, graph mode) and renders child components such as `Header`, `StatusCards`, `EnhancedStatusCards`, `SystemAlerts`, `HistoryView`, `GraphContainer`, and `PerformanceMetrics`. These components consume data from the `DataProvider` context to display real-time and historical CAN data, alerts, and performance metrics.

---

## Detailed Explanation of Key Pages and Components

### 1. Root Layout (`src/app/layout.tsx`)

- **Purpose:**  
  Defines the root HTML structure and metadata for the app. Wraps all pages with global providers.

- **Key Functions and Usage:**  
  - Uses React component `RootLayout` to wrap children with `<html>` and `<body>` tags.  
  - Applies global CSS classes for consistent styling.  
  - Wraps content inside `FooterProvider` to manage footer state globally.  
  - Uses `ClientLayoutContent` to handle client-side layout concerns.

- **Why Used:**  
  Provides a consistent layout and global context for the entire app, enabling shared state and styling.

### 2. Main Page (`src/app/page.tsx`)

- **Purpose:**  
  Entry point page rendering the main `Dashboard` component.

- **Key Functions and Usage:**  
  - Wraps `Dashboard` inside `DataProvider` context to supply CAN data and alerts.  
  - Uses React functional component with `"use client"` directive for client-side rendering.

- **Why Used:**  
  Centralizes data provisioning and UI rendering for the dashboard in one place.

### 3. Data Context (`components/data-context.js`)

- **Purpose:**  
  Manages real-time CAN data, WebSocket connection, data decoding, alert calculation, and historical data.

- **Key Functions and Usage:**  
  - `DataProvider` component maintains state for current data, history, daily reports, and connection status.  
  - Establishes WebSocket connection using `createWebSocket()` from `websocketurl.js`.  
  - Parses incoming CAN frames and decodes them with `decodeCANFrame()` from `canDecoder.js`.  
  - Merges decoded signals into categorized state slices (`status615`, `temp616`, `measurement617`, `faults`) using `mergeDecodedSignals()`.  
  - Calculates alerts with `calculateAlerts()` based on critical and warning alert lists.  
  - Persists history and reports in `localStorage`.  
  - Provides context values (`currentData`, `history`, `dailyReports`, `alerts`, etc.) to child components.

- **Why Used:**  
  Centralizes data management and provides a reactive data source for the UI components.

### 4. Dashboard (`components/dashboard.js`)

- **Purpose:**  
  Main UI component managing dashboard views, tabs, theme, and rendering child components.

- **Key Functions and Usage:**  
  - Manages state for dark mode, current view (`dashboard`, `graphs`, `history`, `reports`), dashboard tabs, and graph mode.  
  - Uses `useData()` hook to access connection status.  
  - Toggles theme with `toggleTheme()` function.  
  - Persists current view in `localStorage`.  
  - Uses GSAP for smooth scroll animations and scroll triggers.  
  - Renders `Header` with props for theme, connection, and view control.  
  - Conditionally renders dashboard tabs and child components based on current view and tab:  
    - PerformanceMetrics, EnhancedStatusCards (various modes), SystemAlerts for dashboard view tabs.  
    - GraphContainer with different modes for graphs view.  
    - HistoryView for history view.  
    - ReportsSection (dynamically imported) for reports view.

- **Why Used:**  
  Provides a flexible and interactive UI for users to explore CAN data in multiple formats and views.

---

## Detailed Explanation of Key Pages and Components

### 5. Header (`components/header.js`)

- **Purpose:**  
  Provides the top navigation bar with app branding, connection status, navigation buttons, and theme toggle.

- **Key Functions and Usage:**  
  - Uses React state `mobileMenuOpen` to manage mobile menu visibility.  
  - Displays app logo which on click sets the current view to "dashboard".  
  - Shows connection status with icons (`Wifi` for connected, `WifiOff` for disconnected).  
  - Navigation buttons for switching views: Dashboard, Graphs, History, Reports. Buttons highlight based on the current view and adapt styling for dark mode.  
  - Theme toggle button switches between dark and light modes using `toggleTheme` prop.  
  - Responsive design with separate desktop and mobile navigation menus. Mobile menu toggles visibility on button click.  
  - Uses lucide-react icons for visual clarity and consistency.

- **Why Used:**  
  Centralizes navigation and theme control, providing a consistent and responsive user interface for app navigation and status awareness.

---

## Detailed Explanation of Key Pages and Components

### 6. StatusCards (`components/status-cards.js`)

- **Purpose:**  
  Displays critical vehicle statuses, temperature monitoring, and key measurements in card format.

- **Key Functions and Usage:**  
  - Uses `useData()` hook to access `currentData` and connection status.  
  - Overrides sensor health status keys to `true` when WebSocket is disconnected to avoid false negatives.  
  - Defines arrays for critical statuses, temperatures, and measurements with labels and icons.  
  - Renders three card sections:  
    - Critical Status: Shows statuses like Limp Mode, Brake, Forward, Reverse with active/inactive indicators.  
    - Temperature Monitoring: Displays controller and motor temperatures with color-coded indicators (cool, warm, hot).  
    - Key Measurements: Shows DC Bus Voltage, Motor Speed, AC Current with units and icons.  
  - Applies responsive grid layout and hover effects for better UX.

- **Why Used:**  
  Provides a quick overview of essential vehicle system statuses and measurements, aiding real-time monitoring.

---

## Detailed Explanation of Key Pages and Components

### 7. SystemAlerts (`components/system-alerts.js`)

- **Purpose:**  
  Displays system alerts categorized as critical or warning, providing real-time feedback on vehicle system health.

- **Key Functions and Usage:**  
  - Uses `useData()` hook to access connection status and current alerts.  
  - Filters alerts into `criticalAlerts` and `warningAlerts` arrays based on alert type.  
  - If no alerts or disconnected, shows a message indicating all systems are normal.  
  - Otherwise, displays two columns:  
    - Critical Alerts: Lists critical alerts sorted alphabetically, each with an icon, category, timestamp, and message.  
    - Warning Alerts: Lists warning alerts similarly.  
  - Uses lucide-react icons for alert symbols.  
  - Responsive layout adapts columns to vertical stacking on smaller screens.

- **Why Used:**  
  Provides clear, categorized alert information to users, enabling quick identification and response to critical vehicle issues.

---

## Detailed Explanation of Key Pages and Components

### 8. HistoryView (`components/history-view.js`)

- **Purpose:**  
  Provides a paginated view of historical CAN data with filtering, searching, and export capabilities.

- **Key Functions and Usage:**  
  - Uses `useData()` hook to access the `history` array of CAN data points.  
  - Manages pagination state (`currentPage`) and export format (`json` or `pdf`).  
  - Filters history to include only entries with critical or warning alerts using `calculateAlerts()`.  
  - Supports exporting filtered data as JSON or PDF using `jsPDF`.  
  - Renders paginated list of history items with timestamps and alert summaries.  
  - Provides UI controls for export format selection and pagination navigation.  
  - Uses responsive styling for usability on various screen sizes.

- **Why Used:**  
  Enables users to review past CAN data and alerts, supporting analysis and reporting needs.

---

## Detailed Explanation of Key Pages and Components

### 9. GraphContainer (`components/graph-container.js`)

- **Purpose:**  
  Visualizes CAN data metrics in multiple modes: individual, overlay, and quad view.

- **Key Functions and Usage:**  
  - Uses `useData()` hook to access historical CAN data and connection status.  
  - Manages state for selected graphs (`selectedGraphs`) and quad view selections (`quadSelection`).  
  - Supports three display modes:  
    - **Individual:** Renders all metric components in a grid layout.  
    - **Overlay:** Allows users to select multiple metrics to overlay on charts, rendering selected metrics dynamically.  
    - **Quad:** Displays four user-selectable metrics in a 2x2 grid with dropdown selectors.  
  - Imports individual metric components (e.g., `CtlrTemp1`, `MtrSpd`, `Brake`) and maps them to metric keys.  
  - Uses `Card` and `CardContent` UI components for consistent styling.  
  - Provides responsive styling and interactive controls for metric selection.

- **Why Used:**  
  Offers flexible and customizable visualization options for users to analyze CAN data metrics effectively.

---

## Detailed Explanation of Key Pages and Components

### 10. PerformanceMetrics (`components/performance-metrics.js`)

- **Purpose:**  
  Displays key performance metrics such as motor speed, DC bus voltage, AC current RMS, and motor temperature with trend analysis and sensor health overview.

- **Key Functions and Usage:**  
  - Uses `useData()` hook to access current data, history, alerts, and connection status.  
  - Calculates counts of critical and warning alerts.  
  - Overrides sensor health status keys to `true` when disconnected to avoid false negatives.  
  - Calculates sensor health summary (total and healthy sensors).  
  - Defines metrics array with title, value, unit, trend percentage, icon, color, and max value.  
  - Calculates trend percentage over recent history for each metric.  
  - Computes an efficiency score based on motor temperature, voltage, current, and speed thresholds.  
  - Computes power consumption from voltage and current.  
  - Renders metrics in a grid with icons, values, units, and odometer visualization.  
  - Displays trend icons and colors based on trend direction.  
  - Responsive styling for various screen sizes.

- **Why Used:**  
  Provides a concise and informative overview of vehicle performance metrics, aiding monitoring and diagnostics.

---
