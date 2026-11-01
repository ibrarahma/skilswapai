import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChatMessage, ChatChannel } from '../../types';
import {
  Send, Paperclip, Sparkles, Hash, MessageSquare,
  Smile, Search, Users, User, Check, CheckCheck,
  Phone, Video, MoreVertical, FileText, Code, Plus,
  ShieldCheck, Circle, Bell
} from 'lucide-react';

export const ChatView: React.FC = () => {
  const {
    chatChannels,
    activeChannelId,
    setActiveChannelId,
    chatMessages,
    sendMessage,
    currentUser,
    users,
    setSelectedUserProfile
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'direct' | 'group'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isTypingPeer, setIsTypingPeer] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChannel = chatChannels.find(c => c.id === activeChannelId) || chatChannels[0];
  const activeMessages = chatMessages[activeChannel?.id || ''] || [];

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, activeChannelId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChannel) return;

    sendMessage(activeChannel.id, inputMessage.trim());
    setInputMessage('');
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
  };

  const handleSendSampleAttachment = (fileName: string, type: 'file' | 'voice' = 'file') => {
    if (!activeChannel) return;
    sendMessage(
      activeChannel.id,
      type === 'file' ? `Shared document: ${fileName}` : 'Voice Note (0:42)',
      type,
      '#',
      type === 'voice' ? '0:42' : undefined
    );
    setShowAttachMenu(false);
  };

  const handleAddEmoji = (emoji: string) => {
    setInputMessage(prev => prev + emoji);
  };

  // Filter channels based on tab and search
  const filteredChannels = chatChannels.filter(channel => {
    const matchesType =
      filterType === 'all'
        ? true
        : filterType === 'direct'
        ? channel.type === 'direct'
        : channel.type === 'group';

    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalUnread = chatChannels.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  // Quick emojis
  const commonEmojis = ['👍', '🚀', '🔥', '👏', '💡', '🎉', '💻', '🤝'];

  return (
    <div className="h-[calc(100vh-130px)] min-h-[550px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row">
      
      {/* 1. LEFT CONVERSATION SIDEBAR */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 bg-slate-50/60 dark:bg-slate-900/60">
        
        {/* User Profile & Online Status Header */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border border-indigo-500"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span>{currentUser.name}</span>
              </h3>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Online
              </p>
            </div>
          </div>

          {totalUnread > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white flex items-center gap-1">
              <Bell className="w-3 h-3" />
              {totalUnread} new
            </span>
          )}
        </div>

        {/* Conversation Search Bar */}
        <div className="p-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="px-3 pb-2 flex items-center gap-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'direct', label: 'Direct Messages' },
            { id: 'group', label: 'Group Chats' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold text-center transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Channels / Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredChannels.length === 0 ? (
            <div className="text-center p-6 text-xs text-slate-400">
              No conversations found.
            </div>
          ) : (
            filteredChannels.map(channel => {
              const isSelected = activeChannel?.id === channel.id;
              const isDirect = channel.type === 'direct';

              return (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannelId(channel.id)}
                  className={`w-full p-2.5 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-medium'
                      : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="relative shrink-0">
                    {channel.avatar ? (
                      <img
                        src={channel.avatar}
                        alt={channel.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}>
                        {isDirect ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                      </div>
                    )}
                    {isDirect && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold truncate">
                        {channel.name}
                      </h4>
                      {channel.lastMessageTime && (
                        <span className={`text-[10px] shrink-0 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {channel.lastMessageTime}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-[11px] truncate ${isSelected ? 'text-indigo-100/90' : 'text-slate-500 dark:text-slate-400'}`}>
                        {channel.lastMessage || 'Start conversation...'}
                      </p>
                      {channel.unreadCount && channel.unreadCount > 0 && !isSelected ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-600 text-white shrink-0">
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
      <div className="flex-1 flex flex-col justify-between h-full bg-white dark:bg-slate-900">
        
        {/* Conversation Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              {activeChannel?.avatar ? (
                <img
                  src={activeChannel.avatar}
                  alt={activeChannel.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
                  {activeChannel?.type === 'group' ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
              )}
              {activeChannel?.type === 'direct' && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  {activeChannel?.name || 'Select a Conversation'}
                </h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  activeChannel?.type === 'group'
                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                    : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                }`}>
                  {activeChannel?.type === 'group' ? 'Group Room' : 'Direct Message'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                ● Active now · End-to-end verified communication
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              Campus Verified
            </span>
          </div>
        </div>

        {/* Message History Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-center my-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              Today
            </span>
          </div>

          {activeMessages.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-slate-400">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-xs">No messages yet. Send a greeting to begin exchanging skills!</p>
            </div>
          ) : (
            activeMessages.map(msg => {
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

                  <div className={`max-w-md space-y-1 ${isSelf ? 'items-end text-right' : ''}`}>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {isSelf ? 'You' : msg.senderName}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed transition-all ${
                        isSelf
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {msg.text}

                      {msg.type === 'file' && (
                        <div className={`mt-2 p-2 rounded-xl flex items-center gap-2 text-[11px] font-medium ${
                          isSelf ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                        }`}>
                          <FileText className="w-4 h-4 shrink-0" />
                          <span className="truncate">Shared Project Document</span>
                        </div>
                      )}

                      {msg.type === 'voice' && (
                        <div className={`mt-2 p-2 rounded-xl flex items-center gap-2 text-[11px] font-medium ${
                          isSelf ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                        }`}>
                          <span>🎵 Voice Audio ({msg.audioDuration || '0:42'})</span>
                        </div>
                      )}
                    </div>

                    {isSelf && (
                      <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-0.5">
                        <CheckCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Delivered</span>
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
          
          {/* Quick Emoji Bar */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 shadow-xl flex items-center gap-1 z-20">
              {commonEmojis.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleAddEmoji(emoji)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-base cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Quick Attachment Dropdown */}
          {showAttachMenu && (
            <div className="absolute bottom-16 left-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 shadow-xl space-y-1 z-20 w-52 text-xs">
              <button
                type="button"
                onClick={() => handleSendSampleAttachment('ECE_Lab_Schematic_v2.pdf', 'file')}
                className="w-full p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Share PDF Document</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendSampleAttachment('Verilog_UART_Module.v', 'file')}
                className="w-full p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Code className="w-4 h-4 text-purple-500" />
                <span>Share Code File</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendSampleAttachment('Voice Message', 'voice')}
                className="w-full p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <span>🎙️ Record Voice Note</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Add emoji"
            >
              <Smile className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Attach document or code"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder={activeChannel ? `Message #${activeChannel.name}...` : 'Type a message...'}
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/30"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
