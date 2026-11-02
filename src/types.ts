export type UserRole = 'student' | 'teacher' | 'mentor' | 'recruiter' | 'admin';

export type PublicRegistrationRole = 'student' | 'teacher';

export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type ExchangeStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled' | 'Completed';

export interface UserSkill {
  id: string;
  name: string;
  category: string;
  level: SkillLevel;
  type: 'teach' | 'learn';
  endorsements: number;
}

export interface SkillListing {
  id: string;
  userId: string;
  userName: string;
  username: string;
  userAvatar: string;
  userRole: UserRole;
  institution: string;
  skillName: string;
  category: string;
  level: SkillLevel;
  type: 'offered' | 'wanted';
  description: string;
  createdAt: string;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  category: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  liveUrl?: string;
  likes: number;
  commentsCount: number;
  authorId: string;
  authorName: string;
  authorUsername?: string;
  authorAvatar: string;
  authorRole: string;
  college: string;
  department?: string;
  createdAt: string;
  updatedAt?: string;
  status: 'Idea' | 'In Progress' | 'Completed';
  visibility?: 'public' | 'private';
  published?: boolean;
  lookingForTeammates?: boolean;
  requiredSkills?: string[];
  teamMembers?: string[];
  tasks?: ProjectTask[];
  milestones?: ProjectMilestone[];
  files?: ProjectFile[];
  upvotedBy?: string[];
}

export interface ConnectionRequest {
  id: string;
  senderUid: string;
  senderName: string;
  senderUsername: string;
  senderAvatar: string;
  senderRole: UserRole;
  senderCollege: string;
  senderDepartment: string;
  receiverUid: string;
  receiverName: string;
  receiverUsername: string;
  receiverAvatar: string;
  receiverRole: UserRole;
  receiverCollege: string;
  receiverDepartment: string;
  participants: string[];
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInvitation {
  id: string;
  projectId: string;
  projectTitle: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  roleOffered: string;
  message: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  assignee?: string;
  status: 'todo' | 'in_progress' | 'done';
  dueDate?: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface ProjectFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  url: string;
  type?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: UserRole;
  avatar: string;
  college: string;
  department: string;
  semester: number;
  bio: string;
  location: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  resumeUrl?: string;
  resumeText?: string;
  verificationStatus: VerificationStatus;
  availabilityStatus:
    | 'Available for Projects'
    | 'Looking for Hackathon Team'
    | 'Seeking Co-founder'
    | 'Open for Mentorship'
    | 'Hiring Students';
  skillsToTeach: UserSkill[];
  skillsToLearn: UserSkill[];
  interests: string[];
  certificates: Certificate[];
  rating: number;
  reviewCount: number;
  badges: string[];
  compatibilityScore?: number;
  phoneNumber?: string;
  phone?: string;

  // Student-specific fields
  course?: string;
  learningGoals?: string;

  // Teacher / Professor-specific fields
  institution?: string;
  designation?: string;
  subjectsAndExpertise?: string[];
  mentoringInterests?: string[];
  experience?: string;
  availability?: string;

  // Metadata
  profileCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SwapRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  teachSkill: string;
  learnSkill: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt?: string;
}

export interface ExchangeRequest {
  id: string;
  senderUid: string;
  senderName: string;
  senderUsername: string;
  senderAvatar: string;
  receiverUid: string;
  receiverName: string;
  receiverUsername: string;
  receiverAvatar: string;
  offeredSkill: string;
  requestedSkill: string;
  message: string;
  status: ExchangeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MentoringSession {
  id: string;
  hostUid: string;
  hostName: string;
  hostRole: UserRole;
  participantUid: string;
  participantName: string;
  topic: string;
  scheduledDate: string;
  scheduledTime: string;
  meetLink?: string;
  notes?: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled' | 'Completed';
  createdAt: string;
  updatedAt: string;
}

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  category: 'Notes' | 'PDFs' | 'Tutorials' | 'External Links' | 'Project Docs';
  subject: string;
  externalUrl: string;
  authorUid: string;
  authorName: string;
  authorRole: UserRole;
  institution: string;
  tags: string[];
  createdAt: string;
}

export interface PlatformReport {
  id: string;
  reporterUid: string;
  reporterName: string;
  targetType: 'user' | 'project' | 'message' | 'resource';
  targetId: string;
  targetName: string;
  reason: string;
  status: 'Open' | 'Reviewed' | 'Resolved' | 'Dismissed';
  createdAt: string;
}

export interface Hackathon {
  id: string;
  title: string;
  organizer: string;
  banner: string;
  description: string;
  tags: string[];
  prizePool: string;
  startDate: string;
  endDate: string;
  location: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  registeredStudentsCount: number;
  isRegistered?: boolean;
  teamsCount: number;
}

export interface StartupIdea {
  id: string;
  title: string;
  tagline: string;
  description: string;
  stage: 'Idea' | 'MVP' | 'Traction' | 'Seed Stage';
  category: string;
  founderId: string;
  founderName: string;
  founderAvatar: string;
  college: string;
  lookingFor: string[];
  pitchDeckUrl?: string;
  likes: number;
  mentorsConnected: number;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: 'General' | 'Tech' | 'Career' | 'Projects' | 'Q&A' | 'Doubt Solving';
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  college: string;
  createdAt: string;
  likes: number;
  repliesCount: number;
  isSolved?: boolean;
  tags: string[];
  upvotedBy?: string[];
  replies?: ForumReply[];
}

export interface ForumReply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  isBestAnswer?: boolean;
  likes: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  authorName: string;
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  createdAt?: string;
  readBy?: string[];
  type?: 'text' | 'file' | 'voice';
  fileUrl?: string;
  fileName?: string;
  audioDuration?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'direct' | 'group';
  members: string[];
  avatar?: string;
  peerUid?: string;
  peerUsername?: string;
  peerRole?: UserRole;
  peerCollege?: string;
  projectId?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  updatedAt?: string;
}

export interface NotificationItem {
  id: string;
  recipientUid?: string;
  senderUid?: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'swap' | 'team' | 'project' | 'hackathon' | 'admin' | 'session' | 'chat';
}

export interface AIResumeAnalysis {
  overallScore: number;
  atsCompatibility: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  improvementSuggestions: string[];
}

export interface AIProjectSuggestion {
  title: string;
  domain: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  techStack: string[];
  keyFeatures: string[];
  portfolioImpact: string;
}

export interface AISkillRoadmapWeek {
  weekNumber: number;
  topic: string;
  keyConcepts: string[];
  recommendedProjects: string[];
  learningResources: string[];
}

export interface AISkillRoadmap {
  skillName: string;
  duration: string;
  level: string;
  weeks: AISkillRoadmapWeek[];
}

export interface AIInterviewQuestion {
  id: number;
  question: string;
  expectedKeyPoints: string[];
}

export interface AIInterviewEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  sampleIdealAnswer: string;
}
