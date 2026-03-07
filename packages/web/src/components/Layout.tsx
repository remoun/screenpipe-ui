import { useEffect } from "react";
import { NavLink, Outlet } from "react-router";
import { useHealth } from "@screenpipe-ui/react";
import type { ScreenpipeUIClient } from "@screenpipe-ui/core";

const navItems = [
  { to: "/search", label: "Search", icon: "S" },
  { to: "/timeline", label: "Timeline", icon: "T" },
  { to: "/meetings", label: "Meetings", icon: "M" },
];

export function Layout({ client }: { client: ScreenpipeUIClient }) {
  const { health, error, check } = useHealth(client);

  useEffect(() => {
    check();
    const id = setInterval(check, 15_000);
    return () => clearInterval(id);
  }, [check]);

  const isHealthy = health !== null && !error && health.status === "healthy";

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <nav className="flex flex-col w-16 border-r border-gray-800 bg-gray-950">
        <div className="flex items-center justify-center h-14 border-b border-gray-800">
          <span className="text-sm font-semibold tracking-tight text-gray-400">
            sp
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-center w-10 h-10 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
                }`
              }
              title={item.label}
            >
              {item.icon}
            </NavLink>
          ))}
        </div>
        {/* Health dot at bottom */}
        <div className="mt-auto flex items-center justify-center py-4">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isHealthy ? "bg-green-500" : "bg-red-500"
            }`}
            title={
              isHealthy
                ? "screenpipe is healthy"
                : error ?? "screenpipe is not responding"
            }
          />
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
