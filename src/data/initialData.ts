import { UserProfile, ProjectItem, Hackathon, StartupIdea, ForumPost, Poll, ChatChannel, ChatMessage, NotificationItem } from '../types';

// Known demo/mock account identifiers isolated from genuine user listings
export const KNOWN_DEMO_USER_IDS = new Set([
  'usr_student_1',
  'usr_student_2',
  'usr_student_3',
  'usr_mentor_1',
  'usr_recruiter_1',
  'usr_admin_1',
]);

export const KNOWN_DEMO_EMAILS = new Set([
  'aarav.sharma@iitd.ac.in',
  'ananya.v@bits-pilani.ac.in',
  'rohan.k@nitk.edu.in',
  'v.malhotra@iitd.ac.in',
  'priya@techfusion.careers',
  'admin.dean@iitd.ac.in',
]);

// Fake/demo student accounts have been isolated and removed from active user listings.
// Genuine users are loaded directly from Cloud Firestore (/users collection).
export const INITIAL_USERS: UserProfile[] = [];

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj_1',
    title: 'CodeSync - Realtime Collaborative IDE for Campus Teams',
    description: 'A browser-based collaborative code editor with video chat, AI auto-complete, and instant sandbox execution for college hackathons and group projects.',
    techStack: ['Next.js', 'WebSockets', 'Monaco Editor', 'Node.js', 'Docker', 'Tailwind CSS'],
    category: 'Web Dev',
    githubUrl: 'https://github.com/skillswap-campus/codesync',
    liveUrl: 'https://codesync-demo.vercel.app',
    likes: 12,
    commentsCount: 3,
    authorId: 'campus_showcase_1',
    authorName: 'MANUU ECE Innovation Lab',
    authorAvatar: 'https://ui-avatars.com/api/?name=ECE+Lab&background=4f46e5&color=fff',
    authorRole: 'student',
    college: 'MANUU, Hyderabad',
    createdAt: '2 days ago',
    status: 'In Progress',
    lookingForTeammates: true,
    requiredSkills: ['DevOps / Docker', 'Embedded C', 'Frontend UI'],
    upvotedBy: [],
    tasks: [
      { id: 't1', title: 'Implement WebSocket operational transformation logic', status: 'done', assignee: 'Project Lead' },
      { id: 't2', title: 'Add dark theme syntax highlighting presets', status: 'in_progress', assignee: 'Frontend Team' },
      { id: 't3', title: 'Containerize code execution engine sandbox', status: 'todo', assignee: 'Unassigned' }
    ],
    milestones: [
      { id: 'm1', title: 'Alpha Release & Campus Beta Test', dueDate: '2026-08-15', completed: true },
      { id: 'm2', title: 'Multi-language Execution Engine', dueDate: '2026-09-01', completed: false }
    ],
    files: [
      { id: 'f1', name: 'CodeSync_Architecture_Diagram.pdf', size: '2.4 MB', uploadedAt: 'Yesterday', url: '#' },
      { id: 'f2', name: 'UI_Wireframes_v2.fig', size: '14.1 MB', uploadedAt: '3 days ago', url: '#' }
    ]
  },
  {
    id: 'proj_2',
    title: 'CampuShare - Peer-to-Peer Book & Hardware Gear Exchange',
    description: 'Hyper-local college marketplace where students list unused textbooks, lab gear, and microcontrollers for free skill swap or nominal rental.',
    techStack: ['React', 'Firebase', 'Express', 'Tailwind CSS'],
    category: 'Mobile App',
    githubUrl: 'https://github.com/skillswap-campus/campushare',
    likes: 18,
    commentsCount: 4,
    authorId: 'campus_showcase_2',
    authorName: 'ECE Hardware Club',
    authorAvatar: 'https://ui-avatars.com/api/?name=Hardware+Club&background=7c3aed&color=fff',
    authorRole: 'student',
    college: 'MANUU, Hyderabad',
    createdAt: '1 week ago',
    status: 'In Progress',
    lookingForTeammates: true,
    requiredSkills: ['UI Design', 'Firebase Firestore', 'IoT Sensors'],
    upvotedBy: []
  }
];

export const INITIAL_HACKATHONS: Hackathon[] = [
  {
    id: 'hack_1',
    title: 'National AI Innovation Hackathon 2026',
    organizer: 'Ministry of Education & University Innovation Cell',
    banner: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
    description: 'Build breakthrough generative AI solutions for healthcare, education, agriculture, and smart cities. Over ₹10 Lakhs in cash prizes and incubator access!',
    tags: ['AI/ML', 'Generative AI', 'Healthcare', 'EdTech'],
    prizePool: '₹10,00,000',
    startDate: '2026-08-10',
    endDate: '2026-08-12',
    location: 'Hybrid / Online',
    mode: 'Hybrid',
    registeredStudentsCount: 142,
    isRegistered: false,
    teamsCount: 34
  },
  {
    id: 'hack_2',
    title: 'Buildathon X - Embedded IoT & Smart Campus Challenge',
    organizer: 'MANUU Department of ECE & Innovation Cell',
    banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
    description: '48-hour hardware and software sprint focused on smart energy monitoring, VLSI design, and embedded microcontroller systems.',
    tags: ['IoT', 'Embedded Systems', 'VLSI', 'Hardware'],
    prizePool: '₹2,50,000',
    startDate: '2026-08-25',
    endDate: '2026-08-27',
    location: 'MANUU Campus, Hyderabad',
    mode: 'Hybrid',
    registeredStudentsCount: 95,
    isRegistered: false,
    teamsCount: 24
  },
  {
    id: 'hack_3',
    title: 'CleanTech & Sustainable Campus Challenge',
    organizer: 'University E-Cell & CleanTech Labs',
    banner: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=800',
    description: 'Hardware + Software hackathon for energy monitoring, waste reduction, and smart solar micro-grids for university campuses.',
    tags: ['IoT', 'Sustainability', 'Hardware', 'CleanTech'],
    prizePool: '₹5,00,000',
    startDate: '2026-09-05',
    endDate: '2026-09-07',
    location: 'Online',
    mode: 'Online',
    registeredStudentsCount: 78,
    isRegistered: false,
    teamsCount: 19
  }
];

