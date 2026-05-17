/**
 * Backgrounds API - CRUD for shop carousel backgrounds
 * Uses Supabase as the data store
 * GET  /api/backgrounds       - list all backgrounds (public)
 * POST /api/backgrounds       - add a background (authenticated)
 * DELETE /api/backgrounds?id=  - delete a background (authenticated)
 */

import { supabase, getSupabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET - list all backgrounds
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('backgrounds')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('[backgrounds] Fetch error:', error);
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json(data || []);
    } catch (err) {
      console.error('[backgrounds] GET error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // POST - add a background
  if (req.method === 'POST') {
    try {
      const { url, public_id, sort_order } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'url is required' });
      }

      const adminClient = getSupabaseAdmin();
      const client = adminClient || supabase;

      const { data, error } = await client
        .from('backgrounds')
        .insert({ url, public_id: public_id || null, sort_order: sort_order || 0 })
        .select()
        .single();

      if (error) {
        console.error('[backgrounds] Insert error:', error);
        return res.status(500).json({ error: error.message });
      }
      return res.status(201).json(data);
    } catch (err) {
      console.error('[backgrounds] POST error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE - remove a background
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'id query param is required' });
      }

      const adminClient = getSupabaseAdmin();
      const client = adminClient || supabase;

      const { error } = await client
        .from('backgrounds')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[backgrounds] Delete error:', error);
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({ success: true, id });
    } catch (err) {
      console.error('[backgrounds] DELETE error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
