import React from "react";
import { useTable } from "react-table";
import Modal from "./Modal";
import "./EventDetailsModal.css"; // Import the CSS styles for the modal

function EventDetailsModal({ isOpen, onClose, events, onEdit, onDelete }) {
  const data = React.useMemo(() => events, [events]);

  const columns = React.useMemo(
    () => [
      { Header: "Name", accessor: "name" },
      { Header: "Date", accessor: "date" },
      { Header: "Leader", accessor: "leader" },
      { Header: "Volunteers", accessor: "volunteers" },
      {
        Header: "Activities",
        accessor: "activities",
        Cell: ({ value }) => value.map((activity) => activity.name).join(", ") || "No activities"
      },
      {
        Header: "Actions",
        accessor: "id",
        Cell: ({ value }) => (
          <button className="delete-button" onClick={() => onDelete(value)}>
            Delete
          </button>
        )
      }
    ],
    [onDelete]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h2>Event History</h2>
        <button onClick={onClose} className="close-button">&times;</button>
      </div>

      <table {...getTableProps()} className="event-table">
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>

      {rows.length === 0 && <p>No events found.</p>}
    </Modal>
  );
}

export default EventDetailsModal;
