"use client";

import { useState, useEffect } from "react";
import { FollowUpSmsIntegration } from "./follow-up-sms-integration";
import { FollowUpSkeleton } from "./follow-up-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface FollowUpLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  nextContact: string;
  createdAt: string;
  updatedAt: string;
}

export function FollowUpSmsWrapper() {
  const [leads, setLeads] = useState<FollowUpLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/follow-up");
      const result = await response.json();

      if (result.success && result.data && result.data.leads) {
        setLeads(result.data.leads);
      } else {
        setError(result.error || "Erro ao carregar leads");
      }
    } catch (err) {
      console.error("Erro ao buscar leads:", err);
      setError("Erro de conexão ao carregar leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  if (loading) {
    return <FollowUpSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar leads</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button 
                onClick={fetchLeads}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <FollowUpSmsIntegration 
      leads={leads} 
      onLeadUpdate={fetchLeads}
    />
  );
}
