"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Clock, ThumbsUp, ThumbsDown, Flag, MapPin, Users, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

interface PendingSpot {
  id: string
  name: string
  address: string
  description: string
  submittedBy: string
  submittedDate: string
  images: string[]
  cuisine: string[]
  priceRange: string
  phone?: string
  website?: string
  aiVerificationScore: number
  aiVerificationReasons: string[]
  communityVotes: {
    approve: number
    reject: number
    voters: { userId: string; vote: "approve" | "reject"; reason?: string; date: string }[]
  }
  status: "pending" | "approved" | "rejected"
  flagged: boolean
  flagReasons: string[]
}

interface VerificationStats {
  totalPending: number
  totalApproved: number
  totalRejected: number
  myVotes: number
  communityScore: number
}

export default function VerificationPage() {
  const [activeTab, setActiveTab] = useState("pending")
  const [pendingSpots, setPendingSpots] = useState<PendingSpot[]>([])
  const [stats, setStats] = useState<VerificationStats>({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    myVotes: 0,
    communityScore: 85,
  })
  const [selectedSpot, setSelectedSpot] = useState<PendingSpot | null>(null)
  const [voteReason, setVoteReason] = useState("")

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockSpots: PendingSpot[] = [
      {
        id: "pending-1",
        name: "Iya Agba Kitchen",
        address: "789 Fulton Street, Brooklyn, NY 11238",
        description:
          "Home-style cooking with generous portions. Known for their perfectly smooth amala texture and authentic Yoruba flavors.",
        submittedBy: "@foodie_bk",
        submittedDate: "2024-03-10",
        images: ["/homestyle-nigerian-kitchen-amala-preparation.jpg"],
        cuisine: ["Nigerian", "Home-style", "Comfort Food"],
        priceRange: "$",
        phone: "+1 (718) 555-0456",
        aiVerificationScore: 78,
        aiVerificationReasons: [
          "Images show authentic Nigerian food preparation",
          "Description mentions specific Yoruba dishes",
          "Address appears to be a legitimate restaurant location",
          "Phone number format is valid",
        ],
        communityVotes: {
          approve: 12,
          reject: 2,
          voters: [
            {
              userId: "user1",
              vote: "approve",
              reason: "I've been here, food is authentic and delicious",
              date: "2024-03-12",
            },
            {
              userId: "user2",
              vote: "approve",
              reason: "Great spot, family-owned and traditional recipes",
              date: "2024-03-11",
            },
          ],
        },
        status: "pending",
        flagged: false,
        flagReasons: [],
      },
      {
        id: "pending-2",
        name: "Quick Amala Express",
        address: "456 Fast Food Lane, Queens, NY 11101",
        description: "Fast and convenient amala for busy people. Quick service and affordable prices.",
        submittedBy: "@quickeats",
        submittedDate: "2024-03-08",
        images: ["/modern-nigerian-restaurant-amala-dish.jpg"],
        cuisine: ["Nigerian", "Fast Food"],
        priceRange: "$",
        aiVerificationScore: 45,
        aiVerificationReasons: [
          "Description lacks detail about authentic preparation",
          "Images appear to be stock photos",
          "Address may not correspond to actual restaurant",
          "Limited information about traditional aspects",
        ],
        communityVotes: {
          approve: 3,
          reject: 8,
          voters: [
            {
              userId: "user3",
              vote: "reject",
              reason: "This doesn't look like authentic amala, seems like fast food chain",
              date: "2024-03-09",
            },
          ],
        },
        status: "pending",
        flagged: true,
        flagReasons: ["Potentially inauthentic", "Suspicious images"],
      },
    ]

    setPendingSpots(mockSpots)
    setStats({
      totalPending: mockSpots.filter((s) => s.status === "pending").length,
      totalApproved: 45,
      totalRejected: 8,
      myVotes: 23,
      communityScore: 85,
    })
  }, [])

  const handleVote = (spotId: string, vote: "approve" | "reject") => {
    setPendingSpots((prev) =>
      prev.map((spot) => {
        if (spot.id === spotId) {
          const newVoters = [
            ...spot.communityVotes.voters,
            {
              userId: "current-user",
              vote,
              reason: voteReason,
              date: new Date().toISOString().split("T")[0],
            },
          ]

          return {
            ...spot,
            communityVotes: {
              ...spot.communityVotes,
              [vote]: spot.communityVotes[vote] + 1,
              voters: newVoters,
            },
          }
        }
        return spot
      }),
    )

    setVoteReason("")
    setSelectedSpot(null)
  }

  const handleFlag = (spotId: string, reason: string) => {
    setPendingSpots((prev) =>
      prev.map((spot) => {
        if (spot.id === spotId) {
          return {
            ...spot,
            flagged: true,
            flagReasons: [...spot.flagReasons, reason],
          }
        }
        return spot
      }),
    )
  }

  const getVerificationColor = (score: number) => {
    if (score >= 70) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getVerificationBadge = (score: number) => {
    if (score >= 70) return { text: "AI Approved", variant: "default" as const }
    if (score >= 50) return { text: "AI Uncertain", variant: "secondary" as const }
    return { text: "AI Flagged", variant: "destructive" as const }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading font-bold text-foreground">Community Verification</h1>
              <p className="text-body text-muted-foreground mt-1">
                Help maintain quality by verifying authentic Amala spots
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.communityScore}</div>
                <div className="text-caption text-muted-foreground">Your Score</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.totalPending}</div>
                  <div className="text-caption text-muted-foreground">Pending Review</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.totalApproved}</div>
                  <div className="text-caption text-muted-foreground">Approved</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.totalRejected}</div>
                  <div className="text-caption text-muted-foreground">Rejected</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.myVotes}</div>
                  <div className="text-caption text-muted-foreground">Your Votes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending ({stats.totalPending})</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            {pendingSpots
              .filter((spot) => spot.status === "pending")
              .map((spot) => (
                <Card key={spot.id} className={cn("overflow-hidden", spot.flagged && "border-red-200")}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                    {/* Spot information */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-subheading font-bold text-foreground">{spot.name}</h3>
                            {spot.flagged && (
                              <Badge variant="destructive" className="text-xs">
                                <Flag className="h-3 w-3 mr-1" />
                                Flagged
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-caption text-muted-foreground mb-3">
                            <MapPin className="h-4 w-4" />
                            <span>{spot.address}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-body text-muted-foreground">{spot.description}</p>

                      <div className="flex flex-wrap gap-2">
                        {spot.cuisine.map((cuisine) => (
                          <Badge key={cuisine} variant="secondary">
                            {cuisine}
                          </Badge>
                        ))}
                        <Badge variant="outline">{spot.priceRange}</Badge>
                      </div>

                      {/* Images */}
                      {spot.images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto">
                          {spot.images.map((image, index) => (
                            <img
                              key={index}
                              src={image || "/placeholder.svg"}
                              alt={`${spot.name} ${index + 1}`}
                              className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                            />
                          ))}
                        </div>
                      )}

                      {/* Submission info */}
                      <div className="flex items-center space-x-4 text-caption text-muted-foreground">
                        <span>Submitted by {spot.submittedBy}</span>
                        <span>•</span>
                        <span>{new Date(spot.submittedDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Verification panel */}
                    <div className="space-y-4">
                      {/* AI Verification */}
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-2">
                            <Bot className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-card-foreground">AI Analysis</span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-body">Confidence Score</span>
                            <div className="flex items-center space-x-2">
                              <span className={cn("font-bold", getVerificationColor(spot.aiVerificationScore))}>
                                {spot.aiVerificationScore}%
                              </span>
                              <Badge {...getVerificationBadge(spot.aiVerificationScore)} className="text-xs" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <span className="text-caption font-medium">Key Findings:</span>
                            <ul className="space-y-1">
                              {spot.aiVerificationReasons.map((reason, index) => (
                                <li
                                  key={index}
                                  className="text-caption text-muted-foreground flex items-start space-x-2"
                                >
                                  <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Community Votes */}
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-card-foreground">Community Votes</span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <ThumbsUp className="h-4 w-4 text-green-600" />
                                <span className="font-medium">{spot.communityVotes.approve}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <ThumbsDown className="h-4 w-4 text-red-600" />
                                <span className="font-medium">{spot.communityVotes.reject}</span>
                              </div>
                            </div>
                          </div>

                          {/* Recent votes */}
                          {spot.communityVotes.voters.slice(0, 2).map((voter, index) => (
                            <div key={index} className="text-caption">
                              <div className="flex items-center space-x-2 mb-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {voter.userId.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{voter.userId}</span>
                                <Badge
                                  variant={voter.vote === "approve" ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {voter.vote}
                                </Badge>
                              </div>
                              {voter.reason && <p className="text-muted-foreground ml-8">{voter.reason}</p>}
                            </div>
                          ))}

                          <Separator />

                          {/* Vote buttons */}
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="vote-reason" className="text-caption font-medium">
                                Your verification reason (optional)
                              </Label>
                              <Textarea
                                id="vote-reason"
                                value={voteReason}
                                onChange={(e) => setVoteReason(e.target.value)}
                                placeholder="Why are you approving/rejecting this spot?"
                                rows={2}
                                className="mt-1 text-sm"
                              />
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleVote(spot.id, "approve")}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleVote(spot.id, "reject")}
                                className="flex-1"
                              >
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFlag(spot.id, "Needs review")}
                              className="w-full bg-transparent"
                            >
                              <Flag className="h-4 w-4 mr-1" />
                              Flag for Review
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </Card>
              ))}

            {pendingSpots.filter((spot) => spot.status === "pending").length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-subheading font-bold text-foreground mb-2">All caught up!</h3>
                  <p className="text-body text-muted-foreground">
                    No spots pending verification right now. Check back later for new submissions.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-subheading font-bold text-foreground mb-2">Approved Spots</h3>
                <p className="text-body text-muted-foreground">
                  View all community-approved Amala spots. Great work helping maintain quality!
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardContent className="p-12 text-center">
                <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-subheading font-bold text-foreground mb-2">Rejected Spots</h3>
                <p className="text-body text-muted-foreground">
                  Spots that didn't meet community standards. These help us learn what to avoid.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
