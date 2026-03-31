import type { CertificateData } from "@/types";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

/* ------------------------------------------------------------------
   BASE64 ICONOS PNG REDONDOS
------------------------------------------------------------------ */

// Logo UJAT
const LOGO_UJAT =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABI0lEQVR4Xu3TsQ2DMBRF0TPAQGwARuwAW2iE0pQEdkBDoCy2SRxYYQE3KP9JjmcpkNvztNFVQVwKP1HjqCOjx3sZ3c8B9WewAnMA53gEPYE7wAn8Br8BxsANuAnuAbt4BuxBTT3zBapJkV9hx4t8A6QJgLQBYA1gLAEu4MLmHNNK+2eKQ41ktwGI8vnQWd+REGP7smjzh4uZxFPXIRnSH5j9+diqAK1E+z7j/QfNodnqAyN53VPyqfBvz2L2ys5C2zvyfzCO5lcA1sAPuAmzgDtwAW8gzuAteAGHADmwBd+P5JfuZWFn8deq/odt63Q+uPMI7hMAAAAASUVORK5CYII=";

// Icono Blockchain
const ICON_BLOCKCHAIN =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABI0lEQVR4Xu3TsQ2DMBRF0TPAQGwARuwAW2iE0pQEdkBDoCy2SRxYYQE3KP9JjmcpkNvztNFVQVwKP1HjqCOjx3sZ3c8B9WewAnMA53gEPYE7wAn8Br8BxsANuAnuAbt4BuxBTT3zBapJkV9hx4t8A6QJgLQBYA1gLAEu4MLmHNNK+2eKQ41ktwGI8vnQWd+REGP7smjzh4uZxFPXIRnSH5j9+diqAK1E+z7j/QfNodnqAyN53VPyqfBvz2L2ys5C2zvyfzCO5lcA1sAPuAmzgDtwAW8gzuAteAGHADmwBd+P5JfuZWFn8deq/odt63Q+uPMI7hMAAAAASUVORK5CYII=";

// Íconos de datos
const ICON_STUDENT =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABGUlEQVR4Xu3TsQ3CMBRF0TPAQGwARuwAW2iE0pQEdkBDoCy2SRxYYQE3KP9JjmcpkNvztNFVQVwKP1HjqCOjx3sZ3c8B9WewAnMA53gEPYE7wAn8Br8BxsANuAnuAbt4BuxBTT3zBapJkV9hx4t8A6QJgLQBYA1gLAEu4MLmHNNK+2eKQ41ktwGI8vnQWd+REGP7smjzh4uZxFPXIRnSH5j9+diqAK1E+z7j/QfNodnqAyN53VPyqfBvz2L2ys5C2zvyfzCO5lcA1sAPuAmzgDtwAW8gzuAteAGHADmwBd+P5JfuZWFn8deq/odt63Q+uPMI7hMAAAAASUVORK5CYII=";

const ICON_ID =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABFElEQVR4Xu3TsQ3CMBRF0XPgQGwARuwAW2iE0pQEdkBDoCy2SRxYYQE3KP9JjmcpkNvztNFVQVwKP1HjqCOjx3sZ3c8B9WewAnMA53gEPYE7wAn8Br8BxsANuAnuAbt4BuxBTT3zBapJkV9hx4t8A6QJgLQBYA1gLAEu4MLmHNNK+2eKQ41ktwGI8vnQWd+REGP7smjzh4uZxFPXIRnSH5j9+diqAK1E+z7j/QfNodnqAyN53VPyqfBvz2L2ys5C2zvyfzCO5lcA1sAPuAmzgDtwAW8gzuAteAGHADmwBd+P5JfuZWFn8deq/odt63Q+uPMI7hMAAAAASUVORK5CYII=";

