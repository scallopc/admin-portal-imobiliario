'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Title from '@/components/common/title';
import SummaryCard from './summary-card';
import { useLeads } from '@/hooks/queries/use-leads';
import { useProperties } from '@/hooks/queries/use-properties';
import { useLinks } from '@/hooks/queries/use-links';
import DashboardTable from './dashboard-table';
import { useRouter } from 'next/navigation';
import { useDashboardMetrics } from '@/hooks/queries/use-dashboard-metrics';

export default function DashboardClient() {
  const { data: metrics, isLoading: isLoadingMetrics } = useDashboardMetrics();
  const router = useRouter();
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: properties = [], isLoading: propertiesLoading } = useProperties();
  const { data: links = [], isLoading: linksLoading } = useLinks();

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <Title title='Dashboard' subtitle='Visão geral do funil e atividades recentes' />

      {/* Metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total de Leads" 
          subtitle={leadsLoading ? "..." : leads.length} 
        />
        <SummaryCard 
          title="Imóveis Cadastrados" 
          subtitle={propertiesLoading ? "..." : properties.length} 
        />
        <SummaryCard 
          title="Links Gerados" 
          subtitle={linksLoading ? "..." : links.length} 
        />
        <SummaryCard 
          title="Taxa de Conversão" 
          subtitle="3.2%" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <section className="lg:col-span-7 rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-sm font-medium">Leads recentes</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push('/leads')}>Ver todos</Button>
          </div>
          <DashboardTable />
        </section>

        {/* AI Analytics summary */}
        <div className="lg:col-span-3 rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">🤖</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Analytics da IA</h3>
              <p className="text-sm text-muted-foreground">Métricas de uso e performance</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-6">
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">Tokens Utilizados</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                    {isLoadingMetrics ? (
                      <div className="h-8 w-20 bg-blue-200 dark:bg-blue-800 rounded animate-pulse"></div>
                    ) : (
                      metrics?.aiTokens ? metrics.aiTokens.toLocaleString('pt-BR') : "0"
                    )}
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Processamento de IA</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl">⚡</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 rounded-xl p-4 border border-green-200/50 dark:border-green-800/30 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">Interações no Chat</p>
                  </div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">
                    {isLoadingMetrics ? (
                      <div className="h-8 w-16 bg-green-200 dark:bg-green-800 rounded animate-pulse"></div>
                    ) : (
                      metrics?.chatInteractions || "0"
                    )}
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400">Conversas ativas</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl">💬</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-accent to-accent/70 rounded flex items-center justify-center">
                  🔍
                </div>
                Maiores Buscas
              </h4>
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                Top 5
              </div>
            </div>
            
            <div className="space-y-2 flex-1">
              {isLoadingMetrics ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-2 animate-pulse">
                      <div className="w-6 h-6 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                      </div>
                      <div className="w-6 h-4 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : metrics?.topSearches && metrics.topSearches.length > 0 ? (
                metrics.topSearches.slice(0, 5).map((search, index) => {
                  const maxCount = Math.max(...metrics.topSearches.map(s => s.count));
                  const percentage = (search.count / maxCount) * 100;
                  
                  return (
                    <div key={search.term} className="group hover:bg-muted/50 rounded-lg p-2 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                            index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                            'bg-gradient-to-br from-accent/80 to-accent'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate group-hover:text-accent transition-colors">
                              {search.term}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex-1 bg-muted rounded-full h-1 overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-accent to-accent/70 rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <span className="text-xs font-semibold text-foreground">
                            {search.count}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl">🔍</span>
                  </div>
                  <p className="text-muted-foreground text-xs">Nenhuma busca encontrada</p>
                </div>
              )}
            </div>
            
            {metrics?.topSearches && metrics.topSearches.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total analisado</span>
                  <span className="font-medium">
                    {metrics.topSearches.reduce((sum, search) => sum + search.count, 0).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
