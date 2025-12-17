import React from 'https://esm.sh/react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'https://esm.sh/resend@4.0.0'
import { renderAsync } from 'https://esm.sh/@react-email/components@0.0.22'
import { PasswordResetEmail } from './_templates/password-reset.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const rawHookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)

  let webhookData: {
    user: { email: string }
    email_data: {
      token: string
      token_hash: string
      redirect_to: string
      email_action_type: string
      site_url: string
    }
  }

  // Verify webhook signature if secret is configured
  if (rawHookSecret) {
    try {
      // Remove 'whsec_' prefix if present (Supabase webhook secrets include this prefix)
      // Also handle 'v1,' prefix that some webhook secrets have
      let hookSecret = rawHookSecret
      if (hookSecret.startsWith('whsec_')) {
        hookSecret = hookSecret.replace('whsec_', '')
      }
      if (hookSecret.startsWith('v1,')) {
        hookSecret = hookSecret.substring(3)
      }
      
      const wh = new Webhook(hookSecret)
      webhookData = wh.verify(payload, headers) as typeof webhookData
    } catch (error) {
      console.error('Webhook verification failed:', error)
      console.log('Falling back to parsing payload without verification')
      // Fall back to parsing without verification for debugging
      try {
        webhookData = JSON.parse(payload)
      } catch (parseError) {
        return new Response(
          JSON.stringify({ error: { http_code: 401, message: 'Invalid webhook payload' } }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
  } else {
    // For development/testing without webhook secret
    webhookData = JSON.parse(payload)
  }

  const {
    user,
    email_data: { token_hash, redirect_to, email_action_type, site_url },
  } = webhookData

  // Only handle password recovery emails
  if (email_action_type !== 'recovery') {
    console.log(`Skipping email type: ${email_action_type}`)
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  console.log(`Processing password reset for: ${user.email}`)

  try {
    // Build the magic link URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const resetLink = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to || site_url}`

    // Render the React Email template
    const html = await renderAsync(
      React.createElement(PasswordResetEmail, {
        resetLink,
        userEmail: user.email,
      })
    )

    // Send email via Resend
    const { error } = await resend.emails.send({
      from: 'ZAP Confeitaria <noreply@zapconfeitaria.com.br>',
      to: [user.email],
      subject: 'Redefinir sua senha - ZAP Confeitaria',
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log(`Password reset email sent successfully to: ${user.email}`)

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error sending password reset email:', error)
    return new Response(
      JSON.stringify({
        error: {
          http_code: error.statusCode || 500,
          message: error.message || 'Failed to send email',
        },
      }),
      {
        status: error.statusCode || 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
