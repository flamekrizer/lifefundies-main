import './Preloader.css';

export default function Preloader() {
  return (
    <div className="preloader-container">
      <div className="preloader-content">
        <div className="preloader-logo-wrap">
          <img src="./logo.png" alt="LifeFundies Logo" className="preloader-logo" />
        </div>
        <div className="preloader-spinner"></div>

      </div>
    </div>
  );
}
