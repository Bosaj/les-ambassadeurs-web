import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { FaCalendarPlus, FaNewspaper, FaMoneyBillWave, FaComments, FaSignOutAlt, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const PostList = ({ type, data, onDelete, formData, setFormData, setFormType, handleFormSubmit }) => (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold capitalize text-gray-800 dark:text-white">Manage {type}</h2>
        </div>

        {/* Add New Form */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-8 border border-gray-200 dark:border-gray-600">
            <h3 className="font-bold mb-4 text-gray-800 dark:text-white">Add New {type === 'news' ? 'News Item' : 'Program'}</h3>
            <form onSubmit={(e) => { setFormType(type); handleFormSubmit(e); }} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <input
                        type="text" placeholder="Title" required
                        className="border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                    <input
                        type="date" required
                        className="border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image</label>
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept="image/*"
                            className="block w-full text-sm text-gray-500 dark:text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100
                                dark:file:bg-gray-700 dark:file:text-white"
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                const toastId = toast.loading("Uploading image...");
                                try {
                                    const fileExt = file.name.split('.').pop();
                                    const fileName = `${Math.random()}.${fileExt}`;
                                    const filePath = `${type}/${fileName}`;

                                    const { error: uploadError } = await supabase.storage
                                        .from('images')
                                        .upload(filePath, file);

                                    if (uploadError) throw uploadError;

                                    const { data: { publicUrl } } = supabase.storage
                                        .from('images')
                                        .getPublicUrl(filePath);

                                    setFormData({ ...formData, image: publicUrl });
                                    toast.success("Image uploaded!", { id: toastId });
                                } catch (error) {
                                    console.error("Upload error:", error);
                                    toast.error("Upload failed", { id: toastId });
                                }
                            }}
                        />
                        {formData.image && (
                            <img src={formData.image} alt="Preview" className="h-10 w-10 object-cover rounded border" />
                        )}
                    </div>
                    <input
                        type="url" placeholder="Or paste Image URL"
                        className="w-full border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm"
                        value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })}
                    />
                </div>

                <textarea
                    placeholder="Description" required rows="3"
                    className="w-full border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
                <button type="submit" className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800 transition-colors">
                    Add {type === 'news' ? 'News' : 'Program'}
                </button>
            </form>
        </div>

        {/* List */}
        < div className="overflow-x-auto" >
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b dark:border-gray-700 text-gray-700 dark:text-gray-300">
                        <th className="pb-3">Image</th>
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Attendees</th>
                        <th className="pb-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-gray-800 dark:text-gray-200">
                    {data.map((item) => (
                        <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 transition-colors">
                            <td className="py-3">
                                <img src={item.image_url || item.image} alt="" className="h-10 w-16 object-cover rounded" />
                            </td>
                            <td className="py-3 font-medium">{item.title}</td>
                            <td className="py-3 text-gray-500 dark:text-gray-400">{item.date}</td>
                            <td className="py-3">{item.attendees.length}</td>
                            <td className="py-3 text-right">
                                <button onClick={() => onDelete(type, item.id)} className="text-red-500 hover:text-red-700 p-2 border rounded hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-red-800 transition-colors">
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    </div >
);

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const { news, programs, testimonials, addPost, deletePost } = useData();
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
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 bg-blue-900 dark:bg-gray-800 text-white p-6 hidden md:block transition-colors duration-300">
                <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
                <nav className="space-y-2">
                    <button onClick={() => setActiveTab('news')} className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'news' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaNewspaper /> Manage News
                    </button>
                    <button onClick={() => setActiveTab('programs')} className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'programs' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaCalendarPlus /> Manage Programs
                    </button>
                    <button onClick={() => setActiveTab('donations')} className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'donations' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaMoneyBillWave /> Donations
                    </button>
                    <button onClick={() => setActiveTab('testimonials')} className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'testimonials' ? 'bg-blue-800 dark:bg-gray-700' : 'hover:bg-blue-800 dark:hover:bg-gray-700'}`}>
                        <FaComments /> Testimonials
                    </button>
                    <button onClick={handleLogout} className="w-full text-left p-3 rounded flex items-center gap-3 text-red-200 hover:bg-blue-800 dark:hover:bg-gray-700 mt-8 transition-colors">
                        <FaSignOutAlt /> Logout
                    </button>
                </nav>
            </aside>

            {/* Mobile Header / Content */}
            <div className="flex-1">
                <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center md:hidden transition-colors duration-300">
                    <h1 className="font-bold text-blue-900 dark:text-white">Admin Dashboard</h1>
                    <button onClick={handleLogout} className="text-gray-600 dark:text-gray-300"><FaSignOutAlt /></button>
                </header>

                <main className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome, {user?.name}</h1>
                        <button onClick={handleLogout} className="hidden md:flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors">
                            Log out <FaSignOutAlt />
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
                        {activeTab === 'news' && <PostList type="news" data={news} onDelete={handleDelete} onAdd={addPost} formData={formData} setFormData={setFormData} setFormType={setFormType} handleFormSubmit={handleFormSubmit} />}
                        {activeTab === 'programs' && <PostList type="programs" data={programs} onDelete={handleDelete} onAdd={addPost} formData={formData} setFormData={setFormData} setFormType={setFormType} handleFormSubmit={handleFormSubmit} />}

                        {activeTab === 'testimonials' && (
                            <div>
                                <h3 className="font-bold mb-4 text-gray-800 dark:text-white">Add New Testimonial</h3>
                                <form onSubmit={(e) => { addPost('testimonials', formData); setFormData({ ...formData, name: '', role: '', content: '', image: '' }); e.preventDefault(); toast.success("Testimonial Added!"); }} className="space-y-4 mb-8 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input
                                            type="text" placeholder="Name" required
                                            className="border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                            value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        <input
                                            type="text" placeholder="Role (e.g. Volunteer)" required
                                            className="border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                            value={formData.role || ''} onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image</label>
                                        <div className="flex items-center gap-4">
                                            <input type="file" accept="image/*"
                                                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-white"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;
                                                    const toastId = toast.loading("Uploading...");
                                                    try {
                                                        const fileExt = file.name.split('.').pop();
                                                        const fileName = `testimonials/${Math.random()}.${fileExt}`;
                                                        const { error } = await supabase.storage.from('images').upload(fileName, file);
                                                        if (error) throw error;
                                                        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
                                                        setFormData({ ...formData, image: publicUrl });
                                                        toast.success("Uploaded!", { id: toastId });
                                                    } catch (err) { toast.error("Failed", { id: toastId }); }
                                                }}
                                            />
                                            {formData.image && <img src={formData.image} alt="Preview" className="h-10 w-10 object-cover rounded" />}
                                        </div>
                                    </div>
                                    <textarea placeholder="Content" required rows="3" className="w-full border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white" value={formData.content || ''} onChange={e => setFormData({ ...formData, content: e.target.value })}></textarea>
                                    <button type="submit" className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800 transition">Add Testimonial</button>
                                </form>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {testimonials.map(item => (
                                        <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow border dark:border-gray-700 flex flex-col">
                                            <div className="flex items-center gap-3 mb-3">
                                                <img src={item.image_url || 'https://via.placeholder.com/50'} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                <div>
                                                    <div className="font-bold text-sm text-gray-800 dark:text-white">{item.name}</div>
                                                    <div className="text-xs text-gray-500">{item.role}</div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 italic mb-4 flex-1">"{item.content}"</p>
                                            <button onClick={() => handleDelete('testimonials', item.id)} className="self-end text-red-500 text-sm hover:underline">Delete</button>
                                        </div>
                                    ))}
                                    {testimonials.length === 0 && <p className="col-span-full text-center text-gray-500">No testimonials yet.</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'donations' && <div className="text-gray-500 dark:text-gray-400 text-center py-10">Donation management coming soon... (Check Supabase Dashboard for now)</div>}
                    </div>
                </main>
            </div >
        </div >
    );
};

export default AdminDashboard;
