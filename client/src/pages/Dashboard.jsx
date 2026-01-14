// client/src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TaskCard from "../components/TaskCard";
import api from "../services/api";
import { showToast } from "../components/Toast";

const STATUS_FILTERS = [
  { key: "all", label: "all_status", color: "dark" },
  { key: "ongoing", label: "ongoing", color: "dark" },
  { key: "review", label: "pending_approval", color: "dark" },
  { key: "approved", label: "approved", color: "dark" },
  { key: "rejected_overdue", label: "rejected_overdue", color: "danger" },
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

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tasks");
      const sorted = res.data.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTasks(sorted);
    } catch (err) {
      showToast("Failed to load tasks", "Có lỗi xảy ra!");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if ((user.role === "leader" || user.role === "member") && user.group) {
      setGroupFilter(user.group);
      setAssigneeFilter("all");
    }
  }, [user.role, user.group]);

  // CẬP NHẬT: LỌC TASK
  let filteredTasks = tasks;

  if (statusFilter === "ongoing") {
    filteredTasks = tasks.filter(
      (t) => t.status === "ongoing" && !t.isOverdue && !t.reviewNote
    );
  } else if (statusFilter === "review") {
    filteredTasks = tasks.filter((t) => t.status === "review");
  } else if (statusFilter === "approved") {
    filteredTasks = tasks.filter((t) => t.status === "approved");
  } else if (statusFilter === "rejected_overdue") {
    filteredTasks = tasks.filter(
      (t) =>
        // 1. Bị reject (có reviewNote + không phải approved)
        (t.reviewNote && t.status !== "approved") ||
        // 2. Đang ongoing nhưng quá hạn → PHẢI HIỆN Ở ĐÂY LUÔN!
        (t.status === "ongoing" && t.isOverdue) ||
        // 3. Nếu sau này có status "rejected"
        t.status === "rejected"
    );
  } else if (statusFilter !== "all") {
    filteredTasks = tasks.filter((t) => t.status === statusFilter);
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

  const uniqueAssignees = Array.from(
    new Map(
      tasks
        .filter((t) => t.assignee?._id)
        .map((t) => [t.assignee._id, t.assignee])
    ).values()
  );

  const uniqueGroups = [
    ...new Set(tasks.map((t) => t.assignee?.group).filter(Boolean)),
  ];

  const countByStatus = (key) => {
    if (key === "all") return tasks.length;
    if (key === "ongoing")
      return tasks.filter(
        (t) => t.status === "ongoing" && !t.isOverdue && !t.reviewNote
      ).length;
    if (key === "review")
      return tasks.filter((t) => t.status === "review").length;
    if (key === "approved")
      return tasks.filter((t) => t.status === "approved").length;
    if (key === "rejected_overdue")
      return tasks.filter(
        (t) =>
          (t.reviewNote && t.status !== "approved") ||
          (t.status === "ongoing" && t.isOverdue) ||
          t.status === "rejected"
      ).length;
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
        <div className="container-fluid py-1 d-flex flex-column h-100 ">
          {/* 3 BỘ LỌC */}
          <div className="card shadow-sm mb-3 p-3 rounded-pill shadow-sm">
            <div className="row g-5 justify-content-center">
              {/* ============ NHÀ MÁY ============ */}
              <div className="col-md-3">
                <label className="form-label small fw-bold text-dark mb-2">
                  {t("factory")}
                </label>
                <select
                  className="form-select form-select-lg rounded-pill shadow-sm"
                  value={positionFilter}
                  onChange={(e) => {
                    setPositionFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {["manager", "a_manager", "leader", "member"].includes(
                    user.role
                  ) && <option value="all">{t("all_factory")}</option>}
                  {POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              {/* ============ NHÓM ============ */}
              <div className="col-md-3">
                <label className="form-label small fw-bold text-dark mb-2">
                  {t("group")}
                </label>
                <select
                  className="form-select form-select-lg rounded-pill shadow-sm"
                  value={groupFilter}
                  onChange={(e) => {
                    setGroupFilter(e.target.value);
                    setAssigneeFilter("all");
                    setCurrentPage(1);
                  }}
                  disabled={user.role === "member"}
                >
                  {["manager", "a_manager"].includes(user.role) && (
                    <>
                      <option value="all">{t("all_groups")}</option>
                      {uniqueGroups.map((gr) => (
                        <option key={gr} value={gr}>
                          {gr}
                        </option>
                      ))}
                    </>
                  )}
                  {user.role === "leader" && (
                    <option value={user.group}>{user.group}</option>
                  )}
                  {user.role === "member" && (
                    <option value={user.group}>{user.group}</option>
                  )}
                </select>
              </div>

              {/* ============ NHÂN VIÊN ============ */}
              <div className="col-md-3">
                <label className="form-label small fw-bold text-dark mb-2">
                  {t("employee")}
                </label>
                <select
                  className="form-select form-select-lg rounded-pill shadow-sm"
                  value={assigneeFilter}
                  onChange={(e) => {
                    setAssigneeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {/* Manager: lọc nhân viên theo nhóm đã chọn */}
                  {["manager", "a_manager"].includes(user.role) && (
                    <>
                      <option value="all">
                        {
                          groupFilter === "all"
                            ? t("all_members") // Tất cả nhân viên
                            : t("all_in_group") // Tất cả trong nhóm
                        }
                      </option>
                      {uniqueAssignees
                        .filter(
                          (u) =>
                            u &&
                            (groupFilter === "all" || u.group === groupFilter)
                        )
                        .map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name}
                          </option>
                        ))}
                    </>
                  )}

                  {/* Leader & Member: chỉ thấy người trong nhóm mình */}
                  {["leader", "member"].includes(user.role) && (
                    <>
                      {user.role === "leader" && (
                        <option value="all">{t("all_in_group")}</option>
                      )}
                      {uniqueAssignees
                        .filter((u) => u?.group === user.group)
                        .map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name}
                          </option>
                        ))}
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
          {/* STATUS + BUTTONS */}
          <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
            <div className="btn-group flex-wrap" role="group">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className={`btn btn-outline-${f.color} ${
                    statusFilter === f.key ? "active" : ""
                  } fw-bold`}
                  onClick={() => {
                    setStatusFilter(f.key);
                    setCurrentPage(1); // ← QUAN TRỌNG NHẤT – RESET TRANG KHI ĐỔI TAB
                  }}
                >
                  {t(f.label)} ({countByStatus(f.key)})
                </button>
              ))}
            </div>
            <div className="ms-auto d-flex gap-2">
              {canAssignTask && (
                <button
                  className="btn btn-primary btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm d-flex align-items-center "
                  onClick={() => navigate("/new-issue")}
                >
                  <img
                    src="/add.png"
                    alt="add"
                    className="me-1"
                    style={{ width: "25px", height: "25px" }}
                  />
                  {t("create_task")}
                </button>
              )}

              {/* NÚT THỐNG KÊ MỚI – SIÊU ĐẸP */}
              <button
                className="btn btn-primary btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm d-flex align-items-center gap-2"
                onClick={() => navigate("/statistics")}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M3 3v18h18" />
                  <path d="M18 17V9" />
                  <path d="M13 17V5" />
                  <path d="M8 17v-7" />
                </svg>
                {t("statistics")}
              </button>

              <button
                className="btn btn-primary btn-sm px-4 py-2 fw-bold rounded-pill shadow-sm d-flex align-items-center "
                onClick={() => {
                  setStatusFilter("all");
                  setPositionFilter("all");
                  // KHÔNG ĐỔI groupFilter và assigneeFilter nếu là leader/member
                  if (!["leader", "member"].includes(user.role)) {
                    setGroupFilter("all");
                    setAssigneeFilter("all");
                  }
                  setCurrentPage(1);
                  loadTasks();
                }}
              >
                <img
                  src="/reset.png"
                  alt="reset"
                  className="me-1"
                  style={{ width: "25px", height: "25px" }}
                />
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
