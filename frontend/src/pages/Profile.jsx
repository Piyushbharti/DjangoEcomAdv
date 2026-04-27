import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const Profile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  // GET /accounts/get-user/ API call
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/accounts/get-user/');
      if (response.data.status === 200) {
        setProfile(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Token invalid → login page
      navigate('/login');
    } finally {
      setLoading(false);
    }
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

          {/* User Info */}
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

          {/* Logout Button */}
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
