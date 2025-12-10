import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  bucket: 'product-images' | 'company-logos';
  currentUrl?: string;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  className?: string;
  aspectRatio?: 'square' | 'wide' | 'logo';
}

export function ImageUpload({
  bucket,
  currentUrl,
  onUpload,
  onRemove,
  className,
  aspectRatio = 'square',
}: ImageUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLogo = bucket === 'company-logos';
  const effectiveAspectRatio = isLogo ? 'logo' : aspectRatio;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setUploading(true);

    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      onUpload(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className={cn(
          "relative rounded-lg overflow-hidden border border-border bg-muted",
          effectiveAspectRatio === 'square' && 'aspect-square',
          effectiveAspectRatio === 'wide' && 'aspect-video',
          effectiveAspectRatio === 'logo' && 'aspect-[8/3] min-h-[120px]'
        )}>
          <img
            src={preview}
            alt="Preview"
            className={cn(
              "w-full h-full",
              isLogo ? "object-contain p-2" : "object-cover"
            )}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 hover:bg-muted transition-colors cursor-pointer",
            effectiveAspectRatio === 'square' && 'aspect-square',
            effectiveAspectRatio === 'wide' && 'aspect-video',
            effectiveAspectRatio === 'logo' && 'aspect-[8/3] min-h-[120px]',
            uploading && 'opacity-50 cursor-not-allowed'
          )}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Clique para enviar imagem
              </span>
              <span className="text-xs text-muted-foreground/60">
                {bucket === 'company-logos' 
                  ? 'Tamanho ideal: 400x150px (PNG ou JPG, máx. 5MB)'
                  : 'JPG, PNG ou WebP (máx. 5MB)'
                }
              </span>
            </>
          )}
        </button>
      )}

      {!preview && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Enviar Imagem
        </Button>
      )}
    </div>
  );
}