import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function TaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);

  useEffect(() => {
    api
      .get(`/tasks/${id}`)
      .then((res) => setTask(res.data))
      .catch(() => alert("Task không tồn tại hoặc đã bị xóa!"));
  }, [id]);

  if (!task)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <>
      <Header />
      <div className="container py-5">
        <div className="card shadow">
          <div className="card-body p-4">
            <h2 className="mb-4">{task.description}</h2>

            <div className="row">
              <div className="col-md-6">
                <p className="fw-bold text-primary">Ảnh TRƯỚC</p>
                <img
                  src={`http://127.0.0.1:5000${task.beforeImage}`}
                  className="img-fluid rounded shadow"
                />
              </div>
              {task.afterImage && (
                <div className="col-md-6">
                  <p className="fw-bold text-success">Ảnh SAU</p>
                  <img
                    src={`http://127.0.0.1:5000${task.afterImage}`}
                    className="img-fluid rounded shadow"
                  />
                </div>
              )}
            </div>

            <div className="mt-4">
              <p>
                <strong>Trạng thái:</strong>{" "}
                <span className="badge bg-success">Đã hoàn thành</span>
              </p>
              <Link to="/dashboard" className="btn btn-secondary">
                ← Quay lại
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
