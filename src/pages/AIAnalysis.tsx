import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import api from '../lib/api';

interface Analysis {
  analysis_id: number;
  user_id: number;
  analysis_type: string;
  result: string;
  created_at: string;
}

const AIAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<string>('general');

  // Fetch existing analyses on component mount
  useEffect(() => {
    fetchAnalyses();
  }, []);

  // Fetch analyses from API
  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.aiAnalysis.getAnalyses();
      
      // Filter out analyses with API key errors
      const validAnalyses = data.filter(analysis => 
        !analysis.result.includes("API key not configured") &&
        !analysis.result.includes("Error generating insights")
      );
      
      setAnalyses(validAnalyses);
      
      // If we have analyses with errors, show a message
      if (data.length > 0 && validAnalyses.length === 0) {
        setError('Failed to load analyses. The AI service may be unavailable.');
      }
    } catch (err: any) {
      console.error('Error fetching analyses:', err);
      if (err.message && err.message.includes("API key")) {
        setError('AI service unavailable: API key configuration issue. Please contact support.');
      } else {
        setError('Failed to load analyses. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate new analysis
  const generateAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const newAnalysis = await api.aiAnalysis.generateAnalysis(analysisType);
      
      // Check if the result contains an error message about API key
      if (newAnalysis.result && (
          newAnalysis.result.includes("API key not configured") ||
          newAnalysis.result.includes("Error generating insights")
        )) {
        setError("AI analysis unavailable: The API key may be invalid or missing. Please contact support.");
        return;
      }
      
      setAnalyses(prev => [newAnalysis, ...prev]);
    } catch (err: any) {
      console.error('Error generating analysis:', err);
      if (err.message && err.message.includes("API key")) {
        setError('AI service unavailable: API key configuration issue. Please contact support.');
      } else {
        setError('Failed to generate analysis. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get analysis type display name
  const getAnalysisTypeDisplay = (type: string) => {
    switch (type) {
      case 'general': return 'General Financial Analysis';
      case 'budget': return 'Budget Analysis';
      case 'savings': return 'Savings Goals Analysis';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">AI Financial Insights</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4">
        <div className="max-w-3xl mx-auto">
          {/* Analysis type selector and generate button */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Analysis Type
              </label>
              <Select
                value={analysisType}
                onValueChange={setAnalysisType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select analysis type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Financial Analysis</SelectItem>
                  <SelectItem value="budget">Budget Analysis</SelectItem>
                  <SelectItem value="savings">Savings Goals Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={generateAnalysis}
                disabled={loading}
                className="w-full md:w-auto"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate New Insights'
                )}
              </Button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Analysis cards */}
          <div className="space-y-6">
            {analyses.length === 0 && !loading ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">No analyses yet. Generate your first financial insight!</p>
              </div>
            ) : (
              analyses.map((analysis) => (
                <Card key={analysis.analysis_id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">
                      {getAnalysisTypeDisplay(analysis.analysis_type)}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {formatDate(analysis.created_at)}
                    </span>
                  </div>
                  <div className="prose max-w-none">
                    {analysis.result.split('\n').map((line, i) => (
                      <p key={i} className="my-2">{line}</p>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIAnalysis;