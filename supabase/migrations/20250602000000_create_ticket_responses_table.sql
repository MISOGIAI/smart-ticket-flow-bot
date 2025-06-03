-- Create ticket_responses table to store responses to tickets
CREATE TABLE ticket_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  internal_notes TEXT,
  status_before TEXT NOT NULL,
  status_after TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  is_ai_generated BOOLEAN DEFAULT FALSE
);

-- Add indexes for faster queries
CREATE INDEX idx_ticket_responses_ticket_id ON ticket_responses(ticket_id);
CREATE INDEX idx_ticket_responses_created_by ON ticket_responses(created_by);
CREATE INDEX idx_ticket_responses_created_at ON ticket_responses(created_at);

-- Add comment for documentation
COMMENT ON TABLE ticket_responses IS 'Stores all responses and updates made to tickets'; 