// client/src/pages/NewIssue.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../services/api";

export default function NewIssue() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    description: "",
    department: "",
    assignee: "",
    startDate: "",
    dueDate: "",
    beforeImage: null,
  });
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get("/auth/users");
        setUsers(userRes.data.data);
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        setCurrentUser(storedUser);
      } catch (err) {
        alert("Failed to load data");
      }
    };
    fetchData();
  }, []);

  const getEligibleAssignees = () => {
    const role = currentUser.role;
    const group = currentUser.group;

    if (role === "manager" || role === "a_manager") {
      return users.filter(
        (u) => u.department === "ME" && u._id !== currentUser.id
      );
    }
    if (role === "leader") {
      return users.filter(
        (u) =>
          u.department === "ME" &&
          u.group === group &&
          u.role === "member" &&
          u._id !== currentUser.id
      );
    }
    return [];
  };

  const eligibleAssignees = getEligibleAssignees();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eligibleAssignees.length) return alert("No permission!");

    const formData = new FormData();
    formData.append("title", form.description.slice(0, 50) || "ME Task");
    formData.append("description", form.description);
    formData.append("department", form.department);
    formData.append("assignee", form.assignee);
    formData.append("startDate", form.startDate);
    formData.append("dueDate", form.dueDate);
    if (form.beforeImage) formData.append("beforeImage", form.beforeImage);

    try {
      await api.post("/tasks", formData);
      alert("Task assigned!");
      navigate("/dashboard");
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Failed"));
    }
  };

  if (!["manager", "a_manager", "leader"].includes(currentUser.role)) {
    return (
      <>
        <Header />
        <div className="container py-5 text-center">
          <div className="alert alert-warning">No access</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />

      {/* MAIN CONTENT – TỰ ĐỘNG CO GIÃN */}
      <main className="flex-grow-1 bg-light py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-xl-5">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <h2 className="h5 text-center mb-4 text-success fw-bold">
                    {t("assign_task")} - ME
                  </h2>

                  <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">
                          Department
                        </label>
                        <select
                          className="form-select form-select-sm"
                          value={form.department}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              department: e.target.value,
                              assignee: "",
                            })
                          }
                          required
                        >
                          <option value="">Select</option>
                          <option value="ME">ME</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">
                          Assignee
                        </label>
                        <select
                          className="form-select form-select-sm"
                          value={form.assignee}
                          onChange={(e) =>
                            setForm({ ...form, assignee: e.target.value })
                          }
                          required
                          disabled={!eligibleAssignees.length}
                        >
                          <option value="">
                            {eligibleAssignees.length
                              ? "-- Select --"
                              : "No staff"}
                          </option>
                          {eligibleAssignees.map((u) => (
                            <option key={u._id} value={u._id}>
                              {u.name} ({u.role === "leader" ? "L" : "S"} -{" "}
                              {u.group})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="form-label small fw-semibold">
                        Description
                      </label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="3"
                        placeholder="Ex: Fix CNC #3..."
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="row g-3 mt-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">
                          Start Date
                        </label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={form.startDate}
                          onChange={(e) =>
                            setForm({ ...form, startDate: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">
                          Due Date
                        </label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={form.dueDate}
                          onChange={(e) =>
                            setForm({ ...form, dueDate: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="form-label small fw-semibold">
                        Before Image
                      </label>
                      <input
                        type="file"
                        className="form-control form-control-sm"
                        accept="image/*"
                        onChange={(e) =>
                          setForm({ ...form, beforeImage: e.target.files[0] })
                        }
                      />
                    </div>

                    <div className="d-flex justify-content-center gap-2 mt-4">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm px-3"
                        onClick={() => navigate("/dashboard")}
                      >
                        Home
                      </button>
                      <button
                        type="submit"
                        className="btn btn-success btn-sm px-3 fw-bold"
                        disabled={!eligibleAssignees.length}
                      >
                        Assign
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER DÍNH CHÂN */}
      <Footer />
    </div>
  );
}
