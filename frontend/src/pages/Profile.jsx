import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, LogOut, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import axiosInstance from '../api/axios';

const Profile = () => {
  const { user, logout, fetchUser } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  // GET /accounts/get-user/
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/accounts/get-user/');
      if (response.data.status === 200) {
        setProfile(response.data.user);
        setFormData(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  // PUT /accounts/update-user/
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put('/accounts/update-user/', {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        phone_number: formData.phone_number,
      });

      if (response.data.status === 200) {
        setProfile(response.data.user);
        setEditing(false);
        showToast('Profile updated!', 'success');
        // AuthContext mein bhi update karo
        fetchUser();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile', 'error');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading-page">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="error-page">Please login to view profile</div>;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1>My Profile</h1>

        <div className="profile-card">
          {/* Avatar */}
          <div className="profile-avatar">
            {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
          </div>

          {editing ? (
            /* Edit Mode */
            <form onSubmit={handleUpdate} className="profile-form">
              <div className="profile-form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input name="first_name" value={formData.first_name || ''} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input name="last_name" value={formData.last_name || ''} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>Username</label>
                <input name="username" value={formData.username || ''} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input value={formData.email || ''} disabled style={{opacity: 0.6}} />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input name="phone_number" value={formData.phone_number || ''} onChange={handleChange} />
              </div>

              <div className="profile-form-actions">
                <button type="submit" className="btn-save-profile">
                  <Save size={16} /> Save
                </button>
                <button type="button" className="btn-cancel-edit" onClick={() => { setEditing(false); setFormData(profile); }}>
                  <X size={16} /> Cancel
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <>
              <div className="profile-info">
                <div className="profile-field">
                  <User size={18} />
                  <div>
                    <label>Name</label>
                    <p>{profile.first_name} {profile.last_name}</p>
                  </div>
                </div>

                <div className="profile-field">
                  <Mail size={18} />
                  <div>
                    <label>Email</label>
                    <p>{profile.email}</p>
                  </div>
                </div>

                <div className="profile-field">
                  <User size={18} />
                  <div>
                    <label>Username</label>
                    <p>{profile.username}</p>
                  </div>
                </div>

                {profile.phone_number && (
                  <div className="profile-field">
                    <Phone size={18} />
                    <div>
                      <label>Phone</label>
                      <p>{profile.phone_number}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="profile-actions">
                <button className="btn-edit-profile" onClick={() => setEditing(true)}>
                  <Edit3 size={16} /> Edit Profile
                </button>
                <button className="btn-logout" onClick={handleLogout}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
