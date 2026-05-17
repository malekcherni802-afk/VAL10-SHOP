/**
 * Site Settings API - CRUD for site-wide settings
 * Uses Supabase as the data store
 * GET    /api/settings       - get all settings (public)
 * PUT    /api/settings       - upsert settings (authenticated)
 */

import { supabase, getSupabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET - list all settings as a flat object
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');

      if (error) {
        console.error('[settings] Fetch error:', error);
        return res.status(500).json({ error: error.message });
      }

      const obj = {};
      (data || []).forEach(row => {
        obj[row.key] = row.value;
      });
      return res.status(200).json(obj);
    } catch (err) {
      console.error('[settings] GET error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // PUT - upsert settings
  if (req.method === 'PUT') {
    try {
      const updates = req.body;
      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ error: 'Request body must be an object' });
      }

      const adminClient = getSupabaseAdmin();
      const client = adminClient || supabase;

      for (const [key, value] of Object.entries(updates)) {
        const { error } = await client
          .from('site_settings')
          .upsert({ key, value }, { onConflict: 'key' });

        if (error) {
          console.error('[settings] Upsert error for key:', key, error);
          return res.status(500).json({ error: error.message });
        }
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('[settings] PUT error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
