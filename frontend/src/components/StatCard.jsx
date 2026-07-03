const StatCard = ({ label, value, accent = false }) => (
  <div className="card flex flex-col gap-1">
    <span className="text-sm text-navy/60">{label}</span>
    <span className={`font-display text-3xl font-semibold ${accent ? "text-gold-dark" : "text-navy"}`}>
      {value}
    </span>
  </div>
);

export default StatCard;
