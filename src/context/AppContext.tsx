import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  UserProfile, UserRole, ProjectItem, Hackathon, StartupIdea,
  ForumPost, Poll, ChatChannel, ChatMessage, NotificationItem, SwapRequest
} from '../types';
import {
  INITIAL_USERS, INITIAL_PROJECTS, INITIAL_HACKATHONS,
  INITIAL_STARTUPS, INITIAL_FORUM_POSTS, INITIAL_POLLS,
  INITIAL_CHAT_CHANNELS, INITIAL_CHAT_MESSAGES, INITIAL_NOTIFICATIONS,
  KNOWN_DEMO_USER_IDS, KNOWN_DEMO_EMAILS
} from '../data/initialData';

const EMPTY_USER: UserProfile = {
  id: '',
  name: '',
  email: '',
  role: 'student',
  avatar: '',
  college: '',
  department: '',
  semester: 0,
  bio: '',
  location: '',
  githubUrl: '',
  linkedinUrl: '',
  portfolioUrl: '',
  verificationStatus: 'unverified',
  availabilityStatus: 'Available for Projects',
  skillsToTeach: [],
  skillsToLearn: [],
  interests: [],
  certificates: [],
  rating: 0,
  reviewCount: 0,
  badges: [],
};

function mapFirestoreDocToUserProfile(docId: string, data: Record<string, any>, fallbackEmail = ''): UserProfile {
  const name = data.name || '';
  return {
    id: docId,
    name,
    username: data.username || docId.slice(0, 8),
    email: data.email || fallbackEmail || '',
    role: (data.role as UserRole) || 'student',
    avatar: data.avatar
      ? data.avatar
      : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name || 'User'),
    college: data.college || data.institution || '',
    department: data.department || '',
    semester: typeof data.semester === 'number' ? data.semester : Number(data.semester) || 0,
    bio: data.bio || '',
    location: data.location || '',
    githubUrl: data.githubUrl || '',
    linkedinUrl: data.linkedinUrl || '',
    portfolioUrl: data.portfolioUrl || '',
    phoneNumber: data.phoneNumber || data.phone || '',
    phone: data.phoneNumber || data.phone || '',
    verificationStatus: data.verificationStatus || 'unverified',
    availabilityStatus: data.availabilityStatus || 'Available for Projects',
    skillsToTeach: Array.isArray(data.skillsToTeach) ? data.skillsToTeach : [],
    skillsToLearn: Array.isArray(data.skillsToLearn) ? data.skillsToLearn : [],
    interests: Array.isArray(data.interests) ? data.interests : [],
    certificates: Array.isArray(data.certificates) ? data.certificates : [],
    rating: typeof data.rating === 'number' ? data.rating : 5.0,
    reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : 0,
    badges: Array.isArray(data.badges) ? data.badges : [],
    course: data.course || '',
    learningGoals: data.learningGoals || '',
    institution: data.institution || data.college || '',
    designation: data.designation || '',
    subjectsAndExpertise: Array.isArray(data.subjectsAndExpertise) ? data.subjectsAndExpertise : [],
    mentoringInterests: Array.isArray(data.mentoringInterests) ? data.mentoringInterests : [],
    experience: data.experience || '',
    availability: data.availability || '',
    createdAt: data.createdAt ? String(data.createdAt) : undefined,
  };
}

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  isAuthenticated: boolean;
  authLoading: boolean;
  emailVerified: boolean;
  logout: () => Promise<void>;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  projects: ProjectItem[];
  setProjects: React.Dispatch<React.SetStateAction<ProjectItem[]>>;
  hackathons: Hackathon[];
  setHackathons: React.Dispatch<React.SetStateAction<Hackathon[]>>;
  startups: StartupIdea[];
  setStartups: React.Dispatch<React.SetStateAction<StartupIdea[]>>;
  forumPosts: ForumPost[];
  setForumPosts: React.Dispatch<React.SetStateAction<ForumPost[]>>;
  polls: Poll[];
  setPolls: React.Dispatch<React.SetStateAction<Poll[]>>;
  swapRequests: SwapRequest[];
  setSwapRequests: React.Dispatch<React.SetStateAction<SwapRequest[]>>;
  chatChannels: ChatChannel[];
  chatMessages: Record<string, ChatMessage[]>;
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authMode: 'login' | 'register' | 'google' | 'otp' | 'forgot';
  setAuthMode: (mode: 'login' | 'register' | 'google' | 'otp' | 'forgot') => void;
  selectedUserProfile: UserProfile | null;
  setSelectedUserProfile: (user: UserProfile | null) => void;
  
  // Quick Actions
  sendSwapRequest: (receiverId: string, teachSkill: string, learnSkill: string, message: string) => void;
  toggleProjectLike: (projectId: string) => void;
  addProject: (project: Omit<ProjectItem, 'id' | 'likes' | 'commentsCount' | 'createdAt'>) => void;
  registerForHackathon: (hackathonId: string) => void;
  addStartupIdea: (startup: Omit<StartupIdea, 'id' | 'likes' | 'mentorsConnected' | 'createdAt'>) => void;
  addForumPost: (post: Omit<ForumPost, 'id' | 'createdAt' | 'likes' | 'repliesCount'>) => void;
  votePoll: (pollId: string, optionId: string) => void;
  sendChatMessage: (channelId: string, text: string, type?: 'text' | 'file' | 'voice', fileUrl?: string, audioDuration?: string) => void;
  sendMessage: (channelId: string, text: string, type?: 'text' | 'file' | 'voice', fileUrl?: string, audioDuration?: string) => void;
  markNotificationsRead: () => void;
  updateTaskStatus: (projectId: string, taskId: string, status: 'todo' | 'in_progress' | 'done') => void;
  verifyUserByAdmin: (userId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(EMPTY_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);

  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [hackathons, setHackathons] = useState<Hackathon[]>(INITIAL_HACKATHONS);
  const [startups, setStartups] = useState<StartupIdea[]>(INITIAL_STARTUPS);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(INITIAL_FORUM_POSTS);
  const [polls, setPolls] = useState<Poll[]>(INITIAL_POLLS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [chatChannels, setChatChannels] = useState<ChatChannel[]>(INITIAL_CHAT_CHANNELS);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_CHAT_MESSAGES);
  const [activeChannelId, setActiveChannelId] = useState<string>('chan_1');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'google' | 'otp' | 'forgot'>('login');
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfile | null>(null);

  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;
    let unsubscribeUsersCollection: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }
      if (unsubscribeUsersCollection) {
        unsubscribeUsersCollection();
        unsubscribeUsersCollection = null;
      }

      if (!firebaseUser) {
        setCurrentUser(EMPTY_USER);
        setUsers([]);
        setIsAuthenticated(false);
        setEmailVerified(false);
        setAuthLoading(false);
        return;
      }

      // Verify that the user's token is valid and Token Service API is accessible
      firebaseUser.getIdToken().catch(async (tokenErr: any) => {
        const msg = tokenErr?.message || '';
        if (
          msg.includes('token-service-api-has-not-been-used') ||
          msg.includes('securetoken.googleapis.com') ||
          tokenErr?.code === 'auth/token-service-api-has-not-been-used-in-project'
        ) {
          console.warn('Firebase Token Service API is disabled in project. Clearing unrefreshable session.');
          try {
            await signOut(auth);
          } catch {
            // ignore
          }
        }
      });

      setAuthLoading(true);
      setEmailVerified(firebaseUser.emailVerified);

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const mappedUser = mapFirestoreDocToUserProfile(firebaseUser.uid, data, firebaseUser.email || '');
          setCurrentUser(mappedUser);
          setActiveRole(mappedUser.role);
          setEmailVerified(firebaseUser.emailVerified);
          setIsAuthenticated(true);
          setAuthLoading(false);
        } else {
          // Document does not exist yet (registration is still writing it)
          setAuthLoading(true);
        }
      }, (error) => {
        setAuthLoading(false);
        handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
      });

      // Subscribe to genuine users in Firestore (/users collection) while filtering out any demo/mock records
      const usersColRef = collection(db, 'users');
      unsubscribeUsersCollection = onSnapshot(usersColRef, (querySnap) => {
        const genuineUsers: UserProfile[] = [];
        querySnap.forEach((docItem) => {
          const rawData = docItem.data();
          const emailLower = String(rawData.email || '').toLowerCase();
          if (
            KNOWN_DEMO_USER_IDS.has(docItem.id) ||
            KNOWN_DEMO_EMAILS.has(emailLower) ||
            rawData.isDemo === true
          ) {
            return;
          }
          genuineUsers.push(mapFirestoreDocToUserProfile(docItem.id, rawData));
        });
        setUsers(genuineUsers);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
      });
    });

    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
      if (unsubscribeUsersCollection) {
        unsubscribeUsersCollection();
      }
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const activeRole: UserRole = currentUser.role;

  const setActiveRole = (_role: UserRole) => {
    // Role switching is disabled; activeRole always equals currentUser.role
  };

  const logout = async () => {
    await signOut(auth);
    setActiveTab('dashboard');
  };

  const sendSwapRequest = (receiverId: string, teachSkill: string, learnSkill: string, message: string) => {
    const receiver = users.find(u => u.id === receiverId);
    const newSwap: SwapRequest = {
      id: `sw_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      receiverId,
      receiverName: receiver ? receiver.name : 'Student',
      teachSkill,
      learnSkill,
      message,
      status: 'pending',
      createdAt: 'Just now'
    };
    setSwapRequests(prev => [newSwap, ...prev]);

    // Send notification to receiver
    const newNotif: NotificationItem = {
      id: `n_${Date.now()}`,
      title: 'New Skill Swap Request!',
      message: `${currentUser.name} wants to swap ${teachSkill} for ${learnSkill}.`,
      time: 'Just now',
      read: false,
      type: 'swap'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const toggleProjectLike = (projectId: string) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          const upvoted = p.upvotedBy?.includes(currentUser.id);
          const newUpvotedBy = upvoted
            ? p.upvotedBy?.filter(id => id !== currentUser.id)
            : [...(p.upvotedBy || []), currentUser.id];
          return {
            ...p,
            likes: upvoted ? p.likes - 1 : p.likes + 1,
            upvotedBy: newUpvotedBy
          };
        }
        return p;
      })
    );
  };

  const addProject = (projectData: Omit<ProjectItem, 'id' | 'likes' | 'commentsCount' | 'createdAt'>) => {
    const newProject: ProjectItem = {
      ...projectData,
      id: `proj_${Date.now()}`,
      likes: 1,
      commentsCount: 0,
      createdAt: 'Just now',
      upvotedBy: [currentUser.id]
    };
    setProjects(prev => [newProject, ...prev]);
  };

  const registerForHackathon = (hackathonId: string) => {
    setHackathons(prev =>
      prev.map(h => {
        if (h.id === hackathonId) {
          const isReg = !h.isRegistered;
          return {
            ...h,
            isRegistered: isReg,
            registeredStudentsCount: isReg ? h.registeredStudentsCount + 1 : h.registeredStudentsCount - 1
          };
        }
        return h;
      })
    );
  };

  const addStartupIdea = (startupData: Omit<StartupIdea, 'id' | 'likes' | 'mentorsConnected' | 'createdAt'>) => {
    const newStartup: StartupIdea = {
      ...startupData,
      id: `start_${Date.now()}`,
      likes: 1,
      mentorsConnected: 0,
      createdAt: 'Just now'
    };
    setStartups(prev => [newStartup, ...prev]);
  };

  const addForumPost = (postData: Omit<ForumPost, 'id' | 'createdAt' | 'likes' | 'repliesCount'>) => {
    const newPost: ForumPost = {
      ...postData,
      id: `forum_${Date.now()}`,
      createdAt: 'Just now',
      likes: 1,
      repliesCount: 0,
      upvotedBy: [currentUser.id],
      replies: []
    };
    setForumPosts(prev => [newPost, ...prev]);
  };

  const votePoll = (pollId: string, optionId: string) => {
    setPolls(prev =>
      prev.map(p => {
        if (p.id === pollId && !p.userVotedOptionId) {
          const updatedOptions = p.options.map(opt => {
            if (opt.id === optionId) {
              return { ...opt, votes: opt.votes + 1 };
            }
            return opt;
          });
          return {
            ...p,
            options: updatedOptions,
            totalVotes: p.totalVotes + 1,
            userVotedOptionId: optionId
          };
        }
        return p;
      })
    );
  };

  const sendChatMessage = (channelId: string, text: string, type: 'text' | 'file' | 'voice' = 'text', fileUrl?: string, audioDuration?: string) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      channelId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      fileUrl,
      audioDuration
    };

    setChatMessages(prev => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), newMsg]
    }));

    setChatChannels(prev =>
      prev.map(ch => {
        if (ch.id === channelId) {
          return {
            ...ch,
            lastMessage: text || (type === 'voice' ? '🎵 Voice message' : '📎 Shared file'),
            lastMessageTime: 'Just now'
          };
        }
        return ch;
      })
    );
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const updateTaskStatus = (projectId: string, taskId: string, status: 'todo' | 'in_progress' | 'done') => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId && p.tasks) {
          const updatedTasks = p.tasks.map(t => (t.id === taskId ? { ...t, status } : t));
          return { ...p, tasks: updatedTasks };
        }
        return p;
      })
    );
  };

  const verifyUserByAdmin = (userId: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, verificationStatus: 'verified' } : u))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser, setCurrentUser,
        isAuthenticated,
        authLoading,
        emailVerified,
        logout,
        activeRole, setActiveRole,
        users, setUsers,
        projects, setProjects,
        hackathons, setHackathons,
        startups, setStartups,
        forumPosts, setForumPosts,
        polls, setPolls,
        swapRequests, setSwapRequests,
        chatChannels, chatMessages,
        activeChannelId, setActiveChannelId,
        notifications, setNotifications,
        theme, toggleTheme,
        activeTab, setActiveTab,
        authModalOpen, setAuthModalOpen,
        authMode, setAuthMode,
        selectedUserProfile, setSelectedUserProfile,
        sendSwapRequest,
        toggleProjectLike,
        addProject,
        registerForHackathon,
        addStartupIdea,
        addForumPost,
        votePoll,
        sendChatMessage,
        sendMessage: sendChatMessage,
        markNotificationsRead,
        updateTaskStatus,
        verifyUserByAdmin
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
