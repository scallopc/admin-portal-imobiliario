"use client";

import React from "react";
import Title from "@/components/common/title";
import SummaryCard from "./summary-card";
import { useLeads } from "@/hooks/queries/use-leads";
import { useProperties } from "@/hooks/queries/use-properties";
import { useLinks } from "@/hooks/queries/use-links";
import NewLeadsSummary from "./new-leads-summary";
import FollowUpSummary from "../../follow-up/components/follow-up-summary";
import { useRouter } from "next/navigation";
import { useDashboardMetrics } from "@/hooks/queries/use-dashboard-metrics";

export default function Dashboard() {
  const { data: metrics, isLoading: isLoadingMetrics } = useDashboardMetrics();
  const router = useRouter();
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: properties = [], isLoading: propertiesLoading } = useProperties();
  const { data: links = [], isLoading: linksLoading } = useLinks();

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <Title title="Dashboard" subtitle="Visão geral do funil e atividades recentes" />

      {/* Metrics cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Total de Leads" subtitle={leadsLoading ? "..." : leads.length} />
        <SummaryCard title="Imóveis Cadastrados" subtitle={propertiesLoading ? "..." : properties.length} />
        <SummaryCard title="Links Gerados" subtitle={linksLoading ? "..." : links.length} />
        <SummaryCard title="Taxa de Conversão" subtitle="3.2%" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          <section className="lg:col-span-8 space-y-6 bg-card text-card-foreground rounded-lg border p-6 shadow-sm">

          <FollowUpSummary />
          </section>
        {/* AI Analytics summary */}
        <div className="bg-card text-card-foreground flex flex-col rounded-lg border p-6 shadow-sm lg:col-span-4">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <span className="text-sm font-bold text-white">🤖</span>
            </div>
            <div>
              <h3 className="text-foreground text-lg font-semibold">Analytics da IA</h3>
              <p className="text-muted-foreground text-sm">Métricas de uso e performance</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 xl:grid-cols-2">
            <div className="group relative overflow-hidden rounded-xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 transition-all duration-300 hover:shadow-lg dark:border-blue-800/30 dark:from-blue-950/30 dark:to-blue-900/20">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
                    <p className="text-xs font-medium tracking-wide text-blue-700 uppercase dark:text-blue-300">
                      Tokens Utilizados
                    </p>
                  </div>
                  <div className="mb-1 text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {isLoadingMetrics ? (
                      <div className="h-8 w-20 animate-pulse rounded bg-blue-200 dark:bg-blue-800"></div>
                    ) : metrics?.aiTokens ? (
                      metrics.aiTokens.toLocaleString("pt-BR")
                    ) : (
                      "0"
                    )}
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Processamento de IA</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <span className="text-xl text-white">⚡</span>
                </div>
              </div>
              <div className="absolute inset-0 translate-x-[-100%] -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"></div>
            </div>

            <div className="group relative overflow-hidden rounded-xl border border-green-200/50 bg-gradient-to-br from-green-50 to-green-100/50 p-4 transition-all duration-300 hover:shadow-lg dark:border-green-800/30 dark:from-green-950/30 dark:to-green-900/20">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                    <p className="text-xs font-medium tracking-wide text-green-700 uppercase dark:text-green-300">
                      Interações no Chat
                    </p>
                  </div>
                  <div className="mb-1 text-2xl font-bold text-green-900 dark:text-green-100">
                    {isLoadingMetrics ? (
                      <div className="h-8 w-16 animate-pulse rounded bg-green-200 dark:bg-green-800"></div>
                    ) : (
                      metrics?.chatInteractions || "0"
                    )}
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400">Conversas ativas</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <span className="text-xl text-white">💬</span>
                </div>
              </div>
              <div className="absolute inset-0 translate-x-[-100%] -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"></div>
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-foreground flex items-center gap-2 font-semibold">
                <div className="from-accent to-accent/70 flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br">
                  🔍
                </div>
                Maiores Buscas
              </h4>
              <div className="text-muted-foreground bg-muted rounded-full px-2 py-1 text-xs">Top 5</div>
            </div>

            <div className="flex-1 space-y-2">
              {isLoadingMetrics ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex animate-pulse items-center space-x-2">
                      <div className="bg-muted h-6 w-6 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <div className="bg-muted h-3 w-3/4 rounded"></div>
                      </div>
                      <div className="bg-muted h-4 w-6 rounded"></div>
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
                        <div className="flex min-w-0 flex-1 items-center space-x-2">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                              index === 0
                                ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                                : index === 1
                                  ? "bg-gradient-to-br from-gray-300 to-gray-500"
                                  : index === 2
                                    ? "bg-gradient-to-br from-amber-600 to-amber-800"
                                    : "from-accent/80 to-accent bg-gradient-to-br"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-foreground group-hover:text-accent truncate text-xs font-medium transition-colors">
                              {search.term}
                            </p>
                            <div className="mt-1 flex items-center space-x-2">
                              <div className="bg-muted h-1 flex-1 overflow-hidden rounded-full">
                                <div
                                  className="from-accent to-accent/70 h-full rounded-full bg-gradient-to-r transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="ml-2 flex items-center space-x-1">
                          <span className="text-foreground text-xs font-semibold">{search.count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center">
                  <div className="bg-muted mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                    <span className="text-xl">🔍</span>
                  </div>
                  <p className="text-muted-foreground text-xs">Nenhuma busca encontrada</p>
                </div>
              )}
            </div>

            {metrics?.topSearches && metrics.topSearches.length > 0 && (
              <div className="border-border mt-4 border-t pt-3">
                <div className="text-muted-foreground flex items-center justify-between text-xs">
                  <span>Total analisado</span>
                  <span className="font-medium">
                    {metrics.topSearches.reduce((sum, search) => sum + search.count, 0).toLocaleString("pt-BR")}
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
