import React, { useState, useEffect } from 'react';
import './stylesAdd.css'; 
import { Link } from 'react-router-dom';

function AddVolunteerPoints() {
  const [members, setMembers] = useState([]); // To store members data
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  // Simulated list of admins and leaders
  const adminsAndLeaders = ['Admin1', 'Leader1', 'Admin2', 'Leader2'];

  // List of maintenance teams and events
  const maintenanceTeams = ['Grounds and Gardens', 'Support Boat Maintenance', 'Storage Maintenance', 'Sail Training Boat Maintenance'];
  const maintenanceEvents = ['Busy Bee', 'Repairs', 'Cleaning', 'F Shed Drain repairs'];

  useEffect(() => {
    // Simulated data for the demo
    const demoMembers = [
      { id: 1, firstName: 'John', lastName: 'Doe' },
      { id: 2, firstName: 'Jane', lastName: 'Smith' },
      { id: 3, firstName: 'Bob', lastName: 'Brown' },
    ];
    setMembers(demoMembers);
  }, []);

  useEffect(() => {
    setFilteredMembers(
      members.filter(member =>
        member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.id.toString().includes(searchQuery)
      )
    );
  }, [searchQuery, members]);

  const handleSelectMember = (member) => {
    setSelectedMember({
      ...member,
      volunteerDate: '',
      maintenanceTeam: '',
      maintenanceEvent: '',
      startTime: '',
      endTime: '',
      volunteerHours: '',
      volunteerPoints: '',
      comments: '',
      editorName: '',
    });
  };

  const handleInputChange = (field, value) => {
    if (field === 'startTime' || field === 'endTime') {
      const start = new Date(`1970-01-01T${selectedMember.startTime}`);
      const end = new Date(`1970-01-01T${selectedMember.endTime}`);
      const hours = (end - start) / (1000 * 60 * 60);
      const points = Math.floor(hours * (20 / 3)); // Example: 20 points for 3 hours
      setSelectedMember(prevState => ({
        ...prevState,
        [field]: value,
        volunteerHours: hours,
        volunteerPoints: points,
      }));
    } else {
      setSelectedMember(prevState => ({
        ...prevState,
        [field]: value,
      }));
    }
  };

  const handleSave = () => {
    if (selectedMember) {
      setSelectedMember(prevState => ({
        ...prevState,
        editTime: new Date().toLocaleString(),
      }));
      console.log('Saving details for:', selectedMember);
      // Here, you'd typically send this data to your backend for saving
    } else {
      console.log('Please select a member');
    }
  };

  const handleEdit = (member) => {
    console.log('Editing:', member);
    // Logic to handle edit, populate fields with member's data
  };

  const handleDelete = (memberId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setFilteredMembers(filteredMembers.filter(member => member.id !== memberId));
      console.log('Deleted member with ID:', memberId);
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <img src="nyclogo.jpg" alt="Nedlands Yacht Club Logo" className="logo" />
        <h1>Nedlands Yacht Club</h1>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/WorkTeamManagement">Team Management</Link></li>
          <li><Link to="/membermanagement">Member Management</Link></li>
          <li><Link to="/events">Event</Link></li>
          <li><Link to="/VolunteerPoint">Volunteer Point</Link></li>
          <li><Link to="/reports">Report</Link></li>
          <li><Link to="/Admin">Admin</Link></li>
          <li><Link to="/">Logout</Link></li>
        </ul>
      </nav>

      <div className="add-volunteer-container">
        {/* Search Bar */}
        <input 
          type="text" 
          placeholder="Search by ID or Name" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />

        {/* Members Table */}
        <table className="volunteer-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Member ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Date</th>
              <th>Maintenance Team</th>
              <th>Maintenance Event</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Volunteering Hours</th>
              <th>Points</th>
              <th>Comments</th>
              <th>Edited By</th>
              <th>Edit Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(member => (
              <tr key={member.id}>
                <td>
                  <input 
                    type="radio" 
                    name="selectedMember" 
                    onChange={() => handleSelectMember(member)}
                  />
                </td>
                <td>{member.id}</td>
                <td>{member.firstName}</td>
                <td>{member.lastName}</td>
                <td>
                  <input 
                    type="date" 
                    value={selectedMember?.id === member.id ? selectedMember.volunteerDate : ''} 
                    onChange={(e) => handleInputChange('volunteerDate', e.target.value)} 
                    disabled={selectedMember?.id !== member.id}
                  />
                </td>
                <td>
                  <select 
                    value={selectedMember?.id === member.id ? selectedMember.maintenanceTeam : ''} 
                    onChange={(e) => handleInputChange('maintenanceTeam', e.target.value)} 
                    disabled={selectedMember?.id !== member.id}
                  >
                    <option value="">Select Team</option>
                    {maintenanceTeams.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select 
                    value={selectedMember?.id === member.id ? selectedMember.maintenanceEvent : ''} 
                    onChange={(e) => handleInputChange('maintenanceEvent', e.target.value)} 
                    disabled={selectedMember?.id !== member.id}
                  >
                    <option value="">Select Event</option>
                    {maintenanceEvents.map(event => (
                      <option key={event} value={event}>{event}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input 
                    type="time" 
                    value={selectedMember?.id === member.id ? selectedMember.startTime : ''} 
                    onChange={(e) => handleInputChange('startTime', e.target.value)} 
                    disabled={selectedMember?.id !== member.id}
                  />
                </td>
                <td>
                  <input 
                    type="time" 
                    value={selectedMember?.id === member.id ? selectedMember.endTime : ''} 
                    onChange={(e) => handleInputChange('endTime', e.target.value)} 
                    disabled={selectedMember?.id !== member.id}
                  />
                </td>
                <td>{selectedMember?.id === member.id ? selectedMember.volunteerHours : ''}</td>
                <td>{selectedMember?.id === member.id ? selectedMember.volunteerPoints : ''}</td>
                <td>
                  <input 
                    type="text" 
                    placeholder="Comments" 
                    value={selectedMember?.id === member.id ? selectedMember.comments : ''} 
                    onChange={(e) => handleInputChange('comments', e.target.value)} 
                    disabled={selectedMember?.id !== member.id}
                  />
                </td>
                <td>
                  <select 
                    value={selectedMember?.id === member.id ? selectedMember.editorName : ''}
                    onChange={(e) => handleInputChange('editorName', e.target.value)} 
                    disabled={selectedMember?.id !== member.id}
                  >
                    <option value="">Select Name</option>
                    {adminsAndLeaders.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </td>
                <td>{selectedMember?.id === member.id ? selectedMember.editTime : ''}</td>
                <td>
                  <button onClick={() => handleEdit(member)}>Edit</button>
                  <button onClick={handleSave} disabled={selectedMember?.id !== member.id}>Save</button>
                  <button onClick={() => handleDelete(member.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AddVolunteerPoints;
