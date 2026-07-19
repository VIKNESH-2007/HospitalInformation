import "./Table.css";
import Button from "./Button";

function Table({ data }) {
  return (
    <table className="hospital-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Department</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.name}</td>
            <td>{item.department}</td>
            <td>
              <Button text="View" />
              <Button text="Edit" type="success" />
              <Button text="Delete" type="danger" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;