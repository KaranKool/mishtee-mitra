"use client";

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- 1. CONFIGURATION & SETUP ---

// Ensure these are in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- 2. DATA LOGIC ---

/**
 * AUTH: Check if phone exists in 'agents' table.
 */
async function verifyAgent(phoneNumber: string) {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('phone_number', phoneNumber)
    .single();

  if (error || !data) {
    console.error("Auth Error:", error?.message);
    return null;
  }
  return data;
}

/**
 * FETCH JOB: Get the current active job (Pending OR Out for Delivery).
 */
async function getLatestJob(agentId: string) {
  // We look for jobs that are NOT yet delivered
  const { data, error } = await supabase
    .from('orders')
    .select(`
      order_id,
      status,
      qty_kg,
      customers (
        full_name,
        delivery_address,
        lat,
        lon
      )
    `)
    .eq('agent_id', agentId)
    .in('status', ['Pending', 'Out for Delivery']) 
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return null; // No active job found

  const customerData = data.customers as any;

  return {
    order_id: data.order_id,
    status: data.status,
    qty_kg: data.qty_kg,
    customer_name: customerData?.full_name || 'Unknown',
    delivery_address: customerData?.delivery_address || null,
    lat: customerData?.lat,
    lon: customerData?.lon
  };
}

/**
 * UPDATE: Change status in DB (e.g., 'Out for Delivery' or 'Delivered')
 */
async function updateOrderStatus(orderId: string, newStatus: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('order_id', orderId)
    .select();

  if (error) throw new Error(error.message);
  return data;
}

// --- 3. MAIN UI COMPONENT ---

