import { useState, useEffect } from "react";
import { Document, Page, Text, View, PDFDownloadLink, StyleSheet } from "@react-pdf/renderer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Estilos para el PDF
const styles = StyleSheet.create({
  page: { padding: 20 },
  section: { marginBottom: 10 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  text: { fontSize: 12 },
});

// Componente para el recibo en PDF
const PayrollPDF = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Recibo de Pago</Text>
        <Text style={styles.text}>Empleado: {data.employeeName}</Text>
        <Text style={styles.text}>Salario Base: ${data.baseSalary}</Text>
        <Text style={styles.text}>Deducciones: ${data.deductions}</Text>
        <Text style={styles.text}>Salario Neto: ${data.netSalary}</Text>
      </View>
    </Page>
  </Document>
);

// Componente principal
const PayrollReceipt = () => {
  const [payrollData, setPayrollData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/payroll") // Endpoint de nómina
      .then((res) => res.json())
      .then((data) => setPayrollData(data))
      .catch((err) => console.error("Error fetching payroll:", err));
  }, []);

  if (!payrollData) return <p>Cargando recibo de pago...</p>;

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-xl font-bold">Recibo de Pago</h2>
        <p><strong>Empleado:</strong> {payrollData.employeeName}</p>
        <p><strong>Salario Base:</strong> ${payrollData.baseSalary}</p>
        <p><strong>Deducciones:</strong> ${payrollData.deductions}</p>
        <p><strong>Salario Neto:</strong> ${payrollData.netSalary}</p>
        
        <PDFDownloadLink document={<PayrollPDF data={payrollData} />} fileName="recibo_de_pago.pdf">
          {({ loading }) => (
            <Button className="mt-4" disabled={loading}>
              {loading ? "Generando PDF..." : "Descargar Recibo"}
            </Button>
          )}
        </PDFDownloadLink>
      </CardContent>
    </Card>
  );
};

export default PayrollReceipt;
