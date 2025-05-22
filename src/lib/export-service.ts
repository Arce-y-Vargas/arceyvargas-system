import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  format?: (value: any) => string;
  align?: "left" | "center" | "right";
}

export interface ExportConfig {
  title: string;
  subtitle?: string;
  filename: string;
  companyName?: string;
  logoPath?: string;
  columns: ExportColumn[];
  data: any[];
  summary?: {
    title?: string;
    calculations?: Array<{
      label: string;
      value: string | number;
      format?: (value: any) => string;
    }>;
    groupBy?: {
      key: string;
      title: string;
      countLabel?: string;
      percentLabel?: string;
    };
  };
  styles?: {
    primaryColor?: [number, number, number];
    secondaryColor?: [number, number, number];
    lightColor?: [number, number, number];
  };
}

export const formatCurrency = (value: number): string => {
  return `CRC ${value.toLocaleString("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getCurrentDateTime = (): {
  dateStr: string;
  timeStr: string;
  fullStr: string;
} => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    dateStr,
    timeStr,
    fullStr: `${dateStr} a las ${timeStr}`,
  };
};

export const exportToPDF = (config: ExportConfig): void => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const { dateStr, timeStr } = getCurrentDateTime();

  const primaryColor = config.styles?.primaryColor || [0, 90, 170];
  const secondaryColor = config.styles?.secondaryColor || [100, 100, 100];
  const lightColor = config.styles?.lightColor || [240, 240, 240];

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 30, "F");

  if (config.logoPath) {
    try {
      doc.addImage(config.logoPath, "PNG", 10, 5, 20, 20);
    } catch (e) {
      console.warn("No se pudo cargar el logo", e);
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(config.title.toUpperCase(), 40, 15);

  doc.setFontSize(10);
  doc.text(`Generado el ${dateStr} a las ${timeStr}`, 40, 22);

  if (config.summary?.calculations?.length) {
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    let yPos = 40;
    config.summary.calculations.forEach((calc) => {
      doc.text(
        `${calc.label}: ${calc.format ? calc.format(calc.value) : calc.value}`,
        15,
        yPos
      );
      yPos += 5;
    });
  }

  const columnStyles: Record<number, any> = {};
  config.columns.forEach((col, index) => {
    columnStyles[index] = {
      cellWidth: col.width || 25,
      halign: col.align || "left",
    };
  });

  const tableStyles = {
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: lightColor,
    },
    columnStyles,
    margin: {
      top: config.summary?.calculations?.length
        ? 50 + config.summary.calculations.length * 5
        : 50,
    },
    didDrawPage: (data: any) => {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `${config.companyName || ""} - Página ${
          data.pageNumber
        } de ${doc.getNumberOfPages()}`,
        data.settings.margin.left,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        dateStr,
        doc.internal.pageSize.width - 40,
        doc.internal.pageSize.height - 10
      );
    },
  };

  const tableHeaders = config.columns.map((col) => col.header);
  const tableData = config.data.map((item) => {
    return config.columns.map((col) => {
      const value = item[col.key];
      return col.format ? col.format(value) : value;
    });
  });

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    ...tableStyles,
  });

  if (config.summary?.groupBy) {
    const finalY = (doc as any).lastAutoTable.finalY || 200;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(config.summary.title || "Resumen", 15, finalY + 10);

    const groupKey = config.summary.groupBy.key;
    const groupSummary = config.data.reduce((acc, item) => {
      const key = item[groupKey];
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const groupData = Object.entries(groupSummary).map(([key, count]) => [
      key,
      count,
      `${((count / config.data.length) * 100).toFixed(1)}%`,
    ]);

    autoTable(doc, {
      head: [
        [
          config.summary.groupBy.title,
          config.summary.groupBy.countLabel || "Cantidad",
          config.summary.groupBy.percentLabel || "Porcentaje",
        ],
      ],
      body: groupData,
      startY: finalY + 15,
      theme: "grid",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 9,
      },
    });
  }

  const fileName = `${config.filename}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(fileName);
};

export const exportData = {
  toPDF: exportToPDF,
};

export default exportData;