export default function MishTeeDeliveryApp() {
  // --- View State Management ---
  // VIEWS: 'LOGIN' | 'DASHBOARD' | 'POD' | 'SUCCESS'
  const [view, setView] = useState<'LOGIN' | 'DASHBOARD' | 'POD' | 'SUCCESS'>('LOGIN');
  
  // Data State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [agent, setAgent] = useState<any>(null);
  const [currentJob, setCurrentJob] = useState<any>(null);

  // PoD State
  const [recipientName, setRecipientName] = useState('');
  
  // Theme
  const THEME = {
    primary: '#FF6B00', // mishTee Orange
    bg: '#F3F4F6',
    textDark: '#1F2937',
    white: '#FFFFFF',
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    radius: '16px',
    success: '#10B981',
  };

  // --- HANDLERS ---

  // 1. Login Handler
  async function handleLogin() {
    setError('');
    setLoading(true);
    try {
      const agentData = await verifyAgent(phoneInput);
      if (!agentData) {
        setError('Agent not found. Check number.');
        setLoading(false);
        return;
      }
      setAgent(agentData);
      
      // Fetch Job
      const jobData = await getLatestJob(agentData.agent_id);
      setCurrentJob(jobData);
      setView('DASHBOARD');
    } catch (err) {
      setError('Connection failed.');
    } finally {
      setLoading(false);
    }
  }

  // 2. Start Route Handler
  async function handleStartRoute() {
    if (!currentJob) return;
    setLoading(true);
    try {
      await updateOrderStatus(currentJob.order_id, 'Out for Delivery');
      setCurrentJob({ ...currentJob, status: 'Out for Delivery' });
    } catch (err) {
      alert('Update failed');
    } finally {
      setLoading(false);
    }
  }

  // 3. Complete Delivery Handler (PoD)
  async function handleCompleteDelivery() {
    if (!recipientName.trim()) {
      alert("Please enter recipient name/initials.");
      return;
    }
    setLoading(true);
    try {
      await updateOrderStatus(currentJob.order_id, 'Delivered');
      setView('SUCCESS');
    } catch (err) {
      alert('Failed to close order.');
    } finally {
      setLoading(false);
    }
  }

  // 4. Fetch Next Job Handler
  async function handleFetchNext() {
    setLoading(true);
    try {
      const jobData = await getLatestJob(agent.agent_id);
      setCurrentJob(jobData);
      setRecipientName(''); // Reset PoD input
      setView('DASHBOARD');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // --- RENDER HELPERS ---

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
        backgroundColor: THEME.bg, color: THEME.primary, fontWeight: 'bold'
      }}>
        Updating mishTee...
      </div>
    );
  }

  // --- VIEW 1: LOGIN ---
  if (view === 'LOGIN') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.bg, fontFamily: 'sans-serif' }}>
        <div style={{ width: '90%', maxWidth: '400px', backgroundColor: THEME.white, padding: '30px', borderRadius: THEME.radius, boxShadow: THEME.shadow, textAlign: 'center' }}>
          <img src="https://raw.githubusercontent.com/KaranKool/mishtee-magic/main/mishTee_logo.png" style={{ width: '80px', marginBottom: '20px' }} alt="Logo" />
          <h2 style={{ color: THEME.textDark, marginBottom: '20px' }}>Partner Login</h2>
          <input type="tel" placeholder="Enter Mobile Number" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '15px' }}>{error}</p>}
          <button onClick={handleLogin} style={{ width: '100%', padding: '14px', backgroundColor: THEME.primary, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Log In</button>
        </div>
      </div>
    );
  }

  // --- VIEW 4: SUCCESS ---
  if (view === 'SUCCESS') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ECFDF5', fontFamily: 'sans-serif', padding: '20px' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎉</div>
        <h1 style={{ color: '#065F46', marginBottom: '10px' }}>Job Well Done!</h1>
        <p style={{ color: '#047857', textAlign: 'center', marginBottom: '30px' }}>
          Order {currentJob?.order_id} has been delivered successfully.
        </p>
        <button onClick={handleFetchNext} style={{ width: '100%', maxWidth: '300px', padding: '16px', backgroundColor: THEME.success, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}>
          Find Next Assignment
        </button>
      </div>
    );
  }

  // --- VIEW 3: POD (Proof of Delivery) ---
  if (view === 'POD') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)', fontFamily: 'sans-serif', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100 }}>
        <div style={{ width: '90%', maxWidth: '400px', backgroundColor: THEME.white, padding: '30px', borderRadius: THEME.radius, boxShadow: THEME.shadow }}>
          <h3 style={{ marginTop: 0, color: THEME.textDark }}>Proof of Delivery</h3>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>
            Please ask the customer to provide their name or initials to confirm receipt.
          </p>
          
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: THEME.textDark }}>
            RECIPIENT INITIALS / NAME
          </label>
          <input 
            type="text" 
            autoFocus
            placeholder="e.g. A. Mehta"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '25px', borderRadius: '8px', border: '2px solid #E5E7EB', fontSize: '18px', boxSizing: 'border-box' }} 
          />
          
          <button onClick={handleCompleteDelivery} style={{ width: '100%', padding: '16px', backgroundColor: THEME.success, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginBottom: '10px' }}>
            ✅ Confirm Delivery
          </button>
          <button onClick={() => setView('DASHBOARD')} style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#6B7280', border: 'none', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW 2: DASHBOARD (Standard View) ---
  const mapLat = currentJob?.lat || 19.0760;
  const mapLon = currentJob?.lon || 72.8777;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: THEME.bg, fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <header style={{ width: '100%', maxWidth: '500px', backgroundColor: THEME.white, padding: '20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="https://raw.githubusercontent.com/KaranKool/mishtee-magic/main/mishTee_logo.png" style={{ width: '40px' }} alt="Logo" />
          <span style={{ fontWeight: 'bold', color: THEME.primary }}>Delivery Mitra</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: THEME.success, borderRadius: '50%' }}></div>
          <span style={{ fontSize: '12px', color: THEME.success, fontWeight: 'bold' }}>ONLINE</span>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ width: '100%', maxWidth: '500px', padding: '20px', boxSizing: 'border-box' }}>
        <h3 style={{ color: THEME.textDark, marginBottom: '15px' }}>Current Task</h3>

        {currentJob ? (
          <div style={{ backgroundColor: THEME.white, borderRadius: THEME.radius, padding: '20px', boxShadow: THEME.shadow, overflow: 'hidden' }}>
            
            {/* Task Header */}
            <div style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>DELIVER TO</p>
                <h2 style={{ margin: 0, color: THEME.textDark }}>{currentJob.customer_name}</h2>
              </div>
              <div style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', backgroundColor: currentJob.status === 'Out for Delivery' ? '#DEF7EC' : '#FEF3C7', color: currentJob.status === 'Out for Delivery' ? '#03543F' : '#92400E' }}>
                {currentJob.status}
              </div>
            </div>

            {/* Address */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
               <span style={{ fontSize: '20px' }}>📍</span>
               <p style={{ margin: 0, color: '#4B5563', lineHeight: '1.5' }}>{currentJob.delivery_address || "No address provided"}</p>
            </div>

            {/* Map */}
            {(currentJob?.lat && currentJob?.lon) ? (
               <div style={{ width: '100%', height: '200px', backgroundColor: '#eee', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                 <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapLon-0.01}%2C${mapLat-0.01}%2C${mapLon+0.01}%2C${mapLat+0.01}&layer=mapnik&marker=${mapLat}%2C${mapLon}`} style={{ border: 'none' }}></iframe>
               </div>
            ) : (
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#F9FAFB', borderRadius: '8px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>Map unavailable (No coordinates in DB)</div>
            )}

            {/* ACTION BUTTONS LOGIC */}
            {currentJob.status === 'Pending' ? (
              <button onClick={handleStartRoute} style={{ width: '100%', padding: '16px', backgroundColor: THEME.primary, color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                🚀 Start Route
              </button>
            ) : (
              <button onClick={() => setView('POD')} style={{ width: '100%', padding: '16px', backgroundColor: THEME.success, color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                ✍️ Mark as Delivered
              </button>
            )}

          </div>
        ) : (
          <div style={{ backgroundColor: THEME.white, borderRadius: THEME.radius, padding: '40px 20px', textAlign: 'center', boxShadow: THEME.shadow }}>
            <p style={{ color: '#6B7280' }}>No active tasks assigned.</p>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '8px' }}>Relax and wait for the next order!</p>
          </div>
        )}
      </main>
    </div>
  );
}
