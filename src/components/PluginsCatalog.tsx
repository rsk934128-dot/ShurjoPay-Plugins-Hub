import React, { useState } from 'react';
import { PluginItem } from '../types';
import { Search, ExternalLink, Copy, Check, Terminal, Filter, ArrowUpRight } from 'lucide-react';

interface PluginsCatalogProps {
  plugins: PluginItem[];
  onSelectSnippet?: (plugin: PluginItem) => void;
}

export const PluginsCatalog: React.FC<PluginsCatalogProps> = ({ plugins, onSelectSnippet }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', 'PHP & CMS', 'Mobile Platform', 'Java, JavaScript & Others'];

  const filteredPlugins = plugins.filter((plugin) => {
    const matchesCategory = selectedCategory === 'All' || plugin.category === selectedCategory;
    const matchesSearch =
      plugin.framework.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.repository.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.language.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="plugins-catalog-section" className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="plugins-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plugins, languages, packages..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`filter-cat-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plugins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlugins.map((plugin) => (
          <div
            key={plugin.id}
            id={`plugin-card-${plugin.id}`}
            className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 hover:border-amber-500/40 hover:bg-slate-900 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div>
                  <span className="inline-block text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 mb-1.5 border border-slate-700/60">
                    {plugin.language}
                  </span>
                  <h3 className="text-base font-semibold text-slate-100 group-hover:text-amber-400 transition-colors">
                    {plugin.framework}
                  </h3>
                </div>
                {plugin.popular && (
                  <span className="text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                    Official
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                {plugin.description}
              </p>

              <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-800 mb-3 space-y-1">
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="font-mono text-slate-300 font-medium truncate">
                    {plugin.packageName}
                  </span>
                  {plugin.version && (
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                      {plugin.version}
                    </span>
                  )}
                </div>

                {plugin.installCommand && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <code className="text-[11px] font-mono text-amber-300/90 truncate block flex-1">
                      {plugin.installCommand}
                    </code>
                    <button
                      id={`copy-btn-${plugin.id}`}
                      onClick={() => handleCopy(plugin.installCommand!, plugin.id)}
                      title="Copy install command"
                      className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors shrink-0"
                    >
                      {copiedId === plugin.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                <Terminal className="w-3 h-3 text-slate-500" />
                {plugin.repository}
              </span>

              <div className="flex items-center gap-2">
                {onSelectSnippet && (
                  <button
                    onClick={() => onSelectSnippet(plugin)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-0.5"
                  >
                    Snippet <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
                {plugin.packageUrl && (
                  <a
                    href={plugin.packageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-slate-200"
                    title="Package Registry"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlugins.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
          <p className="text-sm">No plugins or modules match your search filter.</p>
        </div>
      )}
    </div>
  );
};
