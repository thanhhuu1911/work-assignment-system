// client/src/pages/Statistics.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../services/api";
import { showToast } from "../components/Toast";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = ["#28a745", "#ffc107", "#846d70ff", "#ff0000ff"];

export default function Statistics() {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [groupFilter, setGroupFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const isManager = ["manager", "a_manager"].includes(user.role);
  const isLeader = user.role === "leader";
  const isMember = user.role === "member";

  // GỌI API MỚI – CHỈ DÙNG CÁI NÀY!
  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (groupFilter !== "all") params.append("group", groupFilter);
      if (userFilter !== "all") params.append("userId", userFilter);
      if (dateRange !== "all") params.append("period", dateRange);

      const res = await api.get(`/tasks/stats?${params.toString()}`);
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
      // Nếu bạn có toast thì gọi ở đây
      showToast("Không tải được thống kê!", "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  // GỌI KHI MOUNT + KHI FILTER THAY ĐỔI
  useEffect(() => {
    fetchStats();
  }, [groupFilter, userFilter, dateRange]);

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (!stats) return null;

  const {
    summary,
    statusBreakdown,
    dailyStats,
    topPerformers,
    availableGroups,
    availableUsers,
  } = stats;

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 bg-light py-3">
        <div className="container-fluid">
          {/* TIÊU ĐỀ + NÚT QUAY LẠI – ĐẸP HOÀN HẢO */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h2 className="text-primary fw-bold mb-0">
              {isMember
                ? "Thống kê cá nhân"
                : isLeader
                ? `Thống kê nhóm ${user.group}`
                : "Thống kê phòng ME"}
            </h2>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button
              onClick={() => window.history.back()}
              className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm fw-semibold"
            >
              <svg
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354l-6-6z" />
              </svg>
              Home
            </button>
            {/* NÚT RESET SIÊU ĐẸP (TUỲ CHỌN) */}
            <div className="col-lg-2 col-md-3">
              <button
                type="button"
                onClick={() => {
                  setGroupFilter("all");
                  setUserFilter("all");
                  setDateRange("all");
                }}
                className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm fw-semibold"
              >
                <img
                  src="/reset.png"
                  alt="reset"
                  className="me-1"
                  style={{ width: "25px", height: "25px" }}
                />
                Reset
              </button>
            </div>
          </div>
          {/* FILTERS */}
          {(isManager || isLeader) && (
            <div className="card border-0 shadow-sm mb-4 overflow-hidden">
              <div className="card-body p-4">
                <div className="row g-4 align-items-end justify-content-center">
                  {/* NHÓM – chỉ hiện cho Manager */}
                  {isManager && (
                    <div className="col-lg-3 col-md-4">
                      <label className="form-label small fw-bold text-muted mb-2">
                        Nhóm
                      </label>
                      <select
                        className="form-select form-select-lg rounded-pill shadow-sm"
                        value={groupFilter}
                        onChange={(e) => setGroupFilter(e.target.value)}
                      >
                        <option value="all">Tất cả nhóm</option>
                        {availableGroups.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* NHÂN VIÊN */}
                  <div className="col-lg-4 col-md-5">
                    <label className="form-label small fw-bold text-muted mb-2">
                      Nhân viên
                    </label>
                    <select
                      className="form-select form-select-lg rounded-pill shadow-sm"
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                    >
                      <option value="all">Tất cả nhân viên</option>
                      {availableUsers.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* THỜI GIAN */}
                  <div className="col-lg-3 col-md-4">
                    <label className="form-label small fw-bold text-muted mb-2">
                      Thời gian
                    </label>
                    <select
                      className="form-select form-select-lg rounded-pill shadow-sm"
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                    >
                      <option value="all">Tổng quan</option>
                      <option value="week">7 ngày qua</option>
                      <option value="month">Tháng này</option>
                      <option value="quarter">Quý này</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* KPI CARDS */}
          <div className="row g-4 mb-5">
            <div className="col-6 col-md-3">
              <div className="card bg-primary text-white h-100 shadow">
                <div className="card-body text-center">
                  <h5>Tổng</h5>
                  <h2>{summary.total}</h2>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card bg-warning text-white h-100 shadow">
                <div className="card-body text-center">
                  <h5>Đang thực hiện</h5>
                  <h2>{summary.ongoing}</h2>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card bg-success text-white h-100 shadow">
                <div className="card-body text-center">
                  <h5>Hoàn thành</h5>
                  <h2>{summary.completed}</h2>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card bg-danger text-white h-100 shadow">
                <div className="card-body text-center">
                  <h5>Quá hạn / Không đạt</h5>
                  <h2>{summary.overdue + summary.rejected}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* CHARTS + TOP PERFORMERS */}
          <div className="row g-4">
            {/* Pie Chart */}
            <div className="col-lg-6">
              <div className="card shadow h-100">
                <div className="card-header bg-white">
                  <h5 className="text-dark fw-bold">Tỷ lệ trạng thái</h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={statusBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {statusBreakdown.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Line Chart */}
            <div className="col-lg-6">
              <div className="card shadow h-100">
                <div className="card-header bg-white">
                  <h5 className="text-dark fw-bold">Hoạt động 7 ngày</h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart
                      data={dailyStats}
                      margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="created"
                        stroke="#007bff"
                        name="Tạo mới"
                        strokeWidth={3}
                        dot={{ r: 6 }}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="ongoing"
                        stroke="#ffc107"
                        name="Đang thực hiện"
                        strokeWidth={3}
                        dot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#28a745"
                        name="Hoàn thành"
                        strokeWidth={3}
                        dot={{ r: 6 }}
                      />

                      <Line
                        type="monotone"
                        dataKey="overdue"
                        stroke="#846d70ff"
                        name="Quá hạn"
                        strokeWidth={3}
                        dot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="rejected"
                        stroke="#ff0000ff"
                        name="Không đạt"
                        strokeWidth={3}
                        dot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top nhân viên */}
            {(isManager || isLeader) && topPerformers.length > 0 && (
              <div className="col-12 mt-4">
                <div className="card shadow">
                  <div className="card-header bg-white">
                    <h5 className="text-dark fw-bold">
                      Top nhân viên xuất sắc
                    </h5>
                  </div>
                  <div className="card-body">
                    {topPerformers.slice(0, 8).map((p, i) => (
                      <div
                        key={i}
                        className="d-flex justify-content-between align-items-center py-3 border-bottom"
                      >
                        <div className="d-flex align-items-center gap-3">
                          <span className="badge bg-warning text-dark fs-5">
                            {i + 1}
                          </span>
                          <strong className="fs-5">{p.name}</strong>
                        </div>
                        <div className="text-end">
                          <span className="text-success fw-bold fs-4">
                            {p.rate}%
                          </span>
                          <small className="text-muted ms-2">
                            ({p.completed}/{p.total})
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
