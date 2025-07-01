"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

interface PopularPage {
  x: string; // Page URL
  y: number; // Views
}

interface PopularPagesListProps {
  data: PopularPage[];
}

export function PopularPagesList({ data }: PopularPagesListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Page URL</TableHead>
            <TableHead className="text-right">Views</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((page, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {/* Assuming internal links, adjust href as needed */}
                  <Link href={page.x} className="hover:underline truncate max-w-[200px] block">
                    {page.x}
                  </Link>
                </TableCell>
                <TableCell className="text-right">{page.y}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="h-24 text-center">
                No popular pages data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}