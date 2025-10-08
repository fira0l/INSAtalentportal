import { useState, useEffect } from 'react';
import { supabase} from '../../lib/supabase';
import type{  NewsItem, Event } from '../../lib/supabase';
import { Plus, Edit, Trash2, Calendar, Newspaper, X } from 'lucide-react';

type TabType = 'news' | 'events';

export const NewsEventsManagement = () => {
  const [activeTab, setActiveTab] = useState<TabType>('news');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | Event | null>(null);

  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'announcement' as NewsItem['category'],
    is_featured: false,
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    link: '',
    category: 'workshop' as Event['category'],
    max_attendees: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: newsData }, { data: eventsData }] = await Promise.all([
      supabase.from('news').select('*').order('published_at', { ascending: false }),
      supabase.from('events').select('*').order('event_date', { ascending: false }),
    ]);

    if (newsData) setNews(newsData);
    if (eventsData) setEvents(eventsData);
    setLoading(false);
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem && 'content' in editingItem) {
      await supabase
        .from('news')
        .update(newsForm)
        .eq('id', editingItem.id);
    } else {
      await supabase.from('news').insert(newsForm);
    }

    resetForm();
    fetchData();
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem && 'event_date' in editingItem) {
      await supabase
        .from('events')
        .update(eventForm)
        .eq('id', editingItem.id);
    } else {
      await supabase.from('events').insert({ ...eventForm, status: 'upcoming' });
    }

    resetForm();
    fetchData();
  };

  const deleteNews = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news item?')) return;
    await supabase.from('news').delete().eq('id', id);
    fetchData();
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    await supabase.from('events').delete().eq('id', id);
    fetchData();
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingItem(null);
    setNewsForm({
      title: '',
      content: '',
      excerpt: '',
      category: 'announcement',
      is_featured: false,
    });
    setEventForm({
      title: '',
      description: '',
      event_date: '',
      location: '',
      link: '',
      category: 'workshop',
      max_attendees: 0,
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">News & Events Management</h2>
          <p className="text-gray-600">Create and manage news updates and events</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create {activeTab === 'news' ? 'News' : 'Event'}
        </button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('news')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'news'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Newspaper className="w-5 h-5 inline mr-2" />
          News ({news.length})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'events'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="w-5 h-5 inline mr-2" />
          Events ({events.length})
        </button>
      </div>

      {activeTab === 'news' ? (
        <div className="grid gap-4">
          {news.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No news items yet</p>
            </div>
          ) : (
            news.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      {item.is_featured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{item.excerpt}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span className="capitalize">{item.category}</span>
                      <span>•</span>
                      <span>{new Date(item.published_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => deleteNews(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {events.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No events yet</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-3">{event.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(event.event_date).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Location:</span>
                        <p className="font-medium text-gray-900">{event.location || 'TBA'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <p className="font-medium text-gray-900 capitalize">{event.category}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            event.status === 'upcoming'
                              ? 'bg-blue-100 text-blue-800'
                              : event.status === 'ongoing'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Create {activeTab === 'news' ? 'News' : 'Event'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {activeTab === 'news' ? (
                <form onSubmit={handleNewsSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                    <input
                      type="text"
                      value={newsForm.excerpt}
                      onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea
                      value={newsForm.content}
                      onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                      required
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newsForm.category}
                      onChange={(e) =>
                        setNewsForm({ ...newsForm, category: e.target.value as NewsItem['category'] })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    >
                      <option value="announcement">Announcement</option>
                      <option value="update">Update</option>
                      <option value="achievement">Achievement</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={newsForm.is_featured}
                      onChange={(e) => setNewsForm({ ...newsForm, is_featured: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                      Featured News
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Publish News
                  </button>
                </form>
              ) : (
                <form onSubmit={handleEventSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      required
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                      <input
                        type="datetime-local"
                        value={eventForm.event_date}
                        onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={eventForm.category}
                        onChange={(e) =>
                          setEventForm({ ...eventForm, category: e.target.value as Event['category'] })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      >
                        <option value="workshop">Workshop</option>
                        <option value="hackathon">Hackathon</option>
                        <option value="ceremony">Ceremony</option>
                        <option value="training">Training</option>
                        <option value="meeting">Meeting</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="Virtual / Physical address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Link</label>
                    <input
                      type="url"
                      value={eventForm.link}
                      onChange={(e) => setEventForm({ ...eventForm, link: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Attendees (0 = unlimited)</label>
                    <input
                      type="number"
                      value={eventForm.max_attendees}
                      onChange={(e) => setEventForm({ ...eventForm, max_attendees: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Event
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
