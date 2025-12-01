import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NewIssue from "./pages/NewIssue";
import TaskDetail from "./pages/TaskDetail"; // THÊM
import ImproveTask from "./pages/ImproveTask"; // THÊM
import ReviewTask from "./pages/ReviewTask";
import Toast from "./components/Toast";
import Statistics from "./pages/Statistics";
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
        <Route path="/improve/:id" element={<ImproveTask />} />
        <Route path="/review/:id" element={<ReviewTask />} />
        <Route path="/statistics" element={<Statistics />} />
      </Routes>
      <Toast />
    </BrowserRouter>
  );
}
