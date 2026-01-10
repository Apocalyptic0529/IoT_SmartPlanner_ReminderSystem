import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertCircle, LogOut, RotateCcw, ChevronLeft, Edit2, X, Check, Moon, Sun, Trash2, Cpu } from "lucide-react";
import { api } from "@shared/routes";

export default function Settings() {
  const { logout, user } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [isResettingScores, setIsResettingScores] = useState(false);
  const [isResettingAnalytics, setIsResettingAnalytics] = useState(false);
  const [isCleaningDeleted, setIsCleaningDeleted] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showResetScoresConfirm, setShowResetScoresConfirm] = useState(false);
  const [showResetAnalyticsConfirm, setShowResetAnalyticsConfirm] = useState(false);
  const [showCleanupDeletedConfirm, setShowCleanupDeletedConfirm] = useState(false);
  
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleGeneratePairingCode = async () => {
    setIsGeneratingCode(true);
    try {
      const response = await fetch("/api/hardware/pairing-code");
      if (response.ok) {
        const data = await response.json();
        setPairingCode(data.code);
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to generate pairing code", variant: "destructive" });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleCleanupDeleted = async () => {
    setIsCleaningDeleted(true);
    try {
      const response = await fetch("/api/cleanup-deleted", { method: "POST" });
      if (response.ok) {
        toast({
          title: "Success",
          description: "All deleted tasks have been permanently removed.",
        });
        setShowCleanupDeletedConfirm(false);
        await queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
      } else {
        throw new Error("Failed to cleanup deleted tasks");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to permanently remove deleted tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCleaningDeleted(false);
    }
  };

  const handleResetScores = async () => {
    setIsResettingScores(true);
    try {
      const response = await fetch("/api/reset-scores", { method: "POST" });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Score history has been reset. Your scores will start fresh.",
        });
        setShowResetScoresConfirm(false);
        // Refetch stats to update the UI
        await queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
      } else {
        throw new Error("Failed to reset scores");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset score history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResettingScores(false);
    }
  };

  const handleResetAnalytics = async () => {
    setIsResettingAnalytics(true);
    try {
      const response = await fetch("/api/reset-analytics", { method: "POST" });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Analytics history has been reset. Your statistics will start fresh.",
        });
        setShowResetAnalyticsConfirm(false);
        // Refetch stats to update the UI
        await queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
      } else {
        throw new Error("Failed to reset analytics");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset analytics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResettingAnalytics(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      toast({
        title: "Error",
        description: "Username cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch("/api/update-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername }),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Username updated successfully.",
        });
        setEditingUsername(false);
        // Refetch user data
        await queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update username");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update username.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch("/api/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          currentPassword,
          newPassword 
        }),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Password updated successfully.",
        });
        setEditingPassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update password");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-full">
      <div className="w-full max-w-2xl px-4 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2 -ml-2 dark:text-gray-300 dark:hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
        </div>
        
        <div>
          <h1 className="text-3xl font-display font-bold dark:text-white">Settings</h1>
          <p className="text-muted-foreground mt-2 dark:text-gray-400">Manage your account, appearance, and data.</p>
        </div>

        {/* Hardware Integration */}
        <Card className="p-6 space-y-4 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <Cpu className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-display font-bold dark:text-white">Hardware Integration</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium dark:text-white">Smart Reminder Status</p>
                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  {user?.hardwareId ? (
                    <div className="flex gap-2">
                      <span className="text-green-600 dark:text-green-400 font-semibold self-center">Hardware: Paired ✓</span>
                      <Button 
                        onClick={handleGeneratePairingCode} 
                        disabled={isGeneratingCode}
                        variant="outline"
                        size="sm"
                        className="dark:border-gray-600 dark:text-gray-300"
                      >
                        Rotate Code
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleGeneratePairingCode} 
                      disabled={isGeneratingCode}
                      variant="outline"
                      className="dark:border-gray-600 dark:text-gray-300"
                    >
                      {isGeneratingCode ? "Generate Pairing Code" : "Pair Hardware"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {pairingCode && (
              <div className="p-4 bg-primary/10 rounded-lg text-center animate-in fade-in slide-in-from-top-2">
                <p className="text-sm font-medium mb-1 dark:text-gray-300">Your Pairing Code:</p>
                <p className="text-3xl font-mono font-bold tracking-widest text-primary">{pairingCode}</p>
                <p className="text-xs text-muted-foreground mt-2 dark:text-gray-400">Program this into your ESP32 device.</p>
              </div>
            )}
            {user?.hardwareId && (
              <p className="text-xs text-muted-foreground dark:text-gray-500 italic">
                Hardware ID: {user.hardwareId}
              </p>
            )}
          </div>
        </Card>

        {/* Appearance */}
        <Card className="p-6 dark:bg-gray-800/50">
          <h2 className="text-xl font-display font-bold mb-4 dark:text-white">Appearance</h2>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode" className="text-base dark:text-white">Dark Mode</Label>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                Switch between light and dark themes.
              </p>
            </div>
            {mounted && (
              <div className="flex items-center gap-2">
                {resolvedTheme === "dark" ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-amber-500" />}
                <Switch
                  id="dark-mode"
                  checked={resolvedTheme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
            )}
          </div>
        </Card>
        
        {/* Account Info */}
        <Card className="p-6 space-y-4 dark:bg-gray-800/50">
          <div>
            <h2 className="text-xl font-display font-bold mb-4 dark:text-white">Account Information</h2>
            <div className="space-y-3">
              {/* Username */}
              <div className="py-4 border-b dark:border-gray-700">
                {editingUsername ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold dark:text-white">Edit Username</span>
                    </div>
                    <Input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="New username"
                      disabled={isUpdating}
                      className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleUpdateUsername}
                        disabled={isUpdating}
                        className="flex-1 dark:bg-primary dark:text-white"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingUsername(false);
                          setNewUsername(user?.username || "");
                        }}
                        disabled={isUpdating}
                        className="flex-1 dark:border-gray-600 dark:text-gray-300"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 dark:text-gray-400">Username</p>
                      <p className="font-medium dark:text-white">{user?.username}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingUsername(true)}
                      className="dark:text-gray-300 dark:hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="py-4">
                {editingPassword ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold dark:text-white">Change Password</span>
                    </div>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current password"
                      disabled={isUpdating}
                      className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
                    />
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      disabled={isUpdating}
                      className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
                    />
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      disabled={isUpdating}
                      className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleUpdatePassword}
                        disabled={isUpdating}
                        className="flex-1 dark:bg-primary dark:text-white"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingPassword(false);
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                        disabled={isUpdating}
                        className="flex-1 dark:border-gray-600 dark:text-gray-300"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 dark:text-gray-400">Password</p>
                      <p className="font-medium text-sm dark:text-white">••••••••</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingPassword(true)}
                      className="dark:text-gray-300 dark:hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-6 space-y-6 dark:bg-gray-800/50">
        <h2 className="text-xl font-display font-bold dark:text-white">Data Management</h2>

        {/* Reset Scores */}
        <div className="space-y-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">Reset Score History</h3>
              <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                Clear all your weekly, monthly, and yearly scores. This action cannot be undone. Your current tasks will remain unchanged.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full border-amber-300 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 dark:text-amber-200"
            onClick={() => setShowResetScoresConfirm(true)}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Scores
          </Button>
        </div>

        {/* Reset Analytics */}
        <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Reset Analytics History</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                Clear all your task completion and productivity analytics. This action cannot be undone. Your current tasks will remain unchanged.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full border-blue-300 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 dark:text-blue-200"
            onClick={() => setShowResetAnalyticsConfirm(true)}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Analytics
          </Button>
        </div>

        {/* Cleanup Deleted Tasks */}
        <div className="space-y-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-red-900 dark:text-red-100">Permanently Remove Deleted Tasks</h3>
              <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                This will permanently delete all tasks from the Deleted Tasks history. Permanent score impacts from missed tasks will be kept.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full border-red-300 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/50 dark:text-red-200"
            onClick={() => setShowCleanupDeletedConfirm(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Cleanup Deleted Tasks
          </Button>
        </div>
      </Card>

        {/* Logout */}
        <Card className="p-6 dark:bg-gray-800/50">
          <h2 className="text-xl font-display font-bold mb-4 dark:text-white">Session</h2>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </Card>
      </div>

      {/* Reset Scores Confirmation Dialog */}
      <Dialog open={showResetScoresConfirm} onOpenChange={setShowResetScoresConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Score History?</DialogTitle>
            <DialogDescription>
              This will permanently delete all your score history including weekly, monthly, and yearly scores. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowResetScoresConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleResetScores}
              disabled={isResettingScores}
            >
              {isResettingScores ? "Resetting..." : "Reset Scores"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Analytics Confirmation Dialog */}
      <Dialog open={showResetAnalyticsConfirm} onOpenChange={setShowResetAnalyticsConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Analytics History?</DialogTitle>
            <DialogDescription>
              This will permanently delete all your task completion and productivity analytics. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowResetAnalyticsConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleResetAnalytics}
              disabled={isResettingAnalytics}
            >
              {isResettingAnalytics ? "Resetting..." : "Reset Analytics"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cleanup Deleted Tasks Confirmation Dialog */}
      <Dialog open={showCleanupDeletedConfirm} onOpenChange={setShowCleanupDeletedConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cleanup Deleted Tasks History?</DialogTitle>
            <DialogDescription>
              This will permanently remove all deleted tasks from history. This action cannot be undone. Permanent score impacts will remain.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowCleanupDeletedConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCleanupDeleted}
              disabled={isCleaningDeleted}
            >
              {isCleaningDeleted ? "Cleaning..." : "Cleanup History"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Logout?</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You'll need to login again to access your tasks.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowLogoutConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
