import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { STATUS_OPTIONS } from '../utils/statusConfig';

const emptyForm = {
  company: '',
  role: '',
  status: 'Applied',
  applicationDate: '',
  deadline: '',
  location: '',
  mode: 'Onsite',
  stipend: '',
  jobLink: '',
  contactPerson: '',
  notes: '',
};

const toInputDate = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().split('T')[0];
};

const InternshipFormModal = ({ open, onClose, onSubmit, initialData, loading }) => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        ...emptyForm,
        ...initialData,
        applicationDate: toInputDate(initialData.applicationDate),
        deadline: toInputDate(initialData.deadline),
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [initialData, open]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.company.trim() || !form.role.trim()) {
      setError('Company and role are required');
      return;
    }
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-gray-900 border border-gray-800 shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-800 bg-gray-900 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-100">
            {initialData ? 'Edit Internship' : 'Add Internship'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-500 hover:bg-gray-800 hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-300">{error}</div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label-text">Company *</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Google"
              />
            </div>
            <div>
              <label className="label-text">Role *</label>
              <input
                name="role"
                value={form.role}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. SWE Intern"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label-text">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">Mode</label>
              <select name="mode" value={form.mode} onChange={handleChange} className="input-field">
                <option value="Onsite">Onsite</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="label-text">Stipend</label>
              <input
                name="stipend"
                value={form.stipend}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. ₹40,000/mo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label-text">Application Date</label>
              <input
                type="date"
                name="applicationDate"
                value={form.applicationDate}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text">Deadline</label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label-text">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Bengaluru"
              />
            </div>
            <div>
              <label className="label-text">Contact Person</label>
              <input
                name="contactPerson"
                value={form.contactPerson}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. HR name / referral"
              />
            </div>
          </div>

          <div>
            <label className="label-text">Job Link</label>
            <input
              name="jobLink"
              value={form.jobLink}
              onChange={handleChange}
              className="input-field"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="label-text">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Interview rounds, prep notes, follow-ups..."
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-800 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Add Internship'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InternshipFormModal;
