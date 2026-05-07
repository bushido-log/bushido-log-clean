import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nnqpfmugcdtmrcxxhttm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hfTQw6fbd8-jMeEfm01WJQ_xG4itla_';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
