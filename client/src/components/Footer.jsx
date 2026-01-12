// client/src/components/Footer.jsx

export default function Footer() {
  return (
    <>
      {/* ĐẨY FOOTER XUỐNG DƯỚI BẰNG FLEX */}
      <div className="flex-grow-1"></div>

      <footer className="bg-dark text-white py-4 mt-auto">
        <div className="container-fluid text-center">
          <p className="mb-2 small text-light">
            © 2025 Work Assignment System. All rights reserved.
          </p>
          <p className="mb-3 small text-light">
            Contact: thanhhuu123455@gmail.com | Hotline: 0368206517
          </p>
        </div>
      </footer>

      {/* CSS TOÀN CỤC – CHỈ CẦN 1 LẦN */}
      <style>{`
        html,
        body,
        #root {
          height: 100%;
          margin: 0;
          padding: 0;
        }
        #root > div {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </>
  );
}
