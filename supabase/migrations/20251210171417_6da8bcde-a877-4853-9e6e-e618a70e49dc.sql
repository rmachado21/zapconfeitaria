-- Create storage bucket for quote PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('quote-pdfs', 'quote-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own PDFs
CREATE POLICY "Users can upload their own quote PDFs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'quote-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public access to read PDFs (for WhatsApp sharing)
CREATE POLICY "Anyone can view quote PDFs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'quote-pdfs');

-- Allow users to delete their own PDFs
CREATE POLICY "Users can delete their own quote PDFs"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'quote-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);