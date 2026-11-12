import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, Loader2, Paperclip, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { getErrorMessage } from "@/lib/utils/error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Database } from "@/integrations/supabase/types";

type ClientDocument = Database["public"]["Tables"]["client_documents"]["Row"];
const bucket = "client-documents";

export function ClientDocuments({ clientId }: { clientId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const queryKey = ["client-documents", user?.id, clientId];
  const { data: documents = [], isLoading, isError, refetch } = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("client_documents").select("*")
        .eq("user_id", user.id).eq("client_id", clientId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function upload() {
    if (!user || !file || !documentType.trim() || uploading) return;
    setUploading(true);
    const path = `${user.id}/${clientId}/${crypto.randomUUID()}`;
    try {
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
        contentType: "application/octet-stream", upsert: false,
      });
      if (uploadError) throw uploadError;
      const { error } = await supabase.from("client_documents").insert({
        user_id: user.id, client_id: clientId, document_type: documentType.trim(),
        file_name: file.name, file_size: file.size, content_type: file.type || null, storage_path: path,
      });
      if (error) {
        await supabase.storage.from(bucket).remove([path]);
        throw error;
      }
      setFile(null);
      setDocumentType("");
      if (inputRef.current) inputRef.current.value = "";
      await qc.invalidateQueries({ queryKey });
      toast.success("Documento anexado ao cliente");
    } catch (error) {
      toast.error(`Não foi possível anexar: ${getErrorMessage(error)}`);
    } finally { setUploading(false); }
  }

  async function download(document: ClientDocument) {
    setBusyId(document.id);
    try {
      const { data, error } = await supabase.storage.from(bucket).download(document.storage_path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.file_name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { toast.error(getErrorMessage(error)); }
    finally { setBusyId(null); }
  }

  async function remove(document: ClientDocument) {
    if (!user || !window.confirm(`Excluir o documento "${document.file_name}"?`)) return;
    setBusyId(document.id);
    try {
      const { error } = await supabase.from("client_documents").delete().eq("id", document.id).eq("user_id", user.id);
      if (error) throw error;
      const { error: storageError } = await supabase.storage.from(bucket).remove([document.storage_path]);
      await qc.invalidateQueries({ queryKey });
      if (storageError) toast.error("Anexo removido da lista, mas não foi possível apagar o arquivo armazenado.");
      else toast.success("Documento excluído");
    } catch (error) { toast.error(getErrorMessage(error)); }
    finally { setBusyId(null); }
  }

  return (
    <section className="mb-8 border-b border-border pb-6" aria-label="Documentos do cliente">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
        <Paperclip className="h-4 w-4" /> Documentos
      </h3>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="client-document-type">Tipo de documento</Label>
          <Input id="client-document-type" placeholder="Ex.: contrato, comprovante, laudo" value={documentType}
            disabled={uploading} onChange={e => setDocumentType(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="client-document-file">Arquivo</Label>
          <Input ref={inputRef} id="client-document-file" type="file" className="min-w-0" disabled={uploading}
            onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <Button className="w-full" disabled={uploading || !file || !documentType.trim()} onClick={upload}>
          {uploading ? <Loader2 className="animate-spin" /> : <Paperclip />}
          {uploading ? "Anexando…" : "Anexar documento"}
        </Button>
      </div>
      <div className="mt-4" aria-live="polite">
        {isLoading ? <p className="text-sm text-muted-foreground">Carregando documentos…</p>
          : isError ? <div><p className="text-sm text-destructive">Não foi possível carregar os documentos.</p><Button variant="link" onClick={() => refetch()}>Tentar novamente</Button></div>
          : documents.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum documento anexado.</p>
          : <ul className="divide-y divide-border">
            {documents.map(document => (
              <li key={document.id} className="flex min-w-0 items-center gap-3 py-3">
                <FileText className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-semibold">{document.document_type}</p>
                  <p className="break-all text-xs text-muted-foreground">{document.file_name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(document.created_at).toLocaleDateString("pt-BR")} · {document.file_size < 1024 ? `${document.file_size} B` : `${(document.file_size / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} KB`}</p>
                </div>
                <Button variant="ghost" size="icon" title="Baixar documento" aria-label={`Baixar ${document.file_name}`} disabled={busyId !== null} onClick={() => download(document)}><Download /></Button>
                <Button variant="ghost" size="icon" className="text-destructive" title="Excluir documento" aria-label={`Excluir ${document.file_name}`} disabled={busyId !== null} onClick={() => remove(document)}><Trash2 /></Button>
              </li>
            ))}
          </ul>}
      </div>
    </section>
  );
}