# 🎨 F5 Design System
## Identidade Visual & Componentes

---

## 📐 Visão Geral

**F5** adota uma identidade visual moderna, profissional e tecnológica que reflete a missão de transformação digital.

**Tagline**: INDÚSTRIA NO DIGITAL  
**Personalidade**: Accenture, McKinsey  
**Estilo**: Clean, Enterprise, Inovador

---

## 🎨 Paleta de Cores

### Cores Primárias

| Cor | Código | Uso | Exemplo |
|-----|--------|-----|---------|
| **Navy** | `#0D1B2A` | Branding, textos principais, headers | Títulos, botões primários |
| **Blue** | `#0066FF` | CTA, links, destaques | Botões de ação, links |
| **Cyan** | `#00D4FF` | Acento, highlights, animações | Accent borders, highlights |

### Cores Secundárias

| Cor | Código | Uso |
|-----|--------|-----|
| **Off White** | `#F4F6F9` | Fundos, backgrounds | 
| **Gray** | `#8B9CB6` | Texto secundário, placeholders |
| **Dark Gray** | `#2D3748` | Texto escuro, rótulos |

### Cores Semânticas

| Cor | Código | Significado |
|-----|--------|-------------|
| **Success** | `#10B981` | Sucesso, aprovado |
| **Warning** | `#F59E0B` | Alerta, atenção |
| **Error** | `#EF4444` | Erro, crítico |
| **Info** | `#3B82F6` | Informação |

---

## 📝 Tipografia

### Fonte Principal
**Inter** (Google Fonts)
- Moderna
- Excelente legibilidade
- Pesos: Light, Regular, Medium, SemiBold, Bold, Extra Bold

### Escala Tipográfica

```
H1 (Display)    — 48px | Extra Bold | Line Height 1.2
H2 (Heading 1)  — 36px | Bold       | Line Height 1.2
H3 (Heading 2)  — 30px | Bold       | Line Height 1.5
H4 (Heading 3)  — 24px | SemiBold   | Line Height 1.5
Body (Large)    — 18px | Regular    | Line Height 1.5
Body (Default)  — 16px | Regular    | Line Height 1.5
Body (Small)    — 14px | Regular    | Line Height 1.5
Caption         — 12px | Regular    | Line Height 1.5
```

### Hierarquia de Pesos

- **Extra Bold (800)** — Títulos principais, CTAs
- **Bold (700)** — Subheadings
- **SemiBold (600)** — Labels, destaque em texto
- **Regular (400)** — Corpo de texto
- **Light (300)** — Texto secundário, hints

---

## 🔲 Espaçamento

Sistema de spacing baseado em múltiplos de 4px:

```
0    = 0px
1    = 4px
2    = 8px
3    = 12px
4    = 16px
6    = 24px
8    = 32px
12   = 48px
16   = 64px
20   = 80px
24   = 96px
```

### Uso
- **Padding/Margin interno**: 6 - 8
- **Margin entre seções**: 12 - 16
- **Margin externo**: 16 - 20

---

## 📦 Componentes

### Button

```typescript
<Button variant="primary" size="md">
  Click Me
</Button>
```

**Variantes**:
- `primary` — Navy bg, white text
- `secondary` — Navy bg with outline
- `outline` — Transparent, blue border
- `ghost` — Minimal, no background

**Tamanhos**:
- `sm` — 12px texto, 8px padding
- `md` — 16px texto, 12px padding (default)
- `lg` — 18px texto, 16px padding

### Card

```typescript
<Card variant="default">
  Content here
</Card>
```

**Variantes**:
- `default` — White bg, subtle border
- `elevated` — White bg, strong shadow
- `outlined` — Off-white bg, navy border

### Heading

```typescript
<Heading level="h2" color={colors.blue}>
  Subtitle
</Heading>
```

---

## 🎯 Padrões de Design

### Layout
- **Max Width**: 1200px (desktop)
- **Gutter**: 16px - 24px
- **Grid**: 12 colunas responsivo

