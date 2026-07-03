const Loader = ({ label = "Loading..." }) => (
  <div className="flex items-center justify-center gap-3 py-12 text-navy/60">
    <span className="h-5 w-5 rounded-full border-2 border-navy/20 border-t-gold animate-spin" />
    <span className="text-sm">{label}</span>
  </div>
);

export default Loader;
