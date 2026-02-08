import React from 'react';

interface AnalyticsData {
  id: string;
  session_id: string;
  message_count: number;
  model: string;
  created_at: string;
}

interface AnalyticsDashboardProps {
  data: AnalyticsData[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data }) => {
  const totalMessages = data.reduce((sum, item) => sum + (item.message_count || 0), 0);
  const totalSessions = data.length;

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-100 mb-8">Analytics Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-950/20 border border-blue-900/50 rounded-lg p-6">
            <div className="text-blue-400 text-sm uppercase tracking-wide mb-2">Total Sessions</div>
            <div className="text-4xl font-bold text-blue-100">{totalSessions}</div>
          </div>
          
          <div className="bg-blue-950/20 border border-blue-900/50 rounded-lg p-6">
            <div className="text-blue-400 text-sm uppercase tracking-wide mb-2">Total Messages</div>
            <div className="text-4xl font-bold text-blue-100">{totalMessages}</div>
          </div>
          
          <div className="bg-blue-950/20 border border-blue-900/50 rounded-lg p-6">
            <div className="text-blue-400 text-sm uppercase tracking-wide mb-2">Avg Messages/Session</div>
            <div className="text-4xl font-bold text-blue-100">
              {totalSessions > 0 ? (totalMessages / totalSessions).toFixed(1) : '0'}
            </div>
          </div>
        </div>

        <div className="bg-blue-950/20 border border-blue-900/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-100 mb-4">Recent Sessions</h2>
          <div className="space-y-3">
            {data.length === 0 ? (
              <p className="text-blue-400 text-sm">No analytics data available yet.</p>
            ) : (
              data.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-blue-900/10 rounded border border-blue-900/30"
                >
                  <div>
                    <div className="text-blue-100 font-medium">Session {item.session_id.slice(0, 8)}...</div>
                    <div className="text-blue-400 text-sm">{item.model}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-100">{item.message_count} messages</div>
                    <div className="text-blue-400 text-sm">
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
