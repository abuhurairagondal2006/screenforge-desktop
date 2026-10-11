import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { HomePage } from "@/pages/HomePage";
import { RecorderPage } from "@/pages/RecorderPage";
import { ScreenshotsPage } from "@/pages/ScreenshotsPage";
import { RecordingsPage } from "@/pages/RecordingsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { AboutPage } from "@/pages/AboutPage";
import { useTheme } from "@/hooks/useTheme";

function KeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "R") {
        e.preventDefault();
        navigate("/recorder");
      }
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
        navigate("/screenshots");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault();
        navigate("/settings");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  return null;
}

export default function App() {
  useTheme();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <KeyboardShortcuts />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/recorder" element={<RecorderPage />} />
            <Route path="/screenshots" element={<ScreenshotsPage />} />
            <Route path="/recordings" element={<RecordingsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
