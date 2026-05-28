import { createAPIFileRoute } from '@tanstack/react-start/api';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Cache da fonte para não baixar em toda requisição
let fontCache: ArrayBuffer | null = null;

async function getFont() {
  if (fontCache) return fontCache;
  const url = 'https://github.com/google/fonts/raw/main/ofl/inter/Inter-Bold.ttf';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Falha ao baixar fonte');
  fontCache = await res.arrayBuffer();
  return fontCache;
}

export const Route = createAPIFileRoute('/api/og')({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const title = url.searchParams.get('title') || 'Novo Orçamento';
    const color = url.searchParams.get('color') || '#2563eb';
    const logoUrl = url.searchParams.get('logo') || '';

    try {
      const fontData = await getFont();

      const svg = await satori(
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#111827',
            backgroundImage: `radial-gradient(circle at 50% -20%, ${color}40 0%, transparent 70%)`,
            fontFamily: 'Inter',
            position: 'relative',
          }}
        >
          {/* Efeito de borda colorida no topo */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '12px', backgroundColor: color }} />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '60px 80px',
              borderRadius: '32px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                style={{
                  height: '120px',
                  maxWidth: '300px',
                  objectFit: 'contain',
                  marginBottom: '40px',
                }}
              />
            ) : (
              <div style={{ fontSize: 80, marginBottom: 40 }}>📄</div>
            )}
            <h1
              style={{
                fontSize: '64px',
                fontWeight: 700,
                color: 'white',
                margin: 0,
                textAlign: 'center',
                letterSpacing: '-2px',
                lineHeight: 1.1,
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: '32px',
                color: '#9ca3af',
                marginTop: '24px',
                marginBottom: 0,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '4px',
              }}
            >
              Proposta Comercial
            </p>
          </div>
          
          <div style={{ position: 'absolute', bottom: 40, color: '#4b5563', fontSize: 24, fontWeight: 700, letterSpacing: '2px' }}>
            GERADO COM SIMBI
          </div>
        </div>,
        {
          width: 1200,
          height: 630,
          fonts: [
            {
              name: 'Inter',
              data: fontData,
              weight: 700,
              style: 'normal',
            },
          ],
        }
      );

      const resvg = new Resvg(svg, {
        background: '#111827',
        fitTo: { mode: 'width', value: 1200 },
      });

      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();

      return new Response(pngBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (e: any) {
      console.error('Erro gerando imagem OG:', e);
      return new Response('Erro gerando imagem: ' + e.message, { status: 500 });
    }
  },
});
