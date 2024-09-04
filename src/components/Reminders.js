import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3001/reminders')
      .then(response => setReminders(response.data))
      .catch(error => console.error(error));
  }, []);

  const addReminder = () => {
    axios.post('http://localhost:3001/reminders', { title, description, date })
      .then(response => {
        setReminders([...reminders, response.data]);
        setTitle('');
        setDescription('');
        setDate('');
      })
      .catch(error => console.error(error));
  };

  const deleteReminder = id => {
    axios.delete(`http://localhost:3001/reminders/${id}`)
      .then(() => setReminders(reminders.filter(reminder => reminder.id !== id)))
      .catch(error => console.error(error));
  };

  const handleEdit = id => {
    const reminder = reminders.find(rem => rem.id === id);
    const newTitle = prompt('Editar título:', reminder.title);
    const newDescription = prompt('Editar descrição:', reminder.description);
    const newDate = prompt('Editar data (YYYY-MM-DD):', reminder.date.split('T')[0]); // Assumindo que a data está no formato ISO

    if (newTitle && newDescription && newDate) {
      axios.put(`http://localhost:3001/reminders/${id}`, { title: newTitle, description: newDescription, date: newDate })
        .then(response => {
          setReminders(reminders.map(reminder =>
            reminder.id === id ? response.data : reminder
          ));
        })
        .catch(error => console.error('Erro ao salvar a edição:', error));
    }
  };

  return (
    <div className="conteudo">
      <h1>Lembretes</h1>
      <div className="topo">
        <input 
          type="text" 
          placeholder="Adicione uma nova tarefa" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
        />
        <input 
          type="date" 
          placeholder="Adicione uma nova data" 
          value={date} 
          onChange={e => setDate(e.target.value)} 
        />
        <button onClick={addReminder}>
          <i className="fa fa-plus"></i>
        </button>
      </div>
      <ul id="ListaTarefas">
        {reminders.map(reminder => (
          <li key={reminder.id}>
            <div>
              <strong>{reminder.title}</strong><br/>
              {reminder.description}<br/>
              {new Date(reminder.date).toLocaleDateString()}
            </div>
            <button className="btnAcao2" onClick={() => deleteReminder(reminder.id)}>
              <i className="fa fa-trash"></i>
            </button>
            <button className="btnAcao2" onClick={() => handleEdit(reminder.id)}>
              <i className="fa fa-edit"></i>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reminders;
