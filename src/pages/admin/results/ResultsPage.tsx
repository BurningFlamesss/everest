import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "#/components/common/PageHeader";
import { DataTable, type Column } from "#/components/common/DataTable";
import { EmptyState } from "#/components/common/EmptyState";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { getBoardResultsServer } from "#/packages/content/server/content";
import { saveBoardResultServer, deleteBoardResultServer } from "#/packages/content/server/mutations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import type { BoardResult } from "#/types/index";

export default function ResultsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<BoardResult> | null>(null);
  const [pendingDelete, setPendingDelete] = useState<BoardResult | null>(null);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["board-results"],
    queryFn: () => getBoardResultsServer(),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => saveBoardResultServer({ data }),
    onSuccess: () => {
      toast.success("Result saved successfully");
      qc.invalidateQueries({ queryKey: ["board-results"] });
      setOpen(false);
      setEditing(null);
    },
    onError: () => toast.error("Failed to save result"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBoardResultServer({ data: id }),
    onSuccess: () => {
      toast.success("Result deleted");
      qc.invalidateQueries({ queryKey: ["board-results"] });
      setPendingDelete(null);
    },
    onError: () => toast.error("Failed to delete result"),
  });

  const columns: Column<BoardResult>[] = [
    {
      key: "board",
      header: "Board",
      render: (row: BoardResult) => <div className="font-medium">{row.board}</div>,
    },
    {
      key: "year",
      header: "Year",
      render: (row: BoardResult) => row.year,
    },
    {
      key: "appeared",
      header: "Appeared",
      render: (row: BoardResult) => String(row.appeared),
    },
    {
      key: "passed",
      header: "Passed",
      render: (row: BoardResult) => String(row.passed),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row: BoardResult) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(row); setOpen(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setPendingDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-surface-base px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        icon={GraduationCap}
        eyebrow="Academics"
        title="Board Results"
        description="Manage historical board examination results."
        actions={
          <Button onClick={() => { setEditing({}); setOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Result
          </Button>
        }
      />

        {results.length > 0 ? (
          <DataTable columns={columns} rows={results} rowId={(r) => r.id} testId="results-table" />
        ) : !isLoading && (
          <EmptyState
            icon={Award}
            title="No results yet"
            description="Add your first board result to get started."
            primaryLabel="Add result"
            onPrimary={() => { setEditing(null); setOpen(true); }}
          />
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing?.id ? "Edit Result" : "Add Result"}</DialogTitle>
              <DialogDescription>Enter the board statistics for the academic year.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Board</Label>
                  <Input
                    value={editing?.board || ""}
                    onChange={(e: any) => setEditing((prev) => ({ ...prev, board: e.target.value }))}
                    placeholder="e.g. SEE or NEB"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year (B.S.)</Label>
                  <Input
                    value={editing?.year || ""}
                    onChange={(e: any) => setEditing((prev) => ({ ...prev, year: e.target.value }))}
                    placeholder="e.g. 2080"
                  />
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Appeared</Label>
                  <Input
                    type="number"
                    value={editing?.appeared || ""}
                    onChange={(e: any) => setEditing((prev) => ({ ...prev, appeared: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Passed</Label>
                  <Input
                    type="number"
                    value={editing?.passed || ""}
                    onChange={(e: any) => setEditing((prev) => ({ ...prev, passed: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dist.</Label>
                  <Input
                    type="number"
                    value={editing?.distinction || ""}
                    onChange={(e: any) => setEditing((prev) => ({ ...prev, distinction: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>1st Div</Label>
                  <Input
                    type="number"
                    value={editing?.firstDivision || ""}
                    onChange={(e: any) => setEditing((prev) => ({ ...prev, firstDivision: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>2nd Div</Label>
                  <Input
                    type="number"
                    value={editing?.secondDivision || ""}
                    onChange={(e: any) => setEditing((prev) => ({ ...prev, secondDivision: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => saveMutation.mutate(editing)} disabled={saveMutation.isPending || !editing?.board}>
                Save Result
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={!!pendingDelete}
          onOpenChange={(op) => !op && setPendingDelete(null)}
          title="Delete Result"
          description={`Are you sure you want to delete the result for ${pendingDelete?.year}?`}
          destructive
          onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
          busy={deleteMutation.isPending}
        />
      </div>
    </main>
  );
}
