-- Create table for Minecraft servers hosting
CREATE TABLE IF NOT EXISTS minecraft_servers (
    id SERIAL PRIMARY KEY,
    server_id VARCHAR(16) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    server_name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'stopped',
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    port INTEGER NOT NULL,
    max_players INTEGER DEFAULT 20,
    online_players INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_online TIMESTAMP
);

CREATE INDEX idx_servers_user_id ON minecraft_servers(user_id);
CREATE INDEX idx_servers_status ON minecraft_servers(status);