const ICON_BOOK =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABHklEQVR4Xu3TsQ3CMBRF0TPAQGwARuwAW2iE0pQEdkBDoCy2SRxYYQE3KP9JjmcpkNvztNFVQVwKP1HjqCOjx3sZ3c8B9WewAnMA53gEPYE7wAn8Br8BxsANuAnuAbt4BuxBTT3zBapJkV9hx4t8A6QJgLQBYA1gLAEu4MLmHNNK+2eKQ41ktwGI8vnQWd+REGP7smjzh4uZxFPXIRnSH5j9+diqAK1E+z7j/QfNodnqAyN53VPyqfBvz2L2ys5C2zvyfzCO5lcA1sAPuAmzgDtwAW8gzuAteAGHADmwBd+P5JfuZWFn8deq/odt63Q+uPMI7hMAAAAASUVORK5CYII=";

const ICON_CALENDAR =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABFUlEQVR4Xu3TsQ3CMBRF0XPgQGwARuwAW2iE0pQEdkBDoCy2SRxYYQE3KP9JjmcpkNvztNFVQVwKP1HjqCOjx3sZ3c8B9WewAnMA53gEPYE7wAn8Br8BxsANuAnuAbt4BuxBTT3zBapJkV9hx4t8A6QJgLQBYA1gLAEu4MLmHNNK+2eKQ41ktwGI8vnQWd+REGP7smjzh4uZxFPXIRnSH5j9+diqAK1E+z7j/QfNodnqAyN53VPyqfBvz2L2ys5C2zvyfzCO5lcA1sAPuAmzgDtwAW8gzuAteAGHADmwBd+P5JfuZWFn8deq/odt63Q+uPMI7hMAAAAASUVORK5CYII=";

/* ------------------------------------------------------------------
   ESTILOS
------------------------------------------------------------------ */

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 35,
    fontFamily: "Helvetica",
  },

  logoTop: {
    width: 85,
    height: 85,
    marginBottom: 10,
  },

  blockchain: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 105,
    height: 105,
    opacity: 0.65,
  },

  header: {
    textAlign: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e3a8a",
  },

  subtitle: {
    fontSize: 12,
    color: "#374151",
    marginTop: 4,
  },

  frame: {
    border: "1px solid #3b82f6",
    backgroundColor: "#eef2ff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 22,
  },

  leyenda: {
    fontSize: 11,
    color: "#1f2937",
    textAlign: "justify",
    lineHeight: 1.55,
  },

  dataFrame: {
    border: "1px solid #3b82f6",
    backgroundColor: "#eef2ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 25,
  },

  contentBox: {
    flexDirection: "row",
    gap: 20,
  },

  column: {
    flex: 1,
  },

  fieldBox: {
    marginBottom: 12,
  },

  rowField: {
    flexDirection: "row",
    alignItems: "center",
  },

  label: {
    fontSize: 10,
    color: "#1e3a8a",
    fontWeight: "bold",
  },

  iconField: {
    width: 22,
    height: 22,
    marginRight: 6,
    marginTop: 2,
  },

  valueBox: {
    backgroundColor: "#f3f4f6",
    padding: 9,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    marginTop: 3,
  },

  valueText: {
    fontSize: 12,
    color: "#111827",
  },

  footer: {
    marginTop: 10,
    borderTop: "1px solid #d1d5db",
    paddingTop: 12,
  },

  hashBox: {
    fontSize: 7,
    fontFamily: "Courier",
    backgroundColor: "#eef2ff",
    border: "1px solid #c7d2fe",
    padding: 6,
    marginTop: 4,
  },

  qr: {
    width: 90,
    height: 90,
  },

  footerText: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 10,
    color: "#6b7280",
  },
});

/* ------------------------------------------------------------------
   COMPONENTE PRINCIPAL
------------------------------------------------------------------ */

interface CertificatePDFProps {
  certificateData: CertificateData;
  hash: string;
  qrCodeDataUrl?: string;
  hashOnChain?: string;
}

