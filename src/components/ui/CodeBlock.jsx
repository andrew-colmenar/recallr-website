import React, { useState, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './CodeBlock.module.css';

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

  // Updated lineProps function
  const lineProps = (lineNumber) => {
    const style = { display: 'block' };
    
    if (tabs) {
      const currentTab = tabs[activeTab];
      if (currentTab.highlightLines && currentTab.highlightLines.includes(lineNumber)) {
        // Instead of using className directly, we need to apply the styles manually
        style.backgroundColor = 'rgba(123, 90, 255, 0.1)';
        style.borderLeft = '3px solid #7B5AFF';
        style.paddingLeft = '12px';
      }
    } else if (highlightLines && highlightLines.includes(lineNumber)) {
      style.backgroundColor = 'rgba(123, 90, 255, 0.1)';
      style.borderLeft = '3px solid #7B5AFF';
      style.paddingLeft = '12px';
    }
    
    return { style };
  };

  // If tabs are provided, render tabbed interface
  if (tabs) {
    return (
      <div className={styles["premium-code-block"]}>
        <div className={styles["code-tabs"]}>
          {tabs.map((tab, index) => (
            <button 
              key={index}
              className={`${styles["code-tab"]} ${activeTab === index ? styles.active : ''}`}
              onClick={() => setActiveTab(index)}
            >
              {tab.name}
            </button>
          ))}
        </div>
        
        <div className={styles["code-block-header"]}>
          {tabs[activeTab].filename && (
            <div className={styles.filename}>
              <span>{tabs[activeTab].filename}</span>
            </div>
          )}
          <button 
            className={`${styles["copy-button"]} ${copied ? styles.copied : ''}`}
            onClick={copyToClipboard}
            aria-label="Copy code to clipboard"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        
        <div ref={codeRef} className={styles["code-container"]}>
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
    <div className={styles["premium-code-block"]}>
      <div className={styles["code-block-header"]}>
        {filename && (
          <div className={styles.filename}>
            <span>{filename}</span>
          </div>
        )}
        <button 
          className={`${styles["copy-button"]} ${copied ? styles.copied : ''}`}
          onClick={copyToClipboard}
          aria-label="Copy code to clipboard"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      
      <div ref={codeRef} className={styles["code-container"]}>
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