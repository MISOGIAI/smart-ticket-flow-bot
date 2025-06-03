import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import SelfServeAnswerBot from '@/components/SelfServeAnswerBot';
import Navbar from '@/components/ui/navbar';

const SelfServeHelpPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Self-Serve Help Center</h1>
            <p className="text-muted-foreground">
              Get instant answers to your questions from our knowledge base
            </p>
          </div>
          
          <SelfServeAnswerBot />
          
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="mx-auto rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <h3 className="font-medium">24/7 Availability</h3>
                  <p className="text-sm text-gray-600">Get answers anytime, even outside business hours</p>
                </div>
                
                <div className="space-y-2">
                  <div className="mx-auto rounded-full bg-green-100 p-3 w-12 h-12 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <h3 className="font-medium">Instant Results</h3>
                  <p className="text-sm text-gray-600">No waiting for agent responses</p>
                </div>
                
                <div className="space-y-2">
                  <div className="mx-auto rounded-full bg-purple-100 p-3 w-12 h-12 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5" />
                    </svg>
                  </div>
                  <h3 className="font-medium">AI-Powered</h3>
                  <p className="text-sm text-gray-600">Intelligent answers from our knowledge base</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SelfServeHelpPage; 