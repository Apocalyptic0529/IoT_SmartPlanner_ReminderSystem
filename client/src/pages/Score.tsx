import { useState, useEffect } from "react";
import { useStats } from "@/hooks/use-stats";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Confetti from "react-confetti";
import { Trophy, Award, Calendar, TrendingUp, TrendingDown, Check, History } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Score() {
  const { data: stats, isLoading } = useStats();
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSaturdayPopup, setShowSaturdayPopup] = useState(false);
  const [saturdayScoreType, setSaturdayScoreType] = useState<'weekly' | 'monthly'>('weekly');
  const [scoreMessage, setScoreMessage] = useState({ title: '', description: '', score: 0, period: '' });
  const [showRecap, setShowRecap] = useState(false);
  const [recapType, setRecapType] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');

  useEffect(() => {
    if (stats) {
      const now = new Date();
      if (now.getDay() === 6) { // Saturday
        const lastPopup = localStorage.getItem('lastSaturdayPopup');
        const todayStr = now.toISOString().split('T')[0];
        
        if (lastPopup !== todayStr) {
          setShowSaturdayPopup(true);
          localStorage.setItem('lastSaturdayPopup', todayStr);
          
          const isLastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() === now.getDate();
          if (isLastDayOfMonth) {
            setSaturdayScoreType('monthly');
            setScoreMessage({
              title: "Monthly Achievement!",
              description: "You've completed your monthly cycle. Great job!",
              score: (stats as any).monthlyScore,
              period: "Monthly"
            });
          } else {
            setSaturdayScoreType('weekly');
            setScoreMessage({
              title: "Weekly Wrap-up!",
              description: "Another productive week down. See your progress!",
              score: (stats as any).weeklyScore,
              period: "Weekly"
            });
          }
        }
      }
    }
  }, [stats]);

  const handleShowRecap = (type: 'weekly' | 'monthly' | 'yearly') => {
    setRecapType(type);
    setShowRecap(true);
  };
  const getWeekRange = (start: string | undefined) => {
    if (!start) return "";
    const startDate = new Date(start);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
  };

  const getMonthRange = (start: string | undefined) => {
    if (!start) return "";
    const startDate = new Date(start);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
  };

  const getYearRange = (start: string | undefined) => {
    if (!start) return "";
    const startDate = new Date(start);
    return `${format(startDate, "yyyy")}`;
  };

  const typedStats = stats as any;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      {showCelebration && (
        <Confetti 
          recycle={false} 
          numberOfPieces={1500} 
          gravity={0.1}
          initialVelocityY={30}
          width={window.innerWidth}
          height={document.documentElement.scrollHeight || window.innerHeight}
        />
      )}

      {/* Saturday Score Popup */}
      <Dialog open={showSaturdayPopup} onOpenChange={setShowSaturdayPopup}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl dark:text-white">{scoreMessage.title}</DialogTitle>
            <DialogDescription className="dark:text-gray-400">{scoreMessage.description}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-6 py-6">
            <motion.div
              className="text-6xl font-display font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              {scoreMessage.score}
            </motion.div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground dark:text-gray-400">{scoreMessage.period} Score</p>
              <p className="text-xs text-muted-foreground mt-1 dark:text-gray-500">
                {saturdayScoreType === 'monthly' ? 'Celebrate your monthly achievements!' : 'Keep pushing to improve next week!'}
              </p>
            </div>
            <Button onClick={() => setShowSaturdayPopup(false)} className="w-full dark:bg-primary dark:text-white">
              <Calendar className="h-4 w-4 mr-2" />
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="text-center">
        <h1 className="text-4xl font-display font-bold mb-2 dark:text-white">Your Score</h1>
        <p className="text-muted-foreground dark:text-gray-300">Track your productivity and achievements</p>
      </div>

      {/* Score Breakdown - Based on Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 text-center space-y-4 border-emerald-100 bg-emerald-50/30 dark:bg-emerald-950/20 dark:border-emerald-900/50">
          <div className="flex justify-center">
            <div className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
              <span className="text-xl font-bold">+10</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold dark:text-white">High Priority Done</p>
            <p className="text-xs text-muted-foreground mt-1 dark:text-gray-400">Focus on what matters most</p>
          </div>
        </Card>

        <Card className="p-6 text-center space-y-4 border-blue-100 bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-900/50">
          <div className="flex justify-center">
            <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
              <span className="text-xl font-bold">+5</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold dark:text-white">Medium Priority Done</p>
            <p className="text-xs text-muted-foreground mt-1 dark:text-gray-400">Keep the momentum going</p>
          </div>
        </Card>

        <Card className="p-6 text-center space-y-4 border-slate-100 bg-slate-50/30 dark:bg-slate-900/20 dark:border-slate-800/50">
          <div className="flex justify-center">
            <div className="h-12 w-12 bg-slate-500 rounded-full flex items-center justify-center text-white shadow-lg">
              <span className="text-xl font-bold">+2</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold dark:text-white">Low Priority Done</p>
            <p className="text-xs text-muted-foreground mt-1 dark:text-gray-400">Every small task counts</p>
          </div>
        </Card>

        <Card className="p-6 text-center space-y-4 border-red-100 bg-red-50/30 dark:bg-red-950/20 dark:border-red-900/50">
          <div className="flex justify-center">
            <div className="h-12 w-12 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg">
              <TrendingDown className="h-6 w-6" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold dark:text-white">Missed Deadlines</p>
            <p className="text-xs text-muted-foreground mt-1 dark:text-gray-400">Points deducted based on priority</p>
          </div>
        </Card>
      </div>

      {/* Period Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Weekly Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 sm:p-6 lg:p-8 text-center space-y-4 sm:space-y-6 h-full flex flex-col items-center justify-center dark:bg-gray-800/50">
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground dark:text-gray-400">This Week</p>
              <motion.div
                className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {(stats as any)?.weeklyScore || 0}
              </motion.div>
              <p className="text-[10px] sm:text-xs text-muted-foreground dark:text-gray-400">
                {getWeekRange(stats?.lastWeeklyReset)}
              </p>
            </div>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => handleShowRecap('weekly')}
              className="text-xs sm:text-sm dark:bg-primary dark:text-white"
              data-testid="button-recap-weekly"
            >
              <History className="h-4 w-4 mr-2" />
              Recap
            </Button>
          </Card>
        </motion.div>

        {/* Monthly Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 sm:p-6 lg:p-8 text-center space-y-4 sm:space-y-6 h-full flex flex-col items-center justify-center dark:bg-gray-800/50">
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground dark:text-gray-400">This Month</p>
              <motion.div
                className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              >
                {(stats as any)?.monthlyScore || 0}
              </motion.div>
              <p className="text-[10px] sm:text-xs text-muted-foreground dark:text-gray-400">
                {getMonthRange(stats?.lastMonthlyReset)}
              </p>
            </div>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => handleShowRecap('monthly')}
              className="text-xs sm:text-sm dark:bg-primary dark:text-white"
              data-testid="button-recap-monthly"
            >
              <History className="h-4 w-4 mr-2" />
              Recap
            </Button>
          </Card>
        </motion.div>

        {/* Yearly Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 sm:p-6 lg:p-8 text-center space-y-4 sm:space-y-6 h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-900/50">
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground dark:text-gray-400">This Year</p>
              <motion.div
                className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                {(stats as any)?.yearlyScore || 0}
              </motion.div>
              <p className="text-[10px] sm:text-xs text-muted-foreground dark:text-gray-400">
                Calendar Year {getYearRange(stats?.lastYearlyReset)}
              </p>
            </div>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => handleShowRecap('yearly')}
              className="text-xs sm:text-sm mt-2 dark:bg-primary dark:text-white"
              data-testid="button-recap-yearly"
            >
              <History className="h-4 w-4 mr-2" />
              Recap
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Score Breakdown */}
      <Card className="p-4 sm:p-6 dark:bg-gray-800/50">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-display font-bold dark:text-white">Weekly Score Breakdown</h3>
          <span className="text-[10px] sm:text-xs text-muted-foreground bg-muted dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-md">
            {getWeekRange(stats?.lastWeeklyReset)}
          </span>
        </div>
        {typedStats?.weeklyScoredTasks && typedStats.weeklyScoredTasks.length > 0 ? (
          <div className="space-y-2">
            {typedStats.weeklyScoredTasks.map((task: any) => (
              <div key={task.id} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 dark:bg-gray-700/50 rounded-lg gap-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {task.scoreImpact > 0 ? (
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-foreground dark:text-white truncate">{task.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {task.status === "completed" && (
                        <Badge variant="secondary" className="text-[10px] sm:text-xs dark:bg-gray-600 dark:text-gray-100">
                          <Check className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {task.status === "missed" && (
                        <Badge variant="destructive" className="text-[10px] sm:text-xs">Missed</Badge>
                      )}
                      {task.status === "pending" && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs dark:border-gray-600 dark:text-gray-300">Pending</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`text-sm sm:text-lg font-display font-bold ml-2 sm:ml-4 flex-shrink-0 ${
                  task.status === "missed" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                }`}>
                  {task.status === "missed" ? "" : "+"}{task.scoreImpact}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400">No scored tasks this week yet</p>
        )}
      </Card>

      {/* Monthly Score Breakdown */}
      <Card className="p-4 sm:p-6 dark:bg-gray-800/50">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-display font-bold dark:text-white">Monthly Score Breakdown</h3>
          <span className="text-[10px] sm:text-xs text-muted-foreground bg-muted dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-md">
            {getMonthRange(stats?.lastMonthlyReset)}
          </span>
        </div>
        {typedStats?.monthlyScoredTasks && typedStats.monthlyScoredTasks.length > 0 ? (
          <div className="space-y-2">
            {typedStats.monthlyScoredTasks.map((task: any) => (
              <div key={task.id} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 dark:bg-gray-700/50 rounded-lg gap-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {task.scoreImpact > 0 ? (
                    task.status === "missed" ? (
                      <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
                    ) : (
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                    )
                  ) : (
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-foreground dark:text-white truncate">{task.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {task.status === "completed" && (
                        <Badge variant="secondary" className="text-[10px] sm:text-xs dark:bg-gray-600 dark:text-gray-100">
                          <Check className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {task.status === "missed" && (
                        <Badge variant="destructive" className="text-[10px] sm:text-xs">Missed</Badge>
                      )}
                      {task.status === "pending" && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs dark:border-gray-600 dark:text-gray-300">Pending</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`text-sm sm:text-lg font-display font-bold ml-2 sm:ml-4 flex-shrink-0 ${
                  task.status === "missed" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                }`}>
                  {task.status === "missed" ? "" : "+"}{task.scoreImpact}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400">No scored tasks this month yet</p>
        )}
      </Card>

      {/* Yearly Score Breakdown */}
      <Card className="p-4 sm:p-6 dark:bg-gray-800/50">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-display font-bold dark:text-white">Yearly Score Breakdown</h3>
          <span className="text-[10px] sm:text-xs text-muted-foreground bg-muted dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-md">
            Year {getYearRange(stats?.lastYearlyReset)}
          </span>
        </div>
        {typedStats?.yearlyScoredTasks && typedStats.yearlyScoredTasks.length > 0 ? (
          <div className="space-y-2">
            {typedStats.yearlyScoredTasks.map((task: any) => (
              <div key={task.id} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 dark:bg-gray-700/50 rounded-lg gap-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {task.scoreImpact > 0 ? (
                    task.status === "missed" ? (
                      <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
                    ) : (
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                    )
                  ) : (
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-foreground dark:text-white truncate">{task.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {task.status === "completed" && (
                        <Badge variant="secondary" className="text-[10px] sm:text-xs dark:bg-gray-600 dark:text-gray-100">
                          <Check className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {task.status === "missed" && (
                        <Badge variant="destructive" className="text-[10px] sm:text-xs">Missed</Badge>
                      )}
                      {task.status === "pending" && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs dark:border-gray-600 dark:text-gray-300">Pending</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`text-sm sm:text-lg font-display font-bold ml-2 sm:ml-4 flex-shrink-0 ${
                  task.status === "missed" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                }`}>
                  {task.status === "missed" ? "" : "+"}{task.scoreImpact}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400">No scored tasks this year yet</p>
        )}
      </Card>

      <Dialog open={showRecap} onOpenChange={setShowRecap}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-2 dark:text-white">
              <History className="h-6 w-6 text-primary" />
              {recapType === 'weekly' ? 'Weekly' : recapType === 'monthly' ? 'Monthly' : 'Yearly'} Recap
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Your productivity breakdown for this {recapType}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1 dark:text-gray-400">Total Score</p>
              <p className="text-5xl font-bold text-primary">
                {recapType === 'weekly' ? typedStats?.weeklyScore : recapType === 'monthly' ? typedStats?.monthlyScore : typedStats?.yearlyScore}
              </p>
            </div>

            <div className="bg-muted/30 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium dark:text-gray-200">Scored Tasks</span>
                <span className="text-sm font-semibold dark:text-white">
                  {recapType === 'weekly' ? typedStats?.weeklyScoredTasks?.length : recapType === 'monthly' ? typedStats?.monthlyScoredTasks?.length : typedStats?.yearlyScoredTasks?.length}
                </span>
              </div>
              <div className="space-y-2">
                {(recapType === 'weekly' ? typedStats?.weeklyScoredTasks : recapType === 'monthly' ? typedStats?.monthlyScoredTasks : typedStats?.yearlyScoredTasks)
                  ?.slice(0, 5).map((task: any) => (
                    <div key={task.id} className="flex justify-between items-center text-xs">
                      <span className="truncate flex-1 mr-2 dark:text-gray-300">{task.title}</span>
                      <span className={task.status === "missed" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>
                        {task.status === "missed" ? "" : "+"}{task.scoreImpact}
                      </span>
                    </div>
                  ))}
                {(recapType === 'weekly' ? typedStats?.weeklyScoredTasks : recapType === 'monthly' ? typedStats?.monthlyScoredTasks : typedStats?.yearlyScoredTasks)
                  ?.length > 5 && (
                    <p className="text-[10px] text-center text-muted-foreground italic">
                      ...and more
                    </p>
                  )}
              </div>
            </div>
          </div>
          <Button onClick={() => setShowRecap(false)} className="w-full">
            Keep it up!
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
