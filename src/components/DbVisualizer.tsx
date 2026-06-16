import React, { useState } from 'react';
import { 
  Database, Table, CodeSquare, Terminal, PlusCircle, 
  Trash2, RefreshCw, Key, HelpCircle, HardDrive, Columns
} from 'lucide-react';
import { Topic, Article, AccessLog } from '../types';

interface DbVisualizerProps {
  topics: Topic[];
  articles: Article[];
  accessLogs: AccessLog[];
  onAddTopic: (title: string, desc: string) => void;
  onAddArticle: (topicId: number, title: string, type: 'subtitle', content: string, imageUrl?: string) => void;
  onClearDb: () => void;
}

export const DbVisualizer: React.FC<DbVisualizerProps> = ({
  topics,
  articles,
  accessLogs,
  onAddTopic,
  onAddArticle,
  onClearDb,
}) => {
  const [activeTab, setActiveTab] = useState<'tables' | 'query' | 'entity'>('tables');
  const [selectedTable, setSelectedTable] = useState<'topics' | 'articles' | 'access_logs'>('articles');
  
  // Custom query simulator
  const [queryPreset, setQueryPreset] = useState<string>('SELECT * FROM articles');
  const [simulatedSqlOutput, setSimulatedSqlOutput] = useState<any[]>([]);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Form states
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [newArticleTitle, setNewArticleTitle] = useState('');
  const [newArticleTopicId, setNewArticleTopicId] = useState<number>(topics[0]?.id || 1);
  const [newArticleType, setNewArticleType] = useState<'subtitle'>('subtitle');
  const [newArticleContent, setNewArticleContent] = useState('');

  // Run simulated queries
  const runQuery = (sql: string) => {
    setQueryPreset(sql);
    setQueryError(null);

    const matchAllArticles = sql.match(/SELECT\s+\*\s+FROM\s+articles/i);
    const matchAllTopics = sql.match(/SELECT\s+\*\s+FROM\s+topics/i);
    const matchAllLogs = sql.match(/SELECT\s+\*\s+FROM\s+access_logs/i);
    const matchJoin = sql.match(/JOIN/i);

    if (matchJoin) {
      // Simulate relational JOIN query
      const joined = articles.map(art => {
        const topic = topics.find(t => t.id === art.topicId);
        return {
          article_id: art.id,
          article_title: art.title,
          topic_title: topic ? topic.title : 'Orphaned',
          article_type: art.type,
          views_count: art.openCount,
        };
      });
      setSimulatedSqlOutput(joined);
    } else if (matchAllArticles) {
      setSimulatedSqlOutput(articles.map(a => ({
        id: a.id,
        topicId: a.topicId,
        title: a.title,
        type: a.type,
        openCount: a.openCount,
        createdAt: a.createdAt,
      })));
    } else if (matchAllTopics) {
      setSimulatedSqlOutput(topics);
    } else if (matchAllLogs) {
      setSimulatedSqlOutput(accessLogs);
    } else {
      setQueryError('SQL Syntax Error or Query pattern not simulated in sandbox (Only simple SELECT and JOIN patterns are available).');
      setSimulatedSqlOutput([]);
    }
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle) return;
    onAddTopic(newTopicTitle, newTopicDesc);
    setNewTopicTitle('');
    setNewTopicDesc('');
  };

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArticleTitle || !newArticleContent) return;
    onAddArticle(Number(newArticleTopicId), newArticleTitle, newArticleType, newArticleContent);
    setNewArticleTitle('');
    setNewArticleContent('');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      
      {/* 2. Header metrics row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-4 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="text-emerald-600 w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Room SQLite Memory Viewer</h3>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            A real-time display of the SQLite DB running local transactions. Add rows or query metrics directly.
          </p>
        </div>

        {/* Clear database button */}
        <button
          onClick={onClearDb}
          className="flex items-center space-x-1.5 bg-red-50 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-lg text-red-700 text-xs font-semibold transition-all cursor-pointer shadow-3xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Reset SQL State</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1 select-none">
        <button
          onClick={() => setActiveTab('tables')}
          className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg border-t border-x transition-all cursor-pointer ${
            activeTab === 'tables' 
              ? 'bg-slate-50 border-slate-200 text-emerald-700 font-bold shadow-3xs' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Browse Tables ({topics.length + articles.length + accessLogs.length} rows)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('query');
            runQuery(queryPreset);
          }}
          className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg border-t border-x transition-all cursor-pointer ${
            activeTab === 'query' 
              ? 'bg-slate-50 border-slate-200 text-indigo-700 font-bold shadow-3xs' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Interactive Query Sandbox</span>
        </button>

        <button
          onClick={() => setActiveTab('entity')}
          className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg border-t border-x transition-all cursor-pointer ${
            activeTab === 'entity' 
              ? 'bg-slate-50 border-slate-200 text-indigo-700 font-bold shadow-3xs' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Schema Relationships</span>
        </button>
      </div>

      {/* Content panes */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[300px]">

        {/* TAB 1: BROWSE TABLES */}
        {activeTab === 'tables' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTable('topics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  selectedTable === 'topics' 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                    : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-100/50'
                }`}
              >
                topics ({topics.length})
              </button>
              <button
                onClick={() => setSelectedTable('articles')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  selectedTable === 'articles' 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                    : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-100/50'
                }`}
              >
                articles ({articles.length})
              </button>
              <button
                onClick={() => setSelectedTable('access_logs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  selectedTable === 'access_logs' 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                    : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-100/55'
                }`}
              >
                access_logs ({accessLogs.length})
              </button>
            </div>

            {/* Table layout render */}
            <div className="overflow-x-auto border border-slate-200 bg-white rounded-xl shadow-3xs">
              {selectedTable === 'topics' && (
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-[#fcfdfe] text-slate-500 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">id (PK)</th>
                      <th className="p-3">title</th>
                      <th className="p-3">description</th>
                      <th className="p-3">created_at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topics.map(t => (
                      <tr key={t.id} className="hover:bg-[#f9fafc] transition-colors">
                        <td className="p-3 font-mono text-emerald-600 font-bold">{t.id}</td>
                        <td className="p-3 font-semibold text-slate-900">{t.title}</td>
                        <td className="p-3 max-w-[200px] truncate text-slate-600">{t.description}</td>
                        <td className="p-3 text-slate-400">{t.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedTable === 'articles' && (
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-[#fcfdfe] text-slate-500 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">id (PK)</th>
                      <th className="p-3">topic_id (FK)</th>
                      <th className="p-3">title</th>
                      <th className="p-3">type</th>
                      <th className="p-3">open_count</th>
                      <th className="p-3">created_at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {articles.map(a => (
                      <tr key={a.id} className="hover:bg-[#f9fafc] transition-colors">
                        <td className="p-3 font-mono text-emerald-600 font-bold">{a.id}</td>
                        <td className="p-3 font-mono text-indigo-600 font-semibold">{a.topicId}</td>
                        <td className="p-3 font-semibold text-slate-900 truncate max-w-[150px]">{a.title}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${a.type === 'subtitle' ? 'bg-indigo-50 border-indigo-150 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                            {a.type}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-600">{a.openCount} views</td>
                        <td className="p-3 text-slate-400">{a.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedTable === 'access_logs' && (
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-[#fcfdfe] text-slate-500 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">id (PK)</th>
                      <th className="p-3">article_id (FK)</th>
                      <th className="p-3">timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {accessLogs.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center p-6 text-slate-400">
                          Empty. Open an article in the Simulator above to auto-register an access transaction.
                        </td>
                      </tr>
                    ) : (
                      accessLogs.map(l => {
                        const referencedArticle = articles.find(a => a.id === l.articleId);
                        return (
                          <tr key={l.id} className="hover:bg-[#f9fafc] transition-colors">
                            <td className="p-3 font-mono text-emerald-600 font-bold">{l.id}</td>
                            <td className="p-3 font-mono text-indigo-700 font-semibold">
                              {l.articleId} <span className="text-slate-400 text-[10px] font-normal">({referencedArticle?.title || 'Unknown'})</span>
                            </td>
                            <td className="p-3 text-slate-550">{l.timestamp}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Quick-insert creators */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Topic creation */}
              <form onSubmit={handleCreateTopic} className="bg-white p-5 border border-slate-200 rounded-xl shadow-3xs space-y-3.5">
                <div className="flex items-center space-x-1.5 text-emerald-600">
                  <PlusCircle className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Add Topic Entity</h4>
                </div>
                <div className="space-y-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Topic Title (e.g., German Travel Phrases)"
                    value={newTopicTitle}
                    onChange={e => setNewTopicTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-sans"
                  />
                  <input
                    type="text"
                    placeholder="Short description..."
                    value={newTopicDesc}
                    onChange={e => setNewTopicDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-sans"
                  />
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-555 text-white font-bold text-xs py-2 rounded-lg transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                  >
                    Insert Into topics
                  </button>
                </div>
              </form>

              {/* Article creation */}
              <form onSubmit={handleCreateArticle} className="bg-white p-5 border border-slate-200 rounded-xl shadow-3xs space-y-3.5">
                <div className="flex items-center space-x-1.5 text-indigo-650">
                  <PlusCircle className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Add Article Entity</h4>
                </div>
                <div className="w-full">
                  <select
                    value={newArticleTopicId}
                    onChange={e => setNewArticleTopicId(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none font-medium cursor-pointer"
                  >
                    {topics.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  required
                  placeholder="Article Title (e.g. Airport Dialogue)"
                  value={newArticleTitle}
                  onChange={e => setNewArticleTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
                />

                <textarea
                  required
                  placeholder="1&#10;00:00:01,000 --> 00:00:04,500&#10;Hello, good morning!&#10;&#10;2&#10;00:00:05,000 --> 00:00:09,000&#10;How can I assist you today?"
                  rows={2}
                  value={newArticleContent}
                  onChange={e => setNewArticleContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-850 font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                ></textarea>

                <button
                  type="submit"
                  className="w-full bg-indigo-650 hover:bg-indigo-550 text-white font-bold text-xs py-2 rounded-lg transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                >
                  Insert Into articles
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: QUERY SANDBOX */}
        {activeTab === 'query' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold">Run test queries to evaluate join tables and counters:</span>
              <div className="flex space-x-1.5">
                <button
                  onClick={() => runQuery('SELECT * FROM articles')}
                  className="bg-white border border-slate-200 hover:bg-slate-100 px-2.5 py-1 rounded text-[10px] text-indigo-700 font-bold cursor-pointer transition-all shadow-3xs"
                >
                  All Articles
                </button>
                <button
                  onClick={() => runQuery('SELECT * FROM topics')}
                  className="bg-white border border-slate-200 hover:bg-slate-100 px-2.5 py-1 rounded text-[10px] text-indigo-700 font-bold cursor-pointer transition-all shadow-3xs"
                >
                  All Topics
                </button>
                <button
                  onClick={() => runQuery('SELECT * FROM articles JOIN topics ON articles.topicId = topics.id')}
                  className="bg-[#f0fdf4] border border-emerald-200 hover:bg-emerald-100 px-2.5 py-1 rounded text-[10px] text-emerald-700 font-bold cursor-pointer transition-all shadow-3xs"
                >
                  Relational JOIN
                </button>
              </div>
            </div>

            {/* Input terminal */}
            <div className="bg-white rounded-xl p-3 border border-slate-200 flex items-center space-x-2 shadow-2xs">
              <span className="text-emerald-500 font-bold font-mono text-sm">&gt;</span>
              <input
                type="text"
                value={queryPreset}
                onChange={e => setQueryPreset(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') runQuery(queryPreset); }}
                className="w-full bg-transparent font-mono text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => runQuery(queryPreset)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs cursor-pointer shadow-xs active:scale-[0.99]"
              >
                Execute
              </button>
            </div>

            {/* Simulated Output logs */}
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl min-h-[140px] font-mono text-xs text-slate-350 shadow-inner">
              {queryError ? (
                <p className="text-red-400 font-semibold">{queryError}</p>
              ) : simulatedSqlOutput.length === 0 ? (
                <p className="text-slate-500 italic">No output. Type selection SQL and hit Enter.</p>
              ) : (
                <pre className="overflow-x-auto whitespace-pre-wrap max-h-56 scrollbar-thin scrollbar-thumb-slate-800 text-[#eceff4] text-left">
                  {JSON.stringify(simulatedSqlOutput, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ENTITY RELATIONSHIPS */}
        {activeTab === 'entity' && (
          <div className="space-y-6">
            <p className="text-slate-600 text-xs leading-relaxed font-sans">
              Below is the schema diagram showing the <span className="text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5 rounded">Room Entity relationships</span>. Room automates SQLite foreign keys to trigger cascade deletion events.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Table Topics Spec */}
              <div className="border border-slate-200 bg-white rounded-xl p-4.5 space-y-2.5 shadow-3xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-800 font-bold font-mono text-xs">TopicEntity</span>
                  <span className="text-[10px] text-slate-400 font-mono">tableName: "topics"</span>
                </div>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="flex justify-between items-center text-slate-700">
                    <span>id: Long</span>
                    <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">PRIMARY KEY</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span>title: String</span>
                    <span className="text-slate-400 text-[10px]">NOT NULL</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span>description: String</span>
                    <span className="text-slate-400 text-[10px]">NULLABLE</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>createdAt: Long</span>
                    <span className="text-[#999] text-[9px]">TIMESTAMP</span>
                  </div>
                </div>
              </div>

              {/* Table Articles Spec */}
              <div className="border border-slate-200 bg-white p-4.5 rounded-xl space-y-2.5 shadow-3xs ring-2 ring-indigo-50/50">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-800 font-bold font-mono text-xs">ArticleEntity</span>
                  <span className="text-[10px] text-slate-400 font-mono">tableName: "articles"</span>
                </div>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="flex justify-between items-center text-slate-700">
                    <span>id: Long</span>
                    <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">PRIMARY KEY</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-750">
                    <span>topicId: Long</span>
                    <span className="bg-indigo-150 text-indigo-700 text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase">FOREIGN KEY</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span>title: String</span>
                    <span className="text-slate-400 text-[10px]">NOT NULL</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-705">
                    <span>type: String</span>
                    <span className="text-slate-400 text-[9px]">PLAIN/SRT</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span>content: String</span>
                    <span className="text-slate-400 text-[10px]">RAW DATA</span>
                  </div>
                  <div className="flex justify-between items-center text-[#d97706]">
                    <span>openCount: Int</span>
                    <span className="text-amber-600 font-bold text-[9px]">DEFAULT 0</span>
                  </div>
                </div>
                <div className="text-[9px] bg-indigo-50/50 p-2 rounded-lg text-indigo-700 border border-indigo-100/50 font-medium leading-normal">
                  ForeignKey references topics(id) with Cascade deletion behavior. Has Index on topicId.
                </div>
              </div>

              {/* Table Access Logs Specs */}
              <div className="border border-slate-200 bg-white rounded-xl p-4.5 space-y-2.5 shadow-3xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-800 font-bold font-mono text-xs">AccessLogEntity</span>
                  <span className="text-[10px] text-slate-400 font-mono">tableName: "access_logs"</span>
                </div>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="flex justify-between items-center text-slate-700">
                    <span>id: Long</span>
                    <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">PRIMARY KEY</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span>articleId: Long</span>
                    <span className="bg-purple-100 text-purple-700 text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase">FOREIGN KEY</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>assessedAt: Long</span>
                    <span className="text-[#999] text-[9px]">TIMESTAMP</span>
                  </div>
                </div>
                <div className="text-[9px] bg-slate-50 p-2 rounded-lg text-slate-500 border border-slate-200/50 font-medium leading-normal">
                  ForeignKey references articles(id) cascade. Triggers analytics dashboards in ViewModels.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
