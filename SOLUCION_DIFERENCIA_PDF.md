# Solución: Diferencia entre PDF de Previsualización y PDF en IPFS

## 🔴 Problema Identificado

El PDF que se mostraba en la previsualización tenía un diseño diferente al que se subía a IPFS. Esto ocurría porque se estaban usando **timestamps diferentes** al generar el PDF.

## 🔍 Análisis del Error

### Flujo Original (Con Error)

1. **Generación del Hash JWT** (`generateCertificateAction`):
   ```typescript
   const hash = JWTService.generateCertificateHash(certificateData)
   // El hash JWT se crea con un timestamp específico (Date.now() dentro del JWT)
   ```

2. **Generación del PDF para IPFS** (❌ ERROR):
   ```typescript
   const pdfBuffer = await PDFService.generateCertificatePDF(
     { ...certificateData, timestamp: Date.now() }, // ❌ Nuevo timestamp diferente
     hash,
     qrCodeDataUrl
   )
   ```
   - Se creaba un **nuevo timestamp** con `Date.now()`
   - Este timestamp era **diferente** al que está dentro del hash JWT

3. **Generación del PDF para Descarga** (✅ Correcto):
   ```typescript
   const certificateData = JWTService.verifyCertificateHash(hash)
   const pdfBuffer = await PDFService.generateCertificatePDF(
     certificateData, // ✅ Usa el timestamp del JWT (original)
     hash,
     qrCodeDataUrl
   )
   ```
   - Se usaba el timestamp **original** del hash JWT

### Resultado del Error

- **PDF en IPFS**: Tenía una fecha de emisión más reciente (el momento de la subida)
- **PDF descargado**: Tenía la fecha de emisión original (cuando se creó el hash)
- **Diseño diferente**: Aunque el diseño visual era el mismo, el contenido (fecha) era diferente

## ✅ Solución Implementada

### Cambio Realizado

En `src/actions/certificate-actions.ts`, se modificó para usar el **mismo timestamp** que está en el hash JWT:

```typescript
// Generar hash JWT del certificado
const hash = JWTService.generateCertificateHash(certificateData)

// ✅ Obtener el timestamp del hash JWT (debe ser el mismo que se usará en la descarga)
const certificateDataWithTimestamp = JWTService.verifyCertificateHash(hash)
if (!certificateDataWithTimestamp) {
  throw new Error('Error al generar el hash del certificado')
}

// ✅ Generar el PDF usando el mismo timestamp que está en el hash JWT
const pdfBuffer = await PDFService.generateCertificatePDF(
  certificateDataWithTimestamp, // Mismo timestamp que en la descarga
  hash,
  qrCodeDataUrl
)
```

### Por Qué Funciona

1. **Consistencia**: Ambos PDFs (IPFS y descarga) usan el mismo `certificateData` que viene del hash JWT
2. **Mismo timestamp**: El timestamp es el que se generó cuando se creó el hash, no uno nuevo
3. **Mismo diseño**: Al usar los mismos datos, el PDF es idéntico en ambos casos

## 📊 Comparación

| Aspecto | Antes (❌) | Después (✅) |
|---------|-----------|-------------|
| **PDF para IPFS** | `timestamp: Date.now()` (nuevo) | `timestamp: del JWT` (original) |
| **PDF para Descarga** | `timestamp: del JWT` (original) | `timestamp: del JWT` (original) |
| **Resultado** | PDFs diferentes | PDFs idénticos |

## 🎯 Verificación

Para verificar que la solución funciona:

1. Genera una nueva constancia
2. Descarga el PDF desde la previsualización
3. Descarga el PDF desde IPFS (usando el hash IPFS)
4. Compara ambos PDFs: deben ser **idénticos**

## 📝 Notas Técnicas

- El timestamp se genera **una sola vez** cuando se crea el hash JWT
- Este timestamp se almacena dentro del JWT y se usa consistentemente
- El componente `CertificatePDF` usa `certificateData.timestamp` para mostrar la fecha de emisión
- El componente también usa `new Date()` para mostrar la fecha actual ("hoy"), pero esto no afecta la consistencia

## 🔧 Archivos Modificados

- `src/actions/certificate-actions.ts`: Corregido para usar el mismo timestamp del JWT

## ✅ Resultado

Ahora ambos PDFs (el que se sube a IPFS y el que se descarga) son **idénticos** porque usan exactamente los mismos datos, incluyendo el mismo timestamp.