export const INITIAL_STARTUPS: StartupIdea[] = [
  {
    id: 'start_1',
    title: 'SmartLab IoT - Remote Electronics Lab Access for Engineering Students',
    tagline: 'Test and debug FPGA and STM32 hardware boards remotely from your browser.',
    description: 'Allows students to upload firmware and observe real-time oscilloscope and logic analyzer outputs over a web interface.',
    stage: 'MVP',
    category: 'EdTech & Hardware',
    founderId: 'campus_startup_1',
    founderName: 'MANUU Incubation Team',
    founderAvatar: 'https://ui-avatars.com/api/?name=Smart+Lab&background=059669&color=fff',
    college: 'MANUU, Hyderabad',
    lookingFor: ['Embedded C Developer', 'WebRTC Engineer', 'UI/UX Designer'],
    likes: 24,
    mentorsConnected: 2,
    createdAt: '1 week ago'
  }
];

export const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: 'forum_1',
    title: 'Best resources for combining Embedded C/STM32 with Edge AI models?',
    content: 'Hi everyone! For our semester project in the ECE department, we are looking to run lightweight TinyML models on microcontrollers. What toolchains do you recommend?',
    category: 'Tech',
    authorId: 'campus_forum_1',
    authorName: 'ECE Study Group',
    authorAvatar: 'https://ui-avatars.com/api/?name=ECE+Group&background=4f46e5&color=fff',
    authorRole: 'student',
    college: 'MANUU, Hyderabad',
    createdAt: '1 day ago',
    likes: 12,
    repliesCount: 1,
    tags: ['EmbeddedSystems', 'TinyML', 'ECE', 'Projects'],
    upvotedBy: [],
    replies: [
      {
        id: 'rep_1',
        authorId: 'campus_faculty_1',
        authorName: 'ECE Faculty Advisor',
        authorAvatar: 'https://ui-avatars.com/api/?name=Faculty+Advisor&background=7c3aed&color=fff',
        content: 'Start with TensorFlow Lite for Microcontrollers (TFLite Micro) or Edge Impulse. Make sure to profile RAM and Flash usage early on your target board!',
        createdAt: '18 hours ago',
        isBestAnswer: true,
        likes: 9
      }
    ]
  }
];

export const INITIAL_POLLS: Poll[] = [
  {
    id: 'poll_1',
    question: 'Which Tech Stack are you using for your 2026 Major Degree Project?',
    authorName: 'SkillSwap Campus Team',
    options: [
      { id: 'opt_1', text: 'React + TypeScript + Firebase', votes: 42 },
      { id: 'opt_2', text: 'Python + FastAPI + PyTorch/AI', votes: 38 },
      { id: 'opt_3', text: 'Embedded C / IoT / VLSI Hardware', votes: 51 },
      { id: 'opt_4', text: 'Flutter / React Native (Cross-platform)', votes: 19 }
    ],
    totalVotes: 150,
    createdAt: '1 day ago'
  }
];

export const INITIAL_CHAT_CHANNELS: ChatChannel[] = [
  {
    id: 'chan_1',
    name: 'MANUU ECE General Lounge',
    type: 'group',
    members: [],
    avatar: 'https://ui-avatars.com/api/?name=MANUU+ECE&background=4f46e5&color=fff',
    lastMessage: 'Welcome to the SkillSwap AI campus collaboration channel!',
    lastMessageTime: 'Today',
    unreadCount: 0
  },
  {
    id: 'chan_2',
    name: 'Hackathon & Project Builders 🚀',
    type: 'group',
    members: [],
    avatar: 'https://ui-avatars.com/api/?name=Project+Builders&background=7c3aed&color=fff',
    lastMessage: 'Share your project ideas and find teammates here.',
    lastMessageTime: 'Today',
    unreadCount: 0
  }
];

export const INITIAL_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  chan_1: [
    {
      id: 'm1',
      channelId: 'chan_1',
      senderId: 'system_welcome',
      senderName: 'SkillSwap AI Campus Bot',
      senderAvatar: 'https://ui-avatars.com/api/?name=SkillSwap+AI&background=4f46e5&color=fff',
      text: 'Welcome to the MANUU ECE General Lounge! Connect with genuine students and faculty mentors here.',
      timestamp: '09:00 AM'
    }
  ],
  chan_2: [
    {
      id: 'm2',
      channelId: 'chan_2',
      senderId: 'system_welcome',
      senderName: 'SkillSwap AI Campus Bot',
      senderAvatar: 'https://ui-avatars.com/api/?name=SkillSwap+AI&background=7c3aed&color=fff',
      text: 'Looking for hackathon teammates or hardware components? Post your requirements in this group!',
      timestamp: '09:05 AM'
    }
  ]
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Welcome to SkillSwap AI!',
    message: 'Complete your skills profile in Settings to match with genuine peers and faculty mentors.',
    time: 'Just now',
    read: false,
    type: 'admin'
  }
];
