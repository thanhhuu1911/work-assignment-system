// client/src/pages/Statistics.jsx
import { useState, useEffect, useMemo } from "react";
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
import html2canvas from "html2canvas";
import PptxGenJS from "pptxgenjs";
// const STATUS_COLORS = {
//   "Đang thực hiện": "#ffc107",
//   "Hoàn thành": "#28a745",
//   "Quá hạn": "#dc3545",
//   "Không đạt": "#808080ff",
// };

const STATUS_COLOR_MAPPING = {
  ongoing: "#ffc107",
  completed: "#28a745",
  overdue: "#dc3545",
  rejected: "#808080ff",
};

export default function Statistics() {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const isManager = ["manager", "a_manager"].includes(user.role);
  const isLeader = user.role === "leader";
  const isMember = user.role === "member";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [groupFilter, setGroupFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [dateRange, setDateRange] = useState(
    isLeader || isMember ? "last_7_days" : "this_month"
  );

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
      showToast("Lỗi tải thống kê", "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const exportToPPT = async () => {
    if (loading || !stats) {
      showToast("Chưa tải xong dữ liệu", "warning");
      return;
    }

    // Ẩn các phần không muốn xuất
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    const titleAndButtonsRow = document.querySelector(
      ".d-flex.justify-content-between.align-items-center.mb-4"
    );
    const rankingSection = document.querySelector(".row.mt-5"); // Phần Ranking (có class mt-5)

    if (header) header.style.display = "none";
    if (footer) footer.style.display = "none";
    if (titleAndButtonsRow) titleAndButtonsRow.style.display = "none";
    if (rankingSection) rankingSection.style.display = "none";

    // Khu vực cần chụp: từ container-fluid đến hết 2 biểu đồ
    const captureArea = document.querySelector("main .container-fluid");

    // Tăng padding và background trắng để đẹp khi xuất
    const originalPadding = captureArea.style.padding;
    const originalBackground = captureArea.style.background;
    captureArea.style.padding = "3rem 2rem";
    captureArea.style.background = "#ffffff";

    try {
      const canvas = await html2canvas(captureArea, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollY: -window.scrollY, // Đảm bảo chụp đúng vị trí
      });

      const imgData = canvas.toDataURL("image/png");

      // Tạo PPT
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_16x9";

      // Slide 1: Cover
      const coverSlide = pptx.addSlide();
      coverSlide.background = { color: "FFFFFF" };
      coverSlide.addText(t("STATISTICS"), {
        x: 0.5,
        y: 1.8,
        w: "90%",
        fontSize: 56,
        color: "1C2526",
        bold: true,
        align: "center",
      });
      const today = new Date().toLocaleDateString("vi-VN");
      coverSlide.addText(
        `${t("ME_Department")}\n${t("Export_Date")}: ${today}`,
        {
          x: 0.5,
          y: 3.5,
          w: "90%",
          fontSize: 32,
          color: "1C2526",
          align: "center",
          lineSpacing: 40,
        }
      );

      // Slide 2: Chỉ nội dung thống kê đến 2 biểu đồ
      const statsSlide = pptx.addSlide();
      statsSlide.addImage({
        data: imgData,
        x: 0.5,
        y: 0.6,
        w: "93%",
        h: "80%",
        sizing: { type: "contain" },
      });

      // Tải file
      pptx.writeFile({
        fileName: `Statistics_Department_ME_${today.replace(/\//g, "-")}.pptx`,
      });
      showToast("Xuất PPT thành công!", "success");
    } catch (err) {
      console.error("Lỗi xuất PPT:", err);
      showToast("Lỗi xuất PPT", "error");
    } finally {
      // Khôi phục UI
      if (header) header.style.display = "";
      if (footer) footer.style.display = "";
      if (titleAndButtonsRow) titleAndButtonsRow.style.display = "";
      if (rankingSection) rankingSection.style.display = "";
      captureArea.style.padding = originalPadding;
      captureArea.style.background = originalBackground;
    }
  };
  useEffect(() => {
    fetchStats();
  }, [groupFilter, userFilter, dateRange]);

  // Reset filter khi đổi nhóm → tránh chọn user không thuộc nhóm
  useEffect(() => {
    setUserFilter("all");
  }, [groupFilter]);

  // Lọc user theo nhóm đã chọn
  const filteredUsers = useMemo(() => {
    if (!stats?.availableUsers) return [];
    if (groupFilter === "all") return stats.availableUsers;
    return stats.availableUsers.filter((u) => u.group === groupFilter);
  }, [stats?.availableUsers, groupFilter]);

  if (loading)
    return (
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div
            className="spinner-border text-primary"
            style={{ width: "4rem", height: "4rem" }}
          />
        </main>
        <Footer />
      </div>
    );
  if (!stats) return null;

  const {
    summary,
    statusBreakdown,
    dailyStats,
    topPerformers,
    availableGroups,
  } = stats;

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 bg-light py-4">
        <div className="container-fluid py-1 d-flex flex-column h-100">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-primary fw-bold">
              {isMember
                ? t("personal_stats")
                : isLeader
                ? t("group_stats", { group: user.group })
                : t("department_stats")}
            </h2>

            <div className="d-flex justify-content-end gap-3 mb-4">
              {/* Nút Home */}
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
                {t("home")}
              </button>

              {/* Nút Reset */}
              <button
                type="button"
                onClick={() => {
                  setGroupFilter("all");
                  setUserFilter("all");
                  const defaultPeriod =
                    isLeader || isMember ? "last_7_days" : "this_month";
                  setDateRange(defaultPeriod);
                  fetchStats();
                }}
                className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm fw-semibold border-2"
                style={{ minWidth: "130px" }}
              >
                <img
                  src="/reset.png"
                  alt="reset"
                  style={{ width: "25px", height: "25px" }}
                />
                {t("reset")}
              </button>

              <button
                onClick={exportToPPT}
                disabled={loading || !stats}
                className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm fw-semibold"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M8.5 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm3 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-6 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" />
                  <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z" />
                  <path d="M5.5 4h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zm0 2h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zm0 2h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1z" />
                </svg>
                {t("export_ppt") || "Xuất PowerPoint"}
              </button>
            </div>
          </div>

          {/* MANAGER: Full filter */}
          {isManager && (
            <div className="card shadow-sm mb-4 border-0">
              <div className="card-body p-4">
                <div className="row g-4">
                  <div className="col-lg-4">
                    <label className="form-label fw-bold text-dark">
                      {t("group")}
                    </label>
                    <select
                      className="form-select form-select-lg rounded-pill shadow-sm"
                      value={groupFilter}
                      onChange={(e) => setGroupFilter(e.target.value)}
                    >
                      <option value="all">{t("all_group")}</option>
                      {availableGroups.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-lg-4">
                    <label className="form-label fw-bold text-dark">
                      {t("employee")}
                    </label>
                    <select
                      className="form-select form-select-lg rounded-pill shadow-sm"
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                    >
                      <option value="all">{t("all_employee")}</option>
                      {filteredUsers.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-lg-4">
                    <label className="form-label fw-bold text-dark">
                      {t("time_period")}
                    </label>
                    <select
                      className="form-select form-select-lg rounded-pill shadow-sm"
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                    >
                      <option value="last_7_days">{t("last_7_days")}</option>{" "}
                      {/* 7 ngày gần nhất */}
                      <option value="this_month">{t("this_month")}</option>{" "}
                      {/* Tháng này */}
                      <option value="last_month">{t("last_month")}</option>{" "}
                      {/* Tháng trước */}
                      <option value="this_year">{t("this_year")}</option>{" "}
                      {/* Năm này */}
                      <option value="last_year">{t("last_year")}</option>{" "}
                      {/* Năm trước */}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LEADER: Chỉ lọc nhân viên trong nhóm + thời gian */}
          {isLeader && (
            <div className="card shadow-sm mb-4 border-0">
              <div className="card-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark">
                      {t("team_employee")}
                    </label>
                    <select
                      className="form-select form-select-lg rounded-pill shadow-sm"
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                    >
                      <option value="all">
                        {t("all_team_employee")} {user.group}
                      </option>
                      {stats.availableUsers.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark">
                      {t("time_period")}
                    </label>
                    <select
                      className="form-select form-select-lg rounded-pill shadow-sm"
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                    >
                      <option value="last_7_days">{t("last_7_days")}</option>{" "}
                      {/* 7 ngày gần nhất */}
                      <option value="this_month">{t("this_month")}</option>{" "}
                      {/* Tháng này */}
                      <option value="last_month">{t("last_month")}</option>{" "}
                      {/* Tháng trước */}
                      <option value="this_year">{t("this_year")}</option>{" "}
                      {/* Năm này */}
                      <option value="last_year">{t("last_year")}</option>{" "}
                      {/* Năm trước */}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MEMBER: Không có filter nào cả */}

          {/* ==================== KPI CARDS ==================== */}
          <div className="row g-4 mb-5">
            {[
              {
                label: t("total_tasks"),
                value: summary.total,
                color: "primary",
              },
              {
                label: t("task_ongoing"),
                value: summary.ongoing,
                color: "warning",
              },
              {
                label: t("completed"),
                value: summary.completed,
                color: "success",
              },
              {
                label: t("overdue"),
                value: summary.overdue,
                color: "danger",
              },
              {
                label: t("rejected"),
                value: summary.rejected,
                color: "secondary",
              },
            ].map((item, i) => (
              <div key={i} className="col-6 col-md-4 col-lg">
                <div
                  className={`card text-white shadow h-100 bg-${item.color}`}
                >
                  <div className="card-body text-center py-4">
                    <h5 className="fw-light mb-2">{item.label}</h5>
                    <h2 className="display-5 fw-bold">{item.value}</h2>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ==================== CHARTS ==================== */}
          <div className="row g-4">
            {/* Line Chart - Hoạt động theo ngày */}
            <div className="col-lg-7">
              <div className="card shadow h-100">
                <div className="card-header bg-white border-0">
                  <h5 className="mb-0 fw-bold">{t("daily_activity")}</h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={380}>
                    <LineChart
                      data={dailyStats}
                      key={`${groupFilter}-${userFilter}-${dateRange}`}
                    >
                      <CartesianGrid strokeDasharray="4 4" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="created"
                        stroke="#007bff"
                        name={t("task_created")}
                        strokeWidth={3}
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#28a745"
                        name={t("task_completed")}
                        strokeWidth={3}
                      />
                      <Line
                        type="monotone"
                        dataKey="ongoing"
                        stroke="#ffc107"
                        name={t("task_ongoing")}
                        strokeWidth={3}
                      />
                      <Line
                        type="monotone"
                        dataKey="overdue"
                        stroke="#dc3545"
                        name={t("task_overdue")}
                        strokeWidth={3}
                      />
                      <Line
                        type="monotone"
                        dataKey="rejected"
                        stroke="#6c757d"
                        name={t("task_rejected")}
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Pie Chart - Tỷ lệ trạng thái */}
            <div className="col-lg-5">
              <div className="card shadow h-100">
                <div className="card-header bg-white border-0">
                  <h5 className="mb-0 fw-bold">{t("status_distribution")}</h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={380}>
                    <PieChart key={`${groupFilter}-${userFilter}-${dateRange}`}>
                      <Pie
                        data={statusBreakdown}
                        dataKey="value"
                        // nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        // label={({ name, value }) => `${name}: ${value}`}
                        label={({ key, value }) =>
                          `${t(`task_${key}`)}: ${value}`
                        }
                      >
                        {statusBreakdown.map((entry, i) => (
                          <Cell
                            key={i}
                            // fill={STATUS_COLORS[entry.name] || "#888"}
                            fill={STATUS_COLOR_MAPPING[entry.key] || "#888"}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const { key, value } = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded shadow-sm">
                                <p className="font-semibold text-dark">
                                  {t(`task_${key}`)}
                                </p>
                                <p className="text-muted">
                                  {t("tasks_count", { count: value })}{" "}
                                  {/* Tùy chọn: thêm key dịch số lượng */}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== TOP PERFORMERS (Chỉ Manager & Leader) ==================== */}
          {(isManager || isLeader) && topPerformers.length > 0 && (
            <div className="row mt-5">
              <div className="col-12">
                <div className="card shadow">
                  <div className="card-header bg-white border-0">
                    <h4 className="mb-0 fw-bold text-primary">
                      {t("statistics_ranking_title", {
                        context: isLeader ? "group" : "department",
                        group: isLeader ? user.group : null,
                      })}
                    </h4>
                  </div>
                  <div className="card-body">
                    {topPerformers.map((p, i) => (
                      <div
                        key={i}
                        className="d-flex justify-content-between align-items-center py-4 border-bottom"
                      >
                        <div className="d-flex align-items-center gap-4">
                          <div
                            className="badge bg-warning text-dark rounded-pill fw-bold"
                            style={{
                              width: 50,
                              height: 50,
                              fontSize: "1.4rem",
                            }}
                          >
                            {i + 1}
                          </div>
                          <h5 className="mb-0 fw-bold">{p.name}</h5>
                        </div>
                        <div className="text-end">
                          <span className="text-success fw-bold fs-3">
                            {p.rate}%
                          </span>
                          <small className="text-muted d-block">
                            ({p.completed} / {p.total} {t("task")})
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
