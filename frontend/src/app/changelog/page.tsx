'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, FileText, Settings, BarChart3, Users, BookOpen, Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import ProtectedRoute from '@/components/ProtectedRoute';
import { changelogData, changeTypes, availablePages, ChangelogEntry } from '@/data/changelog';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'feature':
      return <FileText className="h-4 w-4" />;
    case 'improvement':
      return <Settings className="h-4 w-4" />;
    case 'fix':
      return <BarChart3 className="h-4 w-4" />;
    case 'ui':
      return <Users className="h-4 w-4" />;
    case 'backend':
      return <BookOpen className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  const typeConfig = changeTypes.find(t => t.value === type);
  return typeConfig?.color || 'bg-gray-100 text-gray-800 border-gray-200';
};

function ChangelogContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'version'>('date');
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = changelogData.filter(entry => {
      const matchesSearch = searchTerm === '' || 
        entry.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.changes.some(change => 
          change.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          change.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesType = selectedType === 'all' || 
        entry.changes.some(change => change.type === selectedType);
      
      const matchesPage = selectedPage === 'all' || 
        entry.changes.some(change => 
          change.pages && change.pages.includes(selectedPage)
        );
      
      return matchesSearch && matchesType && matchesPage;
    });

    // Sort data
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        // Version sorting (assuming semantic versioning)
        const aVersion = a.version.replace('v', '').split('.').map(Number);
        const bVersion = b.version.replace('v', '').split('.').map(Number);
        for (let i = 0; i < Math.max(aVersion.length, bVersion.length); i++) {
          const aNum = aVersion[i] || 0;
          const bNum = bVersion[i] || 0;
          if (bNum !== aNum) return bNum - aNum;
        }
        return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedType, selectedPage, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEntries(newExpanded);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedPage('all');
    setSortBy('date');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Project Changelog
          </h1>
          <p className="text-muted-foreground text-lg">
            Track all updates, improvements, and new features for Blimp Smart Table
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Search & Filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search versions, features, or descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {changeTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pages</SelectItem>
                  {availablePages.map(page => (
                    <SelectItem key={page} value={page}>
                      {page}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex space-x-2">
                <Select value={sortBy} onValueChange={(value: 'date' | 'version') => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date (Newest)</SelectItem>
                    <SelectItem value="version">Version (Latest)</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={clearFilters} className="whitespace-nowrap">
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {paginatedData.length} of {filteredData.length} entries
          {(searchTerm || selectedType !== 'all' || selectedPage !== 'all') && (
            <Button 
              variant="link" 
              onClick={clearFilters}
              className="ml-2 p-0 h-auto text-primary"
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Changelog Entries */}
        <div className="space-y-6">
          {paginatedData.map((entry, index) => (
            <Card key={`${entry.version}-${index}`} className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{entry.date}</span>
                    </div>
                    <Badge variant="outline" className="font-medium">
                      {entry.version}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {entry.changes.length} changes
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span className="text-sm">{entry.author}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(index)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {expandedEntries.has(index) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-xl mt-2">
                  Release {entry.version}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {entry.changes.map((change, changeIndex) => (
                    <div key={changeIndex} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                      <div className={`p-2 rounded-lg border ${getTypeColor(change.type)}`}>
                        {getTypeIcon(change.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getTypeColor(change.type)}`}
                          >
                            {change.type.toUpperCase()}
                          </Badge>
                          <h4 className="font-semibold text-foreground">
                            {change.title}
                          </h4>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">
                          {change.description}
                        </p>
                        {change.pages && change.pages.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {change.pages.map((page, pageIndex) => (
                              <Badge 
                                key={pageIndex} 
                                variant="secondary" 
                                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                              >
                                {page}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* No Results */}
        {filteredData.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground text-lg mb-4">No changelog entries found</p>
              <Button variant="outline" onClick={clearFilters}>
                Clear filters to see all entries
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            For questions about updates or to report issues, contact{' '}
            <a 
              href="mailto:oleg@kuftyrev.us" 
              className="text-primary hover:underline"
            >
              oleg@kuftyrev.us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Changelog() {
  return (
    <ProtectedRoute>
      <ChangelogContent />
    </ProtectedRoute>
  );
}
