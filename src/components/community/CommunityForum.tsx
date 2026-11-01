import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ForumPost } from '../../types';
import {
  MessageSquare, Plus, Heart, CheckCircle2, Award, BarChart2,
  Megaphone, ShieldCheck, CornerDownRight, X
} from 'lucide-react';

export const CommunityForum: React.FC = () => {
  const { forumPosts, addForumPost, polls, votePoll, currentUser, setSelectedUserProfile } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  // New post form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'General' | 'Tech' | 'Career' | 'Projects' | 'Q&A' | 'Doubt Solving'>('Career');
  const [tagsInput, setTagsInput] = useState('');

  const categories = ['All', 'Career', 'Tech', 'Projects', 'Q&A', 'Doubt Solving', 'General'];

  const filteredPosts = forumPosts.filter(
    (p) => activeCategory === 'All' || p.category === activeCategory
  );

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addForumPost({
      title: title.trim(),
      content: content.trim(),
      category,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.role,
      college: currentUser.college,
      tags: tagsInput.split(',').map((s) => s.trim()).filter(Boolean)
    });

    setTitle('');
    setContent('');
    setTagsInput('');
    setCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Student Community & Doubt Solver</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            Discussion Forum, Live Polls & Q&A
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ask technical doubts, get career advice from verified faculty mentors, and vote on campus technology trends.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Start Discussion / Ask Doubt</span>
        </button>
      </div>

      {/* Main Grid: Forum Posts + Right Side Polls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Forum Posts */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                {/* Category & Date Header */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-slate-400">{post.createdAt}</span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-2.5 pt-1">
                  <img src={post.authorAvatar} alt={post.authorName} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{post.authorName}</span>
                      {post.authorRole === 'mentor' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          Faculty Mentor 🛡️
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">{post.college}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((t, i) => (
                    <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Replies Thread */}
                {post.replies && post.replies.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Answers & Peer Comments
                    </span>
                    {post.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`p-3.5 rounded-2xl text-xs space-y-1.5 transition-all ${
                          reply.isBestAnswer
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200'
                            : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img src={reply.authorAvatar} alt={reply.authorName} className="w-6 h-6 rounded-full object-cover" />
                            <span className="font-bold text-slate-800 dark:text-slate-100">{reply.authorName}</span>
                          </div>
                          {reply.isBestAnswer && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verified Best Answer</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Right Column (1 col): Live Polls & Campus Announcements */}
        <div className="space-y-6">
          
          {/* Live Campus Poll */}
          {polls.map((poll) => (
            <div
              key={poll.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <BarChart2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Campus Live Poll</span>
              </div>

              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                {poll.question}
              </h4>

              <div className="space-y-2">
                {poll.options.map((option) => {
                  const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                  const isVoted = poll.userVotedOptionId === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => votePoll(poll.id, option.id)}
                      disabled={!!poll.userVotedOptionId}
                      className={`w-full text-left p-3 rounded-2xl border transition-all relative overflow-hidden ${
                        isVoted
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs z-10 relative">
                        <span>{option.text}</span>
                        <span className="font-mono text-[11px]">{percentage}%</span>
                      </div>
                      {poll.userVotedOptionId && (
                        <div
                          className="absolute inset-y-0 left-0 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="text-[10px] text-slate-400 font-semibold text-right">
                Total Campus Votes: {poll.totalVotes}
              </div>
            </div>
          ))}

          {/* Official Announcements Box */}
          <div className="p-6 rounded-3xl bg-indigo-900 text-white space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-amber-300">
              <Megaphone className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Official Campus Bulletin</span>
            </div>
            <h4 className="text-sm font-bold">IIT Delhi & BITS Pilani Joint Skill Summit 2026</h4>
            <p className="text-xs text-indigo-100/80 leading-relaxed">
              Registrations open for peer workshops in Generative AI, Rust Microservices, and Figma Design Systems. Certified badges will be awarded to top peer tutors!
            </p>
          </div>

        </div>

      </div>

      {/* Create Post Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl space-y-4">
            <button onClick={() => setCreateModalOpen(false)} className="absolute top-5 right-5 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Start Discussion or Ask Doubt</h3>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Topic Header</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How to structure fullstack Next.js 15 apps with Express backend?"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                >
                  <option value="Career">Career Advice</option>
                  <option value="Tech">Technical Discussion</option>
                  <option value="Projects">Projects & Team Building</option>
                  <option value="Q&A">Q&A / Exam Prep</option>
                  <option value="Doubt Solving">Doubt Solving</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Content / Question Details</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your question or discussion point in detail..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Nextjs, Express, React, Careers"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md mt-2"
              >
                Post to Forum
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
