import { useState, useEffect } from 'react';
import api from '../../services/api';
import { CheckCircle, XCircle } from 'lucide-react';

type Student = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Student[]>('/admin/students/pending');
      setStudents(data);
    } catch (err) {
      setError('Failed to fetch students. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  const approveStudent = async (studentId: string) => {
    try {
      await api.post(`/admin/students/${studentId}/approve`);
      // Refresh the list after approval
      fetchPendingStudents();
    } catch (err) {
      alert('Failed to approve student.');
      console.error(err);
    }
  };

  const rejectStudent = async (studentId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    try {
      await api.post(`/admin/students/${studentId}/reject`, { reason: reason || '' });
      // Refresh the list after rejection
      fetchPendingStudents();
    } catch (err) {
      alert('Failed to reject student.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading pending students...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="p-8 text-center text-red-600">
            <p>{error}</p>
            <button
                onClick={fetchPendingStudents}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Retry
            </button>
        </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Approval</h2>
        <p className="text-gray-600">Review and approve or reject new student registrations.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No pending students found.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => approveStudent(student.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => rejectStudent(student.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
       <div className="mt-4 text-sm text-gray-600">
        Showing {students.length} pending students.
      </div>
    </div>
  );
};