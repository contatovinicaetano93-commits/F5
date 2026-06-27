'use client';

import { useState } from 'react';

const WHATSAPP_NUMBER = '5511993455589';
const WHATSAPP_MSG = encodeURIComponent(
  'Olá! Vim pelo portal F5 e gostaria de saber mais.',
);

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.413A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.182a8.182 8.182 0 01-4.178-1.145l-.3-.178-3.1.88.878-3.22-.196-.31A8.182 8.182 0 1112 20.182z" />
    </svg>
  );
}

function IconAI() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 2a7 7 0 017 7c0 2.5-1.3 4.7-3.2 6l-.3.2V17a2 2 0 01-2 2h-3a2 2 0 01-2-2v-1.8l-.3-.2A7 7 0 0112 2z" strokeLinejoin="round" />
      <path d="M9 21h6M10 17v-2M14 17v-2" strokeLinecap="round" />
      <circle cx="9.5" cy="10" r=".8" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="10" r=".8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function FloatingButtons() {
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Olá! Sou o assistente F5. Como posso ajudar com sua operação nos marketplaces?' },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  const sendMessage = async () => {
    const text = aiInput.trim();
    if (!text || aiLoading) return;
    setAiInput('');
    setAiMessages((prev) => [...prev, { role: 'user', text }]);
    setAiLoading(true);

    try {
      const res = await fetch('/api/client/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setAiMessages((prev) => [...prev, { role: 'ai', text: data.reply ?? 'Sem resposta.' }]);
      } else {
        setAiMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: 'Para suporte especializado, entre em contato com a equipe F5 pelo WhatsApp.',
          },
        ]);
      }
    } catch {
      setAiMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Erro de conexão. Tente novamente ou acione o WhatsApp.' },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      {/* AI Chat Panel */}
      {aiOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 96,
            right: 24,
            width: 340,
            maxHeight: 480,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 16px 48px rgba(10,22,40,0.18)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
            border: '1px solid rgba(0,102,255,0.12)',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0D1B2A 0%, #0066FF 100%)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(0,212,255,0.2)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#00D4FF',
                }}
              >
                <IconAI />
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Assistente F5</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Operação nos marketplaces</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAiOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 6,
                color: '#fff',
                cursor: 'pointer',
                padding: 6,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <IconClose />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {aiMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  background: msg.role === 'user' ? '#0066FF' : '#F0F4F9',
                  color: msg.role === 'user' ? '#fff' : '#1a2332',
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {msg.text}
              </div>
            ))}
            {aiLoading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 14px',
                  borderRadius: '12px 12px 12px 4px',
                  background: '#F0F4F9',
                  fontSize: 13,
                  color: '#5c6b82',
                }}
              >
                Digitando...
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid rgba(0,0,0,0.06)',
              display: 'flex',
              gap: 8,
            }}
          >
            <input
              type="text"
              placeholder="Pergunte sobre sua operação..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              style={{
                flex: 1,
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={aiLoading || !aiInput.trim()}
              style={{
                background: '#0066FF',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                padding: '8px 12px',
                cursor: aiLoading ? 'not-allowed' : 'pointer',
                opacity: aiLoading || !aiInput.trim() ? 0.5 : 1,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <IconSend />
            </button>
          </div>
        </div>
      )}

      {/* Floating Buttons Stack */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          zIndex: 999,
        }}
      >
        {/* AI Button */}
        <button
          type="button"
          onClick={() => setAiOpen(!aiOpen)}
          title="Assistente F5"
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: aiOpen
              ? 'linear-gradient(135deg, #0066FF 0%, #00D4FF 100%)'
              : 'linear-gradient(135deg, #0D1B2A 0%, #0A2540 100%)',
            border: '1px solid rgba(0,102,255,0.3)',
            color: aiOpen ? '#fff' : '#00D4FF',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 4px 16px rgba(0,102,255,0.25)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          }}
        >
          {aiOpen ? <IconClose /> : <IconAI />}
        </button>

        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Fale com a equipe F5 no WhatsApp"
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: '#25D366',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 4px 16px rgba(37,211,102,0.35)',
            textDecoration: 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.08)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';
          }}
        >
          <IconWhatsApp />
        </a>
      </div>
    </>
  );
}
