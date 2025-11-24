
// FIX: Corrected invalid React import syntax.
import React, { useEffect } from 'react';
import type { User, Company, PickupRequest, AppNotification } from './types';
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import SchedulePickupForm from './components/SchedulePickupForm';
import AdminDashboard from './components/AdminDashboard';
import RegistrationScreen from './components/RegistrationScreen';
import ScheduleSuccessScreen from './components/ScheduleSuccessScreen';
import ApprovalSuccessScreen from './components/ApprovalSuccessScreen';
import CompanyDashboard from './components/CompanyDashboard';

// Mock Data
const MOCK_COMPANIES_INITIAL: Company[] = [
  { 
    id: 'c1', 
    name: 'VINICIUS REALE COMPRA DE CACAU', 
    managerName: 'Vinicius Reale', 
    phone: '75982791851',
    username: 'viniciuscacau',
    password: 'reale123'
  },
];

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'JoaoS', fullName: 'João Silva de Souza', phone: '75982791851', address: 'Rua do Cacau, 123, Jiquiriçá, BA', password: '123', companyId: 'c1', status: 'Ativo' },
  { id: 'u2', name: 'MariaO', fullName: 'Maria Oliveira Santos', phone: '75988223344', address: 'Fazenda Boa Sorte, Zona Rural, Jiquiriçá, BA', password: '456', companyId: 'c1', status: 'Ativo' },
  { id: 'u3', name: 'Vinicius', fullName: 'Vinicius Almeida', phone: '75988334455', address: 'Avenida Principal, 45, Centro, Jiquiriçá, BA', password: '789', companyId: 'c1', status: 'Ativo' },
];

