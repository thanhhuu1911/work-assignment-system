// client/src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TaskCard from "../components/TaskCard";
import api from "../services/api";

// LOẠI BỎ "Need Support"
const STATUS_FILTERS = [
  { key: "all", label: "all_status", color: "dark" },
  { key: "ongoing", label: "ongoing", color: "dark" },
  { key: "review", label: "in_review", color: "dark" },
  { key: "approved", label: "approved", color: "dark" },
  { key: "overdue", label: "overdue", color: "dark" },
];

const POSITIONS = [
  "ASSEMBLY A",
  "ASSEMBLY B",
  "CUTTING",
  "EMBROIDERY",
  "FINISH WH",
  "PANEL",
  "PRINT",
  "QC/QA",
  "VISOR",
  "WAREHOUSE",
];

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 8;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const canAssignTask = ["manager", "a_manager", "leader"].includes(user.role);

  // OVERDUE: SAU 23:59:59 NGÀY dueDate
  const isOverdue = (dueDate) => {
    const due = new Date(dueDate);
    const endOfDay = new Date(
      due.getFullYear(),
      due.getMonth(),
      due.getDate(),
      23,
      59,
      59
    );
    return new Date() > endOfDay;
  };

  const enrichTasksWithOverdue = (tasks) => {
    return tasks.map((task) => ({
      ...task,
      isOverdue: task.status === "ongoing" && isOverdue(task.dueDate),
    }));
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tasks");
      const sorted = res.data.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      const enriched = enrichTasksWithOverdue(sorted);
      setTasks(enriched);
    } catch (err) {
      alert("Failed to load tasks");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // LỌC TASK
  let filteredTasks = tasks;
  if (statusFilter === "ongoing") {
    filteredTasks = filteredTasks.filter(
      (t) => t.status === "ongoing" && !t.isOverdue
    );
  } else if (statusFilter === "overdue") {
    filteredTasks = filteredTasks.filter(
      (t) => t.status === "overdue" || t.isOverdue
    );
  } else if (statusFilter !== "all") {
    filteredTasks = filteredTasks.filter((t) => t.status === statusFilter);
  }
  if (positionFilter !== "all")
    filteredTasks = filteredTasks.filter((t) => t.position === positionFilter);
  if (groupFilter !== "all")
    filteredTasks = filteredTasks.filter(
      (t) => t.assignee?.group === groupFilter
    );
  if (assigneeFilter !== "all")
    filteredTasks = filteredTasks.filter(
      (t) => t.assignee?._id === assigneeFilter
    );

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const uniqueAssignees = tasks
    .filter(
      (t, i, a) => a.findIndex((x) => x.assignee?._id === t.assignee?._id) === i
    )
    .map((t) => t.assignee);

  const filteredAssignees =
    groupFilter === "all"
      ? uniqueAssignees
      : uniqueAssignees.filter((u) => u?.group === groupFilter);

  const uniqueGroups = [
    ...new Set(tasks.map((t) => t.assignee?.group).filter(Boolean)),
  ];

  const countByStatus = (key) => {
    if (key === "all") return tasks.length;
    if (key === "ongoing")
      return tasks.filter((t) => t.status === "ongoing" && !t.isOverdue).length;
    if (key === "overdue")
      return tasks.filter((t) => t.status === "overdue" || t.isOverdue).length;
    return tasks.filter((t) => t.status === key).length;
  };

  // PHÂN QUYỀN DUYỆT (dùng trong TaskCard nếu cần)
  const canReviewTask = (task) => {
    if (!user.role) return false;
    if (["manager", "a_manager"].includes(user.role)) return true;
    if (user.role === "leader" && task.assignee?.group === user.group)
      return true;
    return false;
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1">
        <div className="container-fluid py-3 d-flex flex-column h-100">
          {/* 3 BỘ LỌC */}
          <div className="row g-3 mb-4 justify-content-center">
            <div className="col-md-3">
              <select
                className="form-select form-select-sm"
                value={positionFilter}
                onChange={(e) => {
                  setPositionFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">{t("Tất cả nhà máy")}</option>
                {POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select form-select-sm"
                value={groupFilter}
                onChange={(e) => {
                  setGroupFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">{t("Nhóm")}</option>
                {uniqueGroups.map((gr) => (
                  <option key={gr} value={gr}>
                    {gr}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select form-select-sm"
                value={assigneeFilter}
                onChange={(e) => {
                  setAssigneeFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">{t("Tên nhân viên")}</option>
                {filteredAssignees.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STATUS + BUTTONS */}
          <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
            <div className="btn-group flex-wrap" role="group">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  className={`btn btn-outline-${f.color} ${
                    statusFilter === f.key ? "active" : ""
                  }`}
                  onClick={() => {
                    setStatusFilter(f.key);
                    setCurrentPage(1);
                  }}
                >
                  {t(f.label)} ({countByStatus(f.key)})
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
              <button
                className="btn btn-primary px-4"
                onClick={() => {
                  // reset các filter về mặc định
                  setStatusFilter("all");
                  setPositionFilter("all");
                  setGroupFilter("all");
                  setAssigneeFilter("all");
                  setCurrentPage(1);
                  // load lại tasks
                  loadTasks();
                }}
              >
                {t("reload")}
              </button>
            </div>
          </div>

          {/* TASK GRID */}
          <div className="row g-4 flex-grow-1">
            {loading ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border text-primary" />
              </div>
            ) : currentTasks.length === 0 ? (
              <div className="col-12 text-center py-5">
                <p className="text-muted">{t("no_tasks")}</p>
              </div>
            ) : (
              currentTasks.map((task) => (
                <div className="col-6 col-md-4 col-lg-3" key={task._id}>
                  <TaskCard task={task} canReview={canReviewTask(task)} />
                </div>
              ))
            )}
          </div>

          {/* PHÂN TRANG */}
          <div className="mt-auto pt-3">
            {totalPages > 1 && (
              <nav className="d-flex justify-content-center">
                <ul className="pagination pagination-sm mb-0">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button className="page-link" onClick={() => goToPage(1)}>
                      {"<<"}
                    </button>
                  </li>
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => goToPage(currentPage - 1)}
                    >
                      {"<"}
                    </button>
                  </li>
                  <li className="page-item active">
                    <span className="page-link">
                      {currentPage} / {totalPages}
                    </span>
                  </li>
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => goToPage(currentPage + 1)}
                    >
                      {">"}
                    </button>
                  </li>
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => goToPage(totalPages)}
                    >
                      {">>"}
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
