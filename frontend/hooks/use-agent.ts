import { useState, useCallback } from 'react';

interface FieldCollectionRequest {
  session_id: string;
  field_name: string;
  field_value: string;
  context?: Record<string, any>;
}

interface CoordinateSuggestionRequest {
  address: string;
  city?: string;
  state?: string;
}

interface DuplicateCheckRequest {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

interface PhotoNudgeRequest {
  session_id: string;
  restaurant_data: {
    name: string;
    category: string;
    address: string;
    area: string;
    city: string;
    state: string;
    country: string;
  };
  nudge_type: 'photo' | 'receipt' | 'menu';
}

interface AgentResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  suggestions?: string[];
  warnings?: string[];
}

export function useAgent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const collectField = useCallback(async (request: FieldCollectionRequest): Promise<AgentResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/agent/collect-field', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to collect field');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const suggestCoordinates = useCallback(async (request: CoordinateSuggestionRequest): Promise<AgentResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/agent/suggest-coordinates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to suggest coordinates');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkDuplicates = useCallback(async (request: DuplicateCheckRequest): Promise<AgentResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/agent/check-duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to check duplicates');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generatePhotoNudge = useCallback(async (request: PhotoNudgeRequest): Promise<AgentResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/agent/photo-nudge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate photo nudge');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSessionData = useCallback(async (sessionId: string): Promise<AgentResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/agent/session?sessionId=${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get session data');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    collectField,
    suggestCoordinates,
    checkDuplicates,
    generatePhotoNudge,
    getSessionData,
    isLoading,
    error,
  };
}
