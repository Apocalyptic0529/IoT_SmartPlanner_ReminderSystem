import { useState, useEffect } from "react";
import { useStats } from "@/hooks/use-tasks";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Loader2, TrendingUp, CheckCircle, AlertOctagon, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function StatsOverview() {
  const { data: stats, isLoading } = useStats();
  const [showRecap, setShowRecap] = useState(false);

  useEffect(() => {
    const checkSaturdayRecap = () => {
      const now = new Date();
      if (now.getDay() === 6) { // Saturday
        const lastRecap = localStorage.getItem('lastSaturdayRecap');
        const todayStr = now.toISOString().split('T')[0];
        if (lastRecap !== todayStr) {
          setShowRecap(true);
          localStorage.setItem('lastSaturdayRecap', todayStr);
        }
      }
    };
    checkSaturdayRecap();
  }, []);

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  if (!stats) return null;

  const pieData = [
    { name: "Completed", value: stats.completed, color: "hsl(var(--primary))" },
    { name: "Pending", value: stats.pending, color: "hsl(var(--muted-foreground))" },
    { name: "Overdue", value: stats.overdue, color: "hsl(var(--destructive))" },
  ];

  const barData = [
    { name: "Weekly", score: stats.weeklyScore },
    { name: "Monthly", score: stats.monthlyScore },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Quick Stats Cards */}
      <Card className="lg:col-span-1 bg-gradient-to-br from-primary/5 to-transparent border-primary/10 dark:from-primary/10 dark:to-transparent dark:border-primary/20">
        <CardContent className="p-6">
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2 dark:text-white">
            <TrendingUp className="h-5 w-5 text-primary" />
            Productivity Score
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <span className="text-4xl font-bold text-foreground dark:text-white">{stats.completionRate}%</span>
              <span className="text-sm text-muted-foreground dark:text-gray-400 mb-1">Completion Rate</span>
            </div>
            <div className="h-2 w-full bg-secondary dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-out" 
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-background/50 dark:bg-gray-900/50 rounded-lg p-3">
                <span className="text-xs text-muted-foreground dark:text-gray-400 block">Completed</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" /> {stats.completed}
                </span>
              </div>
              <div className="bg-background/50 dark:bg-gray-900/50 rounded-lg p-3">
                <span className="text-xs text-muted-foreground dark:text-gray-400 block">Overdue</span>
                <span className="text-xl font-bold text-red-500 dark:text-red-400 flex items-center gap-1">
                  <AlertOctagon className="h-4 w-4" /> {stats.overdue}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Card className="lg:col-span-1 dark:bg-gray-800/50 dark:border-gray-800">
        <CardContent className="p-6 h-[250px] relative">
          <h3 className="font-display font-semibold text-sm text-muted-foreground dark:text-gray-400 absolute top-6 left-6">Task Status</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: 'hsl(var(--card))',
                  color: 'hsl(var(--foreground))'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-1 dark:bg-gray-800/50 dark:border-gray-800">
        <CardContent className="p-6 h-[250px] relative">
          <div className="flex justify-between items-start absolute top-6 left-6 right-6 z-10 bg-card/80 dark:bg-gray-900/80 backdrop-blur-sm p-1 rounded-md">
            <h3 className="font-display font-semibold text-sm text-muted-foreground dark:text-gray-400">Score History</h3>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs gap-1 shadow-sm hover:bg-primary/5 dark:border-gray-700 dark:text-gray-300"
              onClick={() => setShowRecap(true)}
            >
              <History className="h-3 w-3" />
              Recap
            </Button>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 50, right: 20, bottom: 20, left: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="currentColor" className="text-muted-foreground dark:text-gray-400" />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: 'hsl(var(--card))',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Bar 
                dataKey="score" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]} 
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Dialog open={showRecap} onOpenChange={setShowRecap}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-2 dark:text-white">
              <History className="h-6 w-6 text-primary" />
              Performance Recap
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Your productivity breakdown for this period.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground dark:text-gray-400">Weekly Score</p>
                <p className="text-3xl font-bold text-primary">{stats.weeklyScore}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground dark:text-gray-400">Monthly Score</p>
                <p className="text-3xl font-bold text-primary">{stats.monthlyScore}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground dark:text-gray-400">Completion Rate</span>
                <span className="font-medium dark:text-white">{stats.completionRate}%</span>
              </div>
              <div className="h-2 w-full bg-secondary dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>

            <div className="bg-muted/30 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm dark:text-gray-200">Tasks Completed</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{stats.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm dark:text-gray-200">Tasks Overdue</span>
                <span className="font-semibold text-red-500 dark:text-red-400">{stats.overdue}</span>
              </div>
              <div className="flex justify-between items-center border-t dark:border-gray-700 pt-2 mt-2">
                <span className="text-sm font-medium dark:text-gray-100">Total Pending</span>
                <span className="font-semibold dark:text-white">{stats.pending}</span>
              </div>
            </div>
          </div>
          <Button onClick={() => setShowRecap(false)} className="w-full dark:bg-primary dark:text-white">
            Keep it up!
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
