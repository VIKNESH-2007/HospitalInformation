import "./InputField.css";

function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder
}) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e)=>onChange(e.target.value)}
      />
    </div>
  );
}

export default InputField;