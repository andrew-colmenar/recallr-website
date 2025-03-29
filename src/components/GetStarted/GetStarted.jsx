// GettingStarted.jsx
import React, { useState } from 'react';
import styles from './GetStarted.module.css';

const GetStarted = () => {
  const [activeTab, setActiveTab] = useState('installation');

  const codeBlocks = {
    installation: `# Install via Poetry or pip
poetry add recallrai
# or
pip install recallrai`,
    initialization: `from recallrai import RecallrAI

api_key = "rai_yourapikey"
project_id = "project-uuid"
client = RecallrAI(api_key=api_key, project_id=project_id)`,
    userManagement: `# Create a user
from recallrai.user import User

user_id = "user123"
metadata = {"key": "value"}
user = client.create_user(user_id=user_id, metadata=metadata)

# Get a user
user = client.get_user("user123")

# List users
user_list = client.list_users(offset=0, limit=10)

# Update a user
updated_user = client.update_user(
    user_id="user123", 
    new_metadata={"role": "user"}, 
    new_user_id="user1234"
)

# Delete a user
client.delete_user("user1234")`,
    sessionManagement: `# Create a session
from recallrai.session import Session

session = client.create_session(
    user_id="user123", 
    auto_process_after_minutes=5
)

# Get an existing session
session = client.get_session(
    user_id="user123", 
    session_id="session-uuid"
)

# List sessions
session_list = client.list_sessions(
    user_id="user123", 
    offset=0, 
    limit=10
)

# Add messages
session.add_user_message("Hello! How are you?")
session.add_assistant_message("I'm an assistant. How can I help you?")

# Get context
context = session.get_context()
print("Context:", context.context)

# Process session
session.process()

# Get status and messages
status = session.get_status()
messages = session.get_messages()`,
    completeExample: `import openai
from recallrai import RecallrAI

# Initialize clients
recallrai_client = RecallrAI(api_key="rai_yourapikey", project_id="project-uuid")
openai_client = openai.OpenAI(api_key="your-openai-api-key")

def chat_with_memory(user_id, session_id=None):
    # Get or create user
    try:
        user = recallrai_client.get_user(user_id)
    except:
        user = recallrai_client.create_user(user_id)
    
    # Create or get session
    if session_id:
        session = recallrai_client.get_session(user_id=user_id, session_id=session_id)
    else:
        session = recallrai_client.create_session(user_id=user_id, auto_process_after_minutes=30)
    
    # User input
    user_message = "How can you help me today?"
    session.add_user_message(user_message)
    
    # Get context
    context = session.get_context()
    
    # Create system prompt with context
    system_prompt = f"""You are a helpful assistant with memory.
    
    MEMORIES ABOUT THE USER:
    {context.context}
    
    Use these memories to provide better responses."""
    
    # Get previous messages
    previous_messages = session.get_messages()
    previous_messages = [{"role": "m.role", "content": m.content} for m in previous_messages]

    # Call LLM
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            **previous_messages,
        ],
        temperature=0.7
    )
    
    assistant_message = response.choices[0].message.content
    
    # Add assistant response
    session.add_assistant_message(assistant_message)
    
    # Process session
    session.process()
    
    return session.session_id`
  };

  return (
    <div className={styles['getting-started']}>
      <header className={styles['header']}>
        <div className={styles['logo']}>
          <h1>RecallrAI</h1>
          <span className={styles['tagline']}>Contextual Memory for AI Assistants</span>
        </div>
      </header>

      <div className={styles['content']}>
        <div className={styles['intro']}>
          <h2>Getting Started with RecallrAI</h2>
          <p>
            RecallrAI is a revolutionary contextual memory system that enables AI assistants to form meaningful connections between conversations, just like human memory. Our Python SDK makes it easy to integrate this powerful memory system into your AI applications.
          </p>
        </div>

        <div className={styles['tabs']}>
          <button 
            className={`${styles['tab']} ${activeTab === 'installation' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('installation')}
          >
            Installation
          </button>
          <button 
            className={`${styles['tab']} ${activeTab === 'initialization' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('initialization')}
          >
            Initialization
          </button>
          <button 
            className={`${styles['tab']} ${activeTab === 'userManagement' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('userManagement')}
          >
            User Management
          </button>
          <button 
            className={`${styles['tab']} ${activeTab === 'sessionManagement' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('sessionManagement')}
          >
            Session Management
          </button>
          <button 
            className={`${styles['tab']} ${activeTab === 'completeExample' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('completeExample')}
          >
            Complete Example
          </button>
        </div>

        <div className={styles['tab-content']}>
          {activeTab === 'installation' && (
            <div className={styles['tab-pane']}>
              <h3>Installation</h3>
              <p>Install the RecallrAI SDK using Poetry or pip:</p>
              <div className={styles['code-block']}>
                <pre>
                  <code>{codeBlocks.installation}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'initialization' && (
            <div className={styles['tab-pane']}>
              <h3>Initialization</h3>
              <p>Create a client instance with your API key and project ID:</p>
              <div className={styles['code-block']}>
                <pre>
                  <code>{codeBlocks.initialization}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'userManagement' && (
            <div className={styles['tab-pane']}>
              <h3>User Management</h3>
              <p>Create, retrieve, update, and delete users:</p>
              <div className={styles['code-block']}>
                <pre>
                  <code>{codeBlocks.userManagement}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'sessionManagement' && (
            <div className={styles['tab-pane']}>
              <h3>Session Management</h3>
              <p>Create sessions, add messages, and retrieve context:</p>
              <div className={styles['code-block']}>
                <pre>
                  <code>{codeBlocks.sessionManagement}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'completeExample' && (
            <div className={styles['tab-pane']}>
              <h3>Complete Example</h3>
              <p>Here's a complete example of using RecallrAI with OpenAI:</p>
              <div className={styles['code-block']}>
                <pre>
                  <code>{codeBlocks.completeExample}</code>
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className={styles['cta-section']}>
          <h3>Ready to Get Started?</h3>
          <p>Sign up for RecallrAI to get your API keys and start building AI assistants with human-like memory.</p>
          <button className={styles['cta-button']}>Sign Up for Free</button>
        </div>
      </div>

      <footer className={styles['footer']}>
        <div className={styles['footer-links']}>
          <a href="#">Documentation</a>
          <a href="#">GitHub</a>
          <a href="#">Support</a>
          <a href="#">Pricing</a>
        </div>
        <div className={styles['copyright']}>
          © {new Date().getFullYear()} RecallrAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default GetStarted;