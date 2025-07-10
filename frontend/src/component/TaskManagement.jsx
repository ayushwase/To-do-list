import React, { useEffect, useState } from 'react';
import { ChevronDown, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { getTasks, createTask, deleteTask, updateTask } from '../service/taskService';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [newTask, setNewTask] = useState({
    assignedTo: '',
    status: 'Not Started',
    dueDate: '',
    priority: 'Normal',
    description: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setNewTask(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600';
      case 'In Progress': return 'text-blue-600';
      case 'Not Started': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Normal': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleNewTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createTask(newTask);
      setTasks([...tasks, response.data]);
      resetForm();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleEditTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateTask(taskToEdit.id, newTask);
      const updatedTasks = tasks.map(task => task.id === taskToEdit.id ? response.data : task);
      setTasks(updatedTasks);
      resetForm();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
    setShowDropdown(null);
  };

  const handleEditClick = (task) => {
    setTaskToEdit(task);
    setNewTask({
      assignedTo: task.assignedTo,
      status: task.status,
      dueDate: task.dueDate,
      priority: task.priority,
      description: task.description
    });
    setShowEditModal(true);
    setShowDropdown(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTask(taskToDelete.id);
      setTasks(tasks.filter(task => task.id !== taskToDelete.id));
      setShowDeleteModal(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
  };

  const resetForm = () => {
    setNewTask({ assignedTo: '', status: 'Not Started', dueDate: '', priority: 'Normal', description: '' });
    setShowNewTaskModal(false);
  };

  const TaskModal = ({ onSubmit, title, show, onClose }) => (
    show ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={onSubmit} className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                <select value={newTask.assignedTo} onChange={(e) => handleInputChange('assignedTo', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required>
                  <option value="">Select User</option>
                  <option value="User 1">User 1</option>
                  <option value="User 2">User 2</option>
                  <option value="User 3">User 3</option>
                  <option value="User 4">User 4</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select value={newTask.status} onChange={(e) => handleInputChange('status', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input type="date" value={newTask.dueDate} onChange={(e) => handleInputChange('dueDate', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select value={newTask.priority} onChange={(e) => handleInputChange('priority', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea value={newTask.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={4} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter task description..." />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-yellow-200 text-gray-700 rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-gray-500 text-white rounded">Save</button>
            </div>
          </form>
        </div>
      </div>
    ) : null
  );

  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="bg-red-600 text-white p-4 rounded-t-lg">
          <h2 className="text-lg font-semibold text-center">Delete</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-700 text-center mb-6">
            Do you want to delete task {taskToDelete?.assignedTo}?
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={handleDeleteCancel} className="px-4 py-2 bg-gray-400 text-white rounded">No</button>
            <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-yellow-200 text-gray-700 rounded">Yes</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <div className="text-white text-sm">☰</div>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Tasks</h1>
            <p className="text-sm text-gray-600">All Tasks</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowNewTaskModal(true)} className="px-4 py-2 bg-yellow-200 text-gray-700 rounded">New Task</button>
          <button onClick={fetchTasks} className="px-4 py-2 bg-yellow-200 text-gray-700 rounded">Refresh</button>
        </div>
      </div>
      <div className="text-sm text-gray-600 mb-4">{tasks.length} records</div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
           <thead>
            <tr className="bg-gray-50">
              <th className="p-3 border-b"><input type="checkbox" className="rounded" /></th>
              <th className="p-3 border-b text-gray-700 font-medium">Assigned To</th>
              <th className="p-3 border-b text-gray-700 font-medium">Status</th>
              <th className="p-3 border-b text-gray-700 font-medium">Due Date</th>
              <th className="p-3 border-b text-gray-700 font-medium">Priority</th>
              <th className="p-3 border-b text-gray-700 font-medium">Comments</th>
              <th className="p-3 border-b text-gray-700 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="p-3 border-b"><input type="checkbox" className="rounded" /></td>
                <td className="p-3 border-b text-blue-600">{task.assignedTo}</td>
                <td className={`p-3 border-b ${getStatusColor(task.status)}`}>{task.status}</td>
                <td className="p-3 border-b text-gray-700">{task.dueDate}</td>
                <td className={`p-3 border-b ${getPriorityColor(task.priority)}`}>{task.priority}</td>
                <td className="p-3 border-b text-gray-700">{task.description}</td>
              
                 <td className="p-3 border-b text-gray-700 relative">
                  <div className="flex items-center justify-between">
                    {/* {index === 1 && ( */}
                    <div className="relative">
                      <button onClick={() => setShowDropdown(showDropdown === task.id ? null : task.id)} className="ml-2 p-1 hover:bg-gray-100 rounded">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      {showDropdown === task.id && (
                        <div className="absolute right-0 top-8 bg-yellow-100 border border-yellow-300 rounded shadow-lg z-10 min-w-16">
                          <button onClick={() => handleEditClick(task)} className="mr-2 text-blue-600 hover:underline">Edit</button>
                          <button onClick={() => handleDeleteClick(task)} className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-yellow-200">Delete</button>
                        </div>
                      )}
                    </div>
                    {/* )} */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">20</span>
          <select className="border border-gray-300 rounded px-2 py-1 text-sm">
            <option>20</option>
            <option>50</option>
            <option>100</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center gap-1"><ChevronsLeft className="h-3 w-3" /> First</button>
          <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center gap-1"><ChevronLeft className="h-3 w-3" /> Prev</button>
          <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm">1</span>
          <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center gap-1">Next <ChevronRight className="h-3 w-3" /></button>
          <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center gap-1">Last <ChevronsRight className="h-3 w-3" /></button>
        </div>
      </div>
      <TaskModal
        title="New Task"
        show={showNewTaskModal}
        onSubmit={handleNewTaskSubmit}
        onClose={() => setShowNewTaskModal(false)}
      />
      <TaskModal
        title="Edit Task"
        show={showEditModal}
        onSubmit={handleEditTaskSubmit}
        onClose={() => setShowEditModal(false)}
      />
      {showDeleteModal && <DeleteConfirmationModal />}
    </div>
  );
};

export default TaskManagement;
