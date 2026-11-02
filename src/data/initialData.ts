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

// Genuine users, projects, chats, and notifications are loaded directly from Cloud Firestore.
export const INITIAL_USERS: UserProfile[] = [];

export const INITIAL_PROJECTS: ProjectItem[] = [];

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

// Placeholder example conversations removed; conversations and messages are synced in real time from Firestore (/chats)
export const INITIAL_CHAT_CHANNELS: ChatChannel[] = [];

export const INITIAL_CHAT_MESSAGES: Record<string, ChatMessage[]> = {};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
