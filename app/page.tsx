"use client";

import React, { useState } from 'react';

export default function DeliveryDashboard() {
  const [isOnline, setIsOnline] = useState(true);

  // --- Theme Constants ---
  const THEME = {
    primary: '#FF6B00', // mishTee Orange
    secondary: '#FFF',
    textDark: '#1F2937',
    textGray: '#6B7280',
    bg: '#F3F4F6',
    success: '#10B981',
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    radius: '16px',
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#E5E5E5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      margin: 0,
      padding: 0
    }}>
      {/* Internal Style Tag for Keyframe Animation (CSS-in-JS workaround for Animations) */}
      <style jsx>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.33); opacity: 1; }
          80%, 100% { opacity: 0; }
        }
        @keyframes pulse-dot {
          0% { transform: scale(0.8); }
          50% { transform: scale(1); }
          100% { transform: scale(0.8); }
        }
      `}</style>

      {/* --- Mobile Container --- */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        backgroundColor: '#FFFFFF',
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        
        {/* --- Header Section --- */}
        <header style={{
          padding: '24px',
          paddingTop: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderBottom: '1px solid #F3F4F6'
        }}>
          <img 
            src="https://raw.githubusercontent.com/KaranKool/mishtee-magic/main/mishTee_logo.png" 
            alt="mishTee Logo"
            style={{ width: '80px', height: 'auto', marginBottom: '12px' }} 
          />
          
          <h1 style={{
            color: THEME.primary,
            fontSize: '22px',
            fontWeight: '800',
            margin: '0 0 4px 0',
            letterSpacing: '-0.5px'
          }}>
            mishTee Delivery Mitra
          </h1>

          <p style={{ margin: 0, color: THEME.textGray, fontSize: '14px' }}>
            Partner ID: #MT-8821
          </p>
        </header>

        {/* --- Status Bar --- */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          backgroundColor: '#FAFAFA',
          borderBottom: '1px solid #F3F4F6'
        }}>
          <span style={{ fontWeight: '600', color: THEME.textDark }}>Current Status</span>
          
          <div 
            onClick={() => setIsOnline(!isOnline)}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: isOnline ? '#ECFDF5' : '#FEF2F2',
              padding: '6px 12px',
              borderRadius: '20px',
              border: `1px solid ${isOnline ? '#A7F3D0' : '#FECACA'}`,
              cursor: 'pointer'
            }}
          >
            <div style={{ position: 'relative', width: '10px', height: '10px', marginRight: '8px' }}>
              {isOnline && (
                <div style={{
                  position: 'absolute',
                  width: '100%', height: '100%',
                  backgroundColor: THEME.success,
                  borderRadius: '50%',
                  animation: 'pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
                  opacity: 0.75
                }} />
              )}
              <div style={{
                position: 'relative',
                width: '10px', height: '10px',
                backgroundColor: isOnline ? THEME.success : '#EF4444',
                borderRadius: '50%',
              }} />
            </div>
            <span style={{ 
              fontSize: '13px', 
              fontWeight: '700', 
              color: isOnline ? '#065F46' : '#991B1B' 
            }}>
              {isOnline ? "AGENT ONLINE" : "OFFLINE"}
            </span>
          </div>
        </div>

        {/* --- Main Content Area --- */}
        <main style={{ padding: '24px', flex: 1, backgroundColor: '#F9FAFB' }}>
          
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: THEME.textDark }}>
            Current Task
          </h2>

          {/* --- Task Card --- */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: THEME.radius,
            boxShadow: THEME.shadow,
            padding: '20px',
            border: '1px solid #E5E7EB'
          }}>
            {/* Customer Info Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', textTransform: 'uppercase', color: THEME.textGray, fontWeight: '600', marginBottom: '4px' }}>
                  Deliver To
                </p>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: THEME.textDark }}>
                  Arjun Mehta
                </h3>
              </div>
              <div style={{ 
                backgroundColor: '#EFF6FF', 
                color: '#2563EB', 
                padding: '4px 8px', 
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                height: 'fit-content'
              }}>
                COD: ₹450
              </div>
            </div>

            {/* Address Line */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              marginBottom: '20px',
              paddingBottom: '20px',
              borderBottom: '1px solid #F3F4F6'
            }}>
              <span style={{ fontSize: '18px', marginRight: '8px' }}>📍</span>
              <p style={{ margin: 0, color: '#4B5563', lineHeight: '1.5' }}>
                Flat 402, Sunshine Towers,<br/>
                Andheri West, Mumbai
              </p>
            </div>

            {/* Order Details (Mini) */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <div style={{ flex: 1, backgroundColor: '#FFF7ED', padding: '10px', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#9A3412' }}>Est. Time</p>
                <p style={{ margin: 0, fontWeight: '700', color: '#C2410C' }}>15 Mins</p>
              </div>
              <div style={{ flex: 1, backgroundColor: '#FFF7ED', padding: '10px', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#9A3412' }}>Distance</p>
                <p style={{ margin: 0, fontWeight: '700', color: '#C2410C' }}>2.4 km</p>
              </div>
            </div>

            {/* --- Primary Action Button --- */}
            <button 
              style={{
                width: '100%',
                backgroundColor: THEME.primary,
                color: 'white',
                border: 'none',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(255, 107, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span>🚀</span> Start Navigation
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}
