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

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tasks");
      setTasks(res.data.data);
    } catch (err) {
      alert("Lỗi tải công việc");
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
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>{t("task_list")}</h2>
          <div className="d-flex gap-2">
            {JSON.parse(localStorage.getItem("user") || "{}").role ===
              "leader" && (
              <button
                className="btn btn-success"
                onClick={() => navigate("/new-issue")}
              >
                {t("create_task")}
              </button>
            )}
            <button className="btn btn-primary" onClick={loadTasks}>
              {t("reload")}
            </button>
          </div>
        </div>

        <div className="btn-group mb-4 flex-wrap" role="group">
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

        <div className="row">
          {loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="col-12 text-center py-5">
              <p className="text-muted">Không có công việc nào</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div className="col-md-6 col-lg-4 mb-4" key={task._id}>
                <TaskCard task={task} taskId={task._id} />{" "}
                {/* ĐÃ SỬA DÒNG NÀY */}
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
