import './Preloader.css';

export default function Preloader() {
  const isDark = window.localStorage.getItem('lifefundies-theme') !== 'light';

  return (
    <div className="preloader-container">
      <div className="preloader-glow" aria-hidden="true" />
      <div className="preloader-content">
        <div className="preloader-logo-wrap">
          <img src={isDark ? '/logo-dark.png' : '/logo.png'} alt="LifeFundies" className="preloader-logo" />
          <div className="preloader-shimmer" aria-hidden="true" />
        </div>
        <div className="preloader-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
