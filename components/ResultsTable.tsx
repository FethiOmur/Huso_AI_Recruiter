import React, { useState, useEffect } from 'react';
import { CandidateAnalysis, HiringRecommendation } from '../types';
import { CheckCircle2, AlertCircle, XCircle, Clock, Download, BarChart2, Star, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ResultsTableProps {
  results: CandidateAnalysis[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateAnalysis | null>(null);

  // Sort results by match score descending
  const sortedResults = [...results].sort((a, b) => b.match_score - a.match_score);

  useEffect(() => {
    if (sortedResults.length > 0 && !selectedCandidate) {
      setSelectedCandidate(sortedResults[0]);
    }
  }, [results]);

  const getRecommendationStyles = (rec: HiringRecommendation) => {
    switch (rec) {
      case HiringRecommendation.STRONG_HIRE: 
        return { 
          badge: 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30', 
          icon: <Star className="w-3 h-3 mr-1.5" /> 
        };
      case HiringRecommendation.INTERVIEW: 
        return { 
          badge: 'border-blue-500/50 text-blue-400 bg-blue-950/30', 
          icon: <CheckCircle2 className="w-3 h-3 mr-1.5" /> 
        };
      case HiringRecommendation.KEEP_ON_FILE: 
        return { 
          badge: 'border-amber-500/50 text-amber-400 bg-amber-950/30', 
          icon: <Clock className="w-3 h-3 mr-1.5" /> 
        };
      case HiringRecommendation.REJECT: 
        return { 
          badge: 'border-red-500/50 text-red-400 bg-red-950/30', 
          icon: <XCircle className="w-3 h-3 mr-1.5" /> 
        };
      default:
        return { badge: 'border-zinc-700 text-zinc-400', icon: null };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Emerald
    if (score >= 60) return '#3b82f6'; // Blue
    if (score >= 40) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const chartData = sortedResults.map(r => ({
    name: r.candidate_name.split(' ')[0], 
    score: r.match_score,
    full: r
  }));

  // Custom Tooltip for Dark Mode Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-bold text-sm">{label}</p>
          <p className="text-zinc-400 text-xs mt-1">
            Score: <span className="text-white font-mono">{payload[0].value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-180px)] min-h-[600px]">
      
      {/* Sidebar List */}
      <div className="xl:col-span-4 glass-panel rounded-2xl flex flex-col overflow-hidden h-full border border-white/5">
        <div className="p-5 border-b border-white/5 bg-white/[0.02]">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center justify-between">
            Candidates 
            <span className="font-mono text-xs text-zinc-500">{sortedResults.length} Total</span>
          </h3>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
          {sortedResults.map((candidate) => {
             const styles = getRecommendationStyles(candidate.hiring_recommendation);
             const isSelected = selectedCandidate?.id === candidate.id;
             return (
              <div
                key={candidate.id}
                onClick={() => setSelectedCandidate(candidate)}
                className={`
                  group p-4 rounded-xl cursor-pointer transition-all duration-200 border
                  ${isSelected
                    ? 'bg-white/10 border-white/20'
                    : 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/5'
                  }
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-8 h-8 rounded flex items-center justify-center text-xs font-bold border
                      ${isSelected ? 'bg-white text-black border-white' : 'bg-black text-zinc-500 border-zinc-800'}
                    `}>
                      {getInitials(candidate.candidate_name)}
                    </div>
                    <div>
                      <div className={`font-medium text-sm leading-tight ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                        {candidate.candidate_name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold" style={{ color: getScoreColor(candidate.match_score) }}>
                      {candidate.match_score}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2 pl-11">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${styles.badge}`}>
                    {styles.icon}
                    {candidate.hiring_recommendation}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Detail View */}
      <div className="xl:col-span-8 flex flex-col h-full overflow-hidden space-y-6">
        {selectedCandidate ? (
          <div className="flex-1 glass-panel rounded-2xl overflow-y-auto custom-scrollbar border border-white/5 relative">
            
            {/* Detail Header */}
            <div className="p-8 border-b border-white/5 relative overflow-hidden bg-gradient-to-r from-white/[0.02] to-transparent">
               <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                 <Target className="w-48 h-48 text-white" />
               </div>
               
               <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                 <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
                      {getInitials(selectedCandidate.candidate_name)}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white tracking-tight">{selectedCandidate.candidate_name}</h2>
                      <div className="flex items-center space-x-2 text-zinc-500 mt-2 font-mono text-xs uppercase tracking-wider">
                        <Download className="w-3 h-3" />
                        <span>{selectedCandidate.fileName}</span>
                      </div>
                      <div className={`mt-4 inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getRecommendationStyles(selectedCandidate.hiring_recommendation).badge}`}>
                        {selectedCandidate.hiring_recommendation}
                      </div>
                    </div>
                 </div>

                 <div className="flex flex-col bg-black/50 rounded-xl p-4 border border-zinc-800 min-w-[180px] backdrop-blur-sm gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Match Index</span>
                      <span className="text-lg font-bold text-white font-mono">{selectedCandidate.match_score}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.15)]"
                        style={{ width: `${selectedCandidate.match_score}%`, backgroundColor: getScoreColor(selectedCandidate.match_score) }}
                      />
                    </div>
                 </div>
               </div>
            </div>

            {/* Content Grid */}
            <div className="p-8 space-y-8">
              
              <section>
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1 h-1 bg-white rounded-full"></span>
                  Executive Summary
                </h4>
                <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 text-zinc-300 leading-relaxed text-sm">
                  {selectedCandidate.summary}
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Strengths */}
                <div>
                  <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4 border-b border-emerald-500/20 pb-2">
                    Key Strengths
                  </h4>
                  <ul className="space-y-3">
                    {selectedCandidate.key_strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start text-sm text-zinc-300 group">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Gaps */}
                <div>
                  <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4 border-b border-red-500/20 pb-2">
                    Identified Gaps
                  </h4>
                  {selectedCandidate.missing_skills.length > 0 ? (
                    <ul className="space-y-3">
                      {selectedCandidate.missing_skills.map((skill, idx) => (
                        <li key={idx} className="flex items-start text-sm text-zinc-300 group">
                           <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform" />
                           {skill}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-zinc-500 italic">No critical gaps detected.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center glass-panel rounded-2xl border border-dashed border-zinc-800 p-10 text-zinc-600">
            <div className="text-center">
              <BarChart2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="uppercase tracking-widest text-xs">Select a data point to expand details</p>
            </div>
          </div>
        )}

        {/* Analytics Card */}
        <div className="glass-panel rounded-2xl p-6 h-64 flex-shrink-0 border border-white/5 flex flex-col">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
             <h3 className="font-bold text-white text-xs uppercase tracking-widest">Cohort Analytics</h3>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis 
                  dataKey="name" 
                  tick={{fontSize: 10, fill: '#52525b', fontFamily: 'monospace'}} 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="score" radius={[2, 2, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      cursor="pointer"
                      key={`cell-${index}`} 
                      fill={selectedCandidate?.id === entry.full.id ? '#ffffff' : '#3f3f46'} 
                      onClick={() => setSelectedCandidate(entry.full)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsTable;
