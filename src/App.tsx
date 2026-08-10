import { NavLink, Route, Routes } from "react-router-dom";
import { ApplicationsPage } from "./pages/ApplicationsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { JobBoardsPage } from "./pages/JobBoardsPage";
import { ResumePage } from "./pages/ResumePage";
import { SettingsPage } from "./pages/SettingsPage";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/applications", label: "Applications" },
  { to: "/resume", label: "Resume & Cover Letter" },
  { to: "/job-boards", label: "Job Boards" },
  { to: "/settings", label: "Settings" },
];

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-4">
          <span className="text-lg font-bold text-slate-900 dark:text-white">Jerbs</span>
          <nav className="flex flex-wrap gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/job-boards" element={<JobBoardsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
