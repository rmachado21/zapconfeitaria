import { processTemplate, TemplateType, TemplateContext } from './whatsappTemplates';

/**
 * Utility to open WhatsApp links reliably across different environments
 * Uses native anchor element to bypass iframe restrictions
 */

export function openWhatsApp(phone: string, message?: string): void {
  // Clean phone number - remove all non-digits
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Add Brazil country code if not present
  const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  
  // Build URL
  let url = `https://wa.me/${formattedPhone}`;
  if (message) {
    url += `?text=${encodeURIComponent(message)}`;
  }

  // Create a temporary anchor element to bypass iframe restrictions
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Open WhatsApp with a pre-filled message using a template
 */
export function openWhatsAppWithTemplate(
  phone: string,
  templateType: TemplateType,
  context: TemplateContext
): void {
  const message = processTemplate(templateType, context);
  openWhatsApp(phone, message);
}