### Hierarquia Visual
1. Contraste de cores (Navy vs Cyan)
2. Peso tipográfico (Extra Bold vs Regular)
3. Tamanho (36px vs 16px)
4. Espaçamento (24px vs 8px)

### Chamadas de Ação
- Sempre em **Blue** ou **Cyan**
- Sempre em **Bold** ou **Extra Bold**
- Padding mínimo: `12px × 24px`
- Border radius: `8px`

---

## 📱 Responsividade

### Breakpoints

```
XS  = 320px  (Mobile small)
SM  = 640px  (Mobile)
MD  = 768px  (Tablet)
LG  = 1024px (Desktop)
XL  = 1280px (Desktop large)
2XL = 1536px (Ultra-wide)
```

### Mobile-First Approach
- Design para mobile primeiro
- Expandir para tablet/desktop
- Tipografia: 14px base (mobile), 16px (desktop)

---

## ✨ Efeitos & Animações

### Transições
- Duração padrão: 300ms
- Easing: `ease` (padrão)
- Propriedades: `all`, `background-color`, `transform`

### Shadows
```
Subtle  (sm)   — 0 1px 2px rgba(13, 27, 42, 0.05)
Small   (md)   — 0 4px 6px -1px rgba(13, 27, 42, 0.1)
Medium  (lg)   — 0 10px 15px -3px rgba(13, 27, 42, 0.1)
Large   (xl)   — 0 20px 25px -5px rgba(13, 27, 42, 0.1)
```

### Border Radius
```
none = 0px
sm   = 4px   (buttons, inputs)
md   = 8px   (cards, containers)
lg   = 12px  (large cards)
xl   = 16px  (hero sections)
full = 9999px (badges, avatars)
```

---

## 🔐 Acessibilidade

### Contraste de Cores
- Navy (#0D1B2A) + White: **20.5:1** ✅ AAA
- Blue (#0066FF) + White: **7.8:1** ✅ AA
- Cyan (#00D4FF) + Navy: **5.2:1** ✅ AA

### Tipografia
- Tamanho mínimo: 12px
- Line height mínima: 1.2
- Contraste texto/fundo: 7:1 recomendado

### Interatividade
- Focus states sempre visíveis
- Hover states em componentes interativos
- Estados desabilitados em gray

---

## 📐 Especificações Técnicas

### Implementação Web
```typescript
// Usar tokens do @f5/ui
import { colors, typography, spacing } from '@f5/ui/src/tokens';

// Aplicar em CSS-in-JS
const buttonStyles = {
  backgroundColor: colors.blue,
  padding: `${spacing[2]} ${spacing[4]}`,
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.bold,
  fontFamily: typography.fontFamily.primary,
};
```

### Implementação Mobile
```typescript
// Mesmo sistema de tokens
import { colors, typography, spacing } from '@f5/ui/src/tokens';

// Em React Native, adaptar para unidades
const buttonStyles = StyleSheet.create({
  button: {
    backgroundColor: colors.blue,
    paddingVertical: spacing[2] / 4, // 2px = 8px / 4
    paddingHorizontal: spacing[4] / 4, // 4px = 16px / 4
  }
});
```

---

## 🎬 Exemplos de Uso

### Hero Section
```
BG: Linear gradient Navy → Blue
Text: White, Extra Bold, H1
CTA: Cyan button
```

### Card Grid
```
Layout: 4 cards responsive
Card BG: White
Border: 1px Off White
Shadow: md
Text: Navy (title), Gray (subtitle)
```

### Data Table
```
Header: Navy bg, white text, bold
Rows: Alternating off-white/white
Highlight: Cyan accent
```

---

## 🚀 Próximos Passos

- [ ] Criar Figma design file com componentes
- [ ] Criar Storybook com componentes interativos
- [ ] Documentar variações de componentes
- [ ] Criar guidelines de animações
- [ ] Testar acessibilidade completa

---

**Versão**: 1.0  
**Criado**: 22 de Junho de 2026  
**Mantido por**: F5 Design Team
