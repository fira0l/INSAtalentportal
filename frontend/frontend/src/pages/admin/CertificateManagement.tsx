import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Certificate, Profile } from '../../lib/supabase';
import { Award, Download, Plus, X } from 'lucide-react';

export const CertificateManagement = () => {
  const [certificates, setCertificates] = useState<(Certificate & { student?: Profile })[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    certificate_number: '',
    title: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const [{ data: certsData }, { data: studentsData }] = await Promise.all([
      supabase
        .from('certificates')
        .select('*, profiles!certificates_student_id_fkey(*)')
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .eq('status', 'approved')
        .order('full_name'),
    ]);

    if (certsData) {
      const formattedCerts = certsData.map((cert: any) => ({
        ...cert,
        student: cert.profiles,
      }));
      setCertificates(formattedCerts);
    }

    if (studentsData) {
      setStudents(studentsData);
    }

    setLoading(false);
  };

  const generateCertificateNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CERT-${year}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('certificates').insert({
      student_id: formData.student_id,
      certificate_number: formData.certificate_number,
      title: formData.title,
      description: formData.description,
      status: 'active',
    });

    if (!error) {
      setShowModal(false);
      setFormData({ student_id: '', certificate_number: '', title: '', description: '' });
      fetchData();
    }
  };

  const revokeCertificate = async (certId: string) => {
    if (!confirm('Are you sure you want to revoke this certificate?')) {
      return;
    }

    const { error } = await supabase
      .from('certificates')
      .update({ status: 'revoked' })
      .eq('id', certId);

    if (!error) {
      fetchData();
    }
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Management</h2>
          <p className="text-gray-600">Issue and manage student certificates</p>
        </div>
        <button
          onClick={() => {
            setFormData({ ...formData, certificate_number: generateCertificateNumber() });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Issue Certificate
        </button>
      </div>

      <div className="grid gap-4">
        {certificates.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No certificates issued yet</p>
          </div>
        ) : (
          certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{cert.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{cert.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Student:</span>
                      <p className="font-medium text-gray-900">{cert.student?.full_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Certificate Number:</span>
                      <p className="font-medium text-gray-900">{cert.certificate_number}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Issue Date:</span>
                      <p className="font-medium text-gray-900">
                        {new Date(cert.issue_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          cert.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {cert.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  {cert.status === 'active' && (
                    <button
                      onClick={() => revokeCertificate(cert.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Issue New Certificate</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Student
                  </label>
                  <select
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="">Choose a student...</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.full_name} - {student.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate Number
                  </label>
                  <input
                    type="text"
                    value={formData.certificate_number}
                    onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="CERT-2025-0001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Certificate of Completion"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="This certifies that the student has successfully completed..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Issue Certificate
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
