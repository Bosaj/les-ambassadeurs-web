import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { FaCalendarPlus, FaNewspaper, FaMoneyBillWave, FaComments, FaSignOutAlt, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PostList = ({ type, data, onDelete, formData, setFormData, setFormType, handleFormSubmit }) => (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold capitalize">Manage {type}</h2>
        </div>

        {/* Add New Form */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
            <h3 className="font-bold mb-4">Add New {type === 'news' ? 'News Item' : 'Program'}</h3>
            <form onSubmit={(e) => { setFormType(type); handleFormSubmit(e); }} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <input
                        type="text" placeholder="Title" required
                        className="border p-2 rounded"
                        value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                    <input
                        type="date" required
                        className="border p-2 rounded"
                        value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>
                <input
                    type="url" placeholder="Image URL (e.g. from Pexels)" required
                    className="w-full border p-2 rounded"
                    value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })}
                />
                <textarea
                    placeholder="Description" required rows="3"
                    className="w-full border p-2 rounded"
                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
                <button type="submit" className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800">
                    Add {type === 'news' ? 'News' : 'Program'}
                </button>
            </form>
        </div>

        {/* List */}
        <table className="w-full text-left">
            <thead>
                <tr className="border-b">
                    <th className="pb-3">Image</th>
                    <th className="pb-3">Title</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Attendees</th>
                    <th className="pb-3 text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3">
                            <img src={item.image} alt="" className="h-10 w-16 object-cover rounded" />
                        </td>
                        <td className="py-3 font-medium">{item.title}</td>
                        <td className="py-3 text-gray-500">{item.date}</td>
                        <td className="py-3">{item.attendees.length}</td>
                        <td className="py-3 text-right">
                            <button onClick={() => onDelete(type, item.id)} className="text-red-500 hover:text-red-700 p-2 border rounded hover:bg-red-50">
                                <FaTrash />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const { news, programs, addPost, deletePost } = useData();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('news');

    // Form State
    const [formType, setFormType] = useState('news'); // 'news' or 'programs'
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        image: '',
        description: ''
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDelete = (type, id) => {
        if (window.confirm("Are you sure?")) {
            deletePost(type, id);
            toast.success("Item deleted");
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        addPost(formType, formData);
        toast.success(`${formType === 'news' ? 'News' : 'Program'} added successfully!`);
        setFormData({ title: '', date: '', image: '', description: '' });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-blue-900 text-white p-6 hidden md:block">
                <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
                <nav className="space-y-2">
                    <button onClick={() => setActiveTab('news')} className={`w-full text-left p-3 rounded flex items-center gap-3 ${activeTab === 'news' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}>
                        <FaNewspaper /> Manage News
                    </button>
                    <button onClick={() => setActiveTab('programs')} className={`w-full text-left p-3 rounded flex items-center gap-3 ${activeTab === 'programs' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}>
                        <FaCalendarPlus /> Manage Programs
                    </button>
                    <button onClick={() => setActiveTab('donations')} className={`w-full text-left p-3 rounded flex items-center gap-3 ${activeTab === 'donations' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}>
                        <FaMoneyBillWave /> Donations
                    </button>
                    <button onClick={() => setActiveTab('testimonials')} className={`w-full text-left p-3 rounded flex items-center gap-3 ${activeTab === 'testimonials' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}>
                        <FaComments /> Testimonials
                    </button>
                    <button onClick={handleLogout} className="w-full text-left p-3 rounded flex items-center gap-3 text-red-200 hover:bg-blue-800 mt-8">
                        <FaSignOutAlt /> Logout
                    </button>
                </nav>
            </aside>

            {/* Mobile Header / Content */}
            <div className="flex-1">
                <header className="bg-white shadow p-4 flex justify-between items-center md:hidden">
                    <h1 className="font-bold text-blue-900">Admin Dashboard</h1>
                    <button onClick={handleLogout}><FaSignOutAlt /></button>
                </header>

                <main className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}</h1>
                        <button onClick={handleLogout} className="hidden md:flex items-center gap-2 text-gray-600 hover:text-red-500">
                            Log out <FaSignOutAlt />
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        {activeTab === 'news' && <PostList type="news" data={news} onDelete={handleDelete} onAdd={addPost} formData={formData} setFormData={setFormData} setFormType={setFormType} handleFormSubmit={handleFormSubmit} />}
                        {activeTab === 'programs' && <PostList type="programs" data={programs} onDelete={handleDelete} onAdd={addPost} formData={formData} setFormData={setFormData} setFormType={setFormType} handleFormSubmit={handleFormSubmit} />}
                        {activeTab === 'donations' && <div className="text-gray-500 text-center py-10">Donation management coming soon...</div>}
                        {activeTab === 'testimonials' && <div className="text-gray-500 text-center py-10">Testimonial management coming soon...</div>}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
