import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase} from '../../lib/supabase';
import type { Certificate } from '../../lib/supabase';
import { Award, Download, CheckCircle } from 'lucide-react';

export const StudentCertificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, [user]);

  const fetchCertificates = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('student_id', user.id)
      .order('issue_date', { ascending: false });

    if (!error && data) {
      setCertificates(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading certificates...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Certificates</h2>
        <p className="text-gray-600">View and download your earned certificates</p>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Certificates Yet</h3>
          <p className="text-gray-600">
            Complete your programs to earn certificates that will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600 opacity-10 rounded-full -ml-12 -mb-12"></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{cert.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">Certificate #{cert.certificate_number}</p>
                    </div>
                  </div>
                  {cert.status === 'active' ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold">
                      Revoked
                    </div>
                  )}
                </div>

                <p className="text-gray-700 mb-6">{cert.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Issue Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(cert.issue_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Certificate ID</p>
                    <p className="text-lg font-semibold text-gray-900 font-mono">
                      {cert.certificate_number}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Certificate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
