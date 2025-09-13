"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  Star,
  Award,
  TrendingUp,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Crown,
  Medal,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface ScoutProfile {
  id: string
  name: string
  email: string
  level: number
  totalVerifications: number
  accuracyRate: number
  badges: string[]
  joinDate: string
  monthlyLimit: number
  monthlyUsed: number
  reputation: number
}

interface LeaderboardData {
  leaderboard: ScoutProfile[]
  totalScouts: number
  totalVerifications: number
}

export default function ScoutDashboard() {
  const [currentUser] = useState<ScoutProfile>({
    id: "scout-1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    level: 3,
    totalVerifications: 45,
    accuracyRate: 92,
    badges: ["Expert Taster", "Reliable Scout", "Photo Pro"],
    joinDate: "2024-01-15",
    monthlyLimit: 15,
    monthlyUsed: 8,
    reputation: 850,
  })

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/scout-verify")
      if (response.ok) {
        const data = await response.json()
        setLeaderboardData(data)
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getScoutBadgeIcon = (badge: string) => {
    switch (badge) {
      case "Expert Taster":
        return <Star className="h-4 w-4" />
      case "Reliable Scout":
        return <Shield className="h-4 w-4" />
      case "Photo Pro":
        return <Eye className="h-4 w-4" />
      case "Community Leader":
        return <Users className="h-4 w-4" />
      case "Rising Star":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Award className="h-4 w-4" />
    }
  }

  const getLeaderboardIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return <Target className="h-5 w-5 text-muted-foreground" />
    }
  }

  const nextLevelThreshold = [0, 100, 300, 600, 1000, 1500, 2500][currentUser.level + 1] || 2500
  const progressToNextLevel =
    ((currentUser.reputation - [0, 100, 300, 600, 1000, 1500][currentUser.level]) /
      (nextLevelThreshold - [0, 100, 300, 600, 1000, 1500][currentUser.level])) *
    100

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-heading font-bold text-foreground">Scout Dashboard</h1>
                <p className="text-caption hidden sm:block">Community verification system</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="badges">Badges & Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Scout Profile Card */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                      <Shield className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{currentUser.name}</h2>
                      <p className="text-muted-foreground">Level {currentUser.level} Community Scout</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {currentUser.accuracyRate}% Accuracy
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {currentUser.totalVerifications} Verifications
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{currentUser.reputation}</p>
                    <p className="text-sm text-muted-foreground">Reputation Points</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress to Level {currentUser.level + 1}</span>
                      <span>
                        {currentUser.reputation}/{nextLevelThreshold}
                      </span>
                    </div>
                    <Progress value={progressToNextLevel} className="h-3" />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {currentUser.badges.map((badge) => (
                      <Badge key={badge} variant="outline" className="flex items-center gap-1">
                        {getScoutBadgeIcon(badge)}
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{currentUser.monthlyUsed}</p>
                      <p className="text-sm text-muted-foreground">This Month</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="mt-4">
                    <Progress value={(currentUser.monthlyUsed / currentUser.monthlyLimit) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {currentUser.monthlyLimit - currentUser.monthlyUsed} verifications remaining
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{currentUser.totalVerifications}</p>
                      <p className="text-sm text-muted-foreground">Total Verified</p>
                    </div>
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Since {new Date(currentUser.joinDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{currentUser.accuracyRate}%</p>
                      <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">Based on community feedback</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{currentUser.badges.length}</p>
                      <p className="text-sm text-muted-foreground">Badges Earned</p>
                    </div>
                    <Award className="h-8 w-8 text-yellow-600" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">Keep verifying to earn more!</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-foreground">Recent Verifications</h3>
                <p className="text-sm text-muted-foreground">Your latest community contributions</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Mama Kemi's Authentic Amala", status: "verified", date: "2024-03-15", confidence: 95 },
                    { name: "Abuja Kitchen", status: "needs_review", date: "2024-03-14", confidence: 75 },
                    { name: "Lagos Street Food", status: "verified", date: "2024-03-12", confidence: 88 },
                  ].map((verification, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {verification.status === "verified" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : verification.status === "flagged" ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{verification.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {verification.confidence}% confidence • {verification.date}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          verification.status === "verified"
                            ? "default"
                            : verification.status === "flagged"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {verification.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-foreground">Community Leaderboard</h3>
                <p className="text-sm text-muted-foreground">Top scouts ranked by reputation and accuracy</p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Loading leaderboard...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaderboardData?.leaderboard.map((scout, index) => (
                      <div
                        key={scout.id}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg border",
                          scout.id === currentUser.id ? "border-primary bg-primary/5" : "border-border",
                        )}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8">
                            {getLeaderboardIcon(index + 1)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {scout.name}
                              {scout.id === currentUser.id && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  You
                                </Badge>
                              )}
                            </p>
                            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                              <span>Level {scout.level}</span>
                              <span>•</span>
                              <span>{scout.accuracyRate}% accuracy</span>
                              <span>•</span>
                              <span>{scout.totalVerifications} verifications</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{scout.reputation}</p>
                          <p className="text-xs text-muted-foreground">reputation</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {leaderboardData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{leaderboardData.totalScouts}</p>
                    <p className="text-sm text-muted-foreground">Active Scouts</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{leaderboardData.totalVerifications}</p>
                    <p className="text-sm text-muted-foreground">Total Verifications</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round((leaderboardData.totalVerifications / leaderboardData.totalScouts) * 10) / 10}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg per Scout</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-foreground">Badge Collection</h3>
                <p className="text-sm text-muted-foreground">Earn badges by contributing to the community</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      name: "Expert Taster",
                      description: "Verified 25+ spots with high accuracy",
                      icon: <Star className="h-8 w-8" />,
                      earned: currentUser.badges.includes("Expert Taster"),
                      requirement: "25 verifications, 90%+ accuracy",
                    },
                    {
                      name: "Reliable Scout",
                      description: "Consistent and trustworthy verifications",
                      icon: <Shield className="h-8 w-8" />,
                      earned: currentUser.badges.includes("Reliable Scout"),
                      requirement: "Level 3, 85%+ accuracy",
                    },
                    {
                      name: "Photo Pro",
                      description: "Provides excellent photos with verifications",
                      icon: <Eye className="h-8 w-8" />,
                      earned: currentUser.badges.includes("Photo Pro"),
                      requirement: "10 verifications with photos",
                    },
                    {
                      name: "Community Leader",
                      description: "Helps guide and mentor other scouts",
                      icon: <Users className="h-8 w-8" />,
                      earned: currentUser.badges.includes("Community Leader"),
                      requirement: "Level 4, mentor 5 new scouts",
                    },
                    {
                      name: "Rising Star",
                      description: "New scout showing great potential",
                      icon: <TrendingUp className="h-8 w-8" />,
                      earned: currentUser.badges.includes("Rising Star"),
                      requirement: "Level 2, first month",
                    },
                    {
                      name: "Master Verifier",
                      description: "The ultimate scout achievement",
                      icon: <Crown className="h-8 w-8" />,
                      earned: false,
                      requirement: "Level 5, 100+ verifications, 95%+ accuracy",
                    },
                  ].map((badge) => (
                    <Card
                      key={badge.name}
                      className={cn(
                        "transition-all duration-200",
                        badge.earned ? "border-primary bg-primary/5" : "border-border opacity-60",
                      )}
                    >
                      <CardContent className="p-6 text-center">
                        <div
                          className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                            badge.earned ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                          )}
                        >
                          {badge.icon}
                        </div>
                        <h4 className="font-semibold text-foreground mb-2">{badge.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                        <Badge variant={badge.earned ? "default" : "secondary"} className="text-xs">
                          {badge.earned ? "Earned" : "Locked"}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">{badge.requirement}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