const MOCK_PICKUPS: PickupRequest[] = [
    {
        id: 'p1',
        userId: 'u1',
        companyId: 'c1',
        fullBags: 10,
        partialBagWeight: 35,
        totalWeight: 10 * 60 + 35,
        photoUrl: 'https://picsum.photos/seed/cocoa1/400/300',
        pickupDate: '2024-08-15T10:00:00.000Z',
        status: 'Agendado',
        address: 'Rua do Cacau, 123, Jiquiriçá, BA',
    },
    {
        id: 'p2',
        userId: 'u1',
        companyId: 'c1',
        fullBags: 8,
        partialBagWeight: 0,
        totalWeight: 8 * 60,
        photoUrl: 'https://picsum.photos/seed/cocoa2/400/300',
        pickupDate: '2024-07-20T14:00:00.000Z',
        status: 'Concluído',
        address: 'Rua do Cacau, 123, Jiquiriçá, BA',
    },
];


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = React.useState<Company | null>(null);
  const [currentScreen, setCurrentScreen] = React.useState<'login' | 'dashboard' | 'new_pickup' | 'super_admin' | 'company_admin' | 'registration' | 'schedule_success' | 'approval_success'>('login');
  
  // Initialize state from LocalStorage or use Mocks if empty
  const [pickupRequests, setPickupRequests] = React.useState<PickupRequest[]>(() => {
    try {
        const saved = localStorage.getItem('app_pickups');
        return saved ? JSON.parse(saved) : MOCK_PICKUPS;
    } catch (e) {
        return MOCK_PICKUPS;
    }
  });
  
  const [users, setUsers] = React.useState<User[]>(() => {
    try {
        const saved = localStorage.getItem('app_users');
        return saved ? JSON.parse(saved) : MOCK_USERS;
    } catch (e) {
        return MOCK_USERS;
    }
  });
  
  const [companies, setCompanies] = React.useState<Company[]>(() => {
    try {
        const saved = localStorage.getItem('app_companies');
        return saved ? JSON.parse(saved) : MOCK_COMPANIES_INITIAL;
    } catch (e) {
        return MOCK_COMPANIES_INITIAL;
    }
  });

  const [notifications, setNotifications] = React.useState<AppNotification[]>(() => {
      try {
          const saved = localStorage.getItem('app_notifications');
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          return [];
      }
  });

  const [latestPickup, setLatestPickup] = React.useState<PickupRequest | null>(null);
  const [editingPickup, setEditingPickup] = React.useState<PickupRequest | null>(null);
  const [newlyApprovedUser, setNewlyApprovedUser] = React.useState<User | null>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('app_pickups', JSON.stringify(pickupRequests));
  }, [pickupRequests]);

  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('app_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
      localStorage.setItem('app_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const handleLoginAttempt = (username: string, password) => {
    // 1. Check for Super Admin
    if (username.toLowerCase() === 'adm' && password === '123456') {
        setCurrentUser(null);
        setCurrentCompany(null);
        setCurrentScreen('super_admin');
        return { success: true };
    }
    // 2. Check for Company Admin
    const company = companies.find(c => c.username.toLowerCase() === username.toLowerCase() && c.password === password);
    if (company) {
        setCurrentUser(null);
        setCurrentCompany(company);
        setCurrentScreen('company_admin');
        return { success: true };
    }
    // 3. Check for User/Client
    const user = users.find(u => u.name.toLowerCase() === username.toLowerCase() && u.password === password);
    if (user) {
        if (user.status === 'Ativo') {
            if (newlyApprovedUser && newlyApprovedUser.id === user.id) {
                setCurrentUser(user);
                setCurrentScreen('approval_success');
            } else {
                setCurrentUser(user);
                setCurrentScreen('dashboard');
            }
            return { success: true };
        } else {
            return { success: false, error: 'Seu cadastro está pendente de aprovação pela empresa.' };
        }
    }

    return { success: false, error: 'Usuário ou senha inválidos.' };
  }
  
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentCompany(null);
    setNewlyApprovedUser(null);
    setCurrentScreen('login');
  };

  const handleNavigateToRegister = () => {
    setCurrentScreen('registration');
  };

  const handleRegister = (clientData: Omit<User, 'id' | 'status'>) => {
    const newUser: User = {
        ...clientData,
        id: `u${Date.now()}`,
        status: 'Pendente',
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentScreen('login');
  };

  const handleAddCompany = (companyData: Omit<Company, 'id'>) => {
    const newCompany: Company = {
        ...companyData,
        id: `c${Date.now()}`,
    };
    setCompanies(prev => [...prev, newCompany]);
  };
  
  const handleUpdateCompany = (updatedCompany: Company) => {
      setCompanies(prev => prev.map(c => c.id === updatedCompany.id ? updatedCompany : c));
  };

  const handleAddClientByCompany = (clientData: Omit<User, 'id' | 'status'>) => {
      const newClient: User = {
          ...clientData,
          id: `u${Date.now()}`,
          status: 'Ativo',
      };
      setUsers(prev => [...prev, newClient]);
  };

  const handleUpdateClient = (updatedClient: User) => {
      setUsers(prev => prev.map(u => u.id === updatedClient.id ? updatedClient : u));
  };

  const handleScheduleNew = () => {
    setEditingPickup(null);
    setCurrentScreen('new_pickup');
  };

  const handleEditPickup = (pickup: PickupRequest) => {
    setEditingPickup(pickup);
    setCurrentScreen('new_pickup');
  };

  const handleDeletePickup = (pickupId: string) => {
    setPickupRequests(prev => prev.filter(p => p.id !== pickupId));
  };

  const handleCancelNewPickup = () => {
    setEditingPickup(null);
    setCurrentScreen('dashboard');
  };

  const handleReturnToDashboard = () => {
    setLatestPickup(null);
    setCurrentScreen('dashboard');
  }

  const handleSavePickup = React.useCallback((pickupData: Omit<PickupRequest, 'id' | 'userId' | 'companyId' | 'status' | 'confirmationCode'>) => {
    if (!currentUser) return;
    
    if (editingPickup) {
        const updatedRequest: PickupRequest = { ...editingPickup, ...pickupData };
        setPickupRequests(prev => prev.map(p => p.id === editingPickup.id ? updatedRequest : p));
        setEditingPickup(null);
        setCurrentScreen('dashboard');
    } else {
        const newId = `p${Date.now()}`;
        const newRequest: PickupRequest = {
            ...pickupData,
            id: newId,
            userId: currentUser.id,
            companyId: currentUser.companyId,
            status: 'Agendado',
        };
        setPickupRequests(prev => [newRequest, ...prev]);
        setLatestPickup(newRequest);

        // CREATE NOTIFICATION FOR COMPANY
        const newNotification: AppNotification = {
            id: `notif${Date.now()}`,
            companyId: currentUser.companyId,
            message: `Novo agendamento: ${currentUser.fullName} registrou ${newRequest.totalWeight}kg.`,
            date: new Date().toISOString(),
            read: false,
            type: 'new_pickup',
            relatedId: newId
        };
        setNotifications(prev => [newNotification, ...prev]);

        setCurrentScreen('schedule_success');
    }
  }, [currentUser, editingPickup]);

  const handleApproveClient = (clientId: string) => {
    let approvedUser: User | null = null;
    setUsers(prevUsers => prevUsers.map(user => {
        if (user.id === clientId) {
            approvedUser = { ...user, status: 'Ativo' };
            return approvedUser;
        }
        return user;
    }));
    if (approvedUser) {
        setNewlyApprovedUser(approvedUser);
    }
  };

  const handleAcknowledgeApprovalAndLogin = (user: User) => {
    setNewlyApprovedUser(null);
    setCurrentUser(user);
    setCurrentScreen('dashboard');
  }

  const handleUpdateRequestStatus = (pickupId: string, status: PickupRequest['status']) => {
    setPickupRequests(prev => prev.map(p => {
      if (p.id === pickupId) {
        const updatedPickup = { ...p, status };
        if (status === 'Confirmado') {
          updatedPickup.confirmationCode = `CACAU-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        if (status !== 'Confirmado' && status !== 'Concluído') {
            delete updatedPickup.confirmationCode;
        }
        return updatedPickup;
      }
      return p;
    }));
  };
  
  const handleCompletePickup = (pickupId: string, code: string): {success: boolean, error?: string} => {
    const pickup = pickupRequests.find(p => p.id === pickupId);
    if (!pickup) return {success: false, error: "Pedido não encontrado."};

    if (pickup.confirmationCode?.toLowerCase() === code.toLowerCase()) {
        setPickupRequests(prev => prev.map(p => p.id === pickupId ? {...p, status: 'Concluído'} : p));
        return {success: true};
    } else {
        return {success: false, error: "Código de confirmação inválido."};
    }
  };

  const handleUpdatePickupDateTime = (pickupId: string, newDateTime: string) => {
    setPickupRequests(prev => prev.map(p => p.id === pickupId ? {
      ...p, 
      pickupDate: newDateTime, 
      status: 'Reagendamento Proposto'
    } : p));
  };

  const handleMarkNotificationAsRead = (notificationId: string) => {
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };
  
  const handleMarkAllNotificationsAsRead = (companyId: string) => {
      setNotifications(prev => prev.map(n => n.companyId === companyId ? { ...n, read: true } : n));
  }

  const renderContent = () => {
    switch (currentScreen) {
        case 'super_admin':
            return <AdminDashboard 
                companies={companies} 
                onAddCompany={handleAddCompany} 
                onUpdateCompany={handleUpdateCompany}
                onLogout={handleLogout} 
            />;
        case 'company_admin':
            if (!currentCompany) return null; // Should not happen
            const companyClients = users.filter(u => u.companyId === currentCompany.id);
            const companyPickups = pickupRequests.filter(p => p.companyId === currentCompany.id);
            const companyNotifications = notifications.filter(n => n.companyId === currentCompany.id);
            return <CompanyDashboard 
                company={currentCompany}
                clients={companyClients}
                pickups={companyPickups}
                notifications={companyNotifications}
                onAddClient={handleAddClientByCompany}
                onUpdateClient={handleUpdateClient}
                onApproveClient={handleApproveClient}
                onLogout={handleLogout}
                onUpdateRequestStatus={handleUpdateRequestStatus}
                onUpdatePickupDateTime={handleUpdatePickupDateTime}
                onMarkNotificationRead={handleMarkNotificationAsRead}
                onMarkAllNotificationsRead={handleMarkAllNotificationsAsRead}
            />;
        case 'registration':
            return <RegistrationScreen companies={companies} onRegister={handleRegister} onCancel={() => setCurrentScreen('login')} />;
        case 'approval_success':
            if (newlyApprovedUser) {
                const company = companies.find(c => c.id === newlyApprovedUser.companyId);
                return <ApprovalSuccessScreen user={newlyApprovedUser} company={company} onAcknowledge={handleAcknowledgeApprovalAndLogin} />
            }
            break; // Fallback to login
        case 'dashboard':
        case 'new_pickup':
        case 'schedule_success':
            if (currentUser) {
                const company = companies.find(c => c.id === currentUser.companyId);
                if (currentScreen === 'dashboard') {
                    const userPickups = pickupRequests.filter(p => p.userId === currentUser.id);
                    return <DashboardScreen user={currentUser} company={company} pickupRequests={userPickups} onScheduleNew={handleScheduleNew} onLogout={handleLogout} onEdit={handleEditPickup} onDelete={handleDeletePickup} onCompletePickup={handleCompletePickup} />;
                }
                if (currentScreen === 'new_pickup') {
                    return <SchedulePickupForm onSave={handleSavePickup} onCancel={handleCancelNewPickup} initialData={editingPickup} />;
                }
                if (currentScreen === 'schedule_success' && latestPickup && company) {
                    return <ScheduleSuccessScreen pickupRequest={latestPickup} company={company} user={currentUser} onReturnToDashboard={handleReturnToDashboard} />;
                }
            }
            break; // Fallback to login
    }
    // Default to login screen
    return <LoginScreen 
        onAttemptLogin={handleLoginAttempt} 
        onNavigateToRegister={handleNavigateToRegister}
        availableUsers={users}
        availableCompanies={companies}
    />;
  }

  return (
    <div className="bg-stone-100 min-h-screen text-stone-800">
      <div className="container mx-auto max-w-2xl p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
