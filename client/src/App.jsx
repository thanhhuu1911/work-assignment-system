import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NewIssue from "./pages/NewIssue";
import TaskDetail from "./pages/TaskDetail"; // THÊM
import TaskImprove from "./pages/TaskImprove"; // THÊM

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-issue" element={<NewIssue />} />
        <Route path="/task/:id" element={<TaskDetail />} /> {/* MỚI */}
        <Route path="/task/improve/:id" element={<TaskImprove />} /> {/* MỚI */}
      </Routes>
    </BrowserRouter>
  );
}
