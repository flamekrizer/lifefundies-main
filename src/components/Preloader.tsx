import './Preloader.css';

export default function Preloader() {
  return (
    <div className="preloader-container">
      <div className="preloader-content">
        <div className="preloader-logo-wrap">
          <span className="preloader-emoji">🌿</span>
        </div>
        <div className="preloader-spinner"></div>
        <h3 className="preloader-title">LifeFundies</h3>
        <p className="preloader-subtitle text-muted">Securing your session...</p>
      </div>
    </div>
  );
}
