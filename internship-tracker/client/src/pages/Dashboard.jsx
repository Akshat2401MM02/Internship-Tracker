import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Search,
  Briefcase,
  Send,
  FileText,
  Users,
  Trophy,
  XCircle,
  Inbox,
} from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import InternshipCard from '../components/InternshipCard';
import InternshipFormModal from '../components/InternshipFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { STATUS_OPTIONS } from '../utils/statusConfig';

const Dashboard = () => {
  const [internships, setInternships] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchInternships = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search) params.search = search;
      if (sortBy) params.sortBy = sortBy;

      const { data } = await api.get('/internships', { params });
      setInternships(data);
    } catch (err) {
      console.error('Failed to fetch internships', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, sortBy]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/internships/stats/summary');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchInternships();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchInternships]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const openAddModal = () => {
    setEditingInternship(null);
    setModalOpen(true);
  };

  const openEditModal = (internship) => {
    setEditingInternship(internship);
    setModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingInternship) {
        await api.put(`/internships/${editingInternship._id}`, formData);
      } else {
        await api.post('/internships', formData);
      }
      setModalOpen(false);
      await fetchInternships();
      await fetchStats();
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/internships/${deleteTarget._id}`);
      setDeleteTarget(null);
      await fetchInternships();
      await fetchStats();
    } finally {
      setDeleteLoading(false);
    }
  };

  const statCards = stats
    ? [
        { label: 'Total', value: stats.summary.total, colorClass: 'bg-primary-500/10 text-primary-400', icon: Briefcase },
        { label: 'Applied', value: stats.summary.Applied, colorClass: 'bg-blue-500/10 text-blue-400', icon: Send },
        { label: 'OA', value: stats.summary.OA, colorClass: 'bg-purple-500/10 text-purple-400', icon: FileText },
        { label: 'Interview', value: stats.summary.Interview, colorClass: 'bg-amber-500/10 text-amber-400', icon: Users },
        { label: 'Offer', value: stats.summary.Offer, colorClass: 'bg-green-500/10 text-green-400', icon: Trophy },
        { label: 'Rejected', value: stats.summary.Rejected, colorClass: 'bg-red-500/10 text-red-400', icon: XCircle },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-400">Track every internship application in one place</p>
          </div>
          <button onClick={openAddModal} className="btn-primary">
            <Plus className="h-4 w-4" />
            Add Internship
          </button>
        </div>

        {stats && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, role, or location..."
              className="input-field pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field sm:w-44"
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field sm:w-44">
            <option value="">Sort: Newest</option>
            <option value="deadline">Sort: Deadline</option>
            <option value="company">Sort: Company A-Z</option>
            <option value="applicationDate">Sort: Application Date</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-800 border-t-primary-500" />
          </div>
        ) : internships.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-800 text-gray-500">
              <Inbox className="h-7 w-7" />
            </div>
            <h3 className="text-base font-semibold text-gray-100">No internships found</h3>
            <p className="mt-1 max-w-sm text-sm text-gray-400">
              {search || statusFilter !== 'All'
                ? 'Try adjusting your search or filters.'
                : 'Get started by adding your first internship application.'}
            </p>
            {!search && statusFilter === 'All' && (
              <button onClick={openAddModal} className="btn-primary mt-4">
                <Plus className="h-4 w-4" />
                Add Internship
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {internships.map((internship) => (
              <InternshipCard
                key={internship._id}
                internship={internship}
                onEdit={openEditModal}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </main>

      <InternshipFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingInternship}
        loading={formLoading}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete internship?"
        message={`This will permanently remove "${deleteTarget?.role}" at "${deleteTarget?.company}". This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Dashboard;
