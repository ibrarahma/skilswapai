import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import {
  Send,
  Paperclip,
  MessageSquare,
  Smile,
  Search,
  Users,
  User,
  CheckCheck,
  FileText,
  Code,
  Plus,
  ShieldCheck,
  Bell,
  ArrowLeft,
  X,
  GraduationCap,
  School,
} from 'lucide-react';

export const ChatView: React.FC = () => {
  const {
    chatChannels,
    activeChannelId,
    setActiveChannelId,
    chatMessages,
    sendMessage,
    markChannelRead,
    openDirectChat,
    createGroupChat,
    connectionRequests,
    currentUser,
    users,
    setSelectedUserProfile,
    setActiveTab,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'direct' | 'group'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [mobileShowMessages, setMobileShowMessages] = useState(false);

  // New Chat / Group Modal State
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [newChatMode, setNewChatMode] = useState<'direct' | 'group'>('direct');
  const [groupName, setGroupName] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChannel =
    chatChannels.find((c) => c.id === activeChannelId) || chatChannels[0] || null;
  const activeMessages = activeChannel ? chatMessages[activeChannel.id] || [] : [];

  // Connected users from Firestore connectionRequests (status === 'Accepted')
  const connectedUserIds = new Set<string>();
  connectionRequests
    .filter((c) => c.status === 'Accepted')
    .forEach((c) => {
      const peerId = c.senderUid === currentUser.id ? c.receiverUid : c.senderUid;
      if (peerId) connectedUserIds.add(peerId);
    });

  const connectedUsersList = users.filter((u) => connectedUserIds.has(u.id));
  const otherRegisteredUsers = users.filter((u) => u.id !== currentUser.id);

  // Auto-scroll to bottom of conversation & mark messages as read
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (activeChannel?.id) {
      markChannelRead(activeChannel.id);
    }
  }, [activeMessages.length, activeChannel?.id]);

  // Close menus/modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (newChatModalOpen) setNewChatModalOpen(false);
        if (showEmojiPicker) setShowEmojiPicker(false);
        if (showAttachMenu) setShowAttachMenu(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [newChatModalOpen, showEmojiPicker, showAttachMenu]);

  const formatChatErrorMessage = (err: unknown): string => {
    const raw = err instanceof Error ? err.message : String(err);
    if (raw.includes('permission-denied') || raw.includes('Missing or insufficient permissions')) {
      return 'Permission denied while accessing this conversation. Please verify you are signed in and try again.';
    }
    if (raw.includes('offline') || raw.includes('unavailable') || raw.includes('network')) {
      return 'Network connection interrupted. Your message could not be delivered — check your connection and retry.';
    }
    return 'Could not deliver message. Please try sending again.';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChannel || sending) return;

    const textToSend = inputMessage.trim();
    setChatError(null);
    setInputMessage('');
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
    setSending(true);
    try {
      await sendMessage(activeChannel.id, textToSend);
    } catch (err) {
      setInputMessage(textToSend);
      setChatError(formatChatErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleSendAttachment = async (
    fileName: string,
    type: 'file' | 'voice' = 'file'
  ) => {
    if (!activeChannel || sending) return;
    setShowAttachMenu(false);
    setChatError(null);
    setSending(true);
    try {
      await sendMessage(
        activeChannel.id,
        type === 'file' ? `Shared document: ${fileName}` : 'Voice Note (0:42)',
        type,
        '#',
        type === 'voice' ? '0:42' : undefined,
        fileName
      );
    } catch (err) {
      setChatError(formatChatErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setInputMessage((prev) => prev + emoji);
  };

  const handleSelectChannel = (channelId: string) => {
    setChatError(null);
    setActiveChannelId(channelId);
    setMobileShowMessages(true);
    markChannelRead(channelId);
  };

  const handleStartDirectWithUser = async (targetUser: UserProfile) => {
    setChatError(null);
    setNewChatModalOpen(false);
    try {
      await openDirectChat(targetUser);
      setMobileShowMessages(true);
    } catch (err) {
      setChatError(formatChatErrorMessage(err));
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedGroupMembers.length === 0) return;
    setChatError(null);
    try {
      await createGroupChat(groupName.trim(), selectedGroupMembers);
      setGroupName('');
      setSelectedGroupMembers([]);
      setNewChatModalOpen(false);
      setMobileShowMessages(true);
    } catch (err) {
      setChatError(formatChatErrorMessage(err));
    }
  };

  // Enrich direct channel metadata with live user profile from users array if available
  const getChannelDisplayInfo = (channel: typeof activeChannel) => {
    if (!channel) return { name: '', username: '', avatar: '', role: 'student', college: '' };
    if (channel.type === 'group') {
      return {
        name: channel.name,
        username: `${channel.members.length} members`,
        avatar: channel.avatar || '',
        role: 'group',
        college: 'Project / Team Room',
      };
    }
    const peerUser = users.find((u) => u.id === channel.peerUid);
    return {
      name: peerUser?.name || channel.name || 'Direct Message',
      username: peerUser?.username || channel.peerUsername || channel.peerUid?.slice(0, 8) || '',
      avatar:
        peerUser?.avatar ||
        channel.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name || 'User')}`,
      role: peerUser?.role || channel.peerRole || 'student',
      college: peerUser?.college || channel.peerCollege || 'MANUU, Hyderabad',
      peerProfile: peerUser,
    };
  };

  // Filter channels based on tab and search
  const filteredChannels = chatChannels.filter((channel) => {
    const matchesType =
      filterType === 'all'
        ? true
        : filterType === 'direct'
        ? channel.type === 'direct'
        : channel.type === 'group';

    const info = getChannelDisplayInfo(channel);
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      info.name.toLowerCase().includes(q) ||
      info.username.toLowerCase().includes(q) ||
      (channel.lastMessage || '').toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  const totalUnread = chatChannels.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const activeChannelInfo = getChannelDisplayInfo(activeChannel);

  const commonEmojis = ['👍', '🚀', '🔥', '👏', '💡', '🎉', '💻', '🤝'];

  return (
    <div className="h-[calc(100vh-130px)] min-h-[550px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row">
      <h1 className="sr-only">Messages and Real-Time Campus Chat</h1>
      
      {/* 1. LEFT CONVERSATION SIDEBAR */}
      <div
        className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 bg-slate-50/60 dark:bg-slate-900/60 ${
          mobileShowMessages && activeChannel ? 'hidden md:flex' : 'flex h-full'
        }`}
      >
        {/* User Profile & New Chat Button Header */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border border-indigo-500"
              />
              <span aria-hidden="true" className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                {currentUser.name}
              </h2>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                @{currentUser.username || currentUser.id.slice(0, 8)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {totalUnread > 0 && (
              <span
                aria-label={`${totalUnread} unread messages`}
                className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white flex items-center gap-1"
              >
                <Bell className="w-3 h-3" aria-hidden="true" />
                {totalUnread}
              </span>
            )}
            <button
              type="button"
              onClick={() => setNewChatModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Start a conversation or group chat"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Conversation Search Bar */}
        <div className="p-3">
          <div className="relative">
            <label htmlFor="chat-conversation-search" className="sr-only">
              Search conversations or username
            </label>
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" aria-hidden="true" />
            <input
              id="chat-conversation-search"
              type="search"
              placeholder="Search conversations or @username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div role="group" aria-label="Filter conversations" className="px-3 pb-2 flex items-center gap-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'direct', label: 'Direct Messages' },
            { id: 'group', label: 'Group Chats' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={filterType === tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                filterType === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Channels / Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredChannels.length === 0 ? (
            <div className="text-center p-5 space-y-3">
              <MessageSquare className="w-7 h-7 text-slate-400 dark:text-slate-600 mx-auto" aria-hidden="true" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                No active conversations yet
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Start a real-time private chat with your connected peers or teachers below.
              </p>
              <button
                type="button"
                onClick={() => setNewChatModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                + Start New Conversation
              </button>

              {/* Quick Connected Users Strip */}
              {connectedUsersList.length > 0 && (
                <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800 text-left space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 px-1 block">
                    Your Connected Network ({connectedUsersList.length})
                  </span>
                  {connectedUsersList.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleStartDirectWithUser(u)}
                      className="w-full p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center gap-2.5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <img
                        src={u.avatar}
                        alt=""
                        aria-hidden="true"
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                          @{u.username || u.id.slice(0, 8)} •{' '}
                          {u.role === 'teacher' ? 'Teacher' : 'Student'}
                        </p>
                      </div>
                      <Send className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            filteredChannels.map((channel) => {
              const isSelected = activeChannel?.id === channel.id;
              const isDirect = channel.type === 'direct';
              const info = getChannelDisplayInfo(channel);

              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => handleSelectChannel(channel.id)}
                  className={`w-full p-2.5 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-medium'
                      : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="relative shrink-0">
                    {info.avatar ? (
                      <img
                        src={info.avatar}
                        alt={info.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}
                      >
                        {isDirect ? <User className="w-5 h-5" aria-hidden="true" /> : <Users className="w-5 h-5" aria-hidden="true" />}
                      </div>
                    )}
                    {isDirect && (
                      <span aria-hidden="true" className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h3 className="text-xs font-bold truncate">{info.name}</h3>
                      {channel.lastMessageTime && (
                        <span
                          className={`text-xs shrink-0 ${
                            isSelected ? 'text-indigo-100' : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {channel.lastMessageTime}
                        </span>
                      )}
                    </div>

                    {isDirect && info.username && (
                      <p
                        className={`text-xs font-mono truncate mb-0.5 ${
                          isSelected ? 'text-indigo-100' : 'text-indigo-700 dark:text-indigo-300'
                        }`}
                      >
                        @{info.username} • {info.role === 'teacher' ? 'Teacher' : 'Student'}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs truncate ${
                          isSelected
                            ? 'text-indigo-100'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {channel.lastMessage || 'Start conversation...'}
                      </p>
                      {channel.unreadCount && channel.unreadCount > 0 && !isSelected ? (
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-rose-600 text-white shrink-0">
                          {channel.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. RIGHT SELECTED CONVERSATION VIEWSTAGE */}
      <div
        className={`flex-1 flex flex-col justify-between h-full bg-white dark:bg-slate-900 ${
          !mobileShowMessages && activeChannel ? 'hidden md:flex' : 'flex'
        }`}
      >
        {!activeChannel ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
              <MessageSquare className="w-7 h-7" aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Real-Time Campus Messaging
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm">
              Select a conversation from the left panel or start a new direct chat with a connected student or teacher/professor.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setNewChatModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                + Start Conversation
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('skills')}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Find Connections
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileShowMessages(false)}
                  aria-label="Back to conversations list"
                  className="md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                </button>

                {activeChannelInfo.peerProfile ? (
                  <button
                    type="button"
                    onClick={() => setSelectedUserProfile(activeChannelInfo.peerProfile!)}
                    aria-label={`View profile of ${activeChannelInfo.name}`}
                    className="relative shrink-0 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    {activeChannelInfo.avatar ? (
                      <img
                        src={activeChannelInfo.avatar}
                        alt={activeChannelInfo.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
                        <User className="w-5 h-5" aria-hidden="true" />
                      </div>
                    )}
                    <span aria-hidden="true" className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                  </button>
                ) : (
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
                      <Users className="w-5 h-5" aria-hidden="true" />
                    </div>
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                      {activeChannelInfo.peerProfile ? (
                        <button
                          type="button"
                          onClick={() => setSelectedUserProfile(activeChannelInfo.peerProfile!)}
                          className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                        >
                          {activeChannelInfo.name}
                        </button>
                      ) : (
                        activeChannelInfo.name
                      )}
                    </h2>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        activeChannel.type === 'group'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                          : activeChannelInfo.role === 'teacher'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                          : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                      }`}
                    >
                      {activeChannel.type === 'group' ? (
                        <>
                          <Users className="w-3 h-3" aria-hidden="true" />
                          <span>Group Room ({activeChannel.members.length})</span>
                        </>
                      ) : activeChannelInfo.role === 'teacher' ? (
                        <>
                          <School className="w-3 h-3" aria-hidden="true" />
                          <span>Teacher / Professor</span>
                        </>
                      ) : (
                        <>
                          <GraduationCap className="w-3 h-3" aria-hidden="true" />
                          <span>Student</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                    {activeChannel.type === 'direct' && activeChannelInfo.username
                      ? `@${activeChannelInfo.username} • ${activeChannelInfo.college}`
                      : 'Real-time Firebase Firestore encrypted stream'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeChannelInfo.peerProfile && (
                  <button
                    type="button"
                    onClick={() => setSelectedUserProfile(activeChannelInfo.peerProfile!)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    View Profile
                  </button>
                )}
                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  Verified
                </span>
              </div>
            </div>

            {/* Message History Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4" aria-live="polite">
              {activeMessages.length === 0 ? (
                <div className="text-center py-12 space-y-2 text-slate-600 dark:text-slate-300">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600" aria-hidden="true" />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    No messages in this conversation yet
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Send a message below — it will be delivered in real time via Cloud Firestore.
                  </p>
                </div>
              ) : (
                activeMessages.map((msg) => {
                  const isSelf = msg.senderId === currentUser.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 ${isSelf ? 'flex-row-reverse' : ''}`}
                    >
                      <img
                        src={msg.senderAvatar || 'https://ui-avatars.com/api/?name=User'}
                        alt={msg.senderName}
                        className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                      />

                      <div
                        className={`max-w-md space-y-1 flex flex-col ${
                          isSelf ? 'items-end text-right' : 'items-start text-left'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {isSelf ? 'You' : msg.senderName}
                          </span>
                          <span>{msg.timestamp}</span>
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed transition-all break-words ${
                            isSelf
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {msg.text}

                          {msg.type === 'file' && (
                            <div
                              className={`mt-2 p-2 rounded-xl flex items-center gap-2 text-xs font-medium ${
                                isSelf
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
                              <span className="truncate">
                                {msg.fileName || 'Shared Project Document'}
                              </span>
                            </div>
                          )}

                          {msg.type === 'voice' && (
                            <div
                              className={`mt-2 p-2 rounded-xl flex items-center gap-2 text-xs font-medium ${
                                isSelf
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              <span>🎵 Voice Audio ({msg.audioDuration || '0:42'})</span>
                            </div>
                          )}
                        </div>

                        {isSelf && (
                          <div className="flex items-center justify-end gap-1 text-xs text-slate-600 dark:text-slate-300 pt-0.5">
                            <CheckCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                            <span>
                              {(msg.readBy?.length || 0) > 1 ? 'Read' : 'Delivered'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Toolbar */}
            <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative">
              {chatError && (
                <div
                  role="alert"
                  className="mb-2.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-2"
                >
                  <span>{chatError}</span>
                  <button
                    type="button"
                    onClick={() => setChatError(null)}
                    className="p-1 text-rose-600 hover:text-rose-800 dark:text-rose-300 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
                    aria-label="Dismiss error"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}
              {/* Quick Emoji Bar */}
              {showEmojiPicker && (
                <div
                  role="region"
                  aria-label="Quick emoji selector"
                  className="absolute bottom-16 left-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 shadow-xl flex items-center gap-1 z-20"
                >
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleAddEmoji(emoji)}
                      aria-label={`Insert emoji ${emoji}`}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-base cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Attachment Dropdown */}
              {showAttachMenu && (
                <div
                  role="menu"
                  aria-label="Attachment options"
                  className="absolute bottom-16 left-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 shadow-xl space-y-1 z-20 w-52 text-xs"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleSendAttachment('ECE_Lab_Schematic_v2.pdf', 'file')}
                    className="w-full p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                    <span>Share PDF Document</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleSendAttachment('Verilog_UART_Module.v', 'file')}
                    className="w-full p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <Code className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                    <span>Share Code File</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleSendAttachment('Voice Message', 'voice')}
                    className="w-full p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <span>🎙️ Record Voice Note</span>
                  </button>
                </div>
              )}

              <form onSubmit={handleSend} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  aria-label="Toggle emoji picker"
                  aria-expanded={showEmojiPicker}
                  className="p-2 text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  title="Add emoji"
                >
                  <Smile className="w-4 h-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  aria-label="Toggle attachment menu"
                  aria-expanded={showAttachMenu}
                  className="p-2 text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  title="Attach document or code"
                >
                  <Paperclip className="w-4 h-4" aria-hidden="true" />
                </button>

                <label htmlFor="chat-message-input" className="sr-only">
                  Message {activeChannelInfo.name}
                </label>
                <input
                  id="chat-message-input"
                  type="text"
                  placeholder={`Message ${activeChannelInfo.name}...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || sending}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <span>{sending ? 'Sending...' : 'Send'}</span>
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* NEW CONVERSATION / GROUP MODAL */}
      {newChatModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-chat-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setNewChatModalOpen(false);
          }}
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-4">
            <button
              type="button"
              onClick={() => setNewChatModalOpen(false)}
              aria-label="Close new conversation modal"
              className="absolute top-5 right-5 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100 p-1 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            <h2 id="new-chat-modal-title" className="text-base font-bold text-slate-800 dark:text-slate-100">
              Start a Conversation
            </h2>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-pressed={newChatMode === 'direct'}
                onClick={() => setNewChatMode('direct')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  newChatMode === 'direct'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                Direct Message
              </button>
              <button
                type="button"
                aria-pressed={newChatMode === 'group'}
                onClick={() => setNewChatMode('group')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  newChatMode === 'group'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                Create Project Group
              </button>
            </div>

            {newChatMode === 'direct' ? (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {connectedUsersList.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      My Connected Peers & Faculty ({connectedUsersList.length})
                    </span>
                    {connectedUsersList.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleStartDirectWithUser(u)}
                        className="w-full p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 flex items-center justify-between gap-3 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={u.avatar}
                            alt=""
                            aria-hidden="true"
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {u.name}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                              @{u.username || u.id.slice(0, 8)} •{' '}
                              {u.role === 'teacher' ? 'Teacher' : 'Student'}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 shrink-0">
                          Message →
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    All Registered Members ({otherRegisteredUsers.length})
                  </span>
                  {otherRegisteredUsers.length === 0 ? (
                    <p className="text-xs text-slate-600 dark:text-slate-300 py-4 text-center">
                      No other registered members found yet.
                    </p>
                  ) : (
                    otherRegisteredUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleStartDirectWithUser(u)}
                        className="w-full p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 flex items-center justify-between gap-3 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={u.avatar}
                            alt=""
                            aria-hidden="true"
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {u.name}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                              @{u.username || u.id.slice(0, 8)} •{' '}
                              {u.role === 'teacher' ? 'Teacher' : 'Student'}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 shrink-0">
                          Chat →
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateGroup} className="space-y-3">
                <div>
                  <label htmlFor="chat-group-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Group / Project Room Name <span className="text-rose-600 dark:text-rose-400" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="chat-group-name"
                    type="text"
                    required
                    placeholder="e.g. VLSI Capstone Team or Smart IoT Builders"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <fieldset>
                  <legend className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Authorized Participants ({selectedGroupMembers.length} selected)
                  </legend>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl p-2">
                    {otherRegisteredUsers.length === 0 ? (
                      <p className="text-xs text-slate-600 dark:text-slate-300 text-center py-3">
                        No other members available to add.
                      </p>
                    ) : (
                      otherRegisteredUsers.map((u) => {
                        const checked = selectedGroupMembers.includes(u.id);
                        return (
                          <label
                            key={u.id}
                            htmlFor={`chat-group-member-${u.id}`}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                id={`chat-group-member-${u.id}`}
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedGroupMembers((prev) => [...prev, u.id]);
                                  } else {
                                    setSelectedGroupMembers((prev) =>
                                      prev.filter((id) => id !== u.id)
                                    );
                                  }
                                }}
                                className="rounded text-indigo-600"
                              />
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {u.name}
                              </span>
                              <span className="text-xs text-slate-600 dark:text-slate-300">
                                (@{u.username || u.id.slice(0, 8)})
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 capitalize">
                              {u.role}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </fieldset>

                <button
                  type="submit"
                  disabled={!groupName.trim() || selectedGroupMembers.length === 0}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md disabled:opacity-40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Create Secure Group Room
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
