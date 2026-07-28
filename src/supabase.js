import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yhzzwmqcdeeilionciuv.supabase.co';
const supabaseKey = 'sb_publishable_e3aPyt5KnsYI4YzGvqeWFg_WrfiH5Ly';

export const supabase = createClient(supabaseUrl, supabaseKey);