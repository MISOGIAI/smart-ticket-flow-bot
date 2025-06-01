
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, Star, Eye, ThumbsUp } from 'lucide-react';

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Articles', count: 45 },
    { id: 'it-support', name: 'IT Support', count: 18 },
    { id: 'hr-policies', name: 'HR Policies', count: 12 },
    { id: 'admin', name: 'Admin', count: 8 },
    { id: 'facilities', name: 'Facilities', count: 7 }
  ];

  const articles = [
    {
      id: 1,
      title: 'How to Reset Your Password',
      description: 'Step-by-step guide to reset your password for various systems',
      category: 'it-support',
      views: 1250,
      likes: 89,
      helpful: true,
      lastUpdated: '2024-01-10',
      content: `
        ## Password Reset Process
        
        ### For Email Accounts:
        1. Go to the login page
        2. Click "Forgot Password"
        3. Enter your email address
        4. Check your email for reset link
        5. Follow the instructions in the email
        
        ### For System Accounts:
        1. Contact IT Support
        2. Provide your employee ID
        3. Wait for confirmation email
        
        ### Security Tips:
        - Use a strong password with mixed characters
        - Don't reuse old passwords
        - Enable two-factor authentication when available
      `
    },
    {
      id: 2,
      title: 'Software Installation Requests',
      description: 'How to request new software installation for your department',
      category: 'it-support',
      views: 890,
      likes: 67,
      helpful: true,
      lastUpdated: '2024-01-08',
      content: `
        ## Software Installation Process
        
        ### Before You Request:
        - Check if the software is already available
        - Verify it's approved for business use
        - Confirm you have a valid license
        
        ### Request Process:
        1. Submit a ticket with category "IT Support"
        2. Include software name and version
        3. Specify business justification
        4. Wait for approval (usually 2-3 business days)
        
        ### Installation Timeline:
        - Standard software: 1-2 days
        - Specialized software: 3-5 days
        - Custom software: 1-2 weeks
      `
    },
    {
      id: 3,
      title: 'Leave Application Process',
      description: 'Complete guide to applying for different types of leave',
      category: 'hr-policies',
      views: 2100,
      likes: 156,
      helpful: true,
      lastUpdated: '2024-01-12',
      content: `
        ## Leave Application Guide
        
        ### Types of Leave:
        - Annual Leave: Up to 25 days per year
        - Sick Leave: Up to 10 days per year
        - Maternity/Paternity: As per policy
        - Emergency Leave: Case by case basis
        
        ### Application Process:
        1. Submit request at least 2 weeks in advance
        2. Get manager approval
        3. HR will confirm via email
        4. Add to your calendar
        
        ### Required Documentation:
        - Medical certificates for sick leave > 3 days
        - Official documents for emergency leave
      `
    },
    {
      id: 4,
      title: 'Expense Reimbursement Policy',
      description: 'How to submit and get approval for business expenses',
      category: 'admin',
      views: 756,
      likes: 43,
      helpful: true,
      lastUpdated: '2024-01-05',
      content: `
        ## Expense Reimbursement
        
        ### Eligible Expenses:
        - Business travel
        - Client entertainment
        - Office supplies
        - Training and conferences
        
        ### Submission Process:
        1. Keep all receipts
        2. Submit within 30 days
        3. Fill out expense form
        4. Get manager approval
        5. Finance will process within 5 business days
        
        ### Required Information:
        - Original receipts
        - Business purpose
        - Date and location
        - Names of attendees (for meals)
      `
    },
    {
      id: 5,
      title: 'Conference Room Booking',
      description: 'How to book and manage conference rooms',
      category: 'facilities',
      views: 445,
      likes: 28,
      helpful: true,
      lastUpdated: '2024-01-03',
      content: `
        ## Conference Room Booking
        
        ### Available Rooms:
        - Conference Room A (8 people)
        - Conference Room B (12 people)
        - Conference Room C (20 people)
        - Boardroom (6 people)
        
        ### Booking Process:
        1. Check calendar availability
        2. Book through the portal
        3. Confirm equipment needs
        4. Cancel if plans change
        
        ### Equipment Available:
        - Projectors and screens
        - Video conferencing
        - Whiteboards
        - Audio systems
      `
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const topArticles = articles.sort((a, b) => b.views - a.views).slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Knowledge Base</h2>
        <p className="text-gray-600">Find answers to common questions and issues</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg h-12"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-sm">
              {category.name} ({category.count})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6">
          {/* Popular Articles */}
          {selectedCategory === 'all' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Most Popular</span>
                </CardTitle>
                <CardDescription>Most viewed articles this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topArticles.map((article) => (
                    <div key={article.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <h3 className="font-medium text-sm mb-2">{article.title}</h3>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{article.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{article.likes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Articles List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{article.title}</CardTitle>
                      <CardDescription>{article.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {categories.find(cat => cat.id === article.category)?.name}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{article.views} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{article.likes} helpful</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        Updated {new Date(article.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <Button variant="outline" size="sm" className="w-full">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Read Article
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or browse different categories
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KnowledgeBase;
