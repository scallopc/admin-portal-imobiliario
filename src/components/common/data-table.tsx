"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

type SortDirection = "asc" | "desc" | null

type Column<T> = {
    key: keyof T | string
    header: string
    className?: string
    cell?: (row: T) => React.ReactNode
    skeletonClassName?: string
    sortable?: boolean
}

type DataTableProps<T> = {
    columns: Column<T>[]
    data: T[]
    emptyMessage?: string
    tableClassName?: string
    headClassName?: string
    rowClassName?: string
    isLoading?: boolean
    skeletonRowCount?: number
    showPagination?: boolean
    pageSizeOptions?: number[]
    defaultPageSize?: number
    enableSorting?: boolean
}

export function DataTable<T extends Record<string, unknown>>({
    columns,
    data,
    emptyMessage = "Nenhum registro encontrado",
    tableClassName,
    headClassName,
    rowClassName,
    isLoading = false,
    skeletonRowCount = 4,
    showPagination = true,
    pageSizeOptions = [10, 20, 50, 100],
    defaultPageSize = 10,
    enableSorting = true,
}: DataTableProps<T>) {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(defaultPageSize)
    const [sortColumn, setSortColumn] = useState<keyof T | string | null>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)

    const sortedData = useMemo(() => {
        if (!enableSorting || !sortColumn || !sortDirection) return data

        return [...data].sort((a, b) => {
            const aValue = a[sortColumn as keyof T]
            const bValue = b[sortColumn as keyof T]

            // Handle null/undefined values
            if (aValue == null && bValue == null) return 0
            if (aValue == null) return sortDirection === "asc" ? -1 : 1
            if (bValue == null) return sortDirection === "asc" ? 1 : -1

            // Handle different data types
            if (typeof aValue === "string" && typeof bValue === "string") {
                const comparison = aValue.localeCompare(bValue, "pt-BR", { numeric: true })
                return sortDirection === "asc" ? comparison : -comparison
            }

            if (typeof aValue === "number" && typeof bValue === "number") {
                return sortDirection === "asc" ? aValue - bValue : bValue - aValue
            }

            if (aValue instanceof Date && bValue instanceof Date) {
                return sortDirection === "asc" ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime()
            }

            // Fallback to string comparison
            const aString = String(aValue)
            const bString = String(bValue)
            const comparison = aString.localeCompare(bString, "pt-BR", { numeric: true })
            return sortDirection === "asc" ? comparison : -comparison
        })
    }, [data, sortColumn, sortDirection, enableSorting])

    const paginatedData = useMemo(() => {
        if (!showPagination) return sortedData
        
        const startIndex = (currentPage - 1) * pageSize
        const endIndex = startIndex + pageSize
        return sortedData.slice(startIndex, endIndex)
    }, [sortedData, currentPage, pageSize, showPagination])

    const totalPages = useMemo(() => {
        if (!showPagination) return 1
        return Math.ceil(sortedData.length / pageSize)
    }, [sortedData.length, pageSize, showPagination])

    const endItem = useMemo(() => {
        if (!showPagination) return sortedData.length
        return Math.min(currentPage * pageSize, sortedData.length)
    }, [sortedData.length, currentPage, pageSize, showPagination])

    const handlePageChange = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    const handlePageSizeChange = (newPageSize: string) => {
        const size = parseInt(newPageSize)
        setPageSize(size)
        setCurrentPage(1) // Reset to first page when changing page size
    }

    const handleSort = (columnKey: keyof T | string) => {
        if (!enableSorting) return

        const column = columns.find(col => col.key === columnKey)
        if (!column || column.sortable === false) return

        if (sortColumn === columnKey) {
            // Cycle through: asc -> desc -> null
            if (sortDirection === "asc") {
                setSortDirection("desc")
            } else if (sortDirection === "desc") {
                setSortColumn(null)
                setSortDirection(null)
            }
        } else {
            // New column, start with asc
            setSortColumn(columnKey)
            setSortDirection("asc")
        }
        
        // Reset to first page when sorting
        setCurrentPage(1)
    }

    const getSortIcon = (columnKey: keyof T | string) => {
        if (!enableSorting) return null
        
        const column = columns.find(col => col.key === columnKey)
        if (!column || column.sortable === false) return null

        if (sortColumn === columnKey) {
            return sortDirection === "asc" ? (
                <ArrowUp className="h-4 w-4" />
            ) : (
                <ArrowDown className="h-4 w-4" />
            )
        }
        
        return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
    }

    const renderPagination = () => {
        if (!showPagination || sortedData.length === 0) return null

        const canGoPrevious = currentPage > 1
        const canGoNext = currentPage < totalPages

        return (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-[#7B756D]/75">
                <div className="flex items-center gap-2 text-sm">
                    <span>
                        Mostrando {endItem} de {sortedData.length} registros
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-sm">
                        <span>Itens por página:</span>
                        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                            <SelectTrigger className="w-20 h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {pageSizeOptions.map(size => (
                                    <SelectItem key={size} value={size.toString()}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(1)}
                            disabled={!canGoPrevious}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={!canGoPrevious}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-1 mx-2">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNumber: number
                                
                                if (totalPages <= 5) {
                                    pageNumber = i + 1
                                } else if (currentPage <= 3) {
                                    pageNumber = i + 1
                                } else if (currentPage >= totalPages - 2) {
                                    pageNumber = totalPages - 4 + i
                                } else {
                                    pageNumber = currentPage - 2 + i
                                }

                                return (
                                    <Button
                                        key={pageNumber}
                                        variant={currentPage === pageNumber ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handlePageChange(pageNumber)}
                                        className="h-8 w-8 p-0"
                                    >
                                        {pageNumber}
                                    </Button>
                                )
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={!canGoNext}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={!canGoNext}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
                <table className={"min-w-full" + (tableClassName ?? "") }>
                    <thead className={"bg-[#7B756D]/75 text-left text-xs uppercase " + (headClassName ?? "")}>
                        <tr>
                            {columns.map((col, idx) => {
                                const isSortable = enableSorting && col.sortable !== false
                                return (
                                    <th
                                        key={String(col.key)}
                                        className={
                                            "px-4 py-3 font-medium " +
                                            (idx === 0 ? " rounded-tl-lg" : "") +
                                            (idx === columns.length - 1 ? " rounded-tr-lg" : "") +
                                            (col.className ? " " + col.className : "") +
                                            (isSortable ? " cursor-pointer hover:bg-[#7B756D]/90 select-none" : "")
                                        }
                                        onClick={() => isSortable && handleSort(col.key)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{col.header}</span>
                                            {getSortIcon(col.key)}
                                        </div>
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {isLoading ? (
                            Array.from({ length: skeletonRowCount }).map((_, r) => (
                                <tr key={`sk-${r}`} className={rowClassName}>
                                    {columns.map((col, cIdx) => {
                                        const base = "h-4 animate-pulse rounded bg-muted";
                                        const width = col.skeletonClassName
                                            ? col.skeletonClassName
                                            : cIdx === 0
                                                ? "w-16"
                                                : cIdx === 1
                                                    ? "w-32"
                                                    : "w-24";
                                        return (
                                            <td key={String(col.key)} className={"px-4 py-3 " + (col.className ?? "")}>
                                                <div className={`${base} ${width}`} />
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={columns.length}>
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, idx) => (
                                <tr key={idx} className={rowClassName}>
                                    {columns.map(col => (
                                        <td key={String(col.key)} className={"px-4 py-3 " + (col.className ?? "")}>
                                            {col.cell ? col.cell(row) : String(row[col.key as keyof T] ?? "")}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {renderPagination()}
        </div>
    )
}

