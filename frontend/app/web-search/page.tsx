"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, ExternalLink, Star, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  relevanceScore: number;
  source: string;
  type: "restaurant" | "review" | "directory" | "social";
}

export default function WebSearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<WebSearchResult[]>([]);
  const [searchTime, setSearchTime] = useState("");
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = async () => {
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    console.log(" Starting web search for:", searchQuery);

    try {
      const response = await fetch("/api/web-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          location: "Brooklyn, NY",
          type: "restaurants",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(" Web search completed:", data);

        setResults(data.results || []);
        setSearchTime(data.searchTime || "");
        setTotalResults(data.totalResults || 0);
      } else {
        throw new Error("Web search failed");
      }
    } catch (error) {
      console.error(" Web search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "restaurant":
        return <Star className="h-3 w-3" />;
      case "review":
        return <Star className="h-3 w-3" />;
      case "directory":
        return <Globe className="h-3 w-3" />;
      case "social":
        return <Globe className="h-3 w-3" />;
      default:
        return <Globe className="h-3 w-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "restaurant":
        return "bg-green-100 text-green-800";
      case "review":
        return "bg-blue-100 text-blue-800";
      case "directory":
        return "bg-purple-100 text-purple-800";
      case "social":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-foreground hover:bg-accent"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
                  <Search className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-heading font-bold text-foreground">
                    Web Search
                  </h1>
                  <p className="text-caption hidden sm:block">
                    Search the web for Amala restaurants and reviews
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-subheading font-bold">Search the Web</h2>
              <p className="text-body text-muted-foreground">
                Find Nigerian restaurants, reviews, and Amala spots from across
                the internet
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search for Nigerian restaurants, Amala spots, reviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-11 bg-background border-border focus:ring-primary"
                    disabled={isSearching}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isSearching}
                  className="h-11 px-6 bg-primary hover:bg-primary/90"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  "Nigerian restaurants near me",
                  "Authentic Amala Brooklyn",
                  "Best Yoruba food NYC",
                  "Nigerian cuisine reviews",
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery(suggestion)}
                    className="text-xs bg-transparent"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-subheading font-bold">Search Results</h3>
                  <p className="text-caption text-muted-foreground">
                    About {totalResults} results ({searchTime})
                  </p>
                </div>
                <Link href="/ai-assistant">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                  >
                    Try AI Search
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {results.map((result, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge
                                className={cn(
                                  "text-xs",
                                  getTypeColor(result.type)
                                )}
                              >
                                {getTypeIcon(result.type)}
                                <span className="ml-1 capitalize">
                                  {result.type}
                                </span>
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {result.relevanceScore}% match
                              </Badge>
                            </div>
                            <h4 className="text-subheading font-semibold text-primary hover:underline cursor-pointer">
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {result.title}
                              </a>
                            </h4>
                            <p className="text-caption text-muted-foreground mb-2">
                              {result.url}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => window.open(result.url, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-body text-muted-foreground">
                          {result.snippet}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-caption text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            <span>{result.source}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(result.url, "_blank")}
                            className="h-7 text-xs bg-transparent"
                          >
                            Visit Site
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {isSearching && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <h3 className="text-subheading font-bold text-foreground mb-2">
                Searching the Web
              </h3>
              <p className="text-body text-muted-foreground">
                Finding the best Nigerian restaurants and Amala spots online...
              </p>
            </div>
          )}

          {!isSearching && results.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-subheading font-bold text-foreground mb-2">
                No Results Found
              </h3>
              <p className="text-body text-muted-foreground mb-6">
                Try different keywords or check your spelling. You can also try
                our AI-powered search for better results.
              </p>
              <Link href="/ai-assistant">
                <Button className="bg-primary hover:bg-primary/90">
                  <Search className="h-4 w-4 mr-2" />
                  Try AI Search
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
