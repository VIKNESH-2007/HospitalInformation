import "./Alert.css";

function Alert({message,type}){

if(!message) return null;

return(

<div className={`alert ${type}`}>

{message}

</div>

);

}

export default Alert;