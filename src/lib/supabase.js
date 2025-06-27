import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iabsxdahmhrmntteyllj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhYnN4ZGFobWhybW50dGV5bGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMzcyNDAsImV4cCI6MjA2NjYxMzI0MH0.QJqJeIHKEbaTjOltJb6SXDH7LIPe0ecGEe3zAOwDrt8'

export const supabase = createClient(supabaseUrl, supabaseKey)
