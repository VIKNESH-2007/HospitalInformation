import "./SelectBox.css";

function SelectBox({
label,
value,
onChange,
options
}){

return(

<div className="select-group">

<label>{label}</label>

<select
value={value}
onChange={onChange}
>

<option value="">Select</option>

{options.map((item,index)=>(

<option
key={index}
value={item}
>
{item}
</option>

))}

</select>

</div>

);

}

export default SelectBox;