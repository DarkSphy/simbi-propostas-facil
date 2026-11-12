ALTER TABLE public.clients ADD CONSTRAINT clients_id_user_id_unique UNIQUE (id, user_id);
CREATE TABLE public.client_documents (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 client_id uuid NOT NULL,
 document_type text NOT NULL CHECK (length(trim(document_type)) > 0),
 file_name text NOT NULL,
 storage_path text NOT NULL UNIQUE,
 file_size bigint NOT NULL DEFAULT 0,
 content_type text,
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT client_documents_client_owner_fk FOREIGN KEY (client_id, user_id) REFERENCES public.clients(id, user_id) ON DELETE CASCADE,
 CONSTRAINT client_documents_path_owner CHECK (split_part(storage_path, '/', 1) = user_id::text AND split_part(storage_path, '/', 2) = client_id::text)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_documents TO authenticated;
GRANT ALL ON public.client_documents TO service_role;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_documents_owner ON public.client_documents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX client_documents_client_idx ON public.client_documents(client_id, created_at DESC);
CREATE POLICY client_documents_storage_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'client-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY client_documents_storage_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'client-documents' AND (storage.foldername(name))[1] = auth.uid()::text AND EXISTS (SELECT 1 FROM public.clients c WHERE c.id::text = (storage.foldername(name))[2] AND c.user_id = auth.uid()));
CREATE POLICY client_documents_storage_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'client-documents' AND (storage.foldername(name))[1] = auth.uid()::text);