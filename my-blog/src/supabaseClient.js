import { createClient } from '@supabase/supabase-js';

// .env.local 파일에 숨겨둔 URL과 Key를 꺼내오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 인증된 Supabase 클라이언트를 생성 후 export
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
