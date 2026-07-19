import "./DatePicker.css";

function DatePicker({
label,
value,
onChange
}){

return(

<div className="date-group">

<label>{label}</label>

<input
type="date"
value={value}
onChange={onChange}
/>

</div>

);

}

export default DatePicker;