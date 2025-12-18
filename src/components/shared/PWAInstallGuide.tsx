import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Smartphone, Apple, Download } from "lucide-react";

// Import images
import iosStep1 from "@/assets/pwa-install/ios-step-1.png";
import iosStep2 from "@/assets/pwa-install/ios-step-2.png";
import iosStep3 from "@/assets/pwa-install/ios-step-3.png";
import androidStep1 from "@/assets/pwa-install/android-step-1.png";
import androidStep2 from "@/assets/pwa-install/android-step-2.png";
import androidStep3 from "@/assets/pwa-install/android-step-3.png";

interface PWAInstallGuideProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const iosSteps = [
  {
    image: iosStep1,
    title: "Abra no Safari",
    description:
      "Acesse o site pelo navegador Safari. Depois, toque no ícone de compartilhar (quadrado com seta para cima) na barra inferior.",
  },
  {
    image: iosStep2,
    title: "Adicionar à Tela de Início",
    description: 'Role para baixo no menu de compartilhamento e toque em "Adicionar à Tela de Início".',
  },
  {
    image: iosStep3,
    title: "Confirme a instalação",
    description: 'Toque em "Adicionar" no canto superior direito. O app será instalado na sua tela inicial.',
  },
];

const androidSteps = [
  {
    image: androidStep1,
    title: "Abra no Chrome",
    description: "Acesse o site pelo navegador Chrome. Depois, toque no menu (três pontos) no canto superior direito.",
  },
  {
    image: androidStep2,
    title: "Instalar app",
    description: 'Toque em "Instalar app" ou "Adicionar à tela inicial" no menu.',
  },
  {
    image: androidStep3,
    title: "Confirme a instalação",
    description: 'Toque em "Instalar" para confirmar. O app será instalado e aparecerá na sua tela inicial.',
  },
];

export function PWAInstallGuide({ trigger, open: externalOpen, onOpenChange }: PWAInstallGuideProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<"ios" | "android">("android");

  // Use external control if provided, otherwise use internal state
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    // Detect platform
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      setDefaultTab("ios");
    }
  }, []);

  // If controlled externally, don't render trigger
  if (externalOpen !== undefined) {
    return (
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[95dvh]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Instale o App no Celular
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ios" className="flex items-center gap-2">
                <Apple className="h-4 w-4" />
                iPhone/iPad
              </TabsTrigger>
              <TabsTrigger value="android" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Android
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ios" className="mt-4">
              <ScrollArea className="h-[60dvh] pr-4">
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    No iPhone/iPad, use o navegador <strong>Safari</strong> para instalar o app.
                  </p>
                  {iosSteps.map((step, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {index + 1}
                        </span>
                        <h3 className="font-medium">{step.title}</h3>
                      </div>
                      <div className="ml-10">
                        <img
                          src={step.image}
                          alt={step.title}
                          className="w-full max-w-xs rounded-lg border shadow-sm"
                        />
                        <p className="text-sm text-muted-foreground mt-3">{step.description}</p>
                      </div>
                    </div>
                  ))}
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Dica:</strong> Após instalar, o app funciona offline e carrega mais rápido!
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="android" className="mt-4">
              <ScrollArea className="h-[60dvh] pr-4">
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    No Android, use o navegador <strong>Chrome</strong> para instalar o app.
                  </p>
                  {androidSteps.map((step, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {index + 1}
                        </span>
                        <h3 className="font-medium">{step.title}</h3>
                      </div>
                      <div className="ml-10">
                        <img
                          src={step.image}
                          alt={step.title}
                          className="w-full max-w-xs rounded-lg border shadow-sm"
                        />
                        <p className="text-sm text-muted-foreground mt-3">{step.description}</p>
                      </div>
                    </div>
                  ))}
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Dica:</strong> Após instalar, o app funciona offline e carrega mais rápido!
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setOpen(false)}>Entendi</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Como instalar no celular
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[95dvh]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Instale o App no Celular
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ios" className="flex items-center gap-2">
              <Apple className="h-4 w-4" />
              iPhone/iPad
            </TabsTrigger>
            <TabsTrigger value="android" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Android
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ios" className="mt-4">
            <ScrollArea className="h-[60dvh] pr-4">
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  No iPhone/iPad, use o navegador <strong>Safari</strong> para instalar o app.
                </p>
                {iosSteps.map((step, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {index + 1}
                      </span>
                      <h3 className="font-medium">{step.title}</h3>
                    </div>
                    <div className="ml-10">
                      <img src={step.image} alt={step.title} className="w-full max-w-xs rounded-lg border shadow-sm" />
                      <p className="text-sm text-muted-foreground mt-3">{step.description}</p>
                    </div>
                  </div>
                ))}
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Dica:</strong> Após instalar, o app funciona offline e carrega mais rápido!
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="android" className="mt-4">
            <ScrollArea className="h-[60dvh] pr-4">
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  No Android, use o navegador <strong>Chrome</strong> para instalar o app.
                </p>
                {androidSteps.map((step, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {index + 1}
                      </span>
                      <h3 className="font-medium">{step.title}</h3>
                    </div>
                    <div className="ml-10">
                      <img src={step.image} alt={step.title} className="w-full max-w-xs rounded-lg border shadow-sm" />
                      <p className="text-sm text-muted-foreground mt-3">{step.description}</p>
                    </div>
                  </div>
                ))}
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Dica:</strong> Após instalar, o app funciona offline e carrega mais rápido!
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => setOpen(false)}>Entendi</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