export const CertificatePDF = ({
  certificateData,
  hash,
  qrCodeDataUrl,
  hashOnChain,
}: CertificatePDFProps) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const today = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={false}>

        {/* LOGO UJAT CENTRADO */}
       

        {/* TÍTULOS */}
        <View style={styles.header}>
          <Text style={styles.title}>Constancia de Servicio Social UJAT</Text>
          <Text style={styles.subtitle}>
            Documento Oficial Certificado mediante Blockchain
          </Text>
        </View>

        {/* LEYENDA EN MARCO */}
        <View style={styles.frame}>
          <Text style={styles.leyenda}>
            A QUIEN CORRESPONDA:
            {"\n\n"}
            La Universidad Juárez Autónoma de Tabasco, por medio de la presente
            y una vez revisado el expediente respectivo.
            {"\n\n"}
            HACE CONSTAR
            {"\n\n"}
            Que el C. <Text style={{ fontWeight: "bold" }}>{certificateData.name}</Text> con matrícula <Text style={{ fontWeight: "bold" }}>{certificateData.matricula}</Text>, con estudios de <Text style={{ fontWeight: "bold" }}>{certificateData.career}</Text>, ha concluido satisfactoriamente el servicio social de acuerdo con el artículo 55 de la Ley Reglamentaria del Artículo 5° Constitucional relativo al ejercicio de las profesiones, así como del Reglamento de Servicio Social de esta Universidad.
            {"\n\n"}
            Para los fines y usos legales que al interesado convengan, se extiende la presente en la ciudad de Villahermosa, Tabasco, el <Text style={{ fontWeight: "bold" }}>{today}</Text>.
          </Text>
        </View>

        {/* DATOS DEL ALUMNO EN MARCO */}
        <View style={styles.dataFrame}>
          <View style={styles.contentBox}>

            {/* Columna izquierda */}
            <View style={styles.column}>

              {/* Nombre */}
              <View style={styles.fieldBox}>
                <View style={styles.rowField}>
                  <Image src={ICON_STUDENT} style={styles.iconField} />
                  <Text style={styles.label}>Estudiante</Text>
                </View>
                <View style={styles.valueBox}>
                  <Text style={styles.valueText}>{certificateData.name}</Text>
                </View>
              </View>

              {/* Matrícula */}
              <View style={styles.fieldBox}>
                <View style={styles.rowField}>
                  <Image src={ICON_ID} style={styles.iconField} />
                  <Text style={styles.label}>Matrícula</Text>
                </View>
                <View style={styles.valueBox}>
                  <Text style={styles.valueText}>{certificateData.matricula}</Text>
                </View>
              </View>
            </View>

            {/* Columna derecha */}
            <View style={styles.column}>

              {/* Carrera */}
              <View style={styles.fieldBox}>
                <View style={styles.rowField}>
                  <Image src={ICON_BOOK} style={styles.iconField} />
                  <Text style={styles.label}>Carrera</Text>
                </View>
                <View style={styles.valueBox}>
                  <Text style={styles.valueText}>{certificateData.career}</Text>
                </View>
              </View>

              {/* Fecha */}
              <View style={styles.fieldBox}>
                <View style={styles.rowField}>
                  <Image src={ICON_CALENDAR} style={styles.iconField} />
                  <Text style={styles.label}>Fecha de Emisión</Text>
                </View>
                <View style={styles.valueBox}>
                  <Text style={styles.valueText}>
                    {formatDate(certificateData.timestamp)}
                  </Text>
                </View>
              </View>

            </View>
          </View>
        </View>

        {/* SEGURIDAD / HASH / QR */}
        <View style={styles.footer}>

          <Text style={{ fontSize: 10, color: "#1e3a8a" }}>
            Firma Digital Local (Hash generado):
          </Text>
          <Text style={styles.hashBox}>{hash}</Text>

          {/* Hash On-Chain */}
          {hashOnChain && (
            <>
              <Text style={{ fontSize: 10, marginTop: 10, color: "#1e3a8a" }}>
                Hash Registrado On-Chain (Blockchain):
              </Text>
              <Text style={styles.hashBox}>{hashOnChain}</Text>
            </>
          )}

          {/* QR */}
          <View style={{ marginTop: 14, alignItems: "center" }}>
            <Text style={{ fontSize: 10, marginBottom: 4 }}>
              Verificación Oficial:
            </Text>
            {qrCodeDataUrl && <Image src={qrCodeDataUrl} style={styles.qr} />}
          </View>

          <Text style={styles.footerText}>
            Documento generado digitalmente — No requiere firma física
          </Text>
        </View>

        {/* Ícono Blockchain (abajo derecha) */}
        <Image src={ICON_BLOCKCHAIN} style={styles.blockchain} />
      </Page>
    </Document>
  );
};
