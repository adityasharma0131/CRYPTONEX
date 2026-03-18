import "./AmbientBg.css";

export default function AmbientBg({ variant = "dashboard" }) {
  if (variant === "home") {
    return (
      <>
        <div className="ambient-bg">
          <div className="a-orb a-orb-1"></div>
          <div className="a-orb a-orb-2"></div>
          <div className="a-orb a-orb-3"></div>
        </div>
        <div className="a-noise"></div>
        <div className="a-grid"></div>
      </>
    );
  }
  return (
    <div className="ambient-bg">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      {variant === "dashboard" && <div className="orb orb-3"></div>}
      <div className="noise-overlay"></div>
      <div className="grid-overlay"></div>
    </div>
  );
}
