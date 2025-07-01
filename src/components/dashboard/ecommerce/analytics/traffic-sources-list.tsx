"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TrafficSource {
  x: string; // Source name (e.g., google.com, direct)
  y: number; // Count
}

interface TrafficSourcesListProps {
  data: TrafficSource[];
}

export function TrafficSourcesList({ data }: TrafficSourcesListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead className="text-right">Visitors</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((source, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{source.x || "(Direct)"}</TableCell>
                <TableCell className="text-right">{source.y}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="h-24 text-center">
                No traffic sources data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}