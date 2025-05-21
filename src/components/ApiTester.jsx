import React, { useState } from 'react';
import { runStandardTests, testApiEndpoint } from '../utils/apiTester';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

/**
 * Component to test API endpoints and verify they return JSON
 */
const ApiTester = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState('/api/health');

  // Run standard tests on common endpoints
  const handleRunStandardTests = async () => {
    setLoading(true);
    try {
      const testResults = await runStandardTests();
      setResults(testResults);
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test a custom endpoint
  const handleTestCustomEndpoint = async () => {
    setLoading(true);
    try {
      const result = await testApiEndpoint(customEndpoint);
      setResults([{ endpoint: customEndpoint, ...result }]);
    } catch (error) {
      console.error('Error testing endpoint:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Tester</CardTitle>
          <CardDescription>
            Test API endpoints to verify they return JSON responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div>
              <Button 
                onClick={handleRunStandardTests} 
                disabled={loading}
                className="mr-2"
              >
                {loading ? 'Running Tests...' : 'Run Standard Tests'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setResults([])}
                disabled={loading || results.length === 0}
              >
                Clear Results
              </Button>
            </div>
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Label htmlFor="custom-endpoint">Custom Endpoint</Label>
                <Input
                  id="custom-endpoint"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  placeholder="/api/endpoint"
                />
              </div>
              <Button 
                onClick={handleTestCustomEndpoint} 
                disabled={loading || !customEndpoint}
              >
                Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">{result.endpoint}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-semibold">Status:</div>
                    <div>{result.status}</div>
                    
                    <div className="font-semibold">Success:</div>
                    <div>{result.success ? 'Yes' : 'No'}</div>
                    
                    <div className="font-semibold">Content Type:</div>
                    <div>{result.contentType || 'N/A'}</div>
                    
                    <div className="font-semibold">Is JSON:</div>
                    <div>{result.isJson ? 'Yes' : 'No'}</div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Response Data:</h4>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                      {result.data ? JSON.stringify(result.data, null, 2) : 'No data'}
                    </pre>
                  </div>
                  
                  {result.error && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2 text-red-500">Error:</h4>
                      <pre className="bg-red-50 p-2 rounded text-xs overflow-auto max-h-40">
                        {result.error}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-gray-500">
              Total endpoints tested: {results.length}
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default ApiTester;
