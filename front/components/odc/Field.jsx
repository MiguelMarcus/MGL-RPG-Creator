export default function Field({ label, help, children, className = "" }) {
  return <label className={`field ${className}`}><span className="field-label">{label}</span>{children}{help && <span className="field-help">{help}</span>}</label>;
}
