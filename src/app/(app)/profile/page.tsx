'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { User, Key, Bell, Palette, Shield, Download } from 'lucide-react';
import {
  Page,
  PageContent,
  PageHeader,
  Card,
  Input,
  Textarea,
  Spinner,
} from '@/components/ui';

export default function UserProfilePage() {
  const { client } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const clientSlug = client?.slug || 'company';
  const clientName = client?.name || 'Company Inc';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: clientName,
    position: '',
    location: '',
    timezone: client?.timezone || '',
    bio: '',
    avatar: '',
    role: '',
    status: '',
    clientSlug,
    lastLoginAt: '',
    lastActiveAt: '',
  });

  // Keep company info in sync with selected client
  useEffect(() => {
    setProfileData((prev) => ({
      ...prev,
      company: clientName,
      clientSlug,
      timezone: client?.timezone || prev.timezone,
    }));
  }, [clientName, clientSlug, client?.timezone]);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setError(null);
        const response = await fetch('/api/profile', { credentials: 'include' });
        if (!response.ok) {
          throw new Error('Failed to load profile');
        }
        const json = await response.json();
        const profile = json?.data?.profile;
        if (!profile) {
          throw new Error('Profile missing');
        }

        const name = (profile.name || '').trim();
        const [firstName, ...rest] = name.split(/\s+/).filter(Boolean);
        const lastName = rest.join(' ');
        const avatar =
          profile.avatarUrl ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.email || firstName || 'user')}`;

        if (!cancelled) {
          setProfileData({
            firstName: firstName || '',
            lastName: lastName || '',
            email: profile.email || '',
            phone: profile.phone || '',
            company: clientName,
            position: '',
            location: '',
            timezone: client?.timezone || '',
            bio: '',
            avatar,
            role: profile.role || '',
            status: profile.status || '',
            clientSlug: profile.clientSlug || clientSlug,
            lastLoginAt: profile.lastLoginAt || '',
            lastActiveAt: profile.lastActiveAt || '',
          });
        }
      } catch (err) {
        console.error('Profile load error', err);
        if (!cancelled) {
          setError('Unable to load your profile right now.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [clientName, clientSlug, client?.timezone]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data & Privacy', icon: Download },
  ];

  if (loading) {
    return (
      <AuthGuard clientId={client?.id}>
        <div className="flex min-h-screen bg-background">
          <Sidebar clientId={client?.id} />
          <Page>
            <PageContent>
              <PageHeader title="Profile Settings" description="Manage your account settings and preferences" />
              <Card className="flex items-center gap-3 justify-center min-h-[200px]">
                <Spinner />
                <span className="text-foreground-secondary">Loading your profile...</span>
              </Card>
            </PageContent>
          </Page>
        </div>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard clientId={client?.id}>
        <div className="flex min-h-screen bg-background">
          <Sidebar clientId={client?.id} />
          <Page>
            <PageContent>
              <PageHeader title="Profile Settings" description="Manage your account settings and preferences" />
              <Card className="p-6">
                <p className="text-foreground text-sm mb-2">We couldn&apos;t load your profile.</p>
                <p className="text-foreground-secondary text-sm">{error}</p>
              </Card>
            </PageContent>
          </Page>
        </div>
      </AuthGuard>
    );
  }

  const fullName =
    [profileData.firstName, profileData.lastName].filter(Boolean).join(' ').trim() ||
    profileData.email ||
    'User';
  const initials = fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const metaParts = [
    profileData.role ? `Role: ${profileData.role}` : null,
    profileData.status ? `Status: ${profileData.status}` : null,
    profileData.clientSlug ? `Client: ${profileData.clientSlug}` : null,
  ].filter(Boolean);

  return (
    <AuthGuard clientId={client?.id}>
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={client?.id} />
        <Page>
          <PageContent>
            <PageHeader title="Profile Settings" description="Manage your account settings and preferences" />

            <div className="flex gap-6">
              {/* Sidebar Navigation */}
              <div className="w-64">
                <Card padding="sm">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-interactive text-foreground-inverse'
                            : 'hover:bg-background-hover text-foreground-secondary'
                        }`}
                      >
                        <Icon size={18} />
                        {tab.label}
                      </button>
                    );
                  })}
                </Card>
              </div>

              {/* Settings Content */}
              <div className="flex-1">
                {activeTab === 'profile' && (
                  <Card>
                    <h2 className="text-xl font-semibold text-foreground mb-6">Profile Information</h2>
                    <p className="text-sm text-foreground-tertiary mb-4">
                      This profile is read-only for now. Contact your admin if something needs an update.
                    </p>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-full bg-background-tertiary flex items-center justify-center overflow-hidden text-xl font-semibold text-foreground">
                          {profileData.avatar ? (
                            <img
                              src={profileData.avatar}
                              alt="Profile avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{initials}</span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-lg font-semibold text-foreground">{fullName}</p>
                          <p className="text-sm text-foreground-secondary">
                            {profileData.email || 'No email on file'}
                          </p>
                          {metaParts.length > 0 && (
                            <p className="text-xs text-foreground-tertiary">{metaParts.join(' • ')}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <Input label="First Name" value={profileData.firstName} readOnly />
                        <Input label="Last Name" value={profileData.lastName} readOnly />
                      </div>

                      <Input label="Email Address" type="email" value={profileData.email} readOnly />

                      <div className="grid grid-cols-2 gap-6">
                        <Input label="Phone Number" type="tel" value={profileData.phone} readOnly />
                        <Input label="Position" value={profileData.position} readOnly />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <Input label="Location" value={profileData.location} readOnly />
                        <Input label="Timezone" value={profileData.timezone || 'Not set'} readOnly />
                      </div>

                      <Textarea label="Bio" rows={4} value={profileData.bio} readOnly placeholder="Tell us about yourself..." />
                    </div>
                  </Card>
                )}

                {activeTab === 'notifications' && (
                  <Card>
                    <h2 className="text-xl font-semibold text-foreground mb-6">Notification Preferences</h2>
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-background-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Bell size={32} className="text-foreground-tertiary" />
                      </div>
                      <p className="text-foreground-secondary">Notification settings will be available soon.</p>
                    </div>
                  </Card>
                )}

                {activeTab === 'security' && (
                  <Card>
                    <h2 className="text-xl font-semibold text-foreground mb-6">Security Settings</h2>
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-background-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Shield size={32} className="text-foreground-tertiary" />
                      </div>
                      <p className="text-foreground-secondary">Security settings will be available soon.</p>
                    </div>
                  </Card>
                )}

                {(activeTab === 'account' || activeTab === 'appearance' || activeTab === 'data') && (
                  <Card>
                    <h2 className="text-xl font-semibold text-foreground mb-6 capitalize">{activeTab} Settings</h2>
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-background-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                        {activeTab === 'account' && <Key size={32} className="text-foreground-tertiary" />}
                        {activeTab === 'appearance' && <Palette size={32} className="text-foreground-tertiary" />}
                        {activeTab === 'data' && <Download size={32} className="text-foreground-tertiary" />}
                      </div>
                      <p className="text-foreground-secondary">
                        {activeTab === 'account' && 'Account settings will be available soon'}
                        {activeTab === 'appearance' && 'Appearance customization will be available soon'}
                        {activeTab === 'data' && 'Data export and privacy settings will be available soon'}
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </PageContent>
        </Page>
      </div>
    </AuthGuard>
  );
}
