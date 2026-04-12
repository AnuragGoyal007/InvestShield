import React, { useState, useRef } from 'react';
import Papa from 'papaparse';

export default function HoldingsImport({ onUploadSuccess, loading }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file.");
      return;
    }

    setError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          console.warn("CSV Error:", results.errors);
        }
        if (results.data && results.data.length > 0) {
          onUploadSuccess(results.data);
        } else {
          setError("The CSV appears to be empty or unreadable.");
        }
      },
      error: (error) => {
        setError(`Failed to parse CSV: ${error.message}`);
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div style={{ marginTop: '32px' }} className="animate-cascade-2">
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragActive ? '#00e5ff' : 'rgba(0, 229, 255, 0.3)'}`,
          borderRadius: '16px',
          padding: '60px 24px',
          textAlign: 'center',
          background: dragActive ? 'rgba(0, 229, 255, 0.05)' : 'rgba(15, 20, 35, 0.4)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".csv" 
          onChange={handleChange} 
          style={{ display: 'none' }} 
        />
        
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="loading-spinner-large" style={{ marginBottom: 16 }}></div>
            <h3 style={{ color: '#00e5ff', margin: 0, fontFamily: 'Outfit' }}>Analyzing Portfolio...</h3>
            <p style={{ color: '#a1a1aa', margin: '8px 0 0', fontSize: 14 }}>Our ML models are scoring your assets securely.</p>
          </div>
        ) : (
          <>
             <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.8 }}>📊</div>
             <h3 style={{ fontSize: '24px', color: '#fff', fontFamily: 'Outfit', margin: '0 0 8px 0' }}>
               Upload Your Holdings Report
             </h3>
             <p style={{ color: '#a1a1aa', margin: '0 0 24px 0', fontSize: '15px' }}>
               Drag & drop your CSV from Groww, INDmoney, or Zerodha, or click to browse.
             </p>
             <button style={{
               background: 'rgba(255,255,255,0.05)',
               border: '1px solid rgba(255,255,255,0.1)',
               color: '#00e5ff',
               padding: '10px 24px',
               borderRadius: '8px',
               fontSize: '14px',
               fontWeight: 600,
               pointerEvents: 'none'
             }}>
               Select CSV File
             </button>
          </>
        )}
      </div>

      {error && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span>⚠️</span> {error}
        </div>
      )}

      <div style={{ 
        marginTop: '24px',
        display: 'flex', 
        alignItems: 'flex-start',
        gap: '16px',
        padding: '20px',
        background: 'rgba(16, 185, 129, 0.05)',
        border: '1px solid rgba(16, 185, 129, 0.15)',
        borderRadius: '12px'
      }}>
        <div style={{ fontSize: '24px' }}>🔒</div>
        <div>
          <h4 style={{ color: '#34d399', margin: '0 0 4px 0', fontSize: '14px' }}>Bank-Grade Privacy</h4>
          <p style={{ color: '#a1a1aa', margin: 0, fontSize: '13px', lineHeight: 1.5 }}>
            Your financial data never leaves your browser. Parsing and structuring is done securely on your device before sending anonymized aggregates to our AI for scoring.
          </p>
        </div>
      </div>
    </div>
  );
}
