import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  arrayUnion,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  UserProfile,
  UserRole,
  ProjectItem,
  Hackathon,
  StartupIdea,
  ForumPost,
  Poll,
  ChatChannel,
  ChatMessage,
  NotificationItem,
  SwapRequest,
  ConnectionRequest,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_HACKATHONS,
  INITIAL_STARTUPS,
  INITIAL_FORUM_POSTS,
  INITIAL_POLLS,
  INITIAL_CHAT_CHANNELS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_NOTIFICATIONS,
  KNOWN_DEMO_USER_IDS,
  KNOWN_DEMO_EMAILS,
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

function toIsoString(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val.toDate === 'function') {
    try {
      return val.toDate().toISOString();
    } catch {
      return '';
    }
  }
  if (typeof val.seconds === 'number') {
    return new Date(val.seconds * 1000).toISOString();
  }
  return String(val);
}

function formatRelativeTime(rawInput?: any): string {
  const isoString = toIsoString(rawInput);
  if (!isoString) return 'Just now';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function mapFirestoreDocToUserProfile(
  docId: string,
  data: Record<string, any>,
  fallbackEmail = ''
): UserProfile {
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
    createdAt: data.createdAt ? toIsoString(data.createdAt) : undefined,
  };
}

function mapFirestoreDocToProject(docId: string, data: Record<string, any>): ProjectItem {
  return {
    id: docId,
    title: data.title || 'Untitled Project',
    description: data.description || '',
    techStack: Array.isArray(data.techStack) ? data.techStack : [],
    category: data.category || 'Web Dev',
    githubUrl: typeof data.githubUrl === 'string' ? data.githubUrl.trim() : '',
    liveDemoUrl:
      typeof data.liveDemoUrl === 'string' && data.liveDemoUrl.trim()
        ? data.liveDemoUrl.trim()
        : typeof data.liveUrl === 'string'
        ? data.liveUrl.trim()
        : '',
    liveUrl:
      typeof data.liveDemoUrl === 'string' && data.liveDemoUrl.trim()
        ? data.liveDemoUrl.trim()
        : typeof data.liveUrl === 'string'
        ? data.liveUrl.trim()
        : '',
    likes: typeof data.likes === 'number' ? data.likes : 0,
    commentsCount: typeof data.commentsCount === 'number' ? data.commentsCount : 0,
    authorId: data.authorId || '',
    authorName: data.authorName || 'Student',
    authorUsername: data.authorUsername || '',
    authorAvatar:
      data.authorAvatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(data.authorName || 'User')}`,
    authorRole: data.authorRole || 'student',
    college: data.college || '',
    department: data.department || '',
    createdAt: data.createdAt ? formatRelativeTime(data.createdAt) : 'Just now',
    updatedAt: toIsoString(data.updatedAt || data.createdAt),
    status: data.status || 'In Progress',
    visibility: data.visibility || 'public',
    published: data.published !== false,
    lookingForTeammates: Boolean(data.lookingForTeammates),
    requiredSkills: Array.isArray(data.requiredSkills) ? data.requiredSkills : [],
    teamMembers: Array.isArray(data.teamMembers) ? data.teamMembers : [],
    tasks: Array.isArray(data.tasks) ? data.tasks : [],
    milestones: Array.isArray(data.milestones) ? data.milestones : [],
    files: Array.isArray(data.files) ? data.files : [],
    upvotedBy: Array.isArray(data.upvotedBy) ? data.upvotedBy : [],
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
  connectionRequests: ConnectionRequest[];
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

  // Connection System Actions
  sendConnectionRequest: (targetUser: UserProfile) => Promise<void>;
  acceptConnectionRequest: (requestId: string) => Promise<void>;
  rejectConnectionRequest: (requestId: string) => Promise<void>;
  cancelConnectionRequest: (requestId: string) => Promise<void>;
  removeConnection: (targetUserId: string) => Promise<void>;

  // Skill Swap Actions
  sendSwapRequest: (
    receiverId: string,
    teachSkill: string,
    learnSkill: string,
    message: string
  ) => Promise<void>;
  acceptSwapRequest: (swapId: string) => Promise<void>;
  rejectSwapRequest: (swapId: string) => Promise<void>;
  cancelSwapRequest: (swapId: string) => Promise<void>;

  // Project Hub Actions
  toggleProjectLike: (projectId: string) => Promise<void>;
  addProject: (
    project: Omit<ProjectItem, 'id' | 'likes' | 'commentsCount' | 'createdAt'>
  ) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<ProjectItem>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  updateTaskStatus: (
    projectId: string,
    taskId: string,
    status: 'todo' | 'in_progress' | 'done'
  ) => Promise<void>;

  // Chat Actions
  openDirectChat: (targetUser: UserProfile) => Promise<string>;
  createGroupChat: (name: string, memberIds: string[], projectId?: string) => Promise<string>;
  sendChatMessage: (
    channelId: string,
    text: string,
    type?: 'text' | 'file' | 'voice',
    fileUrl?: string,
    audioDuration?: string,
    fileName?: string
  ) => Promise<void>;
  sendMessage: (
    channelId: string,
    text: string,
    type?: 'text' | 'file' | 'voice',
    fileUrl?: string,
    audioDuration?: string,
    fileName?: string
  ) => Promise<void>;
  markChannelRead: (channelId: string) => Promise<void>;

  // Other Actions
  registerForHackathon: (hackathonId: string) => void;
  addStartupIdea: (
    startup: Omit<StartupIdea, 'id' | 'likes' | 'mentorsConnected' | 'createdAt'>
  ) => void;
  addForumPost: (post: Omit<ForumPost, 'id' | 'createdAt' | 'likes' | 'repliesCount'>) => void;
  votePoll: (pollId: string, optionId: string) => void;
  markNotificationsRead: () => Promise<void>;
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
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'google' | 'otp' | 'forgot'>('login');
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfile | null>(null);

  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;
    let unsubscribeUsersCollection: (() => void) | null = null;
    let unsubscribeConnections: (() => void) | null = null;
    let unsubscribeSwaps: (() => void) | null = null;
    let unsubscribeNotifications: (() => void) | null = null;
    let unsubscribePublicProjects: (() => void) | null = null;
    let unsubscribeOwnProjects: (() => void) | null = null;
    let unsubscribeChats: (() => void) | null = null;
    let messageUnsubscribers: Record<string, () => void> = {};

    const cleanupAllListeners = () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }
      if (unsubscribeUsersCollection) {
        unsubscribeUsersCollection();
        unsubscribeUsersCollection = null;
      }
      if (unsubscribeConnections) {
        unsubscribeConnections();
        unsubscribeConnections = null;
      }
      if (unsubscribeSwaps) {
        unsubscribeSwaps();
        unsubscribeSwaps = null;
      }
      if (unsubscribeNotifications) {
        unsubscribeNotifications();
        unsubscribeNotifications = null;
      }
      if (unsubscribePublicProjects) {
        unsubscribePublicProjects();
        unsubscribePublicProjects = null;
      }
      if (unsubscribeOwnProjects) {
        unsubscribeOwnProjects();
        unsubscribeOwnProjects = null;
      }
      if (unsubscribeChats) {
        unsubscribeChats();
        unsubscribeChats = null;
      }
      Object.values(messageUnsubscribers).forEach((unsub) => unsub());
      messageUnsubscribers = {};
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      cleanupAllListeners();

      if (!firebaseUser) {
        setCurrentUser(EMPTY_USER);
        setUsers([]);
        setProjects([]);
        setSwapRequests([]);
        setConnectionRequests([]);
        setChatChannels([]);
        setChatMessages({});
        setNotifications([]);
        setActiveChannelId('');
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

      const uid = firebaseUser.uid;

      // 1. Current User Profile listener (auto-bootstraps profile doc if missing on live login)
      const userDocRef = doc(db, 'users', uid);
      let bootstrappingProfile = false;
      unsubscribeSnapshot = onSnapshot(
        userDocRef,
        async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const mappedUser = mapFirestoreDocToUserProfile(uid, data, firebaseUser.email || '');
            setCurrentUser(mappedUser);
            setEmailVerified(firebaseUser.emailVerified);
            setIsAuthenticated(true);
            setAuthLoading(false);
          } else if (!bootstrappingProfile) {
            bootstrappingProfile = true;
            const fallbackEmail = (firebaseUser.email || 'user@example.com').slice(0, 254);
            const fallbackName = (
              firebaseUser.displayName ||
              fallbackEmail.split('@')[0] ||
              'Campus Member'
            ).slice(0, 100);
            const fallbackUsername = (
              fallbackEmail.split('@')[0]?.replace(/[^a-zA-Z0-9_-]/g, '') ||
              `user_${uid.slice(0, 6)}`
            ).slice(0, 60);
            const fallbackAvatar = (
              firebaseUser.photoURL ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}`
            ).slice(0, 1000);
            try {
              await setDoc(
                userDocRef,
                {
                  name: fallbackName,
                  username: fallbackUsername,
                  email: fallbackEmail,
                  role: 'student',
                  college: 'Maulana Azad National Urdu University',
                  institution: 'Maulana Azad National Urdu University',
                  department: 'ECE',
                  semester: 4,
                  bio: 'Student passionate about skill exchange, project collaboration, and peer learning.',
                  avatar: fallbackAvatar,
                  skillsToTeach: [],
                  skillsToLearn: [],
                  interests: ['Hackathons', 'Project Teams'],
                  createdAt: new Date().toISOString(),
                },
                { merge: true }
              );
            } catch {
              // If AuthModal is concurrently creating the profile doc, onSnapshot will fire again when committed
            } finally {
              setAuthLoading(false);
            }
          }
        },
        (error) => {
          setAuthLoading(false);
          handleFirestoreError(error, OperationType.GET, `users/${uid}`);
        }
      );

      // 2. Genuine Users Directory listener (/users)
      const usersColRef = collection(db, 'users');
      unsubscribeUsersCollection = onSnapshot(
        usersColRef,
        (querySnap) => {
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
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'users');
        }
      );

      // 3. Student-Teacher & Peer Connection Requests listener (/connectionRequests)
      const connQuery = query(
        collection(db, 'connectionRequests'),
        where('participants', 'array-contains', uid)
      );
      unsubscribeConnections = onSnapshot(
        connQuery,
        (querySnap) => {
          const list: ConnectionRequest[] = [];
          querySnap.forEach((docItem) => {
            const d = docItem.data();
            list.push({
              id: docItem.id,
              senderUid: d.senderUid || '',
              senderName: d.senderName || 'User',
              senderUsername: d.senderUsername || '',
              senderAvatar: d.senderAvatar || '',
              senderRole: d.senderRole || 'student',
              senderCollege: d.senderCollege || '',
              senderDepartment: d.senderDepartment || '',
              receiverUid: d.receiverUid || '',
              receiverName: d.receiverName || 'User',
              receiverUsername: d.receiverUsername || '',
              receiverAvatar: d.receiverAvatar || '',
              receiverRole: d.receiverRole || 'student',
              receiverCollege: d.receiverCollege || '',
              receiverDepartment: d.receiverDepartment || '',
              participants: Array.isArray(d.participants) ? d.participants : [],
              status: d.status || 'Pending',
              createdAt: toIsoString(d.createdAt),
              updatedAt: toIsoString(d.updatedAt || d.createdAt),
            });
          });
          list.sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
          setConnectionRequests(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'connectionRequests');
        }
      );

      // 4. Skill Exchange Requests listener (/exchangeRequests)
      const swapsQuery = query(
        collection(db, 'exchangeRequests'),
        where('participants', 'array-contains', uid)
      );
      unsubscribeSwaps = onSnapshot(
        swapsQuery,
        (querySnap) => {
          const list: SwapRequest[] = [];
          querySnap.forEach((docItem) => {
            const d = docItem.data();
            const rawStatus = String(d.status || 'Pending').toLowerCase();
            const mappedStatus: SwapRequest['status'] =
              rawStatus === 'accepted'
                ? 'accepted'
                : rawStatus === 'rejected' || rawStatus === 'declined'
                ? 'declined'
                : rawStatus === 'cancelled'
                ? 'cancelled'
                : rawStatus === 'completed'
                ? 'completed'
                : 'pending';

            list.push({
              id: docItem.id,
              senderId: d.senderUid || '',
              senderName: d.senderName || 'Student',
              senderAvatar:
                d.senderAvatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(d.senderName || 'User')}`,
              receiverId: d.receiverUid || '',
              receiverName: d.receiverName || 'Student',
              receiverAvatar: d.receiverAvatar || '',
              teachSkill: d.offeredSkill || '',
              learnSkill: d.requestedSkill || '',
              message: d.message || '',
              status: mappedStatus,
              createdAt: formatRelativeTime(d.createdAt),
              updatedAt: toIsoString(d.updatedAt || d.createdAt),
            });
          });
          list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
          setSwapRequests(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'exchangeRequests');
        }
      );

      // 5. Real Notifications listener (/notifications)
      const notifQuery = query(
        collection(db, 'notifications'),
        where('recipientUid', '==', uid)
      );
      unsubscribeNotifications = onSnapshot(
        notifQuery,
        (querySnap) => {
          const items: (NotificationItem & { rawTime: string })[] = [];
          querySnap.forEach((docItem) => {
            const d = docItem.data();
            const rawTime = toIsoString(d.createdAt);
            items.push({
              id: docItem.id,
              recipientUid: d.recipientUid,
              senderUid: d.senderUid,
              title: d.title || 'Notification',
              message: d.message || '',
              time: formatRelativeTime(rawTime),
              rawTime,
              read: Boolean(d.read),
              type: d.type || 'admin',
            });
          });
          items.sort((a, b) => b.rawTime.localeCompare(a.rawTime));
          setNotifications(items);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'notifications');
        }
      );

      // 6. Projects listener (/projects: public projects + user's own projects)
      let publicProjectsMap: Record<string, ProjectItem> = {};
      let ownProjectsMap: Record<string, ProjectItem> = {};

      const mergeAndSetProjects = () => {
        const merged = { ...publicProjectsMap, ...ownProjectsMap };
        const arr = Object.values(merged).filter((p) => p.published !== false);
        arr.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
        setProjects(arr);
      };

      const pubProjQuery = query(
        collection(db, 'projects'),
        where('visibility', '==', 'public')
      );
      unsubscribePublicProjects = onSnapshot(
        pubProjQuery,
        (querySnap) => {
          const nextMap: Record<string, ProjectItem> = {};
          querySnap.forEach((docItem) => {
            nextMap[docItem.id] = mapFirestoreDocToProject(docItem.id, docItem.data());
          });
          publicProjectsMap = nextMap;
          mergeAndSetProjects();
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'projects');
        }
      );

      const ownProjQuery = query(
        collection(db, 'projects'),
        where('authorId', '==', uid)
      );
      unsubscribeOwnProjects = onSnapshot(
        ownProjQuery,
        (querySnap) => {
          const nextMap: Record<string, ProjectItem> = {};
          querySnap.forEach((docItem) => {
            nextMap[docItem.id] = mapFirestoreDocToProject(docItem.id, docItem.data());
          });
          ownProjectsMap = nextMap;
          mergeAndSetProjects();
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'projects');
        }
      );

      // 7. Real-Time Conversations & Messages listener (/chats and /chats/{chatId}/messages)
      const retryTimers: Record<string, ReturnType<typeof setTimeout>> = {};

      const attachMessagesListener = (chatId: string) => {
        if (messageUnsubscribers[chatId]) return;
        const msgsColRef = collection(db, 'chats', chatId, 'messages');
        messageUnsubscribers[chatId] = onSnapshot(
          msgsColRef,
          (msgSnap) => {
            const msgs: (ChatMessage & { rawTime: string })[] = [];
            msgSnap.forEach((mDoc) => {
              const md = mDoc.data();
              const rawCreated = toIsoString(md.createdAt);
              msgs.push({
                id: mDoc.id,
                channelId: chatId,
                senderId: md.senderUid || '',
                senderName: md.senderName || 'User',
                senderAvatar:
                  md.senderAvatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(md.senderName || 'User')}`,
                text: md.text || '',
                timestamp: formatRelativeTime(rawCreated),
                createdAt: rawCreated,
                rawTime: rawCreated,
                readBy: Array.isArray(md.readBy) ? md.readBy : [],
                type: md.type || 'text',
                fileUrl: md.fileUrl || undefined,
                fileName: md.fileName || undefined,
                audioDuration: md.audioDuration || undefined,
              });
            });
            msgs.sort((a, b) => a.rawTime.localeCompare(b.rawTime));
            setChatMessages((prev) => ({
              ...prev,
              [chatId]: msgs,
            }));
          },
          (err) => {
            console.warn(`Message listener transient error on chats/${chatId}/messages, retrying:`, err);
            if (messageUnsubscribers[chatId]) {
              messageUnsubscribers[chatId]();
              delete messageUnsubscribers[chatId];
            }
            if (!retryTimers[chatId]) {
              retryTimers[chatId] = setTimeout(() => {
                delete retryTimers[chatId];
                if (auth.currentUser?.uid === uid) {
                  attachMessagesListener(chatId);
                }
              }, 1200);
            }
          }
        );
      };

      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', uid)
      );
      unsubscribeChats = onSnapshot(
        chatsQuery,
        (querySnap) => {
          const rawChannels: ChatChannel[] = [];
          const activeIds = new Set<string>();

          querySnap.forEach((docItem) => {
            const d = docItem.data();
            const chatId = docItem.id;
            activeIds.add(chatId);

            const participants: string[] = Array.isArray(d.participants)
              ? d.participants
              : Array.isArray(d.members)
              ? d.members
              : [];
            const isDirect = d.type === 'direct' || chatId.startsWith('dm_');
            const dmParts = isDirect && chatId.startsWith('dm_') ? chatId.split('_') : [];
            const fallbackPeerFromId =
              dmParts.length === 3 ? dmParts.slice(1).find((p) => p !== uid) : undefined;
            const peerUid = isDirect
              ? participants.find((p) => p !== uid) || fallbackPeerFromId || uid
              : undefined;
            const profiles = d.participantProfiles || {};
            const peerProfile = peerUid ? profiles[peerUid] : undefined;

            const displayName = isDirect
              ? peerProfile?.name || d.name || 'Direct Conversation'
              : d.name || 'Group Chat';
            const displayAvatar = isDirect
              ? peerProfile?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`
              : d.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4f46e5&color=fff`;

            const unreadCountsMap = d.unreadCounts || {};
            const unreadForMe =
              typeof unreadCountsMap[uid] === 'number' ? unreadCountsMap[uid] : 0;

            const normalizedUpdatedAt = toIsoString(d.updatedAt || d.createdAt);

            rawChannels.push({
              id: chatId,
              name: displayName,
              type: isDirect ? 'direct' : 'group',
              members: participants,
              avatar: displayAvatar,
              peerUid,
              peerUsername: peerProfile?.username || '',
              peerRole: peerProfile?.role || 'student',
              peerCollege: peerProfile?.college || '',
              projectId: d.projectId || undefined,
              lastMessage: d.lastMessage || 'Start conversation...',
              lastMessageTime: normalizedUpdatedAt ? formatRelativeTime(normalizedUpdatedAt) : '',
              unreadCount: unreadForMe,
              updatedAt: normalizedUpdatedAt,
            });

            // Immediately attach subcollection listener for every active conversation
            attachMessagesListener(chatId);
          });

          // Clean up message listeners for removed chats
          Object.keys(messageUnsubscribers).forEach((cid) => {
            if (!activeIds.has(cid)) {
              messageUnsubscribers[cid]();
              delete messageUnsubscribers[cid];
            }
          });

          rawChannels.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
          setChatChannels(rawChannels);
          setActiveChannelId((prev) => {
            if (prev && rawChannels.some((c) => c.id === prev)) return prev;
            return rawChannels[0]?.id || '';
          });
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'chats');
        }
      );
    });

    return () => {
      cleanupAllListeners();
      unsubscribeAuth();
    };
  }, []);

  // Dedicated real-time listener for the currently selected activeChannelId
  useEffect(() => {
    if (!currentUser.id || !activeChannelId) return;
    const msgsColRef = collection(db, 'chats', activeChannelId, 'messages');
    const unsub = onSnapshot(
      msgsColRef,
      (msgSnap) => {
        const msgs: (ChatMessage & { rawTime: string })[] = [];
        msgSnap.forEach((mDoc) => {
          const md = mDoc.data();
          const rawCreated = toIsoString(md.createdAt);
          msgs.push({
            id: mDoc.id,
            channelId: activeChannelId,
            senderId: md.senderUid || '',
            senderName: md.senderName || 'User',
            senderAvatar:
              md.senderAvatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(md.senderName || 'User')}`,
            text: md.text || '',
            timestamp: formatRelativeTime(rawCreated),
            createdAt: rawCreated,
            rawTime: rawCreated,
            readBy: Array.isArray(md.readBy) ? md.readBy : [],
            type: md.type || 'text',
            fileUrl: md.fileUrl || undefined,
            fileName: md.fileName || undefined,
            audioDuration: md.audioDuration || undefined,
          });
        });
        msgs.sort((a, b) => a.rawTime.localeCompare(b.rawTime));
        setChatMessages((prev) => ({
          ...prev,
          [activeChannelId]: msgs,
        }));
      },
      (err) => {
        console.warn(`Active channel listener warning on chats/${activeChannelId}/messages:`, err);
      }
    );
    return () => unsub();
  }, [activeChannelId, currentUser.id]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const activeRole: UserRole = currentUser.role;

  const setActiveRole = (_role: UserRole) => {
    // Role switching is disabled; activeRole always equals currentUser.role
  };

  const logout = async () => {
    await signOut(auth);
    setActiveTab('dashboard');
  };

  // Helper to create a Firestore notification document
  const createNotificationDoc = async (
    recipientUid: string,
    title: string,
    message: string,
    type: NotificationItem['type']
  ) => {
    if (!currentUser.id || !recipientUid || recipientUid === currentUser.id) return;
    const notifId = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    try {
      await setDoc(doc(db, 'notifications', notifId), {
        recipientUid,
        senderUid: currentUser.id,
        title: title.slice(0, 140),
        message: message.slice(0, 480),
        read: false,
        type,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `notifications/${notifId}`);
    }
  };

  // ==================================================
  // CONNECTION SYSTEM ACTIONS
  // ==================================================
  const sendConnectionRequest = async (targetUser: UserProfile) => {
    if (!currentUser.id || !targetUser.id || targetUser.id === currentUser.id) return;
    const sortedPair = [currentUser.id, targetUser.id].sort();
    const connId = `conn_${sortedPair[0]}_${sortedPair[1]}`;
    const now = new Date().toISOString();

    try {
      await setDoc(doc(db, 'connectionRequests', connId), {
        senderUid: currentUser.id,
        senderName: currentUser.name,
        senderUsername: currentUser.username || currentUser.id.slice(0, 8),
        senderAvatar: currentUser.avatar,
        senderRole: currentUser.role,
        senderCollege: currentUser.college || currentUser.institution || 'MANUU, Hyderabad',
        senderDepartment: currentUser.department || 'ECE',
        receiverUid: targetUser.id,
        receiverName: targetUser.name,
        receiverUsername: targetUser.username || targetUser.id.slice(0, 8),
        receiverAvatar: targetUser.avatar,
        receiverRole: targetUser.role,
        receiverCollege: targetUser.college || targetUser.institution || 'MANUU, Hyderabad',
        receiverDepartment: targetUser.department || 'ECE',
        participants: [currentUser.id, targetUser.id],
        status: 'Pending',
        createdAt: now,
        updatedAt: now,
      });

      await createNotificationDoc(
        targetUser.id,
        'New Connection Request',
        `${currentUser.name} (${currentUser.role === 'teacher' ? 'Professor / Faculty' : 'Student'}) wants to connect with you.`,
        'team'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `connectionRequests/${connId}`);
    }
  };

  const acceptConnectionRequest = async (requestId: string) => {
    const reqItem = connectionRequests.find((r) => r.id === requestId);
    if (!reqItem || !currentUser.id) return;
    const now = new Date().toISOString();

    try {
      await updateDoc(doc(db, 'connectionRequests', requestId), {
        status: 'Accepted',
        updatedAt: now,
      });

      // Ensure a direct conversation exists between the two connected users
      const sortedPair = [reqItem.senderUid, reqItem.receiverUid].sort();
      const chatId = `dm_${sortedPair[0]}_${sortedPair[1]}`;
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          name: `${reqItem.senderName} & ${reqItem.receiverName}`,
          type: 'direct',
          participants: [reqItem.senderUid, reqItem.receiverUid],
          participantProfiles: {
            [reqItem.senderUid]: {
              name: reqItem.senderName,
              username: reqItem.senderUsername,
              avatar: reqItem.senderAvatar,
              role: reqItem.senderRole,
              college: reqItem.senderCollege,
            },
            [reqItem.receiverUid]: {
              name: reqItem.receiverName,
              username: reqItem.receiverUsername,
              avatar: reqItem.receiverAvatar,
              role: reqItem.receiverRole,
              college: reqItem.receiverCollege,
            },
          },
          lastMessage: 'Connected! Say hello to start collaborating.',
          lastMessageTime: now,
          lastSenderUid: currentUser.id,
          unreadCounts: {
            [reqItem.senderUid]: 1,
            [reqItem.receiverUid]: 0,
          },
          createdAt: now,
          updatedAt: now,
        });
      }

      await createNotificationDoc(
        reqItem.senderUid,
        'Connection Request Accepted!',
        `${currentUser.name} accepted your connection request. You can now chat directly!`,
        'team'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `connectionRequests/${requestId}`);
    }
  };

  const rejectConnectionRequest = async (requestId: string) => {
    if (!currentUser.id) return;
    try {
      await updateDoc(doc(db, 'connectionRequests', requestId), {
        status: 'Rejected',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `connectionRequests/${requestId}`);
    }
  };

  const cancelConnectionRequest = async (requestId: string) => {
    if (!currentUser.id) return;
    try {
      await deleteDoc(doc(db, 'connectionRequests', requestId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `connectionRequests/${requestId}`);
    }
  };

  const removeConnection = async (targetUserId: string) => {
    if (!currentUser.id || !targetUserId) return;
    const sortedPair = [currentUser.id, targetUserId].sort();
    const connId = `conn_${sortedPair[0]}_${sortedPair[1]}`;
    try {
      await deleteDoc(doc(db, 'connectionRequests', connId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `connectionRequests/${connId}`);
    }
  };

  // ==================================================
  // SKILL EXCHANGE ACTIONS
  // ==================================================
  const sendSwapRequest = async (
    receiverId: string,
    teachSkill: string,
    learnSkill: string,
    message: string
  ) => {
    if (!currentUser.id || !receiverId || receiverId === currentUser.id) return;
    const receiver = users.find((u) => u.id === receiverId);
    const swapId = `swap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    try {
      await setDoc(doc(db, 'exchangeRequests', swapId), {
        senderUid: currentUser.id,
        senderName: currentUser.name,
        senderUsername: currentUser.username || currentUser.id.slice(0, 8),
        senderAvatar: currentUser.avatar,
        receiverUid: receiverId,
        receiverName: receiver ? receiver.name : 'Campus Member',
        receiverUsername: receiver?.username || receiverId.slice(0, 8),
        receiverAvatar: receiver ? receiver.avatar : '',
        participants: [currentUser.id, receiverId],
        offeredSkill: teachSkill.trim().slice(0, 120) || 'General Mentoring',
        requestedSkill: learnSkill.trim().slice(0, 120) || 'Skill Collaboration',
        message: (message || '').trim().slice(0, 1000),
        status: 'Pending',
        createdAt: now,
        updatedAt: now,
      });

      await createNotificationDoc(
        receiverId,
        'New Skill Swap Request!',
        `${currentUser.name} offered to teach ${teachSkill} in exchange for ${learnSkill}.`,
        'swap'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `exchangeRequests/${swapId}`);
    }
  };

  const acceptSwapRequest = async (swapId: string) => {
    const swap = swapRequests.find((s) => s.id === swapId);
    if (!swap || !currentUser.id) return;
    const now = new Date().toISOString();

    try {
      await updateDoc(doc(db, 'exchangeRequests', swapId), {
        status: 'Accepted',
        updatedAt: now,
      });

      await createNotificationDoc(
        swap.senderId,
        'Skill Swap Accepted!',
        `${currentUser.name} accepted your skill swap (${swap.teachSkill} ⇄ ${swap.learnSkill}).`,
        'swap'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `exchangeRequests/${swapId}`);
    }
  };

  const rejectSwapRequest = async (swapId: string) => {
    const swap = swapRequests.find((s) => s.id === swapId);
    if (!swap || !currentUser.id) return;
    try {
      await updateDoc(doc(db, 'exchangeRequests', swapId), {
        status: 'Rejected',
        updatedAt: new Date().toISOString(),
      });

      await createNotificationDoc(
        swap.senderId,
        'Skill Swap Update',
        `${currentUser.name} declined the skill swap request for ${swap.learnSkill}.`,
        'swap'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `exchangeRequests/${swapId}`);
    }
  };

  const cancelSwapRequest = async (swapId: string) => {
    if (!currentUser.id) return;
    try {
      await deleteDoc(doc(db, 'exchangeRequests', swapId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `exchangeRequests/${swapId}`);
    }
  };

  // ==================================================
  // REAL-TIME CHAT ACTIONS
  // ==================================================
  const openDirectChat = async (targetUser: UserProfile): Promise<string> => {
    const senderUid = currentUser.id || auth.currentUser?.uid || '';
    if (!senderUid || !targetUser.id) return '';
    const sortedPair = [senderUid, targetUser.id].sort();
    const chatId = `dm_${sortedPair[0]}_${sortedPair[1]}`;
    const chatRef = doc(db, 'chats', chatId);
    const now = new Date().toISOString();

    const participantProfiles = {
      [senderUid]: {
        name: currentUser.name || auth.currentUser?.displayName || 'User',
        username: currentUser.username || senderUid.slice(0, 8),
        avatar:
          currentUser.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}`,
        role: currentUser.role || 'student',
        college: currentUser.college || currentUser.institution || 'MANUU, Hyderabad',
      },
      [targetUser.id]: {
        name: targetUser.name,
        username: targetUser.username || targetUser.id.slice(0, 8),
        avatar: targetUser.avatar,
        role: targetUser.role,
        college: targetUser.college || targetUser.institution || 'MANUU, Hyderabad',
      },
    };

    try {
      const snap = await getDoc(chatRef);
      if (!snap.exists()) {
        await setDoc(chatRef, {
          name: targetUser.name,
          type: 'direct',
          participants: [senderUid, targetUser.id],
          participantProfiles,
          lastMessage: 'Conversation started',
          lastMessageTime: now,
          lastSenderUid: senderUid,
          unreadCounts: {
            [senderUid]: 0,
            [targetUser.id]: 0,
          },
          createdAt: now,
          updatedAt: now,
        });
      } else {
        // Ensure both participants and their profiles are always synced on existing chat docs
        await setDoc(
          chatRef,
          {
            type: 'direct',
            participants: [senderUid, targetUser.id],
            participantProfiles,
          },
          { merge: true }
        );
      }
      setActiveChannelId(chatId);
      setActiveTab('chat');
      return chatId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `chats/${chatId}`);
    }
  };

  const createGroupChat = async (
    name: string,
    memberIds: string[],
    projectId?: string
  ): Promise<string> => {
    const senderUid = currentUser.id || auth.currentUser?.uid || '';
    if (!senderUid || !name.trim()) return '';
    const chatId = `grp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const allParticipants = Array.from(new Set([senderUid, ...memberIds])).slice(0, 50);

    const unreadCounts: Record<string, number> = {};
    allParticipants.forEach((uid) => {
      unreadCounts[uid] = 0;
    });

    try {
      await setDoc(doc(db, 'chats', chatId), {
        name: name.trim().slice(0, 120),
        type: 'group',
        participants: allParticipants,
        projectId: projectId || '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=4f46e5&color=fff`,
        lastMessage: `${currentUser.name} created group "${name.trim()}"`,
        lastMessageTime: now,
        lastSenderUid: senderUid,
        unreadCounts,
        createdAt: now,
        updatedAt: now,
      });
      setActiveChannelId(chatId);
      setActiveTab('chat');
      return chatId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `chats/${chatId}`);
    }
  };

  const sendChatMessage = async (
    channelId: string,
    text: string,
    type: 'text' | 'file' | 'voice' = 'text',
    fileUrl?: string,
    audioDuration?: string,
    fileName?: string
  ) => {
    const senderUid = currentUser.id || auth.currentUser?.uid || '';
    if (!senderUid || !channelId || !text.trim()) return;
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const cleanText = text.trim().slice(0, 2000);

    const channel = chatChannels.find((c) => c.id === channelId);
    const chatRef = doc(db, 'chats', channelId);

    try {
      // 1. Inspect / ensure parent chat document and full participant list FIRST
      const chatSnap = await getDoc(chatRef);
      const existingData = chatSnap.exists() ? chatSnap.data() : {};
      const existingParticipants: string[] = Array.isArray(existingData.participants)
        ? existingData.participants
        : Array.isArray(existingData.members)
        ? existingData.members
        : [];

      const participantSet = new Set<string>([
        senderUid,
        ...(channel?.members || []),
        ...existingParticipants,
      ]);
      if (channel?.peerUid) {
        participantSet.add(channel.peerUid);
      }
      if (channelId.startsWith('dm_')) {
        const dmParts = channelId.split('_');
        if (dmParts.length === 3) {
          if (dmParts[1]) participantSet.add(dmParts[1]);
          if (dmParts[2]) participantSet.add(dmParts[2]);
        }
      }

      const allParticipants = Array.from(participantSet).filter(Boolean);
      const peerUid = allParticipants.find((p) => p !== senderUid) || '';

      const existingCounts = existingData.unreadCounts || {};
      const nextUnreadCounts: Record<string, number> = { ...existingCounts };
      allParticipants.forEach((pUid) => {
        if (pUid === senderUid) {
          nextUnreadCounts[pUid] = 0;
        } else {
          nextUnreadCounts[pUid] = (Number(nextUnreadCounts[pUid]) || 0) + 1;
        }
      });

      const lastMessagePreview =
        type === 'voice'
          ? '🎵 Voice message'
          : type === 'file'
          ? `📎 ${fileName || cleanText}`
          : cleanText.slice(0, 200);

      // Build participantProfiles so receiver always sees sender's name/avatar
      const existingProfiles = existingData.participantProfiles || {};
      const peerUserObj = peerUid ? users.find((u) => u.id === peerUid) : undefined;
      const mergedProfiles: Record<string, any> = {
        ...existingProfiles,
        [senderUid]: {
          name: currentUser.name || auth.currentUser?.displayName || 'User',
          username: currentUser.username || senderUid.slice(0, 8),
          avatar:
            currentUser.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}`,
          role: currentUser.role || 'student',
          college: currentUser.college || currentUser.institution || 'MANUU, Hyderabad',
        },
      };
      if (peerUid && peerUserObj) {
        mergedProfiles[peerUid] = {
          name: peerUserObj.name,
          username: peerUserObj.username || peerUid.slice(0, 8),
          avatar: peerUserObj.avatar,
          role: peerUserObj.role,
          college: peerUserObj.college || peerUserObj.institution || 'MANUU, Hyderabad',
        };
      }

      // Ensure parent /chats/{channelId} exists and has both participants BEFORE message write
      await setDoc(
        chatRef,
        {
          name: existingData.name || channel?.name || peerUserObj?.name || 'Conversation',
          type: existingData.type || channel?.type || (channelId.startsWith('dm_') ? 'direct' : 'group'),
          participants: allParticipants,
          participantProfiles: mergedProfiles,
          lastMessage: lastMessagePreview,
          lastMessageTime: now,
          lastSenderUid: senderUid,
          unreadCounts: nextUnreadCounts,
          createdAt: existingData.createdAt || now,
          updatedAt: now,
        },
        { merge: true }
      );

      // 2. Write message document to /chats/{channelId}/messages/{msgId} with participant list
      await setDoc(doc(db, 'chats', channelId, 'messages', msgId), {
        chatId: channelId,
        senderUid,
        receiverUid: peerUid,
        participants: allParticipants,
        senderName: currentUser.name || auth.currentUser?.displayName || 'User',
        senderAvatar:
          currentUser.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}`,
        text: cleanText,
        type,
        fileUrl: fileUrl || '',
        fileName: fileName || '',
        audioDuration: audioDuration || '',
        readBy: [senderUid],
        createdAt: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `chats/${channelId}/messages/${msgId}`);
    }
  };

  const markChannelRead = async (channelId: string) => {
    if (!currentUser.id || !channelId) return;
    const channel = chatChannels.find((c) => c.id === channelId);
    if (!channel || !channel.unreadCount || channel.unreadCount === 0) return;

    try {
      const chatRef = doc(db, 'chats', channelId);
      await updateDoc(chatRef, {
        [`unreadCounts.${currentUser.id}`]: 0,
      });

      const msgs = chatMessages[channelId] || [];
      const unreadMsgs = msgs.filter(
        (m) => m.senderId !== currentUser.id && !(m.readBy || []).includes(currentUser.id)
      );
      await Promise.all(
        unreadMsgs.map((m) =>
          updateDoc(doc(db, 'chats', channelId, 'messages', m.id), {
            readBy: arrayUnion(currentUser.id),
          }).catch(() => {})
        )
      );
    } catch {
      // Non-fatal if channel read marker races
    }
  };

  // ==================================================
  // PROJECT HUB ACTIONS (FIRESTORE PERSISTED)
  // ==================================================
  const addProject = async (
    projectData: Omit<ProjectItem, 'id' | 'likes' | 'commentsCount' | 'createdAt'>
  ) => {
    if (!currentUser.id) return;
    const projId = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    try {
      await setDoc(doc(db, 'projects', projId), {
        title: projectData.title.trim().slice(0, 150),
        description: projectData.description.trim().slice(0, 2000),
        category: projectData.category || 'Web Dev',
        techStack: Array.isArray(projectData.techStack) ? projectData.techStack.slice(0, 20) : [],
        githubUrl: (projectData.githubUrl || '').trim(),
        liveDemoUrl: (projectData.liveDemoUrl || projectData.liveUrl || '').trim(),
        liveUrl: (projectData.liveDemoUrl || projectData.liveUrl || '').trim(),
        likes: 1,
        commentsCount: 0,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorUsername: currentUser.username || currentUser.id.slice(0, 8),
        authorAvatar: currentUser.avatar,
        authorRole: currentUser.role,
        college: currentUser.college || currentUser.institution || 'MANUU, Hyderabad',
        department: currentUser.department || 'ECE',
        status: projectData.status || 'In Progress',
        visibility: projectData.visibility || 'public',
        published: projectData.published !== false,
        lookingForTeammates: Boolean(projectData.lookingForTeammates),
        requiredSkills: Array.isArray(projectData.requiredSkills)
          ? projectData.requiredSkills.slice(0, 15)
          : [],
        teamMembers: Array.isArray(projectData.teamMembers)
          ? projectData.teamMembers
          : [currentUser.id],
        tasks: Array.isArray(projectData.tasks) ? projectData.tasks : [],
        milestones: Array.isArray(projectData.milestones) ? projectData.milestones : [],
        files: Array.isArray(projectData.files) ? projectData.files : [],
        upvotedBy: [currentUser.id],
        createdAt: now,
        updatedAt: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `projects/${projId}`);
    }
  };

  const updateProject = async (projectId: string, updates: Partial<ProjectItem>) => {
    if (!currentUser.id || !projectId) return;
    const existing = projects.find((p) => p.id === projectId);
    if (!existing || existing.authorId !== currentUser.id) return;

    const payload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (updates.title !== undefined) payload.title = updates.title.trim().slice(0, 150);
    if (updates.description !== undefined)
      payload.description = updates.description.trim().slice(0, 2000);
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.visibility !== undefined) payload.visibility = updates.visibility;
    if (updates.techStack !== undefined) payload.techStack = updates.techStack;
    if (updates.requiredSkills !== undefined) payload.requiredSkills = updates.requiredSkills;
    if (updates.lookingForTeammates !== undefined)
      payload.lookingForTeammates = updates.lookingForTeammates;
    if (updates.githubUrl !== undefined) payload.githubUrl = (updates.githubUrl || '').trim();
    if (updates.liveDemoUrl !== undefined || updates.liveUrl !== undefined) {
      const resolvedDemo = (updates.liveDemoUrl ?? updates.liveUrl ?? '').trim();
      payload.liveDemoUrl = resolvedDemo;
      payload.liveUrl = resolvedDemo;
    }
    if (updates.files !== undefined) payload.files = updates.files;
    if (updates.tasks !== undefined) payload.tasks = updates.tasks;
    if (updates.milestones !== undefined) payload.milestones = updates.milestones;

    try {
      await updateDoc(doc(db, 'projects', projectId), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${projectId}`);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!currentUser.id || !projectId) return;
    const existing = projects.find((p) => p.id === projectId);
    if (!existing || existing.authorId !== currentUser.id) return;

    try {
      await deleteDoc(doc(db, 'projects', projectId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `projects/${projectId}`);
    }
  };

  const toggleProjectLike = async (projectId: string) => {
    if (!currentUser.id || !projectId) return;
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;

    const upvoted = proj.upvotedBy?.includes(currentUser.id);
    const nextUpvotedBy = upvoted
      ? (proj.upvotedBy || []).filter((id) => id !== currentUser.id)
      : [...(proj.upvotedBy || []), currentUser.id];
    const nextLikes = Math.max(0, nextUpvotedBy.length);

    try {
      await updateDoc(doc(db, 'projects', projectId), {
        likes: nextLikes,
        upvotedBy: nextUpvotedBy,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${projectId}`);
    }
  };

  const updateTaskStatus = async (
    projectId: string,
    taskId: string,
    status: 'todo' | 'in_progress' | 'done'
  ) => {
    if (!currentUser.id || !projectId) return;
    const proj = projects.find((p) => p.id === projectId);
    if (!proj || !proj.tasks) return;

    const updatedTasks = proj.tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        tasks: updatedTasks,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${projectId}`);
    }
  };

  const registerForHackathon = (hackathonId: string) => {
    setHackathons((prev) =>
      prev.map((h) => {
        if (h.id === hackathonId) {
          const isReg = !h.isRegistered;
          return {
            ...h,
            isRegistered: isReg,
            registeredStudentsCount: isReg
              ? h.registeredStudentsCount + 1
              : h.registeredStudentsCount - 1,
          };
        }
        return h;
      })
    );
  };

  const addStartupIdea = (
    startupData: Omit<StartupIdea, 'id' | 'likes' | 'mentorsConnected' | 'createdAt'>
  ) => {
    const newStartup: StartupIdea = {
      ...startupData,
      id: `start_${Date.now()}`,
      likes: 1,
      mentorsConnected: 0,
      createdAt: 'Just now',
    };
    setStartups((prev) => [newStartup, ...prev]);
  };

  const addForumPost = (
    postData: Omit<ForumPost, 'id' | 'createdAt' | 'likes' | 'repliesCount'>
  ) => {
    const newPost: ForumPost = {
      ...postData,
      id: `forum_${Date.now()}`,
      createdAt: 'Just now',
      likes: 1,
      repliesCount: 0,
      upvotedBy: [currentUser.id],
      replies: [],
    };
    setForumPosts((prev) => [newPost, ...prev]);
  };

  const votePoll = (pollId: string, optionId: string) => {
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id === pollId && !p.userVotedOptionId) {
          const updatedOptions = p.options.map((opt) => {
            if (opt.id === optionId) {
              return { ...opt, votes: opt.votes + 1 };
            }
            return opt;
          });
          return {
            ...p,
            options: updatedOptions,
            totalVotes: p.totalVotes + 1,
            userVotedOptionId: optionId,
          };
        }
        return p;
      })
    );
  };

  const markNotificationsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await Promise.all(
      unread.map((n) =>
        updateDoc(doc(db, 'notifications', n.id), { read: true }).catch(() => {})
      )
    );
  };

  const verifyUserByAdmin = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, verificationStatus: 'verified' } : u))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        authLoading,
        emailVerified,
        logout,
        activeRole,
        setActiveRole,
        users,
        setUsers,
        projects,
        setProjects,
        hackathons,
        setHackathons,
        startups,
        setStartups,
        forumPosts,
        setForumPosts,
        polls,
        setPolls,
        swapRequests,
        setSwapRequests,
        connectionRequests,
        chatChannels,
        chatMessages,
        activeChannelId,
        setActiveChannelId,
        notifications,
        setNotifications,
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        authModalOpen,
        setAuthModalOpen,
        authMode,
        setAuthMode,
        selectedUserProfile,
        setSelectedUserProfile,
        sendConnectionRequest,
        acceptConnectionRequest,
        rejectConnectionRequest,
        cancelConnectionRequest,
        removeConnection,
        sendSwapRequest,
        acceptSwapRequest,
        rejectSwapRequest,
        cancelSwapRequest,
        toggleProjectLike,
        addProject,
        updateProject,
        deleteProject,
        updateTaskStatus,
        openDirectChat,
        createGroupChat,
        sendChatMessage,
        sendMessage: sendChatMessage,
        markChannelRead,
        registerForHackathon,
        addStartupIdea,
        addForumPost,
        votePoll,
        markNotificationsRead,
        verifyUserByAdmin,
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
