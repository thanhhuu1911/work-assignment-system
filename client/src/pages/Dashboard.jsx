// client/src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TaskCard from "../components/TaskCard";
import api from "../services/api";

const STATUS_FILTERS = [
  { key: "all", label: "all_status", color: "primary" },
  { key: "support", label: "need_support", color: "warning" },
  { key: "pending", label: "pending", color: "secondary" },
  { key: "review", label: "in_review", color: "info" },
  { key: "approved", label: "approved", color: "success" },
  { key: "rejected", label: "rejected_overdue", color: "danger" },
];

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const canAssignTask = ["manager", "a_manager", "leader"].includes(user.role);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tasks");
      setTasks(res.data.data);
    } catch (err) {
      alert("Failed to load tasks");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div>
      <Header />

      <div className="container-fluid py-1">
        {/* TITLE */}
        <h2 className="mb-3 fw-bold text-dark">{t("task_list")}</h2>

        {/* FILTERS + BUTTONS */}
        <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
          <div className="btn-group flex-wrap" role="group">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                className={`btn btn-outline-${f.color} ${
                  filter === f.key ? "active" : ""
                }`}
                onClick={() => setFilter(f.key)}
              >
                {t(f.label)} (
                {
                  tasks.filter((t) => f.key === "all" || t.status === f.key)
                    .length
                }
                )
              </button>
            ))}
          </div>

          <div className="ms-auto d-flex gap-2">
            {canAssignTask && (
              <button
                className="btn btn-primary px-4"
                onClick={() => navigate("/new-issue")}
              >
                {t("create_task")}
              </button>
            )}
            <button className="btn btn-primary px-4" onClick={loadTasks}>
              {t("reload")}
            </button>
          </div>
        </div>

        {/* TASK GRID – 4 CỘT, KHOẢNG CÁCH GỌN */}
        <div className="row g-4">
          {loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="col-12 text-center py-5">
              <p className="text-muted">{t("no_tasks")}</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div className="col-md-6 col-lg-4" key={task._id}>
                <TaskCard task={task} />
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
