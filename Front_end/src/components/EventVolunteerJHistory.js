import { useLocation } from "react-router-dom";

function EventVolunteerHistory() {
  const { state } = useLocation();
  const history = state.history;

  return (
    <div>
      <h2>Event History</h2>
      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Points</th>
            <th>Hours</th>
            <th>Activity</th>
            <th>Created By</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.member}</td>
              <td>{entry.points}</td>
              <td>{entry.hours}</td>
              <td>{entry.activity || "No activity"}</td>
              <td>{entry.created_by}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EventVolunteerHistory;
