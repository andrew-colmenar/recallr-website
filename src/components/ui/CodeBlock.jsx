import React, { useState, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './CodeBlock.css';

export const CodeBlock = ({ language, code, filename, highlightLines = [], tabs = null }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  const copyToClipboard = () => {
    const codeToCopy = tabs ? tabs[activeTab].code : code;
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Style for highlighted lines
  const lineProps = (lineNumber) => {
    const style = { display: 'block' };
    
    if (tabs) {
      const currentTab = tabs[activeTab];
      if (currentTab.highlightLines && currentTab.highlightLines.includes(lineNumber)) {
        style.backgroundColor = 'rgba(123, 90, 255, 0.1)';
        style.borderLeft = '3px solid #7B5AFF';
        style.paddingLeft = '12px'; // Add some padding for highlighted lines
      }
    } else if (highlightLines && highlightLines.includes(lineNumber)) {
      style.backgroundColor = 'rgba(123, 90, 255, 0.1)';
      style.borderLeft = '3px solid #7B5AFF';
      style.paddingLeft = '12px'; // Add some padding for highlighted lines
    }
    
    return { style };
  };

  // If tabs are provided, render tabbed interface
  if (tabs) {
    return (
      <div className="premium-code-block">
        <div className="code-tabs">
          {tabs.map((tab, index) => (
            <button 
              key={index}
              className={`code-tab ${activeTab === index ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
            >
              {tab.name}
            </button>
          ))}
        </div>
        
        <div className="code-block-header">
          {tabs[activeTab].filename && (
            <div className="filename">
              <span>{tabs[activeTab].filename}</span>
            </div>
          )}
          <button 
            className="copy-button" 
            onClick={copyToClipboard}
            aria-label="Copy code to clipboard"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        
        <div ref={codeRef} className="code-container">
          <SyntaxHighlighter
            language={tabs[activeTab].language}
            style={vscDarkPlus}
            wrapLines={true}
            lineProps={lineProps}
            showLineNumbers={true}
          >
            {tabs[activeTab].code}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }

  // Regular single code block
  return (
    <div className="premium-code-block">
      <div className="code-block-header">
        {filename && (
          <div className="filename">
            <span>{filename}</span>
          </div>
        )}
        <button 
          className="copy-button" 
          onClick={copyToClipboard}
          aria-label="Copy code to clipboard"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      
      <div ref={codeRef} className="code-container">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          wrapLines={true}
          lineProps={lineProps}
          showLineNumbers={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;