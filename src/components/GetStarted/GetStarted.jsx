import React, { useState } from "react";
import styles from "./GetStarted.module.css";
import { CodeBlock } from "../ui/CodeBlock";

const GetStarted = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTab, setSelectedTab] = useState("quickstart");
  const [apiKey, setApiKey] = useState("rai_yourapikey123456789");
  const [projectId, setProjectId] = useState("project-abc123def456");

  const steps = [
    {
      title: "Install the SDK",
      content: (
        <>
          <p>
            First, install the RecallrAI SDK using your preferred package
            manager:
          </p>
          <CodeBlock
            language="bash"
            code={`poetry add recallrai
# or
pip install recallrai`}
          />
        </>
      ),
    },
    {
      title: "Initialize the Client",
      content: (
        <>
          <p>Create a client instance with your API key and project ID:</p>
          <CodeBlock
            language="python"
            code={`from recallrai import RecallrAI

api_key = "${apiKey}"
project_id = "${projectId}"
client = RecallrAI(api_key=api_key, project_id=project_id)`}
          />
        </>
      ),
    },
    {
      title: "Create a User",
      content: (
        <>
          <p>Create a user to associate with your memory sessions:</p>
          <CodeBlock
            language="python"
            code={`from recallrai.user import User

user_id = "user123"
metadata = {"key": "value"}
user = client.create_user(user_id=user_id, metadata=metadata)
print("Created user:", user.user_id)`}
          />
        </>
      ),
    },
    {
      title: "Create a Session",
      content: (
        <>
          <p>Create a memory session for your user:</p>
          <CodeBlock
            language="python"
            code={`from recallrai.session import Session

# Auto-process after 5 minutes of inactivity
session = client.create_session(user_id="user123", auto_process_after_minutes=5)
print("Created session id:", session.session_id)`}
          />
        </>
      ),
    },
    {
      title: "Add Messages",
      content: (
        <>
          <p>Add user and assistant messages to the session:</p>
          <CodeBlock
            language="python"
            code={`# Add user message
session.add_user_message("Hello! How are you?")

# Add assistant message
session.add_assistant_message("I'm an assistant. How can I help you?")`}
          />
        </>
      ),
    },
    {
      title: "Retrieve Context",
      content: (
        <>
          <p>Get the context from memory to enhance your LLM's responses:</p>
          <CodeBlock
            language="python"
            code={`# Get context with memories
context = session.get_context()
print("Memory used:", context.memory_used)
print("Context:", context.context)`}
          />
        </>
      ),
    },
    {
      title: "Process Session",
      content: (
        <>
          <p>Process the session to update the memory system:</p>
          <CodeBlock
            language="python"
            code={`# Process session to update user memories
session.process()`}
          />
        </>
      ),
    },
  ];

  const tabContent = {
    quickstart: (
      <div className={styles["tab-pane"]}>
        <h3>Quick Start Guide</h3>
        <p>
          Get started with RecallrAI's contextual memory system in minutes.
          Follow these steps to integrate memory capabilities into your AI
          assistant.
        </p>

        <div className={styles["steps-container"]}>
          {steps.map((step, index) => (
            <div
              key={index}
              className={`${styles["step-card"]} ${
                currentStep === index
                  ? styles.active
                  : currentStep > index
                  ? styles.completed
                  : styles.pending
              }`}
            >
              <div className={styles["step-header"]}>
                <div className={styles["step-number"]}>{index + 1}</div>
                <h4 className={styles["step-title"]}>{step.title}</h4>
                {currentStep > index && (
                  <div className={styles["step-status"]}>Completed</div>
                )}
              </div>
              {currentStep === index && (
                <div className={styles["step-body"]}>
                  {step.content}
                  <div className={styles["step-action"]}>
                    {index > 0 && (
                      <button
                        className={`${styles.button} ${styles.secondaryButton}`}
                        onClick={() => setCurrentStep(index - 1)}
                      >
                        Previous
                      </button>
                    )}
                    {index < steps.length - 1 ? (
                      <button
                        className={`${styles.button} ${styles.primaryButton}`}
                        onClick={() => setCurrentStep(index + 1)}
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        className={`${styles.button} ${styles.primaryButton}`}
                        onClick={() => setCurrentStep(0)}
                      >
                        Start Over
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    ),
    full_example: (
      <div className={styles["tab-pane"]}>
        <h3>Complete Integration Example</h3>
        <p>
          This example shows how to integrate RecallrAI with an LLM to create an
          AI assistant with memory:
        </p>

        <h4>Setting Up Clients</h4>
        <CodeBlock
          language="python"
          code={`import openai
from recallrai import RecallrAI

# Initialize RecallrAI and OpenAI clients
recallrai_client = RecallrAI(api_key="rai_yourapikey", project_id="project-uuid")
openai_client = openai.OpenAI(api_key="your-openai-api-key")`}
        />

        <h4>Creating the Memory-Enhanced Chat Function</h4>
        <CodeBlock
          language="python"
          code={`def chat_with_memory(user_id, session_id=None):
    # Get or create user
    try:
        user = recallrai_client.get_user(user_id)
    except:
        user = recallrai_client.create_user(user_id)
    
    # Create a new session or get an existing one
    if session_id:
        session = recallrai_client.get_session(user_id=user_id, session_id=session_id)
    else:
        session = recallrai_client.create_session(user_id=user_id, auto_process_after_minutes=30)
        print(f"Created new session: {session.session_id}")
    
    print("Chat session started. Type 'exit' to end the conversation.")`}
        />

        <h4>Handling User Input</h4>
        <CodeBlock
          language="python"
          code={`    # Inside the chat_with_memory function
    while True:
        # Get user input
        user_message = input("You: ")
        if user_message.lower() == 'exit':
            break
        
        # Add the user message to RecallrAI
        session.add_user_message(user_message)
        
        # Get context from RecallrAI after adding the user message
        context = session.get_context()`}
        />

        <h4>Constructing the System Prompt with Memories</h4>
        <CodeBlock
          language="python"
          code={`        # Create a system prompt that includes the context
        system_prompt = f"""You are a helpful assistant with memory of previous conversations.
        
        MEMORIES ABOUT THE USER:
        {context.context}
        
        You can use the above memories to provide better responses to the user.
        Don't mention that you have access to memories unless you are explicitly asked."""
        
        # Get previous messages
        previous_messages = session.get_messages()`}
        />

        <h4>Sending the Request to the LLM</h4>
        <CodeBlock
          language="python"
          code={`        # Create the messages list for OpenAI
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # Add last few conversation messages (excluding system prompt)
        for msg in previous_messages[-5:]:
            if msg.role != "system":
                messages.append({"role": msg.role, "content": msg.content})
        
        # Send to OpenAI
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7,
        )
        
        # Extract the assistant's response
        assistant_response = response.choices[0].message.content
        
        # Add the assistant's response to RecallrAI
        session.add_assistant_message(assistant_response)
        
        # Print the response
        print(f"Assistant: {assistant_response}")`}
        />

        <h4>Finalizing the Session</h4>
        <CodeBlock
          language="python"
          code={`    # Process the session to update the memory
    session.process()
    print(f"Session ended. Session ID: {session.session_id}")
    return session.session_id

# Example usage
if __name__ == "__main__":
    user_id = "user123"
    session_id = chat_with_memory(user_id)
    print(f"To continue this conversation later, use session ID: {session_id}")`}
        />
      </div>
    ),
    user_management: (
      <div className={styles["tab-pane"]}>
        <h3>User Management</h3>
        <p>
          Create, retrieve, update, and delete users in your RecallrAI project:
        </p>

        <h4>Creating a User</h4>
        <CodeBlock
          language="python"
          code={`# Create a user
user = client.create_user(user_id="user123", metadata={"key": "value"})`}
        />

        <h4>Retrieving a User</h4>
        <CodeBlock
          language="python"
          code={`# Get a user
user = client.get_user("user123")
print("User metadata:", user.metadata)`}
        />

        <h4>Listing Users</h4>
        <CodeBlock
          language="python"
          code={`# List users
user_list = client.list_users(offset=0, limit=10)
for user in user_list.users:
    print(user.user_id, user.metadata)`}
        />

        <h4>Updating a User</h4>
        <CodeBlock
          language="python"
          code={`# Update a user
updated_user = client.update_user(
    user_id="user123", 
    new_metadata={"role": "user"}, 
    new_user_id="user1234"
)`}
        />

        <h4>Deleting a User</h4>
        <CodeBlock
          language="python"
          code={`# Delete a user
client.delete_user("user1234")
print("User deleted.")`}
        />
      </div>
    ),
    session_management: (
      <div className={styles["tab-pane"]}>
        <h3>Session Management</h3>
        <p>Create and manage memory sessions:</p>

        <h4>Creating a Session</h4>
        <CodeBlock
          language="python"
          code={`# Create a session
session = client.create_session(user_id="user123", auto_process_after_minutes=5)`}
        />

        <h4>Retrieving a Session</h4>
        <CodeBlock
          language="python"
          code={`# Get an existing session
session = client.get_session(user_id="user123", session_id="session-uuid")`}
        />

        <h4>Listing Sessions</h4>
        <CodeBlock
          language="python"
          code={`# List sessions
session_list = client.list_sessions(user_id="user123", offset=0, limit=10)
for session in session_list.sessions:
    print(session.session_id, session.status)`}
        />

        <h4>Checking Session Status</h4>
        <CodeBlock
          language="python"
          code={`# Get session status
status = session.get_status()
print("Session status:", status)`}
        />

        <h4>Retrieving Session Messages</h4>
        <CodeBlock
          language="python"
          code={`# Get session messages
messages = session.get_messages()
for message in messages:
    print(f"{message.role}: {message.content} at {message.timestamp}")`}
        />
      </div>
    ),
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.intro}>
          <h2>Getting Started with RecallrAI</h2>
          <p>
            RecallrAI is a revolutionary contextual memory system that enables
            AI assistants to form meaningful connections between conversations,
            just like human memory.
          </p>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              selectedTab === "quickstart" ? styles.active : ""
            }`}
            onClick={() => setSelectedTab("quickstart")}
          >
            Quick Start
          </button>
          <button
            className={`${styles.tab} ${
              selectedTab === "full_example" ? styles.active : ""
            }`}
            onClick={() => setSelectedTab("full_example")}
          >
            Full Example
          </button>
          <button
            className={`${styles.tab} ${
              selectedTab === "user_management" ? styles.active : ""
            }`}
            onClick={() => setSelectedTab("user_management")}
          >
            User Management
          </button>
          <button
            className={`${styles.tab} ${
              selectedTab === "session_management" ? styles.active : ""
            }`}
            onClick={() => setSelectedTab("session_management")}
          >
            Session Management
          </button>
        </div>

        <div className={styles["tab-content"]}>{tabContent[selectedTab]}</div>

        <div className={styles["cta-section"]}>
          <h3>Ready to Enhance Your AI with Memory?</h3>
          <p>
            Give your AI assistants the ability to remember previous
            conversations and form meaningful connections.
          </p>
          <button className={`${styles.button} ${styles.primaryButton}`}>
            View API Documentation
          </button>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
