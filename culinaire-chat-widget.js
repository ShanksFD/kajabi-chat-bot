(function () {
  "use strict";

  // Prevent multiple instances
  if (window.CulinaireChat) {
    return;
  }

  // Configuration - can be overridden
  window.CulinaireChat = {
    config: {
      n8nWebhookUrl: "https://n8n.srv929119.hstgr.cloud/webhook/kajabi-chat",
      apiKey: "wbGoRTGXI65t1u6oMNPQ13c4rcbE8PlcRkeLPBWJskc=",
      position: "bottom-right", // bottom-right, bottom-left
      theme: "default",
      autoLoad: true,
    },

    init: function (customConfig) {
      if (customConfig) {
        Object.assign(this.config, customConfig);
      }
      this.loadWidget();
    },

    loadWidget: function () {
      // Check if already loaded
      if (document.getElementById("culinaire-chat-widget")) {
        return;
      }

      this.injectCSS();
      this.injectHTML();
      this.initializeWidget();
    },

    injectCSS: function () {
      const style = document.createElement("style");
      style.id = "culinaire-chat-styles";
      style.textContent = `
        /* Chat Widget Styles */
        #culinaire-chat-widget {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        
        #culinaire-chat-widget.position-bottom-left {
          left: 24px;
          right: auto;
        }
        
        .culinaire-chat-toggle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ef9396 0%, #e87579 100%);
          border: none;
          cursor: pointer;
          box-shadow: 0 0px 12px 0px rgb(0 0 0 / 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .culinaire-chat-toggle:hover {
          box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
          background: linear-gradient(135deg, #f4b4b7 0%, #ef9396 100%);
        }
        
        .culinaire-chat-toggle.open {
          background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
          transform: rotate(45deg);
        }
        
        .culinaire-chat-icon,
        .culinaire-close-icon {
          width: 24px;
          height: 24px;
          stroke: white;
          stroke-width: 2.5;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: absolute;
        }
        
        .culinaire-close-icon {
          opacity: 0;
          transform: rotate(90deg);
        }
        
        .culinaire-chat-toggle.open .culinaire-chat-icon {
          opacity: 0;
          transform: rotate(-90deg);
        }
        
        .culinaire-chat-toggle.open .culinaire-close-icon {
          opacity: 1;
          transform: rotate(45deg);
        }
        
        .culinaire-chat-window {
          position: absolute;
          bottom: 84px;
          right: 0;
          width: 400px;
          height: 600px;
          background: #ffffff;
          border-radius: 1rem;
          box-shadow: 0 0px 12px 0px rgb(0 0 0 / 0.1);
          opacity: 0;
          visibility: hidden;
          transform: translateY(30px) scale(0.9);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #f1f5f9;
        }
        
        #culinaire-chat-widget.position-bottom-left .culinaire-chat-window {
          left: 0;
          right: auto;
        }
        
        .culinaire-chat-window.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
        }
        
        .culinaire-chat-header {
          background: linear-gradient(135deg, #ef9396 0%, #e87579 100%);
          color: white;
          padding: 20px 24px;
          border-radius: 1rem 1rem 0 0;
        }
        
        .culinaire-chat-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .culinaire-chat-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .culinaire-chat-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        
        .culinaire-chat-header h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 2px 0;
        }
        
        .culinaire-chat-header p {
          opacity: 0.9;
          font-size: 13px;
          font-weight: 400;
          margin: 0;
        }
        
        .culinaire-chat-messages {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background: #f9f9f9;
          scrollbar-width: thin;
          scrollbar-color: #ef9396 transparent;
        }
        
        .culinaire-chat-messages::-webkit-scrollbar {
          width: 4px;
        }
        
        .culinaire-chat-messages::-webkit-scrollbar-thumb {
          background: #ef9396;
          border-radius: 2px;
        }
        
        .culinaire-message {
          margin-bottom: 16px;
          animation: culinaireMessageSlide 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes culinaireMessageSlide {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .culinaire-message.user {
          display: flex;
          justify-content: flex-end;
        }
        
        .culinaire-message.assistant {
          display: flex;
          justify-content: flex-start;
        }
        
        .culinaire-message-bubble {
          max-width: 85%;
          padding: 12px 16px;
          border-radius: 0.75rem;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
          white-space: normal;
          position: relative;
        }
        
        .culinaire-message.user .culinaire-message-bubble {
          background: linear-gradient(135deg, #ef9396 0%, #e87579 100%);
          color: white;
          border-radius: 0.75rem 0.75rem 4px 0.75rem;
          box-shadow: 0 0px 4px 0 rgb(0 0 0 / 0.05);
        }
        
        .culinaire-message.assistant .culinaire-message-bubble {
          background: #ffffff;
          color: #0f172a;
          border: 1px solid #f1f5f9;
          box-shadow: 0 0px 4px 0 rgb(0 0 0 / 0.05);
        }
        
        .culinaire-message.assistant .culinaire-message-bubble ul,
        .culinaire-message.assistant .culinaire-message-bubble ol {
          padding-left: 20px;
          margin: 12px 0;
        }
        
        .culinaire-message.assistant .culinaire-message-bubble h1,
        .culinaire-message.assistant .culinaire-message-bubble h2,
        .culinaire-message.assistant .culinaire-message-bubble h3,
        .culinaire-message.assistant .culinaire-message-bubble h4,
        .culinaire-message.assistant .culinaire-message-bubble h5,
        .culinaire-message.assistant .culinaire-message-bubble h6 {
          font-size: 14px;
          font-weight: 600;
          margin: 8px 0 4px 0;
        }
        
        .culinaire-message.assistant .culinaire-message-bubble h1 { font-size: 16px; }
        .culinaire-message.assistant .culinaire-message-bubble h2 { font-size: 15px; }
        
        .culinaire-welcome-message {
          text-align: center;
          color: #64748b;
          font-style: italic;
          margin: 40px 0;
          font-size: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        
        .culinaire-chat-input-container {
          padding: 16px;
          background: #ffffff;
          border-top: 1px solid #f1f5f9;
          border-radius: 0 0 1rem 1rem;
        }
        
        .culinaire-chat-input-form {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }
        
        .culinaire-chat-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #f1f5f9;
          border-radius: 0.75rem;
          font-size: 14px;
          outline: none;
          resize: none;
          min-height: 44px;
          max-height: 120px;
          font-family: inherit;
          background: #ffffff;
          color: #0f172a;
          overflow: hidden;
        }
        
        .culinaire-chat-input:focus {
          border-color: #ef9396;
          box-shadow: 0 0 0 3px rgba(239, 147, 150, 0.1);
        }
        
        .culinaire-send-button {
          background: linear-gradient(135deg, #ef9396 0%, #e87579 100%);
          color: white;
          border: none;
          border-radius: 0.75rem;
          width: 44px;
          height: 44px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          box-shadow: 0 0px 4px 0 rgb(0 0 0 / 0.05);
        }
        
        .culinaire-send-button:hover:not(:disabled) {
          box-shadow: 0 0px 8px 0px rgb(0 0 0 / 0.07);
          background: linear-gradient(135deg, #f4b4b7 0%, #ef9396 100%);
        }
        
        .culinaire-send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .culinaire-typing-indicator {
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          max-width: 85%;
        }
        
        .culinaire-typing-dots {
          display: flex;
          gap: 4px;
        }
        
        .culinaire-typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ef9396;
          animation: culinaireTypingBounce 1.4s ease-in-out infinite;
        }
        
        .culinaire-typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .culinaire-typing-dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes culinaireTypingBounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        
        /* Mobile responsive */
        @media (max-width: 480px) {
          #culinaire-chat-widget {
            bottom: 16px;
            right: 16px;
          }
          
          #culinaire-chat-widget.position-bottom-left {
            left: 16px;
          }
          
          .culinaire-chat-window {
            width: calc(100vw - 32px);
            height: calc(100vh - 140px);
            max-height: 600px;
            bottom: 80px;
            right: -8px;
          }
          
          #culinaire-chat-widget.position-bottom-left .culinaire-chat-window {
            left: -8px;
            right: auto;
          }
          
          .culinaire-message-bubble {
            max-width: 90%;
          }
        }
      `;

      document.head.appendChild(style);
    },

    injectHTML: function () {
      const widgetHTML = `
        <div id="culinaire-chat-widget" class="position-${this.config.position}">
          <button class="culinaire-chat-toggle" aria-label="Ouvrir l'assistant culinaire">
            <svg class="culinaire-chat-icon" viewBox="0 0 24 24" fill="none">
              <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6z"/>
              <line x1="6" y1="17" x2="18" y2="17"/>
            </svg>
            <svg class="culinaire-close-icon" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          
          <div class="culinaire-chat-window">
            <div class="culinaire-chat-header">
              <div class="culinaire-chat-header-content">
                <div class="culinaire-chat-header-left">
                  <div class="culinaire-chat-avatar">👨‍🍳</div>
                  <div>
                    <h3>Assistant Culinaire</h3>
                    <p>Votre expert en recettes</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="culinaire-chat-messages">
              <div class="culinaire-welcome-message">
                <div style="font-size: 32px; margin-bottom: 8px;">🍴</div>
                <div>
                  <strong>Bonjour et bienvenue !</strong><br/>
                  Je suis votre assistant culinaire personnel. Posez-moi vos questions sur les recettes, ingrédients, techniques de cuisine et plus encore !
                </div>
              </div>
            </div>
            
            <div class="culinaire-chat-input-container">
              <form class="culinaire-chat-input-form">
                <textarea 
                  class="culinaire-chat-input" 
                  placeholder="Demandez-moi une recette, un conseil cuisine..."
                  rows="1"
                ></textarea>
                <button type="submit" class="culinaire-send-button" aria-label="Envoyer le message">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML("beforeend", widgetHTML);
    },

    initializeWidget: function () {
      const widget = document.getElementById("culinaire-chat-widget");
      const toggle = widget.querySelector(".culinaire-chat-toggle");
      const chatWindow = widget.querySelector(".culinaire-chat-window");
      const chatMessages = widget.querySelector(".culinaire-chat-messages");
      const chatForm = widget.querySelector(".culinaire-chat-input-form");
      const chatInput = widget.querySelector(".culinaire-chat-input");
      const sendButton = widget.querySelector(".culinaire-send-button");

      let isOpen = false;
      let sessionId = this.getOrCreateSessionId();

      // Toggle chat window
      toggle.addEventListener("click", () => {
        isOpen = !isOpen;
        toggle.classList.toggle("open", isOpen);
        chatWindow.classList.toggle("open", isOpen);

        if (isOpen) {
          setTimeout(() => chatInput.focus(), 300);
        }
      });

      // Close on outside click
      document.addEventListener("click", (e) => {
        if (isOpen && !widget.contains(e.target)) {
          isOpen = false;
          toggle.classList.remove("open");
          chatWindow.classList.remove("open");
        }
      });

      // Auto-resize textarea
      chatInput.addEventListener("input", () => {
        chatInput.style.height = "auto";
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + "px";
      });

      // Handle form submission
      chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.sendMessage(chatInput, chatMessages, sendButton, sessionId);
      });

      // Handle Enter key
      chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage(chatInput, chatMessages, sendButton, sessionId);
        }
      });
    },

    getOrCreateSessionId: function () {
      let sessionId = localStorage.getItem("culinaire_chat_session_id");
      if (!sessionId) {
        sessionId =
          "culinaire_" +
          Date.now() +
          "_" +
          Math.random().toString(36).substr(2, 9);
        localStorage.setItem("culinaire_chat_session_id", sessionId);
      }
      return sessionId;
    },

    sendMessage: async function (
      chatInput,
      chatMessages,
      sendButton,
      sessionId
    ) {
      const message = chatInput.value.trim();
      if (!message) return;

      // Add user message
      this.addMessage(chatMessages, message, "user");
      chatInput.value = "";
      chatInput.style.height = "auto";

      // Show typing indicator
      this.showTypingIndicator(chatMessages);
      sendButton.disabled = true;

      try {
        const response = await this.sendToAPI(message, sessionId);
        this.hideTypingIndicator(chatMessages);

        const responseText = this.extractResponseText(response);
        this.addMessage(chatMessages, responseText, "assistant");
      } catch (error) {
        console.error("Error sending message:", error);
        this.hideTypingIndicator(chatMessages);
        this.addMessage(
          chatMessages,
          "Désolé, une erreur est survenue. Veuillez réessayer.",
          "assistant"
        );
      } finally {
        sendButton.disabled = false;
        chatInput.focus();
      }
    },

    addMessage: function (chatMessages, content, type) {
      // Remove welcome message if it exists
      const welcomeMessage = chatMessages.querySelector(
        ".culinaire-welcome-message"
      );
      if (welcomeMessage) {
        welcomeMessage.remove();
      }

      const messageDiv = document.createElement("div");
      messageDiv.className = `culinaire-message ${type}`;

      const bubbleDiv = document.createElement("div");
      bubbleDiv.className = "culinaire-message-bubble";

      if (type === "assistant") {
        bubbleDiv.innerHTML = content;
      } else {
        bubbleDiv.textContent = content;
      }

      messageDiv.appendChild(bubbleDiv);
      chatMessages.appendChild(messageDiv);

      // Scroll to bottom
      setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 100);
    },

    showTypingIndicator: function (chatMessages) {
      const typingDiv = document.createElement("div");
      typingDiv.className = "culinaire-typing-indicator";
      typingDiv.innerHTML = `
        <div class="culinaire-typing-dots">
          <div class="culinaire-typing-dot"></div>
          <div class="culinaire-typing-dot"></div>
          <div class="culinaire-typing-dot"></div>
        </div>
      `;

      chatMessages.appendChild(typingDiv);
      setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 100);
    },

    hideTypingIndicator: function (chatMessages) {
      const typingIndicator = chatMessages.querySelector(
        ".culinaire-typing-indicator"
      );
      if (typingIndicator) {
        typingIndicator.remove();
      }
    },

    sendToAPI: async function (message, sessionId) {
      const payload = {
        chatInput: message,
        sessionId: sessionId,
        createdAt: new Date().toISOString(),
        source: "culinaire_widget",
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (this.config.apiKey) {
        headers["Authorization"] = `Bearer ${this.config.apiKey}`;
      }

      const response = await fetch(this.config.n8nWebhookUrl, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: headers,
        mode: "cors",
        credentials: "omit",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();

      try {
        return JSON.parse(text);
      } catch (e) {
        return text.trim();
      }
    },

    extractResponseText: function (response) {
      if (Array.isArray(response)) {
        if (response.length > 0 && response[0].output) {
          return response[0].output;
        }
        return "J'ai reçu une réponse dans un format inattendu. Veuillez réessayer.";
      }

      if (response && typeof response === "object") {
        if (response.output) return response.output;
        if (response.text) return response.text;
        if (response.message) return response.message;
      }

      if (typeof response === "string") {
        return response;
      }

      return "Je m'excuse, mais j'ai rencontré une erreur lors du traitement de votre demande. Veuillez réessayer.";
    },
  };

  // Auto-initialize if autoLoad is true
  if (window.CulinaireChat.config.autoLoad) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        window.CulinaireChat.init();
      });
    } else {
      window.CulinaireChat.init();
    }
  }
})();
