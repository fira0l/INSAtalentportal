import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type {  NewsItem, Event } from '../lib/supabase';
import { Newspaper, Calendar, MapPin, ArrowRight, ExternalLink } from 'lucide-react';

export const NewsEventsPage = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'events'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const [{ data: newsData }, { data: eventsData }] = await Promise.all([
      supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false }),
      supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .in('status', ['upcoming', 'ongoing'])
        .order('event_date', { ascending: true }),
    ]);

    if (newsData) setNews(newsData);
    if (eventsData) setEvents(eventsData);
    setLoading(false);
  };

  const featuredNews = news.filter((item) => item.is_featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Talent Portal</h1>
            <div className="flex gap-3">
              <Link
                to="/signin"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">News & Events</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Stay updated with the latest announcements, achievements, and upcoming events
          </p>
        </div>
      </div>

      {featuredNews.length > 0 && (
        <div className="bg-white py-12 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured News</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredNews.map((item) => (
                <div
                  key={item.id}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200"
                >
                  <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded-full">
                    Featured
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">{item.title}</h3>
                  <p className="text-gray-700 mb-4">{item.excerpt}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(item.published_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'all'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Updates
          </button>
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

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {(activeTab === 'all' || activeTab === 'events') &&
              events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full capitalize">
                      {event.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-4">{event.description}</p>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        {new Date(event.event_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>

                  {event.link && (
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Learn More
                    </a>
                  )}
                </div>
              ))}

            {(activeTab === 'all' || activeTab === 'news') &&
              news
                .filter((item) => !item.is_featured || activeTab === 'news')
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Newspaper className="w-5 h-5 text-blue-600" />
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full capitalize">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    {item.excerpt && <p className="text-gray-600 mb-4">{item.excerpt}</p>}
                    <p className="text-sm text-gray-500">
                      {new Date(item.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
          </div>
        )}

        {!loading &&
          ((activeTab === 'all' && news.length === 0 && events.length === 0) ||
            (activeTab === 'news' && news.length === 0) ||
            (activeTab === 'events' && events.length === 0)) && (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">No content available at the moment</p>
            </div>
          )}
      </div>

      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Join the Talent Portal</h2>
          <p className="text-gray-400 mb-6">
            Sign up today to access exclusive resources, events, and certificates
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </footer>
    </div>
  );
};
