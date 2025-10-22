'use client';

import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { userService } from '@/lib/services/user';
import { storage } from '@/lib/utils/storage';
import { organizationService, type Department, type Team } from '@/lib/services/organization';

export default function UsersPage() {
  const { user } = useUser();
  const [showInvitationForm, setShowInvitationForm] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'error' as 'error' | 'success' });
  
  const [formData, setFormData] = useState({
    emails: '',
    role: 'staff',
    teamId: '',
    departmentId: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Load departments and teams when component mounts
  React.useEffect(() => {
    const loadOrganizationData = async () => {
      if (!user?.token) return;
      
      try {
        const [deptRes, teamRes] = await Promise.all([
          organizationService.getAllDepartments(user.token),
          organizationService.getAllTeams(user.token)
        ]);
        
        if (deptRes.status === 'success') {
          setDepartments(deptRes.data || []);
        }
        if (teamRes.status === 'success') {
          setTeams(teamRes.data || []);
        }
      } catch (error) {
        console.error('Failed to load organization data:', error);
      }
    };

    loadOrganizationData();
  }, [user?.token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const departmentId = e.target.value;
    setSelectedDepartment(departmentId);
    setFormData(prev => ({ ...prev, departmentId, teamId: '' }));
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.emails.trim()) {
      newErrors.emails = 'Email list is required';
    } else {
      // Parse emails and validate each one
      const emailList = formData.emails.split(/[,\n]/).map(email => email.trim()).filter(email => email);
      if (emailList.length === 0) {
        newErrors.emails = 'Please enter at least one email address';
      } else {
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        const invalidEmails = emailList.filter(email => !emailRegex.test(email));
        if (invalidEmails.length > 0) {
          newErrors.emails = `Invalid email addresses: ${invalidEmails.join(', ')}`;
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setMessage({ text: '', type: 'error' });
    
    try {
      const token = storage.getToken();
      if (!token) throw new Error('No authentication token');
      
      // Parse emails from the textarea
      const emailList = formData.emails.split(/[,\n]/).map(email => email.trim()).filter(email => email);
      
      const invitationData = {
        emails: emailList,
        role: formData.role,
        teamId: formData.teamId || undefined,
        departmentId: formData.departmentId || undefined
      };
      
      const res = await userService.sendBulkInvitations(token, invitationData);
      
      if (res.status === 'success') {
        setMessage({ 
          text: res.message, 
          type: 'success' 
        });
        setFormData({
          emails: '',
          role: 'staff',
          teamId: '',
          departmentId: ''
        });
        setSelectedDepartment('');
        setTimeout(() => setShowInvitationForm(false), 3000);
      } else {
        setMessage({ text: res.message || 'Failed to send invitations', type: 'error' });
      }
    } catch (error) {
      console.error('Invitation sending error:', error);
      setMessage({ text: 'Failed to send invitations. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTeams = teams.filter(team => team.departmentId === selectedDepartment);

  if (!user) {
    return (
      <div className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse h-6 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  // Removed scope labels here; the detailed matrix below summarizes privileges clearly.

  return (
    <div className="pt-20 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Role-based visibility and actions based on your permissions.</p>
        </div>

        {/* HR Invitation Section */}
        {user.role === 'hr' && (
          <section>
            <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Send User Invitations</h2>
                <button
                  onClick={() => setShowInvitationForm(!showInvitationForm)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {showInvitationForm ? 'Cancel' : 'Send Invitations'}
                </button>
              </div>
              
              {showInvitationForm && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {message.text && (
                    <div className={`p-3 rounded text-sm ${
                      message.type === 'error' 
                        ? 'bg-red-50 text-red-700' 
                        : 'bg-green-50 text-green-700'
                    }`}>
                      {message.text}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Addresses *
                      </label>
                      <textarea
                        name="emails"
                        value={formData.emails}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded h-24 ${errors.emails ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter email addresses separated by commas or new lines&#10;Example:&#10;user1@example.com&#10;user2@example.com&#10;user3@example.com"
                      />
                      {errors.emails && <p className="text-sm text-red-600 mt-1">{errors.emails}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="staff">Staff</option>
                        <option value="manager">Manager</option>
                        <option value="director">Director</option>
                        <option value="hr">HR</option>
                        <option value="sm">Senior Management</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                        value={selectedDepartment}
                        onChange={handleDepartmentChange}
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Team
                      </label>
                      <select
                        name="teamId"
                        value={formData.teamId}
                        onChange={handleInputChange}
                        disabled={!selectedDepartment}
                        className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
                      >
                        <option value="">Select Team</option>
                        {filteredTeams.map(team => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowInvitationForm(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Sending...' : 'Send Invitations'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        )}

        {/* Profile card (top) */}
        <section>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Profile</h2>
              <dl className="divide-y divide-gray-100">
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{user.name}</dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{user.email}</dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Team</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{user.teamName || user.teamId || 'N/A'}</dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Department</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{user.departmentName || user.departmentId || 'N/A'}</dd>
                </div>
              </dl>
              {/* Removed duplicate badges; details are shown in the matrix */}
            </div>
        </section>

        {/* Role matrix (full width) */}
        <section>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Role-Based Permissions</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="px-3 py-2 text-left font-medium">Role</th>
                      <th className="px-3 py-2 text-left font-medium">Visibility</th>
                      <th className="px-3 py-2 text-left font-medium">Assign</th>
                      <th className="px-3 py-2 text-left font-medium">Assign Scope</th>
                      <th className="px-3 py-2 text-left font-medium">Add Collaborators</th>
                      <th className="px-3 py-2 text-left font-medium">Project Collab Scope</th>
                      <th className="px-3 py-2 text-left font-medium">Update Status</th>
                      <th className="px-3 py-2 text-left font-medium">Edit Task</th>
                      <th className="px-3 py-2 text-left font-medium">Create Task</th>
                      <th className="px-3 py-2 text-left font-medium">Create Project</th>
                      <th className="px-3 py-2 text-left font-medium">Subtasks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                    { key: 'staff', label: 'Staff', visibility: 'Own tasks; project collaborators', assign: false, assignScope: '-', addCollab: 'Limited', projectCollabScope: 'Within project only', updateStatus: 'If collaborator', editTask: 'Own/allowed', createTask: true, createProject: true, subtasks: 'Create/Edit if collaborator' },
                    { key: 'manager', label: 'Manager', visibility: 'Team-wide tasks', assign: true, assignScope: 'To team/staff', addCollab: 'Yes', projectCollabScope: 'Within department', updateStatus: 'If collaborator', editTask: 'If collaborator', createTask: true, createProject: true, subtasks: 'Create/Edit if collaborator' },
                    { key: 'director', label: 'Director', visibility: 'Department-wide tasks', assign: true, assignScope: 'Within department', addCollab: 'Yes', projectCollabScope: 'Within department', updateStatus: 'If collaborator', editTask: 'If collaborator', createTask: true, createProject: true, subtasks: 'Create/Edit if collaborator' },
                    { key: 'hr', label: 'HR', visibility: 'Company-wide tasks/projects/users', assign: false, assignScope: '-', addCollab: 'No', projectCollabScope: '-', updateStatus: 'No', editTask: 'No', createTask: false, createProject: false, subtasks: 'No' },
                    { key: 'sm', label: 'Senior Management', visibility: 'Company-wide tasks/projects/users', assign: true, assignScope: 'Org-wide (downward)', addCollab: 'Yes', projectCollabScope: 'Within department', updateStatus: 'If collaborator', editTask: 'If collaborator', createTask: false, createProject: false, subtasks: 'Create/Edit if collaborator' },
                    ].map((r) => (
                      <tr key={r.key} className={`${user.role === r.key ? 'bg-blue-50/50' : ''}`} title={user.role === r.key ? 'Your role' : undefined}>
                        <td className="px-3 py-2 font-medium text-gray-800">{r.label}</td>
                        <td className="px-3 py-2 text-gray-700">{r.visibility}</td>
                        <td className="px-3 py-2">{r.assign ? <span className="px-2 py-0.5 rounded bg-green-100 text-green-800">Yes</span> : <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">No</span>}</td>
                        <td className="px-3 py-2 text-gray-700">{r.assignScope}</td>
                        <td className="px-3 py-2">
                          {r.addCollab === 'Yes' && <span className="px-2 py-0.5 rounded bg-green-100 text-green-800">Yes</span>}
                          {r.addCollab === 'No' && <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">No</span>}
                          {r.addCollab === 'Limited' && <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">Limited</span>}
                        </td>
                        <td className="px-3 py-2 text-gray-700">{r.projectCollabScope}</td>
                        <td className="px-3 py-2">
                          {r.updateStatus === 'If collaborator' && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">If collaborator</span>}
                          {r.updateStatus === 'No' && <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">No</span>}
                        </td>
                        <td className="px-3 py-2">
                          {r.editTask === 'Own/allowed' && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">Own</span>}
                          {r.editTask === 'If collaborator' && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">If collaborator</span>}
                          {r.editTask === 'No' && <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">No</span>}
                        </td>
                        <td className="px-3 py-2">{r.createTask ? <span className="px-2 py-0.5 rounded bg-green-100 text-green-800">Yes</span> : <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">No</span>}</td>
                        <td className="px-3 py-2">{r.createProject ? <span className="px-2 py-0.5 rounded bg-green-100 text-green-800">Yes</span> : <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">No</span>}</td>
                        <td className="px-3 py-2">
                          {r.subtasks === 'No' && <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">No</span>}
                          {r.subtasks === 'Create/Edit if collaborator' && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">If collaborator</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
}
