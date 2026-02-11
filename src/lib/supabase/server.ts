import { createClient } from '@supabase/supabase-js'

export const createServerClient = () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
        throw new Error("Missing or invalid environment variable: SUPABASE_URL");
    }
    if (!serviceKey) {
        throw new Error("Missing environment variable: SUPABASE_SERVICE_ROLE_KEY");
    }

    return createClient(supabaseUrl, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
