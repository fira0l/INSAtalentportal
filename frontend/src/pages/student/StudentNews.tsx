import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type{ NewsItem, Event, EventRegistration } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';
import { Newspaper, Calendar, MapPin, ExternalLink, CheckCircle } from 'lucide-react';

export const StudentNews = () => {
  const { user } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);

    const [{ data: newsData }, { data: eventsData }, { data: regsData }] = await Promise.all([
      supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(10),
      supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .eq('status', 'upcoming')
        .order('event_date', { ascending: true }),
      user
        ? supabase
            .from('event_registrations')
            .select('event_id')
            .eq('student_id', user.id)
        : { data: null },
    ]);

    if (newsData) setNews(newsData);
    if (eventsData) setEvents(eventsData);
    if (regsData) {
      setRegistrations(new Set(regsData.map((r: any) => r.event_id)));
    }

    setLoading(false);
  };

  const registerForEvent = async (eventId: string) => {
    if (!user) return;

    const { error } = await supabase.from('event_registrations').insert({
      event_id: eventId,
      student_id: user.id,
    });

    if (!error) {
      setRegistrations(new Set(registrations.add(eventId)));
    }
  };

  const unregisterFromEvent = async (eventId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('student_id', user.id);

    if (!error) {
      const newRegs = new Set(registrations);
      newRegs.delete(eventId);
      setRegistrations(newRegs);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading news and events...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">News & Events</h2>
        <p className="text-gray-600">Stay updated with the latest announcements and upcoming events</p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Upcoming Events
        </h3>

        {events.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No upcoming events</p>
          </div>
        ) : (
          <div className="grid gap-4 mb-8">
            {events.map((event) => {
              const isRegistered = registrations.has(event.id);
              return (
                <div
                  key={event.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full capitalize">
                          {event.category}
                        </span>
                        {isRegistered && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Registered
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h4>
                      <p className="text-gray-600 mb-4">{event.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {new Date(event.event_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
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
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {isRegistered ? (
                      <button
                        onClick={() => unregisterFromEvent(event.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Cancel Registration
                      </button>
                    ) : (
                      <button
                        onClick={() => registerForEvent(event.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Register Now
                      </button>
                    )}
                    {event.link && (
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Event Details
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-blue-600" />
          Latest News
        </h3>

        {news.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No news available</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {news.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full capitalize">
                        {item.category}
                      </span>
                      {item.is_featured && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
                    {item.excerpt && <p className="text-gray-600 mb-3">{item.excerpt}</p>}
                    <p className="text-sm text-gray-500">
                      {new Date(item.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
