import React from 'react';
import {
    FaCalendarPlus, FaNewspaper, FaHandHoldingHeart, FaCalendarCheck,
    FaSearch, FaPlus, FaThumbtack, FaTrash, FaHandshake
} from 'react-icons/fa';

const PostList = ({ type, data, onDelete, togglePin, onEdit, t, onAdd, searchTerm, setSearchTerm, activeLang }) => {

    // Filter data based on search term
    const filteredData = data.filter(item => {
        if (!searchTerm) return true;

        const term = searchTerm.toLowerCase();
        const title = (item.title?.en || item.title?.fr || item.title?.ar || item.title || item.name || '').toLowerCase();
        const desc = (item.description?.en || item.description?.fr || item.description?.ar || item.description || item.website_url || '').toLowerCase();
        return title.includes(term) || desc.includes(term);
    });

    return (
        <div>
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold capitalize text-gray-800 dark:text-white flex items-center gap-2">
                    {type === 'news' ? <FaNewspaper /> : (type === 'events' ? <FaCalendarCheck /> : (type === 'projects' ? <FaHandHoldingHeart /> : (type === 'partners' ? <FaHandshake /> : <FaCalendarPlus />)))}
                    {t.manage} {type === 'news' ? t.tab_news : (type === 'events' ? t.tab_events : (type === 'projects' ? (t.projects_section_title || "Projects") : (type === 'partners' ? (t.tab_partners || "Partners") : t.tab_programs)))}
                </h2>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t.search_placeholder || "Search..."}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg font-medium whitespace-nowrap"
                    >
                        <FaPlus size={14} />
                        {type === 'news' ? t.add_new_news : (type === 'events' ? t.add_new_event : (type === 'projects' ? (t.add_new_project || "Add Project") : (type === 'partners' ? (t.add_new_partner || "Add Partner") : t.add_new_program)))}
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <table className="w-full text-left min-w-[800px]">
                    <thead>
                        <tr className="border-b dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50">
                            <th className="p-4 whitespace-nowrap font-semibold">{t.table_image || "Image"}</th>
                            <th className="p-4 min-w-[30%] font-semibold">{type === 'partners' ? (t.partner_name || "Partner Name") : (t.table_title || "Title")}</th>
                            {type !== 'partners' && <th className="p-4 whitespace-nowrap font-semibold">{t.table_date || "Date"}</th>}
                            <th className="p-4 whitespace-nowrap font-semibold">{type === 'partners' ? (t.partner_website || "Website") : (t.location || "Location")}</th>
                            {type === 'events' && <th className="p-4 whitespace-nowrap font-semibold">{t.attendees || "Attendees"}</th>}
                            {type === 'programs' && <th className="p-4 whitespace-nowrap font-semibold">{t.joined || "Joined"}</th>}
                            {type === 'projects' && <th className="p-4 whitespace-nowrap font-semibold">{t.supported || "Supported"}</th>}
                            {type === 'partners' && <th className="p-4 whitespace-nowrap font-semibold"></th>}
                            <th className="p-4 whitespace-nowrap text-center font-semibold">{t.pin_item || "Pin"}</th>
                            <th className="p-4 whitespace-nowrap text-right font-semibold">{t.table_actions || "Actions"}</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-800 dark:text-gray-200 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredData.length > 0 ? filteredData.map((item) => (
                            <tr key={item.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group">
                                <td className="p-4 whitespace-nowrap">
                                    <div className="relative w-16 h-10 rounded overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                                        <img src={item.image_url || item.image || "https://via.placeholder.com/150"} alt="" className="w-full h-full object-cover" />
                                    </div>
                                </td>
                                <td className="p-4 font-medium">
                                    <p className="line-clamp-1">{(item.title?.[activeLang] || item.title?.en || item.title?.fr || item.title?.ar || item.name || (typeof item.title === 'string' ? item.title : '') || (t.untitled || 'Untitled'))}</p>
                                </td>
                                {type !== 'partners' && <td className="p-4 whitespace-nowrap text-gray-500 dark:text-gray-400 text-sm">
                                    {item.date ? new Date(item.date).toLocaleDateString() : '-'}
                                </td>}
                                <td className="p-4 text-gray-500 dark:text-gray-400 text-sm font-medium">
                                    {type === 'partners' ? (
                                        <a href={item.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{item.website_url || '-'}</a>
                                    ) : (
                                        (item.location?.[activeLang] || item.location?.en || item.location?.fr || item.location?.ar || (typeof item.location === 'string' ? item.location : '-'))
                                    )}
                                </td>
                                {type === 'events' && <td className="p-4 whitespace-nowrap text-center text-sm">{item.attendees?.filter(a => a.status !== 'rejected').length || 0}</td>}
                                {(type === 'programs' || type === 'projects') && <td className="p-4 whitespace-nowrap text-center text-sm">{item.attendees?.filter(a => a.status !== 'rejected').length || 0}</td>}
                                {type === 'partners' && <td className="p-4"></td>}
                                <td className="p-4 whitespace-nowrap text-center">
                                    <button
                                        onClick={() => togglePin(type, item.id, item.is_pinned)}
                                        className={`p-2 rounded-full transition-all ${item.is_pinned ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500'}`}
                                        title={item.is_pinned ? (t.unpin || "Unpin") : (t.pin_to_top || "Pin to top")}
                                    >
                                        <FaThumbtack size={14} />
                                    </button>
                                </td>
                                <td className="p-4 whitespace-nowrap text-right">
                                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onEdit(item)} className="text-blue-500 hover:text-blue-700 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors" title={t.edit_btn}>
                                            <FaNewspaper size={14} />
                                        </button>
                                        <button onClick={() => onDelete(type, item.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors" title={t.delete_btn}>
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    {t.no_items_found || "No items found."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PostList;
