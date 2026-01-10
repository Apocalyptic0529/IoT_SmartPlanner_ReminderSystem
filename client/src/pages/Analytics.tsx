import { useStats } from "@/hooks/use-stats";
import { useTasks } from "@/hooks/use-tasks";
import { Card } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Activity, TrendingUp, AlertCircle, CheckCircle, Lightbulb } from "lucide-react";

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981'];

export default function Analytics() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: tasks, isLoading: tasksLoading } = useTasks({ status: "all", category: "all" });

  // Prepare data for analytics pie chart using active task data
  const allAnalyticsData = [
    { name: 'Completed', value: stats?.completed ?? 0 },
    { name: 'Missed', value: stats?.overdue ?? 0 },
  ];
  const analyticsData = allAnalyticsData.filter(d => d.value > 0);

  // Prepare daily completion data from current tasks
  const dailyData = tasks?.reduce((acc: any[], task) => {
    if (task.status !== 'completed' && task.status !== 'missed' && task.status !== 'pending') return acc;
    
    const date = new Date(task.dueDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existing = acc.find(d => d.date === date);
    if (existing) {
      if (task.status === 'completed') existing.completed++;
      else if (task.status === 'missed') existing.missed++;
      else if (task.status === 'pending') existing.pending++;
    } else {
      acc.push({ 
        date, 
        completed: task.status === 'completed' ? 1 : 0, 
        missed: task.status === 'missed' ? 1 : 0,
        pending: task.status === 'pending' ? 1 : 0
      });
    }
    return acc;
  }, [])?.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())?.slice(-7) || [];

  if (statsLoading || tasksLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-64 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  // Generate insight messages
  const getInsightMessage = () => {
    const completionRate = stats?.completionRate || 0;
    
    if (completionRate >= 80) {
      return "Excellent work! You're maintaining a great completion rate. Keep up the momentum!";
    } else if (completionRate >= 60) {
      return "You're on track! Keep completing tasks to improve your productivity score.";
    } else if (completionRate >= 40) {
      return "You're making progress! Focus on completing more tasks to boost your score.";
    } else if (completionRate > 0) {
      return "Get started with your tasks. Each completion improves your productivity score!";
    } else {
      return "Keep setting clear goals and deadlines to improve your task management.";
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-display font-bold">Analytics</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Completed</span>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-bold">{stats?.completed || 0}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">active tasks</p>
        </Card>

        <Card className="p-4 sm:p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Missed</span>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-2xl sm:text-3xl font-display font-bold">{stats?.overdue || 0}</div>
            <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-muted rounded">All-time</span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">active tasks</p>
        </Card>

        <Card className="p-4 sm:p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Current Pending</span>
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-bold">{stats?.pending || 0}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">in progress</p>
        </Card>

        <Card className="p-4 sm:p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Productivity Score</span>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-bold">{stats?.completionRate || 0}%</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">completion rate</p>
        </Card>
      </div>

      {/* Scoring System Legend */}
      <Card className="p-4 sm:p-6 bg-muted/20 border-primary/10">
        <h3 className="text-base sm:text-lg font-display font-bold mb-3 sm:mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
          Scoring System
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <div className="bg-background/50 p-3 sm:p-4 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">High</p>
            <p className="text-xl sm:text-2xl font-display font-bold text-foreground">+10</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">On completion</p>
          </div>
          <div className="bg-background/50 p-3 sm:p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Medium</p>
            <p className="text-xl sm:text-2xl font-display font-bold text-foreground">+5</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">On completion</p>
          </div>
          <div className="bg-background/50 p-3 sm:p-4 rounded-lg border border-slate-100 dark:border-slate-800/30">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Low</p>
            <p className="text-xl sm:text-2xl font-display font-bold text-foreground">+2</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">On completion</p>
          </div>
          <div className="bg-background/50 p-3 sm:p-4 rounded-lg border border-red-100 dark:border-red-900/30">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-red-600 mb-1">Missed</p>
            <p className="text-xl sm:text-2xl font-display font-bold text-foreground">-VAR</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">By priority</p>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Current Task Distribution */}
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-display font-bold mb-3 sm:mb-4">Current Task Status</h3>
          {analyticsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>No task data available</p>
            </div>
          )}
        </Card>

        {/* Daily Completion Trend */}
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-display font-bold mb-3 sm:mb-4">7-Day Task Trend</h3>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#10b981" />
                <Bar dataKey="pending" stackId="a" fill="#3b82f6" />
                <Bar dataKey="missed" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>No task data available</p>
            </div>
          )}
        </Card>
      </div>

      {/* Insight Message */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-2 sm:gap-3">
          <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 min-w-0">
            <h3 className="font-display font-bold text-amber-900 dark:text-amber-100 text-sm sm:text-base">Insight</h3>
            <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">{getInsightMessage()}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
